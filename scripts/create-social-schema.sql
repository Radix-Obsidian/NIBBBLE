-- =====================================================
-- NIBBBLE Tier 5: Social Infrastructure Schema
-- =====================================================

-- Creator Following System
CREATE TABLE IF NOT EXISTS public.creator_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notification_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(follower_id, creator_id)
);

-- Recipe Rating & Reviews System
CREATE TABLE IF NOT EXISTS public.recipe_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    success_rate INTEGER CHECK (success_rate >= 0 AND success_rate <= 100),
    cooking_time_actual INTEGER, -- in minutes
    difficulty_experienced INTEGER CHECK (difficulty_experienced >= 1 AND difficulty_experienced <= 5),
    modifications TEXT[],
    would_make_again BOOLEAN,
    images TEXT[],
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(recipe_id, user_id)
);

-- Review Helpfulness Tracking
CREATE TABLE IF NOT EXISTS public.review_helpfulness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.recipe_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(review_id, user_id)
);

-- Community Discussion Threads
CREATE TABLE IF NOT EXISTS public.discussion_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'recipe-help', 'techniques', 'ingredients', 'equipment', 'dietary')),
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP WITH TIME ZONE,
    last_reply_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Discussion Thread Replies
CREATE TABLE IF NOT EXISTS public.thread_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES public.thread_replies(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_solution BOOLEAN DEFAULT false,
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reply Voting System
CREATE TABLE IF NOT EXISTS public.reply_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reply_id UUID NOT NULL REFERENCES public.thread_replies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(reply_id, user_id)
);

-- Social Sharing Tracking
CREATE TABLE IF NOT EXISTS public.social_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('recipe', 'review', 'thread')),
    content_id UUID NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('twitter', 'instagram', 'facebook', 'tiktok', 'pinterest', 'link')),
    share_url TEXT,
    share_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Activity Feed
CREATE TABLE IF NOT EXISTS public.activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(30) NOT NULL CHECK (activity_type IN (
        'followed_creator', 'reviewed_recipe', 'shared_recipe', 
        'created_thread', 'replied_to_thread', 'marked_solution',
        'liked_recipe', 'bookmarked_recipe'
    )),
    content_type VARCHAR(20),
    content_id UUID,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Preferences for Social Features
CREATE TABLE IF NOT EXISTS public.social_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    activity_visibility VARCHAR(20) DEFAULT 'public' CHECK (activity_visibility IN ('public', 'followers', 'private')),
    allow_recipe_sharing BOOLEAN DEFAULT true,
    allow_review_sharing BOOLEAN DEFAULT true,
    show_success_rate BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Notification System
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(30) NOT NULL CHECK (notification_type IN (
        'new_follower', 'recipe_reviewed', 'recipe_shared', 
        'thread_reply', 'review_helpful', 'solution_marked',
        'creator_new_recipe', 'followed_creator_activity'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    content_type VARCHAR(20),
    content_id UUID,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    is_email_sent BOOLEAN DEFAULT false,
    is_push_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Creator Following Indexes
CREATE INDEX IF NOT EXISTS idx_creator_followers_follower_id ON public.creator_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_creator_followers_creator_id ON public.creator_followers(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_followers_followed_at ON public.creator_followers(followed_at DESC);

-- Recipe Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_recipe_reviews_recipe_id ON public.recipe_reviews(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_reviews_user_id ON public.recipe_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_reviews_rating ON public.recipe_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_reviews_created_at ON public.recipe_reviews(created_at DESC);

-- Discussion Threads Indexes
CREATE INDEX IF NOT EXISTS idx_discussion_threads_category ON public.discussion_threads(category);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_created_at ON public.discussion_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_last_reply_at ON public.discussion_threads(last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_recipe_id ON public.discussion_threads(recipe_id);

-- Thread Replies Indexes
CREATE INDEX IF NOT EXISTS idx_thread_replies_thread_id ON public.thread_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_replies_created_at ON public.thread_replies(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_thread_replies_author_id ON public.thread_replies(author_id);

-- Activity Feed Indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_is_read ON public.activity_feed(is_read);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.creator_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reply_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Creator Followers Policies
CREATE POLICY "Users can view public follows" ON public.creator_followers FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON public.creator_followers FOR ALL USING (auth.uid() = follower_id);

-- Recipe Reviews Policies
CREATE POLICY "Anyone can view reviews" ON public.recipe_reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reviews" ON public.recipe_reviews FOR ALL USING (auth.uid() = user_id);

-- Review Helpfulness Policies
CREATE POLICY "Anyone can view helpfulness" ON public.review_helpfulness FOR SELECT USING (true);
CREATE POLICY "Users can manage their own helpfulness votes" ON public.review_helpfulness FOR ALL USING (auth.uid() = user_id);

-- Discussion Threads Policies
CREATE POLICY "Anyone can view threads" ON public.discussion_threads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create threads" ON public.discussion_threads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own threads" ON public.discussion_threads FOR UPDATE USING (auth.uid() = author_id);

-- Thread Replies Policies
CREATE POLICY "Anyone can view replies" ON public.thread_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.thread_replies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own replies" ON public.thread_replies FOR UPDATE USING (auth.uid() = author_id);

-- Reply Votes Policies
CREATE POLICY "Anyone can view votes" ON public.reply_votes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own votes" ON public.reply_votes FOR ALL USING (auth.uid() = user_id);

-- Social Shares Policies
CREATE POLICY "Users can view their own shares" ON public.social_shares FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own shares" ON public.social_shares FOR ALL USING (auth.uid() = user_id);

-- Activity Feed Policies
CREATE POLICY "Users can view their own activity feed" ON public.activity_feed FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert activity" ON public.activity_feed FOR INSERT WITH CHECK (true);

-- Social Preferences Policies
CREATE POLICY "Users can manage their own preferences" ON public.social_preferences FOR ALL USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Update follower counts when following/unfollowing
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles 
        SET followers_count = followers_count + 1
        WHERE id = NEW.creator_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles 
        SET followers_count = GREATEST(followers_count - 1, 0)
        WHERE id = OLD.creator_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_follower_counts
    AFTER INSERT OR DELETE ON public.creator_followers
    FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- Update reply counts on threads
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.discussion_threads 
        SET 
            reply_count = reply_count + 1,
            last_reply_at = NEW.created_at,
            last_reply_by = NEW.author_id
        WHERE id = NEW.thread_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.discussion_threads 
        SET reply_count = GREATEST(reply_count - 1, 0)
        WHERE id = OLD.thread_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_thread_reply_count
    AFTER INSERT OR DELETE ON public.thread_replies
    FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

-- Update helpful count on reviews
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_helpful THEN
            UPDATE public.recipe_reviews 
            SET helpful_count = helpful_count + 1
            WHERE id = NEW.review_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_helpful != NEW.is_helpful THEN
            UPDATE public.recipe_reviews 
            SET helpful_count = helpful_count + CASE WHEN NEW.is_helpful THEN 1 ELSE -1 END
            WHERE id = NEW.review_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.is_helpful THEN
            UPDATE public.recipe_reviews 
            SET helpful_count = GREATEST(helpful_count - 1, 0)
            WHERE id = OLD.review_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_review_helpful_count
    AFTER INSERT OR UPDATE OR DELETE ON public.review_helpfulness
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Auto-create social preferences for new users
CREATE OR REPLACE FUNCTION create_social_preferences_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.social_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table (assuming it exists)
CREATE TRIGGER trigger_create_social_preferences
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION create_social_preferences_for_user();