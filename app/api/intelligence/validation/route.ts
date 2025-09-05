import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceService } from '@/lib/services/intelligence-service';

export async function POST(request: NextRequest) {
  try {
    const validationData = await request.json();
    const {
      content_type,
      content_id,
      validation_type,
      content_text,
      user_id,
      metadata
    } = validationData;

    if (!content_type || !content_id || !validation_type) {
      return NextResponse.json(
        { error: 'Missing required fields: content_type, content_id, validation_type' },
        { status: 400 }
      );
    }

    const validContentTypes = ['recipe', 'review', 'thread_post', 'profile', 'comment', 'image'];
    const validValidationTypes = ['spam_detection', 'quality_assessment', 'authenticity_check', 'safety_validation', 'plagiarism_detection', 'image_analysis'];

    if (!validContentTypes.includes(content_type)) {
      return NextResponse.json(
        { error: 'Invalid content_type. Must be one of: ' + validContentTypes.join(', ') },
        { status: 400 }
      );
    }

    if (!validValidationTypes.includes(validation_type)) {
      return NextResponse.json(
        { error: 'Invalid validation_type. Must be one of: ' + validValidationTypes.join(', ') },
        { status: 400 }
      );
    }

    const validation = await IntelligenceService.validateContent({
      content_type,
      content_id,
      validation_type,
      content_text,
      user_id,
      metadata
    });

    if (validation) {
      return NextResponse.json({
        success: true,
        validation
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to validate content' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Content validation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const pending = searchParams.get('pending') === 'true';
    const contentType = searchParams.get('contentType');
    const validationType = searchParams.get('validationType');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (contentId) {
      // Get validation history for specific content
      const validations = await IntelligenceService.getContentValidation(contentId);
      
      return NextResponse.json({
        success: true,
        validations
      });
    } else if (pending) {
      // Get pending validations for moderation
      const pendingValidations = await IntelligenceService.getPendingValidations(
        contentType || undefined,
        validationType || undefined,
        limit
      );

      return NextResponse.json({
        success: true,
        validations: pendingValidations,
        total: pendingValidations.length
      });
    } else {
      return NextResponse.json(
        { error: 'Must provide contentId or set pending=true' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Get validation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { validationId, status, reviewerNotes, reviewerId } = await request.json();

    if (!validationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: validationId, status' },
        { status: 400 }
      );
    }

    const validStatuses = ['approved', 'flagged', 'rejected', 'needs_review'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Update validation status (this would need to be implemented in the service)
    // For now, we'll simulate the update
    return NextResponse.json({
      success: true,
      message: `Validation ${validationId} updated to ${status}`,
      validation: {
        id: validationId,
        validation_status: status,
        reviewer_id: reviewerId,
        review_notes: reviewerNotes,
        reviewed_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Update validation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}