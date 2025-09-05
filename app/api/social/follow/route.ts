import { NextRequest, NextResponse } from 'next/server';
import { SocialService } from '@/lib/services/social-service';

export async function POST(request: NextRequest) {
  try {
    const { followerId, creatorId } = await request.json();

    if (!followerId || !creatorId) {
      return NextResponse.json(
        { error: 'Missing required fields: followerId, creatorId' },
        { status: 400 }
      );
    }

    if (followerId === creatorId) {
      return NextResponse.json(
        { error: 'Users cannot follow themselves' },
        { status: 400 }
      );
    }

    const success = await SocialService.followCreator(followerId, creatorId);

    if (success) {
      return NextResponse.json({ success: true, message: 'Successfully followed creator' });
    } else {
      return NextResponse.json(
        { error: 'Failed to follow creator' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Follow creator API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { followerId, creatorId } = await request.json();

    if (!followerId || !creatorId) {
      return NextResponse.json(
        { error: 'Missing required fields: followerId, creatorId' },
        { status: 400 }
      );
    }

    const success = await SocialService.unfollowCreator(followerId, creatorId);

    if (success) {
      return NextResponse.json({ success: true, message: 'Successfully unfollowed creator' });
    } else {
      return NextResponse.json(
        { error: 'Failed to unfollow creator' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unfollow creator API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const followerId = searchParams.get('followerId');
    const creatorId = searchParams.get('creatorId');
    const getFollowers = searchParams.get('getFollowers');
    const getFollowing = searchParams.get('getFollowing');

    if (followerId && creatorId) {
      // Check if user is following creator
      const isFollowing = await SocialService.isFollowingCreator(followerId, creatorId);
      return NextResponse.json({ isFollowing });
    }

    if (getFollowers && creatorId) {
      // Get creator's followers
      const followers = await SocialService.getCreatorFollowers(creatorId);
      return NextResponse.json({ followers });
    }

    if (getFollowing && followerId) {
      // Get user's following list
      const following = await SocialService.getUserFollowing(followerId);
      return NextResponse.json({ following });
    }

    return NextResponse.json(
      { error: 'Invalid query parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Get follow data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}