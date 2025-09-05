import { NextRequest, NextResponse } from 'next/server';
import { SocialService } from '@/lib/services/social-service';

export async function POST(request: NextRequest) {
  try {
    const threadData = await request.json();
    const { title, content, author_id, category, recipe_id, tags } = threadData;

    if (!title || !content || !author_id || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, author_id, category' },
        { status: 400 }
      );
    }

    const validCategories = ['general', 'recipe-help', 'techniques', 'ingredients', 'equipment', 'dietary'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: ' + validCategories.join(', ') },
        { status: 400 }
      );
    }

    const thread = await SocialService.createDiscussionThread({
      title,
      content,
      author_id,
      category,
      recipe_id,
      tags
    });

    if (thread) {
      return NextResponse.json({
        success: true,
        thread
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to create discussion thread' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Create thread API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const threads = await SocialService.getDiscussionThreads(category || undefined, limit, offset);

    return NextResponse.json({
      success: true,
      threads,
      pagination: {
        limit,
        offset,
        hasMore: threads.length === limit
      }
    });
  } catch (error) {
    console.error('Get threads API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}