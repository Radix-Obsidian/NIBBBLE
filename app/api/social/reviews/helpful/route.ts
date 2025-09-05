import { NextRequest, NextResponse } from 'next/server';
import { SocialService } from '@/lib/services/social-service';

export async function POST(request: NextRequest) {
  try {
    const { reviewId, userId, isHelpful } = await request.json();

    if (!reviewId || !userId || typeof isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: reviewId, userId, isHelpful' },
        { status: 400 }
      );
    }

    const success = await SocialService.markReviewHelpful(reviewId, userId, isHelpful);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Review marked as ${isHelpful ? 'helpful' : 'not helpful'}`
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to mark review helpfulness' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Mark review helpful API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}