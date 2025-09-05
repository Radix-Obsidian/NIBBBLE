-- =====================================================
-- NIBBBLE Tier 6: Platform Intelligence Schema
-- =====================================================

-- Cooking Analytics Engine - Success Pattern Analysis
CREATE TABLE IF NOT EXISTS public.cooking_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    cooking_started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    cooking_completed_at TIMESTAMP WITH TIME ZONE,
    success_rate INTEGER CHECK (success_rate >= 0 AND success_rate <= 100),
    actual_prep_time INTEGER, -- minutes
    actual_cook_time INTEGER, -- minutes
    actual_total_time INTEGER, -- minutes
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    equipment_used JSONB,
    modifications_made TEXT[],
    environmental_factors JSONB, -- temperature, humidity, altitude
    user_skill_level INTEGER CHECK (user_skill_level >= 1 AND user_skill_level <= 5),
    interruptions_count INTEGER DEFAULT 0,
    steps_completed INTEGER,
    steps_total INTEGER,
    failure_points JSONB, -- which steps caused issues
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 10),
    would_cook_again BOOLEAN,
    recommendation_score DECIMAL(3,2) CHECK (recommendation_score >= 0 AND recommendation_score <= 10),
    photos_taken INTEGER DEFAULT 0,
    video_recorded BOOLEAN DEFAULT false,
    shared_results BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Success Pattern Insights
CREATE TABLE IF NOT EXISTS public.success_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN (
        'time_optimization', 'equipment_preference', 'skill_adaptation', 
        'modification_trend', 'seasonal_variance', 'failure_prevention'
    )),
    pattern_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    sample_size INTEGER NOT NULL,
    success_improvement DECIMAL(5,2), -- percentage improvement
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adaptive Learning System - AI Model Training Data
CREATE TABLE IF NOT EXISTS public.ai_training_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN (
        'recipe_success_predictor', 'difficulty_estimator', 'time_predictor',
        'substitution_suggester', 'skill_assessor', 'quality_validator'
    )),
    input_features JSONB NOT NULL,
    expected_output JSONB NOT NULL,
    actual_output JSONB,
    feedback_score DECIMAL(3,2) CHECK (feedback_score >= -1 AND feedback_score <= 1),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
    training_weight DECIMAL(3,2) DEFAULT 1.0,
    is_validated BOOLEAN DEFAULT false,
    validation_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    validated_at TIMESTAMP WITH TIME ZONE
);

-- AI Model Performance Tracking
CREATE TABLE IF NOT EXISTS public.ai_model_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_type VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    metric_type VARCHAR(30) NOT NULL CHECK (metric_type IN (
        'accuracy', 'precision', 'recall', 'f1_score', 'mae', 'rmse', 'user_satisfaction'
    )),
    metric_value DECIMAL(6,4) NOT NULL,
    sample_size INTEGER NOT NULL,
    test_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    test_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    baseline_comparison DECIMAL(6,4),
    improvement_percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance Monitoring - System Health Tracking
CREATE TABLE IF NOT EXISTS public.system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN (
        'api_response_time', 'database_query_time', 'page_load_time', 
        'search_latency', 'recommendation_latency', 'error_rate',
        'user_session_duration', 'feature_usage_rate'
    )),
    service_name VARCHAR(50) NOT NULL,
    endpoint VARCHAR(100),
    metric_value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- ms, seconds, percentage, count
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id UUID,
    user_agent TEXT,
    ip_address INET,
    additional_context JSONB
);

