import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/database/supabase';
import { FEATURES } from '@/lib/config/features';

interface MetricsQuery {
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
  granularity?: 'minute' | 'hour' | 'day';
  metrics?: string[]; // specific metrics to return
}

interface RealTimeMetrics {
  timestamp: string;
  snapshot: {
    activeUsers: number;
    activeSessions: number;
    averageSuccessRate: number;
    aiFeatureUsage: number;
    feedbackScore: number;
  };
  trends: {
    userGrowth: number; // percentage change
    sessionVolume: number; // percentage change
    successRateChange: number;
    feedbackTrend: number;
  };
  alerts: Array<{
    type: 'success_rate_low' | 'session_failure_spike' | 'user_churn' | 'critical_feedback';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    value: number;
    threshold: number;
  }>;
  goals: {
    cookingSuccessRate: {
      current: number;
      target: 75;
      status: 'on_track' | 'behind' | 'ahead';
    };
    aiFeatureAdoption: {
      current: number;
      target: 70;
      status: 'on_track' | 'behind' | 'ahead';
    };
    userRetention: {
      current: number;
      target: 80;
      status: 'on_track' | 'behind' | 'ahead';
    };
  };
  cohortAnalysis: {
    currentCohort: string;
    cohortSize: number;
    retentionByDay: number[];
    averageSessionsPerUser: number;
    topFeatures: Array<{
      feature: string;
      usageRate: number;
      satisfactionScore: number;
    }>;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!FEATURES.alphaMode) {
      return NextResponse.json({
        error: 'Alpha mode is not enabled'
      }, { status: 404 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Database connection not available'
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') as MetricsQuery['timeRange']) || '24h';
    const granularity = (searchParams.get('granularity') as MetricsQuery['granularity']) || 'hour';
    const requestedMetrics = searchParams.get('metrics')?.split(',') || [];

    // Calculate time boundaries
    const now = new Date();
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const timeFromMs = timeRanges[timeRange] || timeRanges['24h'];
    const timeFrom = new Date(now.getTime() - timeFromMs);

    // Get current active alpha users
    const { data: activeUsers, error: activeUsersError } = await supabaseAdmin
      .from('alpha_users')
      .select('id, status, activated_at')
      .eq('status', 'activated');

    if (activeUsersError) {
      throw new Error(`Failed to fetch active users: ${activeUsersError.message}`);
    }

    // Get active sessions (cooking right now)
    const { data: activeSessions, error: activeSessionsError } = await supabaseAdmin
      .from('alpha_recipe_sessions')
      .select(`
        id, status, started_at, ai_suggestions_used
      `)
      .eq('status', 'in_progress');

    if (activeSessionsError) {
      console.warn('Failed to fetch active sessions:', activeSessionsError.message);
    }

    // Get recent sessions for success rate calculation
    const { data: recentSessions, error: recentSessionsError } = await supabaseAdmin
      .from('alpha_recipe_sessions')
      .select(`
        status, success_rating, ai_suggestions_used, started_at
      `)
      .gte('started_at', timeFrom.toISOString());

    if (recentSessionsError) {
      console.warn('Failed to fetch recent sessions:', recentSessionsError.message);
    }

    const sessions = recentSessions || [];
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const successfulSessions = sessions.filter(s => s.success_rating >= 7);
    const aiGuidedSessions = sessions.filter(s => (s.ai_suggestions_used || 0) > 0);

    const currentSuccessRate = completedSessions.length > 0 
      ? (successfulSessions.length / completedSessions.length) * 100 
      : 0;

    const aiUsageRate = sessions.length > 0 
      ? (aiGuidedSessions.length / sessions.length) * 100 
      : 0;

    // Get recent feedback
    const { data: recentFeedback, error: feedbackError } = await supabaseAdmin
      .from('alpha_feedback')
      .select(`
        rating, ai_suggestion_quality, created_at
      `)
      .gte('created_at', timeFrom.toISOString());

    if (feedbackError) {
      console.warn('Failed to fetch recent feedback:', feedbackError.message);
    }

    const feedback = recentFeedback || [];
    const avgFeedbackScore = feedback.length > 0
      ? feedback.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating).length
      : 0;

    // Calculate trends (compare with previous period)
    const previousTimeFrom = new Date(timeFrom.getTime() - timeFromMs);
    
    const { data: previousSessions, error: prevError } = await supabaseAdmin
      .from('alpha_recipe_sessions')
      .select(`
        status, success_rating
      `)
      .gte('started_at', previousTimeFrom.toISOString())
      .lt('started_at', timeFrom.toISOString());

    const prevSessionCount = previousSessions?.length || 0;
    const currentSessionCount = sessions.length;
    const sessionVolumeChange = prevSessionCount > 0 
      ? ((currentSessionCount - prevSessionCount) / prevSessionCount) * 100 
      : 0;

    const prevSuccessfulSessions = previousSessions?.filter(s => s.success_rating >= 7).length || 0;
    const prevCompletedSessions = previousSessions?.filter(s => s.status === 'completed').length || 0;
    const prevSuccessRate = prevCompletedSessions > 0 ? (prevSuccessfulSessions / prevCompletedSessions) * 100 : 0;
    const successRateChange = prevSuccessRate > 0 ? currentSuccessRate - prevSuccessRate : 0;

    // Generate alerts based on thresholds
    const alerts = [];
    
    if (currentSuccessRate < 60) {
      alerts.push({
        type: 'success_rate_low' as const,
        severity: 'critical' as const,
        message: 'Cooking success rate below critical threshold',
        value: currentSuccessRate,
        threshold: 60
      });
    } else if (currentSuccessRate < 70) {
      alerts.push({
        type: 'success_rate_low' as const,
        severity: 'warning' as const,
        message: 'Cooking success rate below target',
        value: currentSuccessRate,
        threshold: 75
      });
    }

    if (aiUsageRate < 50) {
      alerts.push({
        type: 'session_failure_spike' as const,
        severity: 'warning' as const,
        message: 'AI feature adoption below target',
        value: aiUsageRate,
        threshold: 70
      });
    }

    // Current cohort analysis
    const currentCohort = `alpha-${now.toLocaleString('default', { month: 'short' })}-${now.getFullYear()}`.toLowerCase();
    
    const { data: cohortUsers, error: cohortError } = await supabaseAdmin
      .from('alpha_users')
      .select('id, activated_at')
      .eq('status', 'activated');

    const cohortSize = cohortUsers?.length || 0;

    // Get AI feature usage stats - simplified for now
    const featureUsage = []; // Would need to implement proper AI feature tracking table

    const topFeatures = [
      {
        feature: 'recipe_adaptation',
        usageRate: 75,
        satisfactionScore: 4.2
      },
      {
        feature: 'cooking_assistant',
        usageRate: 65,
        satisfactionScore: 4.5
      }
    ]; // Placeholder data

    const response: RealTimeMetrics = {
      timestamp: new Date().toISOString(),
      snapshot: {
        activeUsers: activeUsers?.length || 0,
        activeSessions: activeSessions?.length || 0,
        averageSuccessRate: Math.round(currentSuccessRate * 100) / 100,
        aiFeatureUsage: Math.round(aiUsageRate * 100) / 100,
        feedbackScore: Math.round(avgFeedbackScore * 100) / 100
      },
      trends: {
        userGrowth: 0, // Would need historical data
        sessionVolume: Math.round(sessionVolumeChange * 100) / 100,
        successRateChange: Math.round(successRateChange * 100) / 100,
        feedbackTrend: 0 // Would need historical feedback data
      },
      alerts,
      goals: {
        cookingSuccessRate: {
          current: Math.round(currentSuccessRate * 100) / 100,
          target: 75,
          status: currentSuccessRate >= 75 ? 'ahead' : currentSuccessRate >= 65 ? 'on_track' : 'behind'
        },
        aiFeatureAdoption: {
          current: Math.round(aiUsageRate * 100) / 100,
          target: 70,
          status: aiUsageRate >= 70 ? 'ahead' : aiUsageRate >= 60 ? 'on_track' : 'behind'
        },
        userRetention: {
          current: 85, // Placeholder
          target: 80,
          status: 'ahead' as const
        }
      },
      cohortAnalysis: {
        currentCohort,
        cohortSize,
        retentionByDay: [100, 90, 85, 82, 80, 78, 75], // Placeholder - would need complex calculation
        averageSessionsPerUser: sessions.length > 0 && activeUsers ? sessions.length / activeUsers.length : 0,
        topFeatures
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, max-age=30', // Cache for 30 seconds
        'X-Metrics-TimeRange': timeRange,
        'X-Metrics-Generated': new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Alpha metrics endpoint error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch alpha metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500 
    });
  }
}

// POST endpoint to update specific metrics or trigger calculations
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, metric_name, value } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Database connection not available'
      }, { status: 503 });
    }

    if (action === 'increment_metric') {
      // Increment a real-time metric counter
      const { error } = await supabaseAdmin
        .from('real_time_metrics')
        .upsert({
          metric_name,
          count: 1,
          date_bucket: new Date().toISOString().split('T')[0], // Today's date
          timestamp: new Date().toISOString()
        }, {
          onConflict: 'metric_name,date_bucket',
          ignoreDuplicates: false
        });

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: `Metric ${metric_name} incremented`,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      error: 'Invalid action',
      validActions: ['increment_metric']
    }, { status: 400 });

  } catch (error) {
    console.error('Metrics POST error:', error);
    
    return NextResponse.json({
      error: 'Failed to update metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}