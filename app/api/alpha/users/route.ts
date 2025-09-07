import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { FEATURES } from '@/lib/config/features';
import { alphaUserManager } from '@/lib/auth/alpha-user-management';

interface UserActivationRequest {
  userId: string;
  inviteCode: string;
}

interface UserUpdateRequest {
  userId: string;
  updates: {
    alphaStatus?: 'active' | 'paused' | 'churned';
    priorityLevel?: 'high' | 'medium' | 'low';
    cohort?: string;
    metadata?: Record<string, any>;
  };
}

interface OnboardingUpdateRequest {
  userId: string;
  step: number;
  stepData?: any;
}

interface CookingSessionRequest {
  userId: string;
  recipeId: string;
  adaptationId?: string;
  estimatedDuration?: number;
}

interface SessionUpdateRequest {
  sessionId: string;
  updates: {
    status?: 'preparing' | 'cooking' | 'completed' | 'abandoned';
    currentStep?: number;
    successRating?: number;
    difficultyRating?: number;
    aiGuidanceUsed?: boolean;
    adaptationsUsed?: string[];
    issuesEncountered?: string[];
    userNotes?: string;
  };
}

// POST endpoint for various user management actions
export async function POST(request: NextRequest): Promise<NextResponse> {
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

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'activate':
        return await handleUserActivation(body as UserActivationRequest);
      
      case 'update_onboarding':
        return await handleOnboardingUpdate(body as OnboardingUpdateRequest);
      
      case 'start_session':
        return await handleStartCookingSession(body as CookingSessionRequest);
      
      case 'update_session':
        return await handleUpdateCookingSession(body as SessionUpdateRequest);
      
      case 'track_journey_event':
        return await handleTrackJourneyEvent(body);
        
      default:
        return NextResponse.json({
          error: 'Invalid action',
          validActions: ['activate', 'update_onboarding', 'start_session', 'update_session', 'track_journey_event']
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Alpha users POST error:', error);
    
    return NextResponse.json({
      error: 'Failed to process user request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for user data retrieval
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'profile';

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Database connection not available'
      }, { status: 503 });
    }

    switch (action) {
      case 'profile':
        if (!userId) {
          return NextResponse.json({
            error: 'userId parameter required for profile action'
          }, { status: 400 });
        }
        return await handleGetUserProfile(userId);

      case 'dashboard':
        if (!userId) {
          return NextResponse.json({
            error: 'userId parameter required for dashboard action'
          }, { status: 400 });
        }
        return await handleGetUserDashboard(userId);

      case 'sessions':
        if (!userId) {
          return NextResponse.json({
            error: 'userId parameter required for sessions action'
          }, { status: 400 });
        }
        return await handleGetUserSessions(userId, searchParams);

      case 'list':
        return await handleListAlphaUsers(searchParams);

      default:
        return NextResponse.json({
          error: 'Invalid action',
          validActions: ['profile', 'dashboard', 'sessions', 'list']
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Alpha users GET error:', error);
    
    return NextResponse.json({
      error: 'Failed to retrieve user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH endpoint for user updates
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body: UserUpdateRequest = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json({
        error: 'userId and updates are required'
      }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Database connection not available'
      }, { status: 503 });
    }

    // Verify user is alpha user
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('is_alpha_user, alpha_status')
      .eq('id', userId)
      .single();

    if (userError || !user || !user.is_alpha_user) {
      return NextResponse.json({
        error: 'User not found or not an alpha user'
      }, { status: 404 });
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.alphaStatus) {
      updateData.alpha_status = updates.alphaStatus;
    }

    if (updates.priorityLevel) {
      updateData.alpha_priority_level = updates.priorityLevel;
    }

    if (updates.cohort) {
      updateData.alpha_cohort = updates.cohort;
    }

    if (updates.metadata) {
      // Merge with existing metadata
      const { data: currentUser } = await supabaseAdmin
        .from('profiles')
        .select('alpha_metadata')
        .eq('id', userId)
        .single();

      const currentMetadata = currentUser?.alpha_metadata || {};
      updateData.alpha_metadata = { ...currentMetadata, ...updates.metadata };
    }

    // Update user profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      userId,
      updates: updateData
    });

  } catch (error) {
    console.error('Alpha users PATCH error:', error);
    
    return NextResponse.json({
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Action handlers
async function handleUserActivation(request: UserActivationRequest): Promise<NextResponse> {
  const { userId, inviteCode } = request;

  if (!userId || !inviteCode) {
    return NextResponse.json({
      error: 'userId and inviteCode are required'
    }, { status: 400 });
  }

  const result = await alphaUserManager.activateAlphaUser(userId, inviteCode);

  if (!result.success) {
    return NextResponse.json({
      success: false,
      error: result.error
    }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    user: result.user,
    onboarding: result.onboarding,
    message: 'Alpha user activated successfully'
  }, { status: 201 });
}

async function handleOnboardingUpdate(request: OnboardingUpdateRequest): Promise<NextResponse> {
  const { userId, step, stepData } = request;

  if (!userId || !step) {
    return NextResponse.json({
      error: 'userId and step are required'
    }, { status: 400 });
  }

  await alphaUserManager.updateOnboardingProgress(userId, step, stepData);

  return NextResponse.json({
    success: true,
    message: 'Onboarding progress updated',
    userId,
    step,
    completed: true
  });
}

async function handleStartCookingSession(request: CookingSessionRequest): Promise<NextResponse> {
  const { userId, recipeId, adaptationId, estimatedDuration } = request;

  if (!userId || !recipeId) {
    return NextResponse.json({
      error: 'userId and recipeId are required'
    }, { status: 400 });
  }

  // Verify user is alpha user
  const { data: user, error: userError } = await supabaseAdmin
    .from('profiles')
    .select('is_alpha_user, alpha_status')
    .eq('id', userId)
    .single();

  if (userError || !user || !user.is_alpha_user || user.alpha_status !== 'active') {
    return NextResponse.json({
      error: 'User not authorized for alpha cooking sessions'
    }, { status: 403 });
  }

  // Create cooking session
  const estimatedEndTime = estimatedDuration 
    ? new Date(Date.now() + estimatedDuration * 60 * 1000).toISOString()
    : null;

  const sessionData = {
    user_id: userId,
    recipe_id: recipeId,
    adaptation_id: adaptationId,
    status: 'preparing',
    current_step: 0,
    start_time: new Date().toISOString(),
    estimated_end_time: estimatedEndTime,
    session_data: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: session, error: sessionError } = await supabaseAdmin
    .from('cooking_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (sessionError) {
    throw sessionError;
  }

  // Track user journey event
  await supabaseAdmin
    .from('user_journey_events')
    .insert({
      user_id: userId,
      event: 'first_cooking_session',
      metadata: { recipe_id: recipeId, adaptation_id: adaptationId },
      timestamp: new Date().toISOString()
    });

  return NextResponse.json({
    success: true,
    session: {
      id: session.id,
      recipeId: session.recipe_id,
      status: session.status,
      startTime: session.start_time,
      estimatedEndTime: session.estimated_end_time
    },
    message: 'Cooking session started successfully'
  }, { status: 201 });
}

async function handleUpdateCookingSession(request: SessionUpdateRequest): Promise<NextResponse> {
  const { sessionId, updates } = request;

  if (!sessionId || !updates) {
    return NextResponse.json({
      error: 'sessionId and updates are required'
    }, { status: 400 });
  }

  // Verify session exists and get user info
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('cooking_sessions')
    .select(`
      *,
      profiles!inner(is_alpha_user, alpha_status)
    `)
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({
      error: 'Cooking session not found'
    }, { status: 404 });
  }

  if (!session.profiles.is_alpha_user || session.profiles.alpha_status !== 'active') {
    return NextResponse.json({
      error: 'User not authorized for alpha cooking sessions'
    }, { status: 403 });
    
  }

  // Build update object
  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (updates.status) {
    updateData.status = updates.status;
    if (updates.status === 'completed') {
      updateData.actual_end_time = new Date().toISOString();
      // Calculate duration
      const startTime = new Date(session.start_time).getTime();
      const endTime = Date.now();
      updateData.duration = Math.round((endTime - startTime) / (1000 * 60)); // minutes
    }
  }

  if (updates.currentStep !== undefined) {
    updateData.current_step = updates.currentStep;
    updateData.steps_completed = updates.currentStep;
  }

  if (updates.successRating !== undefined) {
    updateData.success_rating = updates.successRating;
  }

  if (updates.difficultyRating !== undefined) {
    updateData.difficulty_rating = updates.difficultyRating;
  }

  if (updates.aiGuidanceUsed !== undefined) {
    updateData.ai_guidance_used = updates.aiGuidanceUsed;
  }

  if (updates.adaptationsUsed) {
    updateData.adaptations_used = updates.adaptationsUsed;
  }

  if (updates.issuesEncountered) {
    updateData.issues_encountered = updates.issuesEncountered;
  }

  if (updates.userNotes) {
    updateData.user_notes = updates.userNotes;
  }

  // Update session
  const { error: updateError } = await supabaseAdmin
    .from('cooking_sessions')
    .update(updateData)
    .eq('id', sessionId);

  if (updateError) {
    throw updateError;
  }

  // Track journey events for significant updates
  if (updates.status === 'completed' && updates.successRating && updates.successRating >= 4) {
    await supabaseAdmin
      .from('user_journey_events')
      .insert({
        user_id: session.user_id,
        event: 'first_success',
        metadata: { 
          session_id: sessionId,
          success_rating: updates.successRating 
        },
        timestamp: new Date().toISOString()
      });
  }

  return NextResponse.json({
    success: true,
    sessionId,
    updates: updateData,
    message: 'Cooking session updated successfully'
  });
}

async function handleTrackJourneyEvent(request: any): Promise<NextResponse> {
  const { userId, event, metadata } = request;

  if (!userId || !event) {
    return NextResponse.json({
      error: 'userId and event are required'
    }, { status: 400 });
  }

  const validEvents = ['signup', 'first_recipe_view', 'first_cooking_session', 'first_success', 'skill_progression', 'feature_discovery'];
  
  if (!validEvents.includes(event)) {
    return NextResponse.json({
      error: 'Invalid event type',
      validEvents
    }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('user_journey_events')
    .insert({
      user_id: userId,
      event,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    });

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    message: 'Journey event tracked successfully',
    userId,
    event
  });
}

async function handleGetUserProfile(userId: string): Promise<NextResponse> {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      alpha_onboarding(*)
    `)
    .eq('id', userId)
    .eq('is_alpha_user', true)
    .single();

  if (error || !profile) {
    return NextResponse.json({
      error: 'Alpha user profile not found'
    }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      alphaStatus: profile.alpha_status,
      alphaCohort: profile.alpha_cohort,
      alphaActivatedAt: profile.alpha_activated_at,
      priorityLevel: profile.alpha_priority_level,
      onboardingCompleted: !!profile.alpha_onboarding_completed_at,
      onboardingCompletedAt: profile.alpha_onboarding_completed_at,
      feedbackScore: profile.alpha_feedback_score || 0,
      metadata: profile.alpha_metadata || {},
      onboarding: profile.alpha_onboarding
    }
  });
}

async function handleGetUserDashboard(userId: string): Promise<NextResponse> {
  const dashboard = await alphaUserManager.getAlphaUserDashboard(userId);
  return NextResponse.json({ dashboard });
}

async function handleGetUserSessions(userId: string, searchParams: URLSearchParams): Promise<NextResponse> {
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  const status = searchParams.get('status');

  let query = supabaseAdmin
    .from('cooking_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data: sessions, error } = await query
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return NextResponse.json({
    sessions: sessions || [],
    pagination: { limit, offset, total: sessions?.length || 0 }
  });
}

async function handleListAlphaUsers(searchParams: URLSearchParams): Promise<NextResponse> {
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const status = searchParams.get('status');
  const cohort = searchParams.get('cohort');

  let query = supabaseAdmin
    .from('profiles')
    .select('id, email, display_name, alpha_status, alpha_cohort, alpha_activated_at, alpha_priority_level, alpha_feedback_score')
    .eq('is_alpha_user', true)
    .order('alpha_activated_at', { ascending: false });

  if (status) {
    query = query.eq('alpha_status', status);
  }

  if (cohort) {
    query = query.eq('alpha_cohort', cohort);
  }

  const { data: users, error } = await query
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return NextResponse.json({
    users: users || [],
    pagination: { limit, offset, total: users?.length || 0 }
  });
}