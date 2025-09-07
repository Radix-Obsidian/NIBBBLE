-- =====================================================
-- NIBBBLE ALPHA LAUNCH DATABASE SCHEMA
-- =====================================================
-- Alpha-specific tables for controlled launch
-- Core AI cooking experience focus only

-- =====================================================
-- ALPHA USER MANAGEMENT
-- =====================================================

-- Alpha users table for controlled access
CREATE TABLE IF NOT EXISTS alpha_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    invite_code TEXT UNIQUE,
    status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'activated', 'suspended')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 1 CHECK (onboarding_step >= 1 AND onboarding_step <= 5),
    cooking_profile JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alpha user profiles (enhanced for cooking focus)
CREATE TABLE IF NOT EXISTS alpha_cooking_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    alpha_user_id UUID REFERENCES alpha_users(id) ON DELETE CASCADE,
    
    -- Cooking Profile Data
    skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'home_cook', 'experienced', 'chef')),
    dietary_restrictions TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    cooking_goals TEXT[] DEFAULT '{}',
    kitchen_equipment JSONB DEFAULT '{}',
    preferred_cuisines TEXT[] DEFAULT '{}',
    cooking_time_preference TEXT DEFAULT 'moderate' CHECK (cooking_time_preference IN ('quick', 'moderate', 'leisurely')),
    
    -- Alpha Metrics
    recipes_attempted INTEGER DEFAULT 0,
    recipes_completed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    ai_features_used INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ALPHA RECIPES & AI ADAPTATIONS
-- =====================================================

-- Alpha recipe attempts (core metric tracking)
CREATE TABLE IF NOT EXISTS alpha_recipe_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    alpha_user_id UUID REFERENCES alpha_users(id) ON DELETE CASCADE,
    
    -- Recipe Information
    recipe_id TEXT NOT NULL, -- Can reference external recipe APIs
    recipe_title TEXT NOT NULL,
    recipe_source TEXT DEFAULT 'spoonacular',
    original_recipe_data JSONB DEFAULT '{}',
    
    -- AI Adaptations Applied
    ai_adaptations_applied JSONB DEFAULT '[]',
    skill_level_adjustment TEXT,
    dietary_adaptations TEXT[] DEFAULT '{}',
    equipment_adaptations TEXT[] DEFAULT '{}',
    ingredient_substitutions JSONB DEFAULT '{}',
    
    -- Session Tracking
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    abandoned_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'completed', 'abandoned')),
    
    -- Success Metrics
    success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 10),
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    would_cook_again BOOLEAN,
    cooking_duration_minutes INTEGER,
    
    -- AI Performance
    ai_response_times JSONB DEFAULT '{}',
    ai_suggestions_used INTEGER DEFAULT 0,
    ai_suggestions_total INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ALPHA FEEDBACK SYSTEM
-- =====================================================

-- Alpha feedback collection
CREATE TABLE IF NOT EXISTS alpha_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    alpha_user_id UUID REFERENCES alpha_users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES alpha_recipe_sessions(id) ON DELETE CASCADE,
    
    -- Feedback Type
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('post_cooking', 'first_day', 'weekly', 'exit', 'bug_report', 'feature_request')),
    trigger_context TEXT,
    
    -- Feedback Data
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    feedback_text TEXT,
    feedback_data JSONB DEFAULT '{}',
    
    -- AI Feature Feedback
    ai_helped BOOLEAN,
    ai_features_used TEXT[] DEFAULT '{}',
    ai_suggestion_quality INTEGER CHECK (ai_suggestion_quality >= 1 AND ai_suggestion_quality <= 5),
    
    -- Categorization
    sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'addressed', 'closed')),
    
    -- Metadata
    device_type TEXT,
    browser_info JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ALPHA METRICS & ANALYTICS
-- =====================================================

-- Alpha metrics aggregation (daily snapshots)
CREATE TABLE IF NOT EXISTS alpha_metrics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL,
    
    -- User Metrics
    total_alpha_users INTEGER DEFAULT 0,
    active_users_today INTEGER DEFAULT 0,
    new_activations_today INTEGER DEFAULT 0,
    
    -- Recipe Session Metrics
    total_sessions_today INTEGER DEFAULT 0,
    completed_sessions_today INTEGER DEFAULT 0,
    abandoned_sessions_today INTEGER DEFAULT 0,
    
    -- Success Metrics
    average_success_rating DECIMAL(3,2) DEFAULT 0.0,
    completion_rate DECIMAL(5,2) DEFAULT 0.0,
    ai_usage_rate DECIMAL(5,2) DEFAULT 0.0,
    
    -- Performance Metrics
    average_ai_response_time DECIMAL(6,2) DEFAULT 0.0,
    average_session_duration DECIMAL(8,2) DEFAULT 0.0,
    
    -- Feedback Metrics
    feedback_count INTEGER DEFAULT 0,
    average_feedback_rating DECIMAL(3,2) DEFAULT 0.0,
    critical_issues_today INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alpha user journey tracking
