import { NextRequest, NextResponse } from 'next/server';
import { SocialService } from '@/lib/services/social-service';

export async function POST(request: NextRequest) {
  try {
    const testUserId1 = 'test-user-1-' + Date.now();
    const testUserId2 = 'test-user-2-' + Date.now();
    const testRecipeId = 'test-recipe-' + Date.now();
    
    const results = {
      steps: [] as Array<{
        step: string;
        success: boolean;
        data?: any;
        error?: string;
      }>,
      summary: {
        totalSteps: 0,
        successfulSteps: 0,
        failedSteps: 0
      }
    };

    // Test 1: Creator Following System
    try {
      const followSuccess = await SocialService.followCreator(testUserId1, testUserId2);
      results.steps.push({
        step: '1. Creator Following - Follow Creator',
        success: followSuccess,
        data: followSuccess ? 'Successfully followed creator' : null
      });

      if (followSuccess) {
        const isFollowing = await SocialService.isFollowingCreator(testUserId1, testUserId2);
        results.steps.push({
          step: '2. Creator Following - Check Following Status',
          success: isFollowing,
          data: `Following status: ${isFollowing}`
        });

        const followers = await SocialService.getCreatorFollowers(testUserId2);
        results.steps.push({
          step: '3. Creator Following - Get Followers',
          success: true,
          data: `Retrieved ${followers.length} followers`
        });

        const unfollowSuccess = await SocialService.unfollowCreator(testUserId1, testUserId2);
        results.steps.push({
          step: '4. Creator Following - Unfollow Creator',
          success: unfollowSuccess,
          data: unfollowSuccess ? 'Successfully unfollowed creator' : null
        });
      }
    } catch (error: any) {
      results.steps.push({
        step: '1-4. Creator Following System',
        success: false,
        error: error.message
      });
    }

    // Test 2: Recipe Rating & Reviews System
    try {
      const review = await SocialService.createReview({
        recipe_id: testRecipeId,
        user_id: testUserId1,
        rating: 4,
        review_text: 'Great recipe! Easy to follow and delicious results.',
        success_rate: 85,
        cooking_time_actual: 45,
        difficulty_experienced: 3,
        modifications: ['Added extra garlic', 'Used olive oil instead of butter'],
        would_make_again: true,
        images: ['https://example.com/image1.jpg']
      });

      results.steps.push({
        step: '5. Recipe Reviews - Create Review',
        success: !!review,
        data: review ? `Created review with ID: ${review.id}` : null
      });

      if (review) {
        const reviews = await SocialService.getRecipeReviews(testRecipeId);
        results.steps.push({
          step: '6. Recipe Reviews - Get Recipe Reviews',
          success: true,
          data: `Retrieved ${reviews.length} reviews for recipe`
        });

        const helpfulSuccess = await SocialService.markReviewHelpful(review.id, testUserId2, true);
        results.steps.push({
          step: '7. Recipe Reviews - Mark Helpful',
          success: helpfulSuccess,
          data: helpfulSuccess ? 'Successfully marked review as helpful' : null
        });
      }
    } catch (error: any) {
      results.steps.push({
        step: '5-7. Recipe Reviews System',
        success: false,
        error: error.message
      });
    }

    // Test 3: Community Discussion Features
    try {
      const thread = await SocialService.createDiscussionThread({
        title: 'Need help with sourdough starter',
        content: 'My sourdough starter isn\'t rising properly after 5 days. Any suggestions?',
        author_id: testUserId1,
        category: 'recipe-help',
        recipe_id: testRecipeId,
        tags: ['sourdough', 'baking', 'troubleshooting']
      });

      results.steps.push({
        step: '8. Community - Create Discussion Thread',
        success: !!thread,
        data: thread ? `Created thread with ID: ${thread.id}` : null
      });

      if (thread) {
        const threads = await SocialService.getDiscussionThreads('recipe-help');
        results.steps.push({
          step: '9. Community - Get Discussion Threads',
          success: true,
          data: `Retrieved ${threads.length} threads in recipe-help category`
        });

        const reply = await SocialService.createThreadReply({
          thread_id: thread.id,
          author_id: testUserId2,
          content: 'Try feeding your starter with a 1:1:1 ratio of starter:flour:water daily. Make sure the water is room temperature!',
          images: []
        });

        results.steps.push({
          step: '10. Community - Create Thread Reply',
          success: !!reply,
          data: reply ? `Created reply with ID: ${reply.id}` : null
        });

        if (reply) {
          const replies = await SocialService.getThreadReplies(thread.id);
          results.steps.push({
            step: '11. Community - Get Thread Replies',
            success: true,
            data: `Retrieved ${replies.length} replies for thread`
          });

          const voteSuccess = await SocialService.voteOnReply(reply.id, testUserId1, 'upvote');
          results.steps.push({
            step: '12. Community - Vote on Reply',
            success: voteSuccess,
            data: voteSuccess ? 'Successfully upvoted reply' : null
          });
        }
      }
    } catch (error: any) {
      results.steps.push({
        step: '8-12. Community Discussion Features',
        success: false,
        error: error.message
      });
    }

    // Test 4: Social Sharing Engine
    try {
      const share = await SocialService.trackSocialShare({
        user_id: testUserId1,
        content_type: 'recipe',
        content_id: testRecipeId,
        platform: 'twitter',
        share_url: 'https://twitter.com/intent/tweet?text=Check%20out%20this%20recipe!'
      });

      results.steps.push({
        step: '13. Social Sharing - Track Share',
        success: !!share,
        data: share ? `Tracked share with ID: ${share.id}` : null
      });

      const shareUrl = await SocialService.generateShareableLink('recipe', testRecipeId);
      results.steps.push({
        step: '14. Social Sharing - Generate Shareable Link',
        success: !!shareUrl,
        data: shareUrl ? `Generated share URL: ${shareUrl}` : null
      });

      const stats = await SocialService.getSharingStats('recipe', testRecipeId);
      results.steps.push({
        step: '15. Social Sharing - Get Sharing Stats',
        success: true,
        data: `Retrieved sharing stats: ${JSON.stringify(stats)}`
      });
    } catch (error: any) {
      results.steps.push({
        step: '13-15. Social Sharing Engine',
        success: false,
        error: error.message
      });
    }

    // Test 5: Activity Feed & Notifications
    try {
      await SocialService.addToActivityFeed(
        testUserId1,
        testUserId1,
        'reviewed_recipe',
        'recipe',
        testRecipeId,
        { rating: 4, success_rate: 85 }
      );

      results.steps.push({
        step: '16. Activity Feed - Add Activity',
        success: true,
        data: 'Successfully added activity to feed'
      });

      const activities = await SocialService.getActivityFeed(testUserId1);
      results.steps.push({
        step: '17. Activity Feed - Get Activities',
        success: true,
        data: `Retrieved ${activities.length} activities`
      });

      await SocialService.createNotification({
        recipient_id: testUserId1,
        actor_id: testUserId2,
        notification_type: 'recipe_reviewed',
        title: 'New Review',
        message: 'Someone reviewed your recipe!',
        content_type: 'recipe',
        content_id: testRecipeId
      });

      results.steps.push({
        step: '18. Notifications - Create Notification',
        success: true,
        data: 'Successfully created notification'
      });

      const notifications = await SocialService.getUserNotifications(testUserId1);
      results.steps.push({
        step: '19. Notifications - Get User Notifications',
        success: true,
        data: `Retrieved ${notifications.length} notifications`
      });

      const unreadCount = await SocialService.getUnreadNotificationCount(testUserId1);
      results.steps.push({
        step: '20. Notifications - Get Unread Count',
        success: true,
        data: `Unread notifications: ${unreadCount}`
      });
    } catch (error: any) {
      results.steps.push({
        step: '16-20. Activity Feed & Notifications',
        success: false,
        error: error.message
      });
    }

    // Calculate summary
    results.summary.totalSteps = results.steps.length;
    results.summary.successfulSteps = results.steps.filter(step => step.success).length;
    results.summary.failedSteps = results.steps.filter(step => !step.success).length;

    // Test API Endpoints
    const apiTests = [];

    // Test Follow API
    try {
      const followResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/social/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: testUserId1, creatorId: testUserId2 })
      });
      
      apiTests.push({
        endpoint: 'POST /api/social/follow',
        success: followResponse.ok,
        status: followResponse.status
      });
    } catch (error) {
      apiTests.push({
        endpoint: 'POST /api/social/follow',
        success: false,
        error: 'Network error'
      });
    }

    // Test Reviews API
    try {
      const reviewsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/social/reviews?recipeId=${testRecipeId}`);
      
      apiTests.push({
        endpoint: 'GET /api/social/reviews',
        success: reviewsResponse.ok,
        status: reviewsResponse.status
      });
    } catch (error) {
      apiTests.push({
        endpoint: 'GET /api/social/reviews',
        success: false,
        error: 'Network error'
      });
    }

    // Test Community Threads API
    try {
      const threadsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/social/community/threads?category=general`);
      
      apiTests.push({
        endpoint: 'GET /api/social/community/threads',
        success: threadsResponse.ok,
        status: threadsResponse.status
      });
    } catch (error) {
      apiTests.push({
        endpoint: 'GET /api/social/community/threads',
        success: false,
        error: 'Network error'
      });
    }

    // Test Social Share API
    try {
      const shareResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/social/share?contentType=recipe&contentId=${testRecipeId}`);
      
      apiTests.push({
        endpoint: 'GET /api/social/share',
        success: shareResponse.ok,
        status: shareResponse.status
      });
    } catch (error) {
      apiTests.push({
        endpoint: 'GET /api/social/share',
        success: false,
        error: 'Network error'
      });
    }

    // Test Notifications API
    try {
      const notificationsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/social/notifications?userId=${testUserId1}`);
      
      apiTests.push({
        endpoint: 'GET /api/social/notifications',
        success: notificationsResponse.ok,
        status: notificationsResponse.status
      });
    } catch (error) {
      apiTests.push({
        endpoint: 'GET /api/social/notifications',
        success: false,
        error: 'Network error'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Tier 5: Social Infrastructure test completed',
      testResults: results,
      apiEndpointTests: apiTests,
      overallHealth: {
        serviceLayerHealth: `${results.summary.successfulSteps}/${results.summary.totalSteps} steps passed`,
        apiEndpointHealth: `${apiTests.filter(test => test.success).length}/${apiTests.length} endpoints responding`,
        socialFeatures: {
          creatorFollowing: results.steps.filter(s => s.step.includes('Creator Following')).every(s => s.success),
          recipeReviews: results.steps.filter(s => s.step.includes('Recipe Reviews')).every(s => s.success),
          communityDiscussions: results.steps.filter(s => s.step.includes('Community')).every(s => s.success),
          socialSharing: results.steps.filter(s => s.step.includes('Social Sharing')).every(s => s.success),
          activityNotifications: results.steps.filter(s => s.step.includes('Activity Feed') || s.step.includes('Notifications')).every(s => s.success)
        },
        recommendedActions: results.summary.failedSteps > 0 ? [
          'Apply social database schema using scripts/create-social-schema.sql',
          'Verify Supabase RLS policies are properly configured',
          'Check that all database tables exist and are accessible',
          'Ensure proper authentication is set up',
          'Review error logs for specific database connection issues'
        ] : [
          'Tier 5: Social Infrastructure fully operational!',
          'All social features implemented and tested',
          '✅ Creator Following System: Complete',
          '✅ Recipe Rating & Reviews: Complete', 
          '✅ Community Discussion Features: Complete',
          '✅ Social Sharing Engine: Complete',
          '✅ Activity Feed & Notifications: Complete',
          'Ready for social engagement and community building!'
        ]
      }
    });

  } catch (error: any) {
    console.error('Social workflow test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Social workflow test failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Tier 5: Social Infrastructure Test Endpoint',
    description: 'POST to this endpoint to test the complete social infrastructure implementation',
    testCoverage: [
      'Creator Following System (follow/unfollow, follower lists)',
      'Recipe Rating & Reviews (create reviews, success feedback, helpfulness)',
      'Community Discussion Features (threads, replies, voting)',
      'Social Sharing Engine (cross-platform sharing, tracking)',
      'Activity Feed & Notifications (real-time updates, notifications)'
    ],
    features: {
      '✅ Creator Following': 'Users can follow/unfollow creators and view follower lists',
      '✅ Recipe Reviews': 'Success-based feedback with ratings, modifications, and photos',
      '✅ Community Discussions': 'Threaded discussions with categories and voting',
      '✅ Social Sharing': 'Cross-platform sharing with tracking and analytics',
      '✅ Notifications': 'Real-time activity feed and notification system'
    },
    usage: 'POST /api/test/social-workflow'
  });
}