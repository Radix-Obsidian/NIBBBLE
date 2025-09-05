import { supabase, supabaseAdmin } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Types for Social Infrastructure
export interface CreatorFollow {
  id: string;
  follower_id: string;
  creator_id: string;
  followed_at: string;
  notification_enabled: boolean;
}

export interface RecipeReview {
  id: string;
  recipe_id: string;
  user_id: string;
  rating: number;
  review_text?: string;
  success_rate?: number;
  cooking_time_actual?: number;
  difficulty_experienced?: number;
  modifications?: string[];
  would_make_again?: boolean;
  images?: string[];
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface DiscussionThread {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category: 'general' | 'recipe-help' | 'techniques' | 'ingredients' | 'equipment' | 'dietary';
  recipe_id?: string;
  tags?: string[];
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  last_reply_at?: string;
  last_reply_by?: string;
  created_at: string;
  updated_at: string;
  author_profile?: {
    display_name: string;
    avatar_url?: string;
  };
  recipe?: {
    title: string;
    image_url?: string;
  };
}

export interface ThreadReply {
  id: string;
  thread_id: string;
  parent_reply_id?: string;
  author_id: string;
  content: string;
  is_solution: boolean;
  upvote_count: number;
  downvote_count: number;
  images?: string[];
  created_at: string;
  updated_at: string;
  author_profile?: {
    display_name: string;
    avatar_url?: string;
  };
  replies?: ThreadReply[];
}

export interface SocialShare {
  id: string;
  user_id: string;
  content_type: 'recipe' | 'review' | 'thread';
  content_id: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'pinterest' | 'link';
  share_url?: string;
  share_count: number;
  created_at: string;
}

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  actor_id: string;
  activity_type: string;
  content_type?: string;
  content_id?: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
  actor_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  actor_id?: string;
  notification_type: string;
  title: string;
  message: string;
  content_type?: string;
  content_id?: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  actor_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export class SocialService {
  // =====================================================
  // Creator Following System
  // =====================================================

  static async followCreator(followerId: string, creatorId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('creator_followers')
        .insert({
          id: uuidv4(),
          follower_id: followerId,
          creator_id: creatorId
        });

      if (error) throw error;

      // Create notification for creator
      await this.createNotification({
        recipient_id: creatorId,
        actor_id: followerId,
        notification_type: 'new_follower',
        title: 'New Follower',
        message: 'Someone started following you!'
      });

      // Add to activity feed
      await this.addToActivityFeed(followerId, followerId, 'followed_creator', 'profile', creatorId);

      return true;
    } catch (error) {
      console.error('Follow creator error:', error);
      return false;
    }
  }

  static async unfollowCreator(followerId: string, creatorId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('creator_followers')
        .delete()
        .eq('follower_id', followerId)
        .eq('creator_id', creatorId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Unfollow creator error:', error);
      return false;
    }
  }

  static async isFollowingCreator(followerId: string, creatorId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('creator_followers')
        .select('id')
        .eq('follower_id', followerId)
        .eq('creator_id', creatorId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Check following status error:', error);
      return false;
    }
  }

