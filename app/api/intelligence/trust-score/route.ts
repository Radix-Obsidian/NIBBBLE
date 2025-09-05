import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceService } from '@/lib/services/intelligence-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    const trustScore = await IntelligenceService.getUserTrustScore(userId);

    if (trustScore) {
      return NextResponse.json({
        success: true,
        trustScore
      });
    } else {
      // No trust score yet, return default values
      return NextResponse.json({
        success: true,
        trustScore: {
          user_id: userId,
          overall_trust_score: 50.0,
          content_quality_score: 50.0,
          engagement_authenticity_score: 50.0,
          community_reputation_score: 50.0,
          verification_level: 'unverified',
          flags_count: 0,
          successful_contributions: 0,
          community_endorsements: 0,
          last_calculated: null,
          calculation_version: '1.0'
        }
      });
    }
  } catch (error) {
    console.error('Get trust score API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const trustScore = await IntelligenceService.calculateAndUpdateTrustScore(userId);

    if (trustScore) {
      return NextResponse.json({
        success: true,
        message: 'Trust score calculated and updated',
        trustScore
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to calculate trust score' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Calculate trust score API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}