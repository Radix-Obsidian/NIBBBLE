import { NextRequest, NextResponse } from 'next/server';
import { SocialService } from '@/lib/services/social-service';

export async function POST(request: NextRequest) {
  try {
    const { user_id, content_type, content_id, platform } = await request.json();

    if (!user_id || !content_type || !content_id || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, content_type, content_id, platform' },
        { status: 400 }
      );
    }

    const validContentTypes = ['recipe', 'review', 'thread'];
    const validPlatforms = ['twitter', 'instagram', 'facebook', 'tiktok', 'pinterest', 'link'];

    if (!validContentTypes.includes(content_type)) {
      return NextResponse.json(
        { error: 'Invalid content_type. Must be one of: ' + validContentTypes.join(', ') },
        { status: 400 }
      );
    }

    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be one of: ' + validPlatforms.join(', ') },
        { status: 400 }
      );
    }

    // Generate shareable link
    const shareUrl = await SocialService.generateShareableLink(content_type, content_id);

    // Track the share
    const share = await SocialService.trackSocialShare({
      user_id,
      content_type,
      content_id,
      platform,
      share_url: shareUrl
    });

    if (share) {
      return NextResponse.json({
        success: true,
        share,
        shareUrl
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to track social share' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Social share API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType');
    const contentId = searchParams.get('contentId');

    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: 'Missing required parameters: contentType, contentId' },
        { status: 400 }
      );
    }

    const stats = await SocialService.getSharingStats(contentType, contentId);

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get sharing stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}