  static async getCreatorFollowers(creatorId: string): Promise<CreatorFollow[]> {
    try {
      const { data, error } = await supabase
        .from('creator_followers')
        .select(`
          *,
          follower:profiles!creator_followers_follower_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('creator_id', creatorId)
        .order('followed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get creator followers error:', error);
      return [];
    }
  }

  static async getUserFollowing(userId: string): Promise<CreatorFollow[]> {
    try {
      const { data, error } = await supabase
        .from('creator_followers')
        .select(`
          *,
          creator:profiles!creator_followers_creator_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('follower_id', userId)
        .order('followed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user following error:', error);
      return [];
    }
  }

  // =====================================================
  // Recipe Rating & Reviews System
  // =====================================================

  static async createReview(reviewData: {
    recipe_id: string;
    user_id: string;
    rating: number;
    review_text?: string;
    success_rate?: number;
    cooking_time_actual?: number;
    difficulty_experienced?: number;
    modifications?: string[];
    would_make_again?: boolean;
    images?: string[];
  }): Promise<RecipeReview | null> {
    try {
      const { data, error } = await supabase
        .from('recipe_reviews')
        .insert({
          id: uuidv4(),
          ...reviewData
        })
        .select(`
          *,
          user_profile:profiles!recipe_reviews_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Add to activity feed
      await this.addToActivityFeed(reviewData.user_id, reviewData.user_id, 'reviewed_recipe', 'recipe', reviewData.recipe_id);

      // Update recipe rating average (this would typically be done via a trigger)
      await this.updateRecipeRating(reviewData.recipe_id);

      return data;
    } catch (error) {
      console.error('Create review error:', error);
      return null;
    }
  }

  static async getRecipeReviews(recipeId: string, limit: number = 20, offset: number = 0): Promise<RecipeReview[]> {
    try {
      const { data, error } = await supabase
        .from('recipe_reviews')
        .select(`
          *,
          user_profile:profiles!recipe_reviews_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get recipe reviews error:', error);
      return [];
    }
  }

  static async markReviewHelpful(reviewId: string, userId: string, isHelpful: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('review_helpfulness')
        .upsert({
          review_id: reviewId,
          user_id: userId,
          is_helpful: isHelpful
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Mark review helpful error:', error);
      return false;
    }
  }

  static async updateRecipeRating(recipeId: string): Promise<void> {
    try {
      const { data: reviews, error } = await supabase
        .from('recipe_reviews')
        .select('rating')
        .eq('recipe_id', recipeId);

      if (error || !reviews || reviews.length === 0) return;

      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

      await supabase
        .from('recipes')
        .update({ rating: Math.round(averageRating * 10) / 10 })
        .eq('id', recipeId);
    } catch (error) {
      console.error('Update recipe rating error:', error);
    }
  }

  // =====================================================
  // Community Discussion Features
  // =====================================================

  static async createDiscussionThread(threadData: {
    title: string;
    content: string;
    author_id: string;
    category: string;
    recipe_id?: string;
    tags?: string[];
  }): Promise<DiscussionThread | null> {
    try {
      const { data, error } = await supabase
        .from('discussion_threads')
        .insert({
          id: uuidv4(),
          ...threadData
        })
        .select(`
          *,
          author_profile:profiles!discussion_threads_author_id_fkey (
            display_name,
            avatar_url
          ),
          recipe:recipes (
            title,
            image_url
          )
        `)
        .single();

      if (error) throw error;

      // Add to activity feed
      await this.addToActivityFeed(threadData.author_id, threadData.author_id, 'created_thread', 'thread', data.id);

      return data;
    } catch (error) {
      console.error('Create discussion thread error:', error);
      return null;
    }
  }

  static async getDiscussionThreads(
    category?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<DiscussionThread[]> {
    try {
      let query = supabase
        .from('discussion_threads')
        .select(`
          *,
          author_profile:profiles!discussion_threads_author_id_fkey (
            display_name,
            avatar_url
          ),
          recipe:recipes (
            title,
            image_url
          )
        `)
        .order('last_reply_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get discussion threads error:', error);
      return [];
    }
  }

  static async getThreadReplies(threadId: string): Promise<ThreadReply[]> {
    try {
      const { data, error } = await supabase
        .from('thread_replies')
        .select(`
          *,
          author_profile:profiles!thread_replies_author_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('thread_id', threadId)
        .is('parent_reply_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get nested replies for each top-level reply
      const repliesWithNested = await Promise.all(
        (data || []).map(async (reply) => {
          const nestedReplies = await this.getNestedReplies(reply.id);
          return { ...reply, replies: nestedReplies };
        })
      );

      return repliesWithNested;
    } catch (error) {
      console.error('Get thread replies error:', error);
      return [];
    }
  }

  static async getNestedReplies(parentReplyId: string): Promise<ThreadReply[]> {
    try {
      const { data, error } = await supabase
        .from('thread_replies')
        .select(`
          *,
          author_profile:profiles!thread_replies_author_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('parent_reply_id', parentReplyId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get nested replies error:', error);
      return [];
    }
  }

  static async createThreadReply(replyData: {
    thread_id: string;
    parent_reply_id?: string;
    author_id: string;
    content: string;
    images?: string[];
  }): Promise<ThreadReply | null> {
    try {
      const { data, error } = await supabase
        .from('thread_replies')
        .insert({
          id: uuidv4(),
          ...replyData
        })
        .select(`
          *,
          author_profile:profiles!thread_replies_author_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Add to activity feed
      await this.addToActivityFeed(replyData.author_id, replyData.author_id, 'replied_to_thread', 'thread', replyData.thread_id);

      // Increment thread view count
      await this.incrementThreadViewCount(replyData.thread_id);

      return data;
    } catch (error) {
      console.error('Create thread reply error:', error);
      return null;
    }
  }

  static async voteOnReply(replyId: string, userId: string, voteType: 'upvote' | 'downvote'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reply_votes')
        .upsert({
          reply_id: replyId,
          user_id: userId,
          vote_type: voteType
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Vote on reply error:', error);
      return false;
    }
  }

  static async markReplyAsSolution(replyId: string, threadAuthorId: string): Promise<boolean> {
    try {
      // First verify the user is the thread author
      const { data: thread } = await supabase
        .from('discussion_threads')
        .select('author_id')
        .eq('id', threadAuthorId)
        .single();

      if (!thread || thread.author_id !== threadAuthorId) {
        return false;
      }

      // Unmark any existing solutions for this thread
      await supabase
        .from('thread_replies')
        .update({ is_solution: false })
        .eq('thread_id', threadAuthorId);

      // Mark this reply as solution
      const { error } = await supabase
        .from('thread_replies')
        .update({ is_solution: true })
        .eq('id', replyId);

      if (error) throw error;

      // Add to activity feed
      const { data: reply } = await supabase
        .from('thread_replies')
        .select('author_id')
        .eq('id', replyId)
        .single();

      if (reply) {
        await this.addToActivityFeed(reply.author_id, threadAuthorId, 'marked_solution', 'reply', replyId);
      }

      return true;
    } catch (error) {
      console.error('Mark reply as solution error:', error);
      return false;
    }
  }

  static async incrementThreadViewCount(threadId: string): Promise<void> {
    try {
      await supabase.rpc('increment_thread_view_count', { thread_id: threadId });
    } catch (error) {
      console.error('Increment thread view count error:', error);
    }
  }

  // =====================================================
  // Social Sharing Engine
  // =====================================================

  static async trackSocialShare(shareData: {
    user_id: string;
    content_type: 'recipe' | 'review' | 'thread';
    content_id: string;
    platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'pinterest' | 'link';
    share_url?: string;
  }): Promise<SocialShare | null> {
    try {
      const { data, error } = await supabase
        .from('social_shares')
        .insert({
          id: uuidv4(),
          ...shareData
        })
        .select()
        .single();

      if (error) throw error;

      // Add to activity feed
      await this.addToActivityFeed(shareData.user_id, shareData.user_id, 'shared_recipe', shareData.content_type, shareData.content_id);

      return data;
    } catch (error) {
      console.error('Track social share error:', error);
      return null;
    }
  }

  static async generateShareableLink(contentType: string, contentId: string): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nibbble.com';
    
    switch (contentType) {
      case 'recipe':
        return `${baseUrl}/recipe/${contentId}`;
      case 'review':
        return `${baseUrl}/review/${contentId}`;
      case 'thread':
        return `${baseUrl}/community/thread/${contentId}`;
      default:
        return `${baseUrl}`;
    }
  }

  static async getSharingStats(contentType: string, contentId: string): Promise<{ [platform: string]: number }> {
    try {
      const { data, error } = await supabase
        .from('social_shares')
        .select('platform, share_count')
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      if (error) throw error;

      const stats: { [platform: string]: number } = {};
      data?.forEach(share => {
        stats[share.platform] = (stats[share.platform] || 0) + share.share_count;
      });

      return stats;
    } catch (error) {
      console.error('Get sharing stats error:', error);
      return {};
    }
  }

  // =====================================================
  // Activity Feed & Notifications
  // =====================================================

  static async addToActivityFeed(
    userId: string,
    actorId: string,
    activityType: string,
    contentType?: string,
    contentId?: string,
    metadata?: any
  ): Promise<void> {
    try {
      await supabase
        .from('activity_feed')
        .insert({
          id: uuidv4(),
          user_id: userId,
          actor_id: actorId,
          activity_type: activityType,
          content_type: contentType,
          content_id: contentId,
          metadata: metadata
        });
    } catch (error) {
      console.error('Add to activity feed error:', error);
    }
  }

  static async getActivityFeed(userId: string, limit: number = 20, offset: number = 0): Promise<ActivityFeedItem[]> {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          actor_profile:profiles!activity_feed_actor_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get activity feed error:', error);
      return [];
    }
  }

  static async createNotification(notificationData: {
    recipient_id: string;
    actor_id?: string;
    notification_type: string;
    title: string;
    message: string;
    content_type?: string;
    content_id?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .insert({
          id: uuidv4(),
          ...notificationData
        });
    } catch (error) {
      console.error('Create notification error:', error);
    }
  }

  static async getUserNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<NotificationItem[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor_profile:profiles!notifications_actor_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user notifications error:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('recipient_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return false;
    }
  }

  static async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      return false;
    }
  }

  static async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Get unread notification count error:', error);
      return 0;
    }
  }
}