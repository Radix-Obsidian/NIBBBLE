import { NextRequest, NextResponse } from 'next/server';
import { SocialService } from '@/lib/services/social-service';

export async function POST(request: NextRequest) {
  try {
    const reviewData = await request.json();
    const {
      recipe_id,
      user_id,
      rating,
      review_text,
      success_rate,
      cooking_time_actual,
      difficulty_experienced,
      modifications,
      would_make_again,
      images
    } = reviewData;

    if (!recipe_id || !user_id || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: recipe_id, user_id, rating' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const review = await SocialService.createReview({
      recipe_id,
      user_id,
      rating,
      review_text,
      success_rate,
      cooking_time_actual,
      difficulty_experienced,
      modifications,
      would_make_again,
      images
    });

    if (review) {
      return NextResponse.json({
        success: true,
        review
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Create review API error:', error);
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Missing required parameter: recipeId' },
        { status: 400 }
      );
    }

    const reviews = await SocialService.getRecipeReviews(recipeId, limit, offset);

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        limit,
        offset,
        hasMore: reviews.length === limit
      }
    });
  } catch (error) {
    console.error('Get reviews API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}