import { NextRequest, NextResponse } from 'next/server';
import { IntelligentWaitlistService } from '@/lib/intelligent-waitlist';
import { WaitlistService } from '@/lib/waitlist';
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config';

export const POST = withAppRouterHighlight(async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type, name, ...additionalData } = body;

    // Validate required fields
    if (!email || !type || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, type, name' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['creator', 'cooker'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "creator" or "cooker"' },
        { status: 400 }
      );
    }

    // Extract location data for access control
    const locationData = {
      ip: request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      // TODO: Add country/timezone detection from IP or headers
      country: request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country'),
      timezone: request.headers.get('cf-timezone') || undefined
    };

    // Map camelCase frontend fields to snake_case database fields
    const profileData = {
      email: email.toLowerCase(),
      type,
      name,
      // Creator-specific fields
      social_handle: additionalData.socialHandle || null,
      cooking_experience: additionalData.cookingExperience || null,
      specialty: additionalData.specialty || null,
      audience_size: additionalData.audienceSize || null,
      content_type: additionalData.contentType || null,
      goals: additionalData.goals || null,
      // Cooker-specific fields
      kitchen_setup: additionalData.kitchenSetup || null,
      cooking_goals: additionalData.cookingGoals || null,
      frequency: additionalData.frequency || null,
      challenges: additionalData.challenges || null,
      interests: additionalData.interests || null,
    };

    // Use intelligent waitlist system
    const result = await IntelligentWaitlistService.signup(profileData, locationData);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.accessDecision.reason,
          status: result.entry?.status,
          nextSteps: result.nextSteps,
          estimatedWaitTime: result.estimatedWaitTime
        },
        { status: 409 }
      );
    }

    // Return success response with access decision
    return NextResponse.json({
      success: true,
      instantAccess: result.accessDecision.allowed,
      entry: {
        id: result.entry!.id,
        email: result.entry!.email,
        type: result.entry!.type,
        status: result.entry!.status,
        submittedAt: result.entry!.submitted_at,
        approvedAt: result.entry!.approved_at
      },
      accessDecision: {
        allowed: result.accessDecision.allowed,
        reason: result.accessDecision.reason,
        requiresWaitlist: result.accessDecision.requiresWaitlist
      },
      nextSteps: result.nextSteps,
      estimatedWaitTime: result.estimatedWaitTime
    });

  } catch (error) {
    console.error('Intelligent waitlist submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const GET = withAppRouterHighlight(async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const analytics = searchParams.get('analytics');

    if (email) {
      // Check specific email status with intelligent system
      const result = await IntelligentWaitlistService.getStatus(email);
      return NextResponse.json({
        email,
        status: result.status,
        nextSteps: result.nextSteps,
        estimatedWaitTime: result.estimatedWaitTime,
        entry: result.entry ? {
          id: result.entry.id,
          email: result.entry.email,
          type: result.entry.type,
          status: result.entry.status,
          submittedAt: result.entry.submitted_at,
          approvedAt: result.entry.approved_at
        } : undefined
      });
    } else if (analytics === 'true') {
      // Return analytics dashboard data
      const analyticsData = await IntelligentWaitlistService.getAnalytics();
      return NextResponse.json({ analytics: analyticsData });
    } else {
      // Return all entries (admin only in production)
      const entries = await WaitlistService.getAllEntries();
      return NextResponse.json({ entries });
    }
  } catch (error) {
    console.error('Waitlist query error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PATCH = withAppRouterHighlight(async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, status } = body;

    if (!email || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: email, status' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    let success = false;
    if (status === 'approved') {
      success = await WaitlistService.approveEntry(email);
    } else if (status === 'rejected') {
      success = await WaitlistService.rejectEntry(email);
    }

    if (success) {
      return NextResponse.json({ success: true, email, status });
    } else {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Waitlist update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