-- Error and Exception Tracking
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type VARCHAR(50) NOT NULL CHECK (error_type IN (
        'api_error', 'database_error', 'validation_error', 'auth_error',
        'payment_error', 'external_service_error', 'ui_error', 'logic_error'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    error_code VARCHAR(20),
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    service_name VARCHAR(50) NOT NULL,
    endpoint VARCHAR(100),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id UUID,
    request_id UUID,
    user_agent TEXT,
    ip_address INET,
    request_data JSONB,
    response_data JSONB,
    resolution_status VARCHAR(20) DEFAULT 'open' CHECK (resolution_status IN ('open', 'investigating', 'resolved', 'ignored')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Feature Usage Analytics
CREATE TABLE IF NOT EXISTS public.feature_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_name VARCHAR(50) NOT NULL,
    feature_category VARCHAR(30) NOT NULL CHECK (feature_category IN (
        'recipe_discovery', 'cooking_assistance', 'social_interaction', 
        'commerce', 'profile_management', 'content_creation'
    )),
    action_type VARCHAR(30) NOT NULL CHECK (action_type IN (
        'view', 'click', 'submit', 'share', 'like', 'comment', 'purchase', 'cancel'
    )),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id UUID,
    duration_ms INTEGER,
    success BOOLEAN DEFAULT true,
    context_data JSONB,
    a_b_test_variant VARCHAR(20),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fraud Prevention - Content Quality Validation
CREATE TABLE IF NOT EXISTS public.content_validation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(30) NOT NULL CHECK (content_type IN (
        'recipe', 'review', 'thread_post', 'profile', 'comment', 'image'
    )),
    content_id UUID NOT NULL,
    validation_type VARCHAR(30) NOT NULL CHECK (validation_type IN (
        'spam_detection', 'quality_assessment', 'authenticity_check',
        'safety_validation', 'plagiarism_detection', 'image_analysis'
    )),
    validation_status VARCHAR(20) NOT NULL CHECK (validation_status IN (
        'pending', 'approved', 'flagged', 'rejected', 'needs_review'
    )),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    validation_details JSONB,
    automated_flags JSONB,
    human_review_required BOOLEAN DEFAULT false,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    appeal_status VARCHAR(20) CHECK (appeal_status IN ('none', 'submitted', 'under_review', 'approved', 'denied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fraud Detection Patterns
CREATE TABLE IF NOT EXISTS public.fraud_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN (
        'fake_review', 'bot_activity', 'spam_content', 'manipulation_attempt',
        'copyright_violation', 'unsafe_content', 'promotional_spam'
    )),
    detection_algorithm VARCHAR(50) NOT NULL,
    pattern_signature JSONB NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    auto_action VARCHAR(30) CHECK (auto_action IN (
        'none', 'flag_content', 'hide_content', 'suspend_user', 'require_verification'
    )),
    false_positive_rate DECIMAL(4,3),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Trust Scores
CREATE TABLE IF NOT EXISTS public.user_trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_trust_score DECIMAL(4,2) CHECK (overall_trust_score >= 0 AND overall_trust_score <= 100),
    content_quality_score DECIMAL(4,2) CHECK (content_quality_score >= 0 AND content_quality_score <= 100),
    engagement_authenticity_score DECIMAL(4,2) CHECK (engagement_authenticity_score >= 0 AND engagement_authenticity_score <= 100),
    community_reputation_score DECIMAL(4,2) CHECK (community_reputation_score >= 0 AND community_reputation_score <= 100),
    verification_level VARCHAR(20) DEFAULT 'unverified' CHECK (verification_level IN (
        'unverified', 'email_verified', 'phone_verified', 'identity_verified', 'expert_verified'
    )),
    flags_count INTEGER DEFAULT 0,
    successful_contributions INTEGER DEFAULT 0,
    community_endorsements INTEGER DEFAULT 0,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    calculation_version VARCHAR(10) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Business Intelligence Aggregations
CREATE TABLE IF NOT EXISTS public.business_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(50) NOT NULL,
    metric_category VARCHAR(30) NOT NULL CHECK (metric_category IN (
        'user_growth', 'engagement', 'content_creation', 'revenue', 
        'retention', 'acquisition', 'satisfaction', 'performance'
    )),
    metric_value DECIMAL(12,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('hour', 'day', 'week', 'month', 'quarter', 'year')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    comparison_previous_period DECIMAL(12,4),
    growth_rate DECIMAL(6,2), -- percentage
    target_value DECIMAL(12,4),
    target_achievement_rate DECIMAL(5,2), -- percentage
    additional_dimensions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Cooking Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_cooking_analytics_recipe_id ON public.cooking_analytics(recipe_id);
CREATE INDEX IF NOT EXISTS idx_cooking_analytics_user_id ON public.cooking_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_cooking_analytics_session_id ON public.cooking_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_cooking_analytics_started_at ON public.cooking_analytics(cooking_started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cooking_analytics_success_rate ON public.cooking_analytics(success_rate DESC);

-- Success Patterns Indexes
CREATE INDEX IF NOT EXISTS idx_success_patterns_recipe_id ON public.success_patterns(recipe_id);
CREATE INDEX IF NOT EXISTS idx_success_patterns_type ON public.success_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_success_patterns_active ON public.success_patterns(is_active);

-- AI Training Data Indexes
CREATE INDEX IF NOT EXISTS idx_ai_training_data_model_type ON public.ai_training_data(model_type);
CREATE INDEX IF NOT EXISTS idx_ai_training_data_validated ON public.ai_training_data(is_validated);
CREATE INDEX IF NOT EXISTS idx_ai_training_data_created_at ON public.ai_training_data(created_at DESC);

-- System Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON public.system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_service ON public.system_metrics(service_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON public.system_metrics(timestamp DESC);

-- Error Logs Indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON public.error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_status ON public.error_logs(resolution_status);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);

-- Feature Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_feature_analytics_feature ON public.feature_analytics(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_analytics_category ON public.feature_analytics(feature_category);
CREATE INDEX IF NOT EXISTS idx_feature_analytics_user_id ON public.feature_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_analytics_timestamp ON public.feature_analytics(timestamp DESC);

-- Content Validation Indexes
CREATE INDEX IF NOT EXISTS idx_content_validation_type ON public.content_validation(content_type);
CREATE INDEX IF NOT EXISTS idx_content_validation_content_id ON public.content_validation(content_id);
CREATE INDEX IF NOT EXISTS idx_content_validation_status ON public.content_validation(validation_status);
CREATE INDEX IF NOT EXISTS idx_content_validation_requires_review ON public.content_validation(human_review_required);

-- User Trust Scores Indexes
CREATE INDEX IF NOT EXISTS idx_user_trust_scores_user_id ON public.user_trust_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trust_scores_overall ON public.user_trust_scores(overall_trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_trust_scores_verification ON public.user_trust_scores(verification_level);

-- Business Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_business_metrics_name ON public.business_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_business_metrics_category ON public.business_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_business_metrics_period ON public.business_metrics(period_type, period_start DESC);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.cooking_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;

-- Cooking Analytics Policies
CREATE POLICY "Users can view their own cooking analytics" ON public.cooking_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cooking analytics" ON public.cooking_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cooking analytics" ON public.cooking_analytics FOR UPDATE USING (auth.uid() = user_id);

-- Success Patterns Policies (read-only for users)
CREATE POLICY "Anyone can view active success patterns" ON public.success_patterns FOR SELECT USING (is_active = true);

-- AI Training Data Policies (system only)
CREATE POLICY "System can manage AI training data" ON public.ai_training_data FOR ALL USING (true);

-- System Metrics Policies (admin only)
CREATE POLICY "Admins can view system metrics" ON public.system_metrics FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Content Validation Policies
CREATE POLICY "Users can view validation of their content" ON public.content_validation FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.recipes WHERE id = content_id AND creator_id = auth.uid()
        UNION
        SELECT 1 FROM public.recipe_reviews WHERE id = content_id AND user_id = auth.uid()
        UNION
        SELECT 1 FROM public.discussion_threads WHERE id = content_id AND author_id = auth.uid()
    )
);

-- User Trust Scores Policies
CREATE POLICY "Users can view their own trust score" ON public.user_trust_scores FOR SELECT USING (auth.uid() = user_id);

-- Business Metrics Policies (admin only)
CREATE POLICY "Admins can view business metrics" ON public.business_metrics FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Update cooking analytics when reviews are created
CREATE OR REPLACE FUNCTION sync_cooking_analytics_from_review()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.cooking_analytics (
        recipe_id,
        user_id,
        session_id,
        cooking_started_at,
        cooking_completed_at,
        success_rate,
        actual_total_time,
        difficulty_rating,
        quality_score,
        would_cook_again
    ) VALUES (
        NEW.recipe_id,
        NEW.user_id,
        gen_random_uuid(),
        NEW.created_at - INTERVAL '2 hours', -- estimate cooking start
        NEW.created_at,
        NEW.success_rate,
        NEW.cooking_time_actual,
        NEW.difficulty_experienced,
        NEW.rating * 2, -- convert 1-5 to 1-10 scale
        NEW.would_make_again
    )
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_cooking_analytics
    AFTER INSERT ON public.recipe_reviews
    FOR EACH ROW EXECUTE FUNCTION sync_cooking_analytics_from_review();

-- Auto-calculate user trust scores
CREATE OR REPLACE FUNCTION calculate_user_trust_score(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
    content_quality DECIMAL(4,2) := 50.0;
    engagement_auth DECIMAL(4,2) := 50.0;
    community_rep DECIMAL(4,2) := 50.0;
    overall_trust DECIMAL(4,2);
BEGIN
    -- Calculate content quality score (based on reviews and ratings)
    SELECT COALESCE(AVG(helpful_count::DECIMAL / GREATEST(1, (SELECT COUNT(*) FROM public.recipe_reviews))) * 100, 50.0)
    INTO content_quality
    FROM public.recipe_reviews
    WHERE user_id = target_user_id;

    -- Calculate engagement authenticity (simplified)
    SELECT COALESCE(50.0 + LEAST(50.0, COUNT(*) * 2), 50.0)
    INTO engagement_auth
    FROM public.recipe_reviews
    WHERE user_id = target_user_id AND created_at > NOW() - INTERVAL '30 days';

    -- Calculate community reputation (based on follows and interactions)
    SELECT COALESCE(50.0 + LEAST(50.0, COUNT(*) * 1), 50.0)
    INTO community_rep
    FROM public.creator_followers
    WHERE creator_id = target_user_id;

    -- Calculate overall trust score
    overall_trust := (content_quality * 0.4 + engagement_auth * 0.3 + community_rep * 0.3);

    -- Upsert trust score
    INSERT INTO public.user_trust_scores (
        user_id,
        overall_trust_score,
        content_quality_score,
        engagement_authenticity_score,
        community_reputation_score,
        last_calculated
    ) VALUES (
        target_user_id,
        overall_trust,
        content_quality,
        engagement_auth,
        community_rep,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        overall_trust_score = EXCLUDED.overall_trust_score,
        content_quality_score = EXCLUDED.content_quality_score,
        engagement_authenticity_score = EXCLUDED.engagement_authenticity_score,
        community_reputation_score = EXCLUDED.community_reputation_score,
        last_calculated = EXCLUDED.last_calculated,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update trust scores when users create content
CREATE OR REPLACE FUNCTION trigger_update_trust_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Schedule trust score recalculation (in a real system, this would be queued)
    PERFORM calculate_user_trust_score(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_trust_score_on_review
    AFTER INSERT ON public.recipe_reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_update_trust_score();

-- Performance monitoring function
CREATE OR REPLACE FUNCTION log_system_metric(
    p_metric_type VARCHAR(50),
    p_service_name VARCHAR(50),
    p_endpoint VARCHAR(100),
    p_metric_value DECIMAL(10,4),
    p_unit VARCHAR(20),
    p_user_id UUID DEFAULT NULL,
    p_session_id UUID DEFAULT NULL,
    p_additional_context JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.system_metrics (
        metric_type,
        service_name,
        endpoint,
        metric_value,
        unit,
        user_id,
        session_id,
        additional_context
    ) VALUES (
        p_metric_type,
        p_service_name,
        p_endpoint,
        p_metric_value,
        p_unit,
        p_user_id,
        p_session_id,
        p_additional_context
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;