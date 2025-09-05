import { NextRequest, NextResponse } from 'next/server';
import { SocialService } from '@/lib/services/social-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadCount = searchParams.get('unreadCount');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    if (unreadCount === 'true') {
      const count = await SocialService.getUnreadNotificationCount(userId);
      return NextResponse.json({
        success: true,
        unreadCount: count
      });
    }

    const notifications = await SocialService.getUserNotifications(userId, limit, offset);

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit
      }
    });
  } catch (error) {
    console.error('Get notifications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notificationId, userId, markAllAsRead } = await request.json();

    if (markAllAsRead) {
      if (!userId) {
        return NextResponse.json(
          { error: 'Missing required field: userId' },
          { status: 400 }
        );
      }

      const success = await SocialService.markAllNotificationsAsRead(userId);

      if (success) {
        return NextResponse.json({
          success: true,
          message: 'All notifications marked as read'
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to mark all notifications as read' },
          { status: 500 }
        );
      }
    } else {
      if (!notificationId || !userId) {
        return NextResponse.json(
          { error: 'Missing required fields: notificationId, userId' },
          { status: 400 }
        );
      }

      const success = await SocialService.markNotificationAsRead(notificationId, userId);

      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Notification marked as read'
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to mark notification as read' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Update notification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}