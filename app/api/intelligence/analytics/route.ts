import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceService } from '@/lib/services/intelligence-service';

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json();
    const {
      recipe_id,
      user_id,
      cooking_started_at,
      cooking_completed_at,
      success_rate,
      actual_prep_time,
      actual_cook_time,
      difficulty_rating,
      equipment_used,
      modifications_made,
      environmental_factors,
      user_skill_level,
      interruptions_count,
      steps_completed,
      steps_total,
      failure_points,
      quality_score,
      would_cook_again,
      photos_taken,
      video_recorded,
      shared_results
    } = sessionData;

    if (!recipe_id || !user_id || !cooking_started_at) {
      return NextResponse.json(
        { error: 'Missing required fields: recipe_id, user_id, cooking_started_at' },
        { status: 400 }
      );
    }

    const analytics = await IntelligenceService.recordCookingSession({
      recipe_id,
      user_id,
      cooking_started_at,
      cooking_completed_at,
      success_rate,
      actual_prep_time,
      actual_cook_time,
      difficulty_rating,
      equipment_used,
      modifications_made,
      environmental_factors,
      user_skill_level,
      interruptions_count,
      steps_completed,
      steps_total,
      failure_points,
      quality_score,
      would_cook_again,
      photos_taken,
      video_recorded,
      shared_results
    });

    if (analytics) {
      return NextResponse.json({
        success: true,
        analytics
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to record cooking session' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Record cooking analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const patterns = searchParams.get('patterns') === 'true';

    if (patterns) {
      // Get success patterns
      const successPatterns = await IntelligenceService.getSuccessPatterns(recipeId || undefined);
      
      return NextResponse.json({
        success: true,
        patterns: successPatterns
      });
    } else {
      // Get cooking analytics
      const analytics = await IntelligenceService.getCookingAnalytics(
        recipeId || undefined,
        userId || undefined,
        limit
      );

      return NextResponse.json({
        success: true,
        analytics,
        total: analytics.length
      });
    }
  } catch (error) {
    console.error('Get cooking analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}