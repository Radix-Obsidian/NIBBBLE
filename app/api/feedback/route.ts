import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

interface FeedbackRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'All fields are required: name, email, subject, message' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please enter a valid email address' 
        },
        { status: 400 }
      );
    }

    // Validate message length (prevent spam/abuse)
    if (message.length > 5000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Message must be less than 5000 characters' 
        },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      logger.error('Supabase admin client not available for feedback submission');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database service temporarily unavailable' 
        },
        { status: 503 }
      );
    }

    // Store feedback in database
    const { error: dbError } = await supabaseAdmin
      .from('feedback_submissions')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim(),
        submitted_at: new Date().toISOString(),
        status: 'pending',
        user_agent: request.headers.get('user-agent') || null,
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
      });

    if (dbError) {
      logger.error('Database error storing feedback', { error: dbError, email });
      
      // Don't expose database errors to client
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to submit feedback. Please try again later.' 
        },
        { status: 500 }
      );
    }

    logger.info('Feedback submitted successfully', { 
      email, 
      subject: subject.substring(0, 50) + (subject.length > 50 ? '...' : '')
    });

    // TODO: In production, you might want to:
    // 1. Send email notification to support team
    // 2. Send confirmation email to user
    // 3. Add to CRM system
    // 4. Trigger Slack/Discord notification

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully. We\'ll get back to you soon!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Unexpected error in feedback submission', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request format' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve feedback (admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add proper admin authentication check here
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'all';

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database service not available' },
        { status: 503 }
      );
    }

    let query = supabaseAdmin
      .from('feedback_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: feedback, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching feedback', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      feedback: feedback || [],
      pagination: { limit, offset, total: feedback?.length || 0 }
    });

  } catch (error) {
    logger.error('Unexpected error fetching feedback', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}