CREATE TABLE IF NOT EXISTS alpha_user_journey (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    alpha_user_id UUID REFERENCES alpha_users(id) ON DELETE CASCADE,
    
    -- Journey Stage
    stage TEXT NOT NULL CHECK (stage IN ('invited', 'activated', 'onboarding', 'first_recipe', 'ai_adaptation', 'completion', 'feedback', 'retention')),
    stage_data JSONB DEFAULT '{}',
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Context
    device_type TEXT,
    referrer TEXT,
    session_id TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ALPHA WAITLIST INTEGRATION
-- =====================================================

-- Enhanced waitlist for alpha management
CREATE TABLE IF NOT EXISTS alpha_waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    
    -- Waitlist Data
    signup_source TEXT DEFAULT 'website',
    referral_code TEXT,
    interest_level TEXT DEFAULT 'medium' CHECK (interest_level IN ('low', 'medium', 'high')),
    cooking_experience TEXT DEFAULT 'beginner',
    
    -- Alpha Invitation
    invited BOOLEAN DEFAULT FALSE,
    invited_at TIMESTAMP WITH TIME ZONE,
    invite_code TEXT UNIQUE,
    activated BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMP WITH TIME ZONE,
    
    -- Priority Scoring
    priority_score INTEGER DEFAULT 0,
    early_access BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Alpha users indexes
CREATE INDEX IF NOT EXISTS idx_alpha_users_user_id ON alpha_users(user_id);
CREATE INDEX IF NOT EXISTS idx_alpha_users_status ON alpha_users(status);
CREATE INDEX IF NOT EXISTS idx_alpha_users_invite_code ON alpha_users(invite_code);

-- Alpha cooking profiles indexes
CREATE INDEX IF NOT EXISTS idx_alpha_cooking_profiles_user_id ON alpha_cooking_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_alpha_cooking_profiles_skill_level ON alpha_cooking_profiles(skill_level);

-- Alpha recipe sessions indexes
CREATE INDEX IF NOT EXISTS idx_alpha_recipe_sessions_user_id ON alpha_recipe_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_alpha_recipe_sessions_status ON alpha_recipe_sessions(status);
CREATE INDEX IF NOT EXISTS idx_alpha_recipe_sessions_started_at ON alpha_recipe_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_alpha_recipe_sessions_completed_at ON alpha_recipe_sessions(completed_at);

-- Alpha feedback indexes
CREATE INDEX IF NOT EXISTS idx_alpha_feedback_user_id ON alpha_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_alpha_feedback_type ON alpha_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_alpha_feedback_priority ON alpha_feedback(priority);
CREATE INDEX IF NOT EXISTS idx_alpha_feedback_status ON alpha_feedback(status);

-- Alpha metrics indexes
CREATE INDEX IF NOT EXISTS idx_alpha_metrics_daily_date ON alpha_metrics_daily(metric_date);

-- Alpha user journey indexes
CREATE INDEX IF NOT EXISTS idx_alpha_user_journey_user_id ON alpha_user_journey(user_id);
CREATE INDEX IF NOT EXISTS idx_alpha_user_journey_stage ON alpha_user_journey(stage);

-- Alpha waitlist indexes
CREATE INDEX IF NOT EXISTS idx_alpha_waitlist_email ON alpha_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_alpha_waitlist_invited ON alpha_waitlist(invited);
CREATE INDEX IF NOT EXISTS idx_alpha_waitlist_priority_score ON alpha_waitlist(priority_score DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all alpha tables
ALTER TABLE alpha_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE alpha_cooking_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alpha_recipe_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alpha_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE alpha_user_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE alpha_waitlist ENABLE ROW LEVEL SECURITY;

-- Alpha users policies
CREATE POLICY "Users can view their own alpha profile" ON alpha_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alpha profile" ON alpha_users
    FOR UPDATE USING (auth.uid() = user_id);

-- Alpha cooking profiles policies
CREATE POLICY "Users can view their own cooking profile" ON alpha_cooking_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own cooking profile" ON alpha_cooking_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cooking profile" ON alpha_cooking_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Alpha recipe sessions policies
CREATE POLICY "Users can view their own recipe sessions" ON alpha_recipe_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipe sessions" ON alpha_recipe_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipe sessions" ON alpha_recipe_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Alpha feedback policies
CREATE POLICY "Users can view their own feedback" ON alpha_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback" ON alpha_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Alpha user journey policies
CREATE POLICY "Users can view their own journey" ON alpha_user_journey
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create journey events" ON alpha_user_journey
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role policies for metrics (admin access)
CREATE POLICY "Service role can access alpha metrics" ON alpha_metrics_daily
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access waitlist" ON alpha_waitlist
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_alpha_users_updated_at
    BEFORE UPDATE ON alpha_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alpha_cooking_profiles_updated_at
    BEFORE UPDATE ON alpha_cooking_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alpha_recipe_sessions_updated_at
    BEFORE UPDATE ON alpha_recipe_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alpha_feedback_updated_at
    BEFORE UPDATE ON alpha_feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alpha_waitlist_updated_at
    BEFORE UPDATE ON alpha_waitlist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ALPHA LAUNCH SUCCESS FUNCTIONS
-- =====================================================

-- Function to calculate user success rate
CREATE OR REPLACE FUNCTION calculate_user_success_rate(user_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    success_rate DECIMAL(5,2);
BEGIN
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 0.0
            ELSE ROUND((COUNT(*) FILTER (WHERE success_rating >= 7) * 100.0) / COUNT(*), 2)
        END
    INTO success_rate
    FROM alpha_recipe_sessions
    WHERE user_id = user_uuid AND status = 'completed';
    
    RETURN COALESCE(success_rate, 0.0);
END;
$$ LANGUAGE plpgsql;

-- Function to get alpha metrics summary
CREATE OR REPLACE FUNCTION get_alpha_metrics_summary()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_alpha_users', (SELECT COUNT(*) FROM alpha_users WHERE status = 'activated'),
        'recipe_completion_rate', (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0.0
                ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completed') * 100.0) / COUNT(*), 2)
            END
            FROM alpha_recipe_sessions
            WHERE created_at >= CURRENT_DATE
        ),
        'average_success_rating', (
            SELECT ROUND(AVG(success_rating), 2)
            FROM alpha_recipe_sessions
            WHERE status = 'completed' AND success_rating IS NOT NULL
        ),
        'ai_usage_rate', (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0.0
                ELSE ROUND((COUNT(*) FILTER (WHERE ai_suggestions_used > 0) * 100.0) / COUNT(*), 2)
            END
            FROM alpha_recipe_sessions
            WHERE status = 'completed'
        ),
        'critical_feedback_count', (
            SELECT COUNT(*)
            FROM alpha_feedback
            WHERE priority = 'critical' AND status = 'new'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE ALPHA USER CREATION
-- =====================================================

-- Function to create alpha user from waitlist
CREATE OR REPLACE FUNCTION invite_alpha_user(user_email TEXT, invite_code_param TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
    alpha_user_id UUID;
    generated_code TEXT;
BEGIN
    -- Generate invite code if not provided
    IF invite_code_param IS NULL THEN
        generated_code := 'ALPHA-' || upper(substring(gen_random_uuid()::text from 1 for 8));
    ELSE
        generated_code := invite_code_param;
    END IF;
    
    -- Create alpha user record
    INSERT INTO alpha_users (email, invite_code, status)
    VALUES (user_email, generated_code, 'invited')
    RETURNING id INTO alpha_user_id;
    
    -- Update waitlist if exists
    UPDATE alpha_waitlist 
    SET invited = TRUE, invited_at = NOW(), invite_code = generated_code
    WHERE email = user_email;
    
    RETURN alpha_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL ALPHA METRICS SETUP
-- =====================================================

-- Insert initial daily metrics entry
INSERT INTO alpha_metrics_daily (metric_date) 
VALUES (CURRENT_DATE) 
ON CONFLICT DO NOTHING;

-- =====================================================
-- ALPHA LAUNCH READY CONFIRMATION
-- =====================================================

-- Create a view for alpha launch readiness
CREATE OR REPLACE VIEW alpha_launch_readiness AS
SELECT 
    'Alpha Database Schema' as component,
    'READY' as status,
    NOW() as checked_at,
    json_build_object(
        'tables_created', (
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'alpha_%'
        ),
        'indexes_created', (
            SELECT COUNT(*) 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname LIKE 'idx_alpha_%'
        ),
        'policies_created', (
            SELECT COUNT(*) 
            FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename LIKE 'alpha_%'
        )
    ) as details;

-- Show readiness status
SELECT * FROM alpha_launch_readiness;

-- =====================================================
-- END ALPHA DATABASE SCHEMA
-- =====================================================