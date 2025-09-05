import { NextRequest, NextResponse } from 'next/server';
import { SocialService } from '@/lib/services/social-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }

    const replies = await SocialService.getThreadReplies(threadId);

    return NextResponse.json({
      success: true,
      replies
    });
  } catch (error) {
    console.error('Get thread replies API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;
    const { parent_reply_id, author_id, content, images } = await request.json();

    if (!threadId || !author_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: threadId, author_id, content' },
        { status: 400 }
      );
    }

    const reply = await SocialService.createThreadReply({
      thread_id: threadId,
      parent_reply_id,
      author_id,
      content,
      images
    });

    if (reply) {
      return NextResponse.json({
        success: true,
        reply
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to create reply' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Create thread reply API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}