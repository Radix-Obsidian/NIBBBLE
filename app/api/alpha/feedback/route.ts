import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { FEATURES } from '@/lib/config/features';

interface FeedbackSubmission {
  userId: string;
  sessionId: string;
  recipeId: string;
  
  // Core ratings (required)
  overallRating: number; // 1-5
  difficultyRating: number; // 1-5
  aiHelpfulnessRating?: number; // 0-5, 0 = not used
  
  // Experience feedback
  whatWorkedWell?: string[];
  whatWasConfusing?: string[];
  suggestedImprovements?: string[];
  issuesEncountered?: string[];
  
  // Metrics
  timeSpent?: number; // minutes
  stepsCompleted?: number;
  totalSteps?: number;
  adaptationsUsed?: string[];
  
  // AI-specific feedback
  aiFeatures?: {
    recipeAdaptation?: { used: boolean; helpful: boolean; rating?: number };
    cookingAssistant?: { used: boolean; helpful: boolean; rating?: number };
    stepGuidance?: { used: boolean; helpful: boolean; rating?: number };
    troubleshooting?: { used: boolean; helpful: boolean; rating?: number };
  };
  
  // Free-form feedback
  additionalComments?: string;
  wouldRecommend?: boolean;
  likelyToReturnRating?: number; // 1-5 NPS style
  
  // Context
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  cookingContext?: string;
  skillLevel?: number;
  previousExperience?: string;
}

interface FeedbackResponse {
  success: boolean;
  feedbackId?: string;
  insights?: {
    criticalIssues: boolean;
    improvementAreas: string[];
    positiveHighlights: string[];
  };
  followUp?: {
    suggested: boolean;
    type: 'survey' | 'interview' | 'none';
    reason: string;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!FEATURES.alphaMode || !FEATURES.enableFeedbackSystem) {
      return NextResponse.json({
        error: 'Feedback system not available'
      }, { status: 404 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Database connection not available'
      }, { status: 503 });
    }

    const feedback: FeedbackSubmission = await request.json();

    // Validate required fields
    if (!feedback.userId || !feedback.sessionId || !feedback.recipeId) {
      return NextResponse.json({
        error: 'Missing required fields: userId, sessionId, recipeId'
      }, { status: 400 });
    }

    if (!feedback.overallRating || feedback.overallRating < 1 || feedback.overallRating > 5) {
      return NextResponse.json({
        error: 'Overall rating must be between 1 and 5'
      }, { status: 400 });
    }

    if (!feedback.difficultyRating || feedback.difficultyRating < 1 || feedback.difficultyRating > 5) {
      return NextResponse.json({
        error: 'Difficulty rating must be between 1 and 5'
      }, { status: 400 });
    }

    // Verify user is alpha user
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('is_alpha_user, alpha_status')
      .eq('id', feedback.userId)
      .single();

    if (userError || !userProfile || !userProfile.is_alpha_user || userProfile.alpha_status !== 'active') {
      return NextResponse.json({
        error: 'User not authorized for alpha feedback'
      }, { status: 403 });
    }

