import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { IntelligentWaitlistService } from '@/lib/intelligent-waitlist';
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config';
import { logger } from '@/lib/logger';

/**
 * Auto-Authentication API for Instant Access Users
 * 
 * This endpoint handles the seamless flow from waitlist approval to authenticated platform access:
 * 1. Verify user has instant access approval
 * 2. Auto-create Supabase Auth account 
 * 3. Return authentication session
 * 4. Enable immediate platform access
 */

export const POST = withAppRouterHighlight(async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, type, profileData } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name' },
        { status: 400 }
      );
    }

    // Check if user is on waitlist and approved for instant access
    const waitlistStatus = await IntelligentWaitlistService.getStatus(email);
    
    if (waitlistStatus.status !== 'approved') {
      return NextResponse.json(
        { 
          error: 'User must be approved for instant access',
          status: waitlistStatus.status,
          nextSteps: waitlistStatus.nextSteps
        },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true, // Auto-confirm email for instant access users
      user_metadata: {
        name,
        type,
        instant_access: true,
        approved_at: new Date().toISOString()
      }
    });

    if (authError) {
      logger.error('Failed to create auth user:', authError);
      
      // Handle duplicate user gracefully
      if (authError.message.includes('User already registered')) {
        return NextResponse.json(
          { error: 'Account already exists. Please sign in instead.' },
          { status: 409 }
        );
      }
      
      throw new Error(`Authentication setup failed: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user data returned');
    }

    // Create user profile in profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        display_name: name,
        username: email.split('@')[0], // Generate username from email
        user_type: type || 'cooker',
        is_alpha_user: true,
        instant_access: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add profile data if provided
        ...(profileData && {
          cooking_experience: profileData.cookingExperience,
          kitchen_setup: profileData.kitchenSetup,
          cooking_goals: profileData.cookingGoals
        })
      });

    if (profileError) {
      logger.error('Failed to create user profile:', profileError);
      // Continue - profile creation failure shouldn't block auth
    }

    // Generate auth session for immediate login
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/feed?welcome=true`
      }
    });

    if (sessionError) {
      logger.error('Failed to generate auth session:', sessionError);
    }

    logger.info('Instant access account created successfully:', {
      userId: authData.user.id,
      email: email.toLowerCase(),
      type,
      instantAccess: true
    });

    // Return success with authentication info
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name,
        type,
        instantAccess: true
      },
      authLink: sessionData?.properties?.action_link || null,
      message: '🎉 Account created! You now have instant access to NIBBBLE.',
      redirectPath: '/feed?welcome=true'
    });

  } catch (error) {
    logger.error('Instant access account creation failed:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Account creation failed',
        details: 'Please try again or contact support if this issue persists.'
      },
      { status: 500 }
    );
  }
});