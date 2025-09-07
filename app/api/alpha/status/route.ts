import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/database/supabase';
import { FEATURES } from '@/lib/config/features';

interface AlphaStatusResponse {
  alpha: {
    enabled: boolean;
    capacity: {
      current: number;
      limit: number;
      percentage: number;
      accepting: boolean;
    };
    metrics: {
      totalUsers: number;
      activeUsers: number;
      pendingUsers: number;
      pausedUsers: number;
      churnedUsers: number;
      averageRetention: number;
    };
    performance: {
      totalSessions: number;
      completedSessions: number;
      successRate: number;
      averageRating: number;
      aiUsageRate: number;
    };
    feedback: {
      totalFeedback: number;
      averageFeedbackRating: number;
      criticalIssues: number;
      resolvedIssues: number;
    };
    onboarding: {
      totalStarted: number;
      totalCompleted: number;
      completionRate: number;
      averageTimeToComplete: number; // hours
    };
  };
  waitlist: {
    totalEntries: number;
    pendingInvites: number;
    recentSignups: number; // last 7 days
  };
  timestamp: string;
  lastUpdated?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!FEATURES.alphaMode) {
      return NextResponse.json({
        error: 'Alpha mode is not enabled',
        alphaEnabled: false
      }, { status: 404 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Database connection not available'
      }, { status: 503 });
    }

    // Get alpha user counts by status from alpha_users table
    const { data: alphaUsers, error: alphaError } = await supabaseAdmin
      .from('alpha_users')
      .select('id, status, activated_at, created_at, email');

    if (alphaError) {
      throw new Error(`Failed to fetch alpha users: ${alphaError.message}`);
    }

    const usersByStatus = alphaUsers.reduce((acc, user) => {
      const status = user.status || 'invited';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalUsers = alphaUsers.length;
    const activeUsers = usersByStatus.activated || 0;
    const pendingUsers = usersByStatus.invited || 0;
    const pausedUsers = usersByStatus.suspended || 0;
    const churnedUsers = 0; // Not implemented yet

    // Get session performance data from alpha_recipe_sessions
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('alpha_recipe_sessions')
      .select(`
        status,
        success_rating,
        ai_suggestions_used,
        started_at,
        completed_at,
        user_id
      `);

    if (sessionsError) {
      console.warn('Failed to fetch session data:', sessionsError.message);
    }

    const sessionMetrics = sessions || [];
    const completedSessions = sessionMetrics.filter(s => s.status === 'completed').length;
    const successfulSessions = sessionMetrics.filter(s => s.success_rating >= 7).length;
    const aiGuidedSessions = sessionMetrics.filter(s => (s.ai_suggestions_used || 0) > 0).length;
    const avgRating = sessionMetrics.length > 0 
      ? sessionMetrics.filter(s => s.success_rating).reduce((sum, s) => sum + (s.success_rating || 0), 0) / sessionMetrics.filter(s => s.success_rating).length 
      : 0;

    // Get feedback data from alpha_feedback
    const { data: feedback, error: feedbackError } = await supabaseAdmin
      .from('alpha_feedback')
      .select(`
        rating,
        created_at,
        user_id,
        feedback_type
      `);

    if (feedbackError) {
      console.warn('Failed to fetch feedback data:', feedbackError.message);
    }

    const feedbackMetrics = feedback || [];
    const avgFeedbackRating = feedbackMetrics.length > 0
      ? feedbackMetrics.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackMetrics.filter(f => f.rating).length
      : 0;

    // Get critical feedback alerts from alpha_feedback
    const { count: criticalCount, error: criticalError } = await supabaseAdmin
      .from('alpha_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('priority', 'critical')
      .eq('status', 'new');

    const { count: resolvedCount, error: resolvedError } = await supabaseAdmin
      .from('alpha_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('priority', 'critical')
      .in('status', ['addressed', 'closed']);

    // Get onboarding data from alpha_cooking_profiles
    const { data: onboarding, error: onboardingError } = await supabaseAdmin
      .from('alpha_cooking_profiles')
      .select(`
        user_id,
        created_at
      `);

    if (onboardingError) {
      console.warn('Failed to fetch onboarding data:', onboardingError.message);
    }

    const onboardingMetrics = onboarding || [];
    const completedOnboarding = onboardingMetrics.length; // All profiles with cooking profiles are considered onboarded

    // Calculate average time to complete onboarding
    const avgCompletionTime = 0; // Placeholder - would need more complex calculation

    // Get waitlist data from alpha_waitlist
    const { count: waitlistCount, error: waitlistError } = await supabaseAdmin
      .from('alpha_waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('activated', false);

    const { count: pendingInvitesCount, error: invitesError } = await supabaseAdmin
      .from('alpha_waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('invited', true)
      .eq('activated', false);

    const { count: recentSignups, error: recentError } = await supabaseAdmin
      .from('alpha_waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Calculate retention (simplified - days since activation for active users)
    const activeUsersWithDates = alphaUsers.filter(u => 
      u.status === 'activated' && u.activated_at
    );
    const avgRetention = activeUsersWithDates.length > 0
      ? activeUsersWithDates.reduce((sum, u) => {
          const daysSinceActivation = Math.floor(
            (Date.now() - new Date(u.activated_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + daysSinceActivation;
        }, 0) / activeUsersWithDates.length
      : 0;

    const response: AlphaStatusResponse = {
      alpha: {
        enabled: FEATURES.alphaMode,
        capacity: {
          current: totalUsers,
          limit: FEATURES.alphaUserLimit,
          percentage: Math.round((totalUsers / FEATURES.alphaUserLimit) * 100),
          accepting: totalUsers < FEATURES.alphaUserLimit
        },
        metrics: {
          totalUsers,
          activeUsers,
          pendingUsers,
          pausedUsers,
          churnedUsers,
          averageRetention: Math.round(avgRetention)
        },
        performance: {
          totalSessions: sessionMetrics.length,
          completedSessions,
          successRate: completedSessions > 0 ? Math.round((successfulSessions / completedSessions) * 100) : 0,
          averageRating: Math.round(avgRating * 100) / 100,
          aiUsageRate: sessionMetrics.length > 0 ? Math.round((aiGuidedSessions / sessionMetrics.length) * 100) : 0
        },
        feedback: {
          totalFeedback: feedbackMetrics.length,
          averageFeedbackRating: Math.round(avgFeedbackRating * 100) / 100,
          criticalIssues: criticalCount || 0,
          resolvedIssues: resolvedCount || 0
        },
        onboarding: {
          totalStarted: onboardingMetrics.length,
          totalCompleted: completedOnboarding,
          completionRate: onboardingMetrics.length > 0 
            ? Math.round((completedOnboarding / onboardingMetrics.length) * 100) 
            : 0,
          averageTimeToComplete: avgCompletionTime
        }
      },
      waitlist: {
        totalEntries: waitlistCount || 0,
        pendingInvites: pendingInvitesCount || 0,
        recentSignups: recentSignups || 0
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, max-age=60', // Cache for 1 minute
        'X-Alpha-Status': 'active'
      }
    });

  } catch (error) {
    console.error('Alpha status endpoint error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch alpha status',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'X-Alpha-Status': 'error'
      }
    });
  }
}

// POST endpoint for admin actions (future use)
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    error: 'Admin actions not yet implemented'
  }, { status: 501 });
}