    // Verify cooking session exists and belongs to user
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('cooking_sessions')
      .select('id, user_id, recipe_id, status')
      .eq('id', feedback.sessionId)
      .eq('user_id', feedback.userId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Cooking session not found or access denied'
      }, { status: 404 });
    }

    if (session.recipe_id !== feedback.recipeId) {
      return NextResponse.json({
        error: 'Recipe ID does not match cooking session'
      }, { status: 400 });
    }

    // Insert feedback into database
    const feedbackData = {
      user_id: feedback.userId,
      session_id: feedback.sessionId,
      recipe_id: feedback.recipeId,
      overall_rating: feedback.overallRating,
      difficulty_rating: feedback.difficultyRating,
      ai_helpfulness_rating: feedback.aiHelpfulnessRating || 0,
      what_worked_well: feedback.whatWorkedWell || [],
      what_was_confusing: feedback.whatWasConfusing || [],
      suggested_improvements: feedback.suggestedImprovements || [],
      issues_encountered: feedback.issuesEncountered || [],
      time_spent: feedback.timeSpent,
      steps_completed: feedback.stepsCompleted || 0,
      total_steps: feedback.totalSteps || 0,
      adaptations_used: feedback.adaptationsUsed || [],
      ai_features: feedback.aiFeatures || {},
      additional_comments: feedback.additionalComments,
      would_recommend: feedback.wouldRecommend,
      likely_to_return_rating: feedback.likelyToReturnRating,
      device_type: feedback.deviceType,
      cooking_context: feedback.cookingContext,
      skill_level: feedback.skillLevel,
      previous_experience: feedback.previousExperience,
      created_at: new Date().toISOString(),
      submitted_at: new Date().toISOString()
    };

    const { data: insertedFeedback, error: insertError } = await supabaseAdmin
      .from('cooking_feedback')
      .insert(feedbackData)
      .select('id')
      .single();

    if (insertError) {
      throw new Error(`Failed to insert feedback: ${insertError.message}`);
    }

    // Analyze feedback for critical issues
    const criticalIssues = analyzeCriticalIssues(feedback);
    const insights = generateInsights(feedback);
    const followUp = determineFollowUp(feedback);

    // Create critical feedback alerts if necessary
    if (criticalIssues.length > 0) {
      const alertPromises = criticalIssues.map(issue =>
        supabaseAdmin
          .from('critical_feedback_alerts')
          .insert({
            feedback_id: insertedFeedback.id,
            user_id: feedback.userId,
            issue: issue.description,
            severity: issue.severity,
            action_taken: false,
            created_at: new Date().toISOString()
          })
      );

      await Promise.all(alertPromises);
    }

    // Update user's alpha feedback score
    await updateUserFeedbackScore(feedback.userId, feedback.overallRating, insights.positiveHighlights.length);

    // Track AI feature usage if provided
    if (feedback.aiFeatures) {
      await trackAIFeatureUsage(feedback.userId, feedback.sessionId, feedback.aiFeatures);
    }

    // Update session with feedback flag
    await supabaseAdmin
      .from('cooking_sessions')
      .update({ 
        success_rating: feedback.overallRating,
        difficulty_rating: feedback.difficultyRating,
        updated_at: new Date().toISOString()
      })
      .eq('id', feedback.sessionId);

    const response: FeedbackResponse = {
      success: true,
      feedbackId: insertedFeedback.id,
      insights: {
        criticalIssues: criticalIssues.length > 0,
        improvementAreas: insights.improvementAreas,
        positiveHighlights: insights.positiveHighlights
      },
      followUp
    };

    return NextResponse.json(response, {
      status: 201,
      headers: {
        'X-Feedback-Id': insertedFeedback.id,
        'X-Feedback-Critical': criticalIssues.length > 0 ? 'true' : 'false'
      }
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    
    return NextResponse.json({
      error: 'Failed to submit feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to retrieve feedback data (admin or user's own)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const recipeId = searchParams.get('recipeId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Database connection not available'
      }, { status: 503 });
    }

    let query = supabaseAdmin
      .from('cooking_feedback')
      .select(`
        *,
        profiles!inner(email, display_name, is_alpha_user)
      `)
      .eq('profiles.is_alpha_user', true);

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    if (recipeId) {
      query = query.eq('recipe_id', recipeId);
    }

    const { data: feedback, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      feedback: feedback || [],
      pagination: {
        limit,
        offset,
        total: feedback?.length || 0
      }
    });

  } catch (error) {
    console.error('Feedback retrieval error:', error);
    
    return NextResponse.json({
      error: 'Failed to retrieve feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper functions
function analyzeCriticalIssues(feedback: FeedbackSubmission): Array<{ description: string; severity: 'low' | 'medium' | 'high' | 'critical' }> {
  const issues = [];

  // Low rating with negative feedback
  if (feedback.overallRating <= 2) {
    issues.push({
      description: 'Very low overall rating with negative feedback',
      severity: 'critical' as const
    });
  }

  // AI features not helpful when used
  if (feedback.aiFeatures && feedback.aiHelpfulnessRating === 0) {
    issues.push({
      description: 'AI features used but not helpful',
      severity: 'high' as const
    });
  }

  // Multiple confusion points
  if (feedback.whatWasConfusing && feedback.whatWasConfusing.length > 3) {
    issues.push({
      description: 'Multiple confusion points reported',
      severity: 'medium' as const
    });
  }

  // Safety or critical issues mentioned
  const criticalKeywords = ['burn', 'fire', 'injury', 'dangerous', 'unsafe'];
  const allText = [
    ...(feedback.whatWasConfusing || []),
    ...(feedback.issuesEncountered || []),
    feedback.additionalComments || ''
  ].join(' ').toLowerCase();

  if (criticalKeywords.some(keyword => allText.includes(keyword))) {
    issues.push({
      description: 'Potential safety or critical issue mentioned',
      severity: 'critical' as const
    });
  }

  return issues;
}

function generateInsights(feedback: FeedbackSubmission) {
  const improvementAreas = [];
  const positiveHighlights = [];

  // Analyze improvement areas
  if (feedback.difficultyRating >= 4) {
    improvementAreas.push('Recipe complexity may need adjustment');
  }
  if (feedback.aiHelpfulnessRating && feedback.aiHelpfulnessRating <= 2) {
    improvementAreas.push('AI assistance quality needs improvement');
  }
  if (feedback.whatWasConfusing && feedback.whatWasConfusing.length > 0) {
    improvementAreas.push('Instructions clarity could be enhanced');
  }

  // Analyze positive highlights
  if (feedback.overallRating >= 4) {
    positiveHighlights.push('High user satisfaction');
  }
  if (feedback.aiHelpfulnessRating && feedback.aiHelpfulnessRating >= 4) {
    positiveHighlights.push('AI features well-received');
  }
  if (feedback.wouldRecommend === true) {
    positiveHighlights.push('User willing to recommend');
  }
  if (feedback.whatWorkedWell && feedback.whatWorkedWell.length > 0) {
    positiveHighlights.push('Multiple positive aspects identified');
  }

  return { improvementAreas, positiveHighlights };
}

function determineFollowUp(feedback: FeedbackSubmission) {
  // High-value feedback or issues warrant follow-up
  if (feedback.overallRating <= 2 || (feedback.aiHelpfulnessRating && feedback.aiHelpfulnessRating === 0)) {
    return {
      suggested: true,
      type: 'interview' as const,
      reason: 'Critical feedback requiring detailed understanding'
    };
  }

  if (feedback.overallRating === 5 && feedback.wouldRecommend === true) {
    return {
      suggested: true,
      type: 'survey' as const,
      reason: 'Positive feedback suitable for testimonial or case study'
    };
  }

  return {
    suggested: false,
    type: 'none' as const,
    reason: 'Standard feedback, no immediate follow-up needed'
  };
}

async function updateUserFeedbackScore(userId: string, rating: number, positiveHighlights: number) {
  // Simple scoring algorithm: rating weight 70%, detailed feedback 30%
  const ratingScore = (rating / 5) * 70;
  const detailScore = Math.min(positiveHighlights * 10, 30);
  const totalScore = Math.round(ratingScore + detailScore);

  await supabaseAdmin
    .from('profiles')
    .update({
      alpha_feedback_score: totalScore,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
}

async function trackAIFeatureUsage(userId: string, sessionId: string, aiFeatures: any) {
  const usagePromises = [];

  for (const [feature, data] of Object.entries(aiFeatures)) {
    if (data && typeof data === 'object' && (data as any).used) {
      usagePromises.push(
        supabaseAdmin
          .from('ai_feature_usage')
          .insert({
            user_id: userId,
            feature: feature as string,
            session_id: sessionId,
            metadata: { helpful: (data as any).helpful, rating: (data as any).rating },
            timestamp: new Date().toISOString()
          })
      );
    }
  }

  if (usagePromises.length > 0) {
    await Promise.all(usagePromises);
  }
}