-- Alpha Launch Database Migration
-- This migration sets up all the necessary tables for the alpha launch system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Update profiles table for alpha users
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_alpha_user BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS alpha_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS alpha_cohort TEXT,
ADD COLUMN IF NOT EXISTS alpha_activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS alpha_invite_code TEXT,
ADD COLUMN IF NOT EXISTS alpha_priority_level TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS alpha_feedback_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS alpha_onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS alpha_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS waitlist_joined_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS waitlist_source TEXT;

-- Add check constraints
ALTER TABLE profiles 
ADD CONSTRAINT check_alpha_status 
CHECK (alpha_status IN ('inactive', 'pending', 'active', 'paused', 'churned')),
ADD CONSTRAINT check_alpha_priority 
CHECK (alpha_priority_level IN ('low', 'medium', 'high'));

-- Create index for alpha user queries
CREATE INDEX IF NOT EXISTS idx_profiles_alpha_users 
ON profiles (is_alpha_user, alpha_status) WHERE is_alpha_user = true;

-- 2. Alpha invites table
CREATE TABLE IF NOT EXISTS alpha_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  invited_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  expires_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  reminders_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_invite_status 
  CHECK (status IN ('sent', 'opened', 'activated', 'expired'))
);

-- Create indexes for alpha invites
CREATE INDEX IF NOT EXISTS idx_alpha_invites_code ON alpha_invites (invite_code);
CREATE INDEX IF NOT EXISTS idx_alpha_invites_email ON alpha_invites (email);
CREATE INDEX IF NOT EXISTS idx_alpha_invites_status ON alpha_invites (status);

-- 3. Alpha onboarding table
CREATE TABLE IF NOT EXISTS alpha_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  total_steps INTEGER NOT NULL DEFAULT 5,
  step_data JSONB DEFAULT '{}',
  personalized_recommendations TEXT[] DEFAULT '{}',
  assigned_mentor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create index for onboarding queries
CREATE INDEX IF NOT EXISTS idx_alpha_onboarding_user ON alpha_onboarding (user_id);

-- 4. Cooking sessions table (enhanced for alpha tracking)
CREATE TABLE IF NOT EXISTS cooking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  adaptation_id TEXT,
  status TEXT NOT NULL DEFAULT 'preparing',
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estimated_end_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  duration INTEGER, -- minutes
  success_rating INTEGER, -- 1-5
  difficulty_rating INTEGER, -- 1-5
  ai_guidance_used BOOLEAN DEFAULT FALSE,
  adaptations_used TEXT[] DEFAULT '{}',
  issues_encountered TEXT[] DEFAULT '{}',
  steps_completed INTEGER DEFAULT 0,
  user_notes TEXT,
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_session_status 
  CHECK (status IN ('preparing', 'cooking', 'completed', 'abandoned')),
  CONSTRAINT check_success_rating 
  CHECK (success_rating IS NULL OR (success_rating >= 1 AND success_rating <= 5)),
  CONSTRAINT check_difficulty_rating 
  CHECK (difficulty_rating IS NULL OR (difficulty_rating >= 1 AND difficulty_rating <= 5))
);

-- Create indexes for cooking sessions
CREATE INDEX IF NOT EXISTS idx_cooking_sessions_user ON cooking_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_cooking_sessions_recipe ON cooking_sessions (recipe_id);
CREATE INDEX IF NOT EXISTS idx_cooking_sessions_status ON cooking_sessions (status);
CREATE INDEX IF NOT EXISTS idx_cooking_sessions_start_time ON cooking_sessions (start_time);

-- 5. AI feature usage tracking
CREATE TABLE IF NOT EXISTS ai_feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  recipe_id TEXT,
  session_id UUID REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT check_ai_feature 
  CHECK (feature IN ('recipe_adaptation', 'success_prediction', 'cooking_assistant', 'smart_search'))
);

-- Create indexes for AI feature usage
CREATE INDEX IF NOT EXISTS idx_ai_feature_usage_user ON ai_feature_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feature_usage_feature ON ai_feature_usage (feature);
CREATE INDEX IF NOT EXISTS idx_ai_feature_usage_timestamp ON ai_feature_usage (timestamp);

-- 6. User journey events
CREATE TABLE IF NOT EXISTS user_journey_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT check_journey_event 
  CHECK (event IN ('signup', 'first_recipe_view', 'first_cooking_session', 'first_success', 'skill_progression', 'feature_discovery'))
);

-- Create indexes for user journey events
CREATE INDEX IF NOT EXISTS idx_user_journey_events_user ON user_journey_events (user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_event ON user_journey_events (event);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_timestamp ON user_journey_events (timestamp);

-- 7. Cooking feedback table
CREATE TABLE IF NOT EXISTS cooking_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  
  -- Core ratings
  overall_rating INTEGER NOT NULL,
  difficulty_rating INTEGER NOT NULL,
  ai_helpfulness_rating INTEGER DEFAULT 0,
  
  -- Feedback arrays
  what_worked_well TEXT[] DEFAULT '{}',
  what_was_confusing TEXT[] DEFAULT '{}',
  suggested_improvements TEXT[] DEFAULT '{}',
  issues_encountered TEXT[] DEFAULT '{}',
  
  -- Experience metrics
  time_spent INTEGER, -- minutes
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  adaptations_used TEXT[] DEFAULT '{}',
  
  -- AI-specific feedback
  ai_features JSONB DEFAULT '{}',
  
  -- Free-form feedback
  additional_comments TEXT,
  would_recommend BOOLEAN,
  likely_to_return_rating INTEGER, -- 1-5 NPS style
  
  -- Context
  device_type TEXT,
  cooking_context TEXT,
  skill_level INTEGER,
  previous_experience TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_overall_rating 
  CHECK (overall_rating >= 1 AND overall_rating <= 5),
  CONSTRAINT check_difficulty_rating_feedback 
  CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  CONSTRAINT check_ai_helpfulness_rating 
  CHECK (ai_helpfulness_rating >= 0 AND ai_helpfulness_rating <= 5),
  CONSTRAINT check_return_rating 
  CHECK (likely_to_return_rating IS NULL OR (likely_to_return_rating >= 1 AND likely_to_return_rating <= 5)),
  CONSTRAINT check_device_type 
  CHECK (device_type IS NULL OR device_type IN ('mobile', 'tablet', 'desktop'))
);

-- Create indexes for cooking feedback
CREATE INDEX IF NOT EXISTS idx_cooking_feedback_user ON cooking_feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_cooking_feedback_session ON cooking_feedback (session_id);
CREATE INDEX IF NOT EXISTS idx_cooking_feedback_recipe ON cooking_feedback (recipe_id);
CREATE INDEX IF NOT EXISTS idx_cooking_feedback_rating ON cooking_feedback (overall_rating);
CREATE INDEX IF NOT EXISTS idx_cooking_feedback_created ON cooking_feedback (created_at);

-- 8. Micro surveys table
CREATE TABLE IF NOT EXISTS micro_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  questions JSONB NOT NULL,
  target_criteria JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_survey_type 
  CHECK (type IN ('quick_rating', 'feature_specific', 'onboarding', 'retention'))
);

-- Create index for micro surveys
CREATE INDEX IF NOT EXISTS idx_micro_surveys_active ON micro_surveys (active, priority);

-- 9. Micro survey responses
CREATE TABLE IF NOT EXISTS micro_survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  survey_id UUID NOT NULL REFERENCES micro_surveys(id) ON DELETE CASCADE,
  session_id UUID REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  context JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for survey responses
CREATE INDEX IF NOT EXISTS idx_micro_survey_responses_user ON micro_survey_responses (user_id);
CREATE INDEX IF NOT EXISTS idx_micro_survey_responses_survey ON micro_survey_responses (survey_id);
CREATE INDEX IF NOT EXISTS idx_micro_survey_responses_submitted ON micro_survey_responses (submitted_at);

-- 10. Critical feedback alerts
CREATE TABLE IF NOT EXISTS critical_feedback_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES cooking_feedback(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issue TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  action_taken BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_alert_severity 
  CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Create indexes for critical feedback alerts
CREATE INDEX IF NOT EXISTS idx_critical_feedback_alerts_user ON critical_feedback_alerts (user_id);
CREATE INDEX IF NOT EXISTS idx_critical_feedback_alerts_severity ON critical_feedback_alerts (severity);
CREATE INDEX IF NOT EXISTS idx_critical_feedback_alerts_action ON critical_feedback_alerts (action_taken);

-- 11. Real-time metrics table
CREATE TABLE IF NOT EXISTS real_time_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  date_bucket DATE NOT NULL DEFAULT CURRENT_DATE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(metric_name, date_bucket)
);

-- Create indexes for real-time metrics
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_name ON real_time_metrics (metric_name);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_date ON real_time_metrics (date_bucket);

-- 12. Update waitlist table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'waitlist') THEN
    ALTER TABLE waitlist 
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'waiting',
    ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS invite_code TEXT,
    ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;
    
    -- Add constraint for waitlist status
    ALTER TABLE waitlist 
    ADD CONSTRAINT check_waitlist_status 
    CHECK (status IN ('waiting', 'invited', 'activated', 'expired'));
  END IF;
END $$;

-- 13. Create functions for updated timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
DO $$
DECLARE
  table_names TEXT[] := ARRAY[
    'alpha_invites',
    'alpha_onboarding', 
    'cooking_sessions',
    'micro_surveys'
  ];
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY table_names
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at 
        BEFORE UPDATE ON %I 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- 14. Create views for common queries
-- Alpha user metrics view
CREATE OR REPLACE VIEW alpha_user_metrics AS
SELECT 
  p.id,
  au.email,
  p.alpha_cohort,
  p.alpha_status,
  p.alpha_activated_at,
  COUNT(cs.id) as total_sessions,
  COUNT(CASE WHEN cs.success_rating >= 4 THEN 1 END) as successful_sessions,
  AVG(cs.success_rating) as average_rating,
  COUNT(cf.id) as feedback_count,
  AVG(cf.overall_rating) as average_feedback_rating,
  MAX(cs.start_time) as last_activity
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
LEFT JOIN cooking_sessions cs ON p.id = cs.user_id
LEFT JOIN cooking_feedback cf ON p.id = cf.user_id
WHERE p.is_alpha_user = true
GROUP BY p.id, au.email, p.alpha_cohort, p.alpha_status, p.alpha_activated_at;

-- Daily alpha metrics view
CREATE OR REPLACE VIEW daily_alpha_metrics AS
SELECT 
  DATE(cs.start_time) as date,
  COUNT(DISTINCT cs.user_id) as active_users,
  COUNT(cs.id) as total_sessions,
  COUNT(CASE WHEN cs.status = 'completed' THEN 1 END) as completed_sessions,
  COUNT(CASE WHEN cs.status = 'abandoned' THEN 1 END) as abandoned_sessions,
  AVG(cs.success_rating) as average_success_rating,
  COUNT(CASE WHEN cs.ai_guidance_used = true THEN 1 END) as ai_guided_sessions
FROM cooking_sessions cs
JOIN profiles p ON cs.user_id = p.id
WHERE p.is_alpha_user = true
GROUP BY DATE(cs.start_time)
ORDER BY date DESC;

-- 15. Insert initial micro surveys
INSERT INTO micro_surveys (type, questions, target_criteria, active, priority) VALUES
(
  'quick_rating',
  '[
    {
      "id": "overall_experience",
      "type": "rating",
      "question": "How was your cooking experience today?",
      "required": true
    }
  ]'::jsonb,
  '{}'::jsonb,
  true,
  10
),
(
  'feature_specific',
  '[
    {
      "id": "ai_helpfulness",
      "type": "rating",
      "question": "How helpful was the AI cooking assistant?",
      "required": true
    },
    {
      "id": "most_valuable_feature",
      "type": "multiple_choice",
      "question": "Which feature was most valuable?",
      "options": ["Recipe adaptation", "Step guidance", "Timing alerts", "Troubleshooting"],
      "required": false
    }
  ]'::jsonb,
  '{"userType": "returning"}'::jsonb,
  true,
  8
),
(
  'onboarding',
  '[
    {
      "id": "onboarding_clarity",
      "type": "rating",
      "question": "How clear was the onboarding process?",
      "required": true
    },
    {
      "id": "missing_info",
      "type": "text",
      "question": "What information would have been helpful during onboarding?",
      "required": false
    }
  ]'::jsonb,
  '{"userType": "new"}'::jsonb,
  true,
  9
);

-- 16. Create RLS policies for alpha tables (Row Level Security)
-- Enable RLS on alpha tables
ALTER TABLE alpha_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE alpha_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE critical_feedback_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access to their own data
CREATE POLICY "Users can view their own alpha onboarding" 
ON alpha_onboarding FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own alpha onboarding" 
ON alpha_onboarding FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own cooking sessions" 
ON cooking_sessions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own cooking sessions" 
ON cooking_sessions FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own AI feature usage" 
ON ai_feature_usage FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own AI feature usage" 
ON ai_feature_usage FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own journey events" 
ON user_journey_events FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own journey events" 
ON user_journey_events FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their own cooking feedback" 
ON cooking_feedback FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own survey responses" 
ON micro_survey_responses FOR ALL 
USING (user_id = auth.uid());

-- Admin policies (assuming there's an admin role)
CREATE POLICY "Admins can view all alpha data" 
ON alpha_invites FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR role = 'super_admin')
  )
);

-- Apply similar admin policies to other tables as needed

-- 17. Create notification triggers for critical events
CREATE OR REPLACE FUNCTION notify_critical_feedback()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification for critical feedback
  PERFORM pg_notify(
    'critical_feedback',
    json_build_object(
      'user_id', NEW.user_id,
      'issue', NEW.issue,
      'severity', NEW.severity,
      'created_at', NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER critical_feedback_notification
  AFTER INSERT ON critical_feedback_alerts
  FOR EACH ROW
  EXECUTE FUNCTION notify_critical_feedback();

-- 18. Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_cooking_sessions_user_success 
ON cooking_sessions (user_id, success_rating, start_time);

CREATE INDEX IF NOT EXISTS idx_feedback_rating_date 
ON cooking_feedback (overall_rating, created_at);

CREATE INDEX IF NOT EXISTS idx_alpha_users_active 
ON profiles (is_alpha_user, alpha_status, alpha_activated_at) 
WHERE is_alpha_user = true;

-- 19. Insert sample data for testing (only in development)
DO $$
BEGIN
  -- Only insert sample data if we're not in production
  IF current_setting('app.environment', true) != 'production' THEN
    -- Sample micro survey for testing
    INSERT INTO micro_surveys (id, type, questions, active, priority) VALUES 
    (
      '550e8400-e29b-41d4-a716-446655440000',
      'quick_rating',
      '[{"id": "test_rating", "type": "rating", "question": "Test question?", "required": true}]'::jsonb,
      true,
      5
    ) ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 20. Final validation and cleanup
-- Analyze tables for query optimization
ANALYZE profiles;
ANALYZE alpha_invites;
ANALYZE alpha_onboarding;
ANALYZE cooking_sessions;
ANALYZE ai_feature_usage;
ANALYZE user_journey_events;
ANALYZE cooking_feedback;
ANALYZE micro_surveys;
ANALYZE micro_survey_responses;
ANALYZE critical_feedback_alerts;
ANALYZE real_time_metrics;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Alpha launch migration completed successfully! 🚀';
  RAISE NOTICE 'Created tables: alpha_invites, alpha_onboarding, cooking_sessions, ai_feature_usage, user_journey_events, cooking_feedback, micro_surveys, micro_survey_responses, critical_feedback_alerts, real_time_metrics';
  RAISE NOTICE 'Updated profiles table with alpha user columns';
  RAISE NOTICE 'Created views: alpha_user_metrics, daily_alpha_metrics';
  RAISE NOTICE 'Enabled RLS and created security policies';
  RAISE NOTICE 'Ready for alpha launch! 🎉';
END $$;