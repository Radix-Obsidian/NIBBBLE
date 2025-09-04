-- AI-powered Cooking Assistant Database Schema Extensions
-- Fixed version for Supabase deployment

-- Enable necessary extensions (some may not be available in all Supabase instances)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: Vector extension may not be available in all Supabase tiers
-- If vector extension fails, we'll use JSONB for embeddings instead
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Vector extension not available, will use JSONB for embeddings';
END
$$;

-- Check if profiles table exists, if not create a basic one
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    favorite_cuisines TEXT[],
    location TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    recipes_count INTEGER DEFAULT 0,
    tiktok_handle TEXT,
    instagram_handle TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if recipes table exists, if not create a basic one
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    ingredients JSONB DEFAULT '[]',
    instructions TEXT[] DEFAULT '{}',
    cook_time INTEGER DEFAULT 0,
    prep_time INTEGER DEFAULT 0,
    difficulty TEXT DEFAULT 'medium',
    cuisine TEXT,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    video_url TEXT,
    creator_id UUID REFERENCES profiles(id),
    rating DECIMAL(3,2) DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. AI Cooking Profiles - extends existing profiles with AI capabilities
CREATE TABLE IF NOT EXISTS ai_cooking_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    skill_level INTEGER DEFAULT 1 CHECK (skill_level >= 1 AND skill_level <= 10),
    cooking_experience_years INTEGER DEFAULT 0,
    preferred_cooking_time INTEGER DEFAULT 30, -- in minutes
    equipment_available TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['oven', 'stovetop', 'microwave', 'air_fryer', etc.]
    dietary_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', etc.]
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['nuts', 'shellfish', 'eggs', etc.]
    spice_tolerance INTEGER DEFAULT 3 CHECK (spice_tolerance >= 1 AND spice_tolerance <= 5),
    preferred_portion_sizes JSONB DEFAULT '{"small": false, "medium": true, "large": false}',
    cooking_goals TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['weight_loss', 'muscle_gain', 'heart_health', 'budget_friendly', etc.]
    learning_preferences JSONB DEFAULT '{"video": true, "text": true, "step_by_step": true}',
    success_history JSONB DEFAULT '{"attempts": 0, "successes": 0, "failures": 0}',
    preferred_cuisines_ranked TEXT[] DEFAULT ARRAY[]::TEXT[], -- ordered list of cuisine preferences
    ingredient_preferences JSONB DEFAULT '{"loved": [], "disliked": [], "never_tried": []}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Recipe Adaptations - stores AI-generated recipe modifications
CREATE TABLE IF NOT EXISTS recipe_adaptations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    adaptation_type TEXT NOT NULL,
    adapted_recipe JSONB NOT NULL, -- full adapted recipe data
    adaptation_reasons TEXT[] NOT NULL, -- reasons for adaptation
    confidence_score DECIMAL(3,2) DEFAULT 0.80, -- AI confidence in adaptation (0.00-1.00)
    user_feedback INTEGER, -- user rating of adaptation (1-5)
    success_rate DECIMAL(3,2) DEFAULT NULL, -- historical success rate for similar adaptations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_adaptation_type CHECK (adaptation_type IN ('skill_adjusted', 'dietary_modified', 'equipment_adapted', 'portion_scaled', 'ingredient_substituted', 'time_optimized')),
    CONSTRAINT valid_confidence_score CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
    CONSTRAINT valid_user_feedback CHECK (user_feedback IS NULL OR (user_feedback >= 1 AND user_feedback <= 5))
);

-- 3. Smart Ingredient Substitutions
CREATE TABLE IF NOT EXISTS ingredient_substitutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_ingredient TEXT NOT NULL,
    substitute_ingredient TEXT NOT NULL,
    substitution_ratio DECIMAL(5,2) DEFAULT 1.00, -- how much substitute to use (1.00 = 1:1 ratio)
    context_tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['baking', 'frying', 'soup', etc.]
    dietary_reasons TEXT[] DEFAULT ARRAY[]::TEXT[], -- why this substitution might be chosen
    flavor_impact INTEGER DEFAULT 3, -- impact on taste (1=minimal, 5=significant)
    texture_impact INTEGER DEFAULT 3,
    nutritional_impact JSONB DEFAULT '{}', -- changes in nutrition
    success_rate DECIMAL(3,2) DEFAULT 0.85,
    user_ratings JSONB DEFAULT '{"count": 0, "average": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_flavor_impact CHECK (flavor_impact >= 1 AND flavor_impact <= 5),
    CONSTRAINT valid_texture_impact CHECK (texture_impact >= 1 AND texture_impact <= 5),
    CONSTRAINT valid_success_rate CHECK (success_rate >= 0.00 AND success_rate <= 1.00)
);

-- 4. Cooking Intelligence Insights
CREATE TABLE IF NOT EXISTS cooking_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL,
    insight_content TEXT NOT NULL,
    skill_level_target INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7,8,9,10], -- which skill levels this applies to
    context_conditions JSONB DEFAULT '{}', -- when this insight is relevant
    confidence_score DECIMAL(3,2) DEFAULT 0.80,
    user_helpfulness_rating DECIMAL(3,2) DEFAULT NULL, -- user feedback on helpfulness
    shown_count INTEGER DEFAULT 0,
    acted_upon_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_insight_type CHECK (insight_type IN ('technique_tip', 'timing_adjustment', 'temperature_guidance', 'troubleshooting', 'flavor_enhancement', 'safety_warning', 'equipment_recommendation')),
    CONSTRAINT valid_confidence_score_insights CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00)
);

-- 5. Success Prediction Model Data
CREATE TABLE IF NOT EXISTS cooking_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    adaptation_id UUID REFERENCES recipe_adaptations(id),
    predicted_success_score DECIMAL(3,2) DEFAULT NULL, -- ML model prediction (0.00-1.00)
    actual_outcome TEXT,
    user_rating INTEGER,
    time_taken_minutes INTEGER,
    difficulty_experienced INTEGER,
    issues_encountered TEXT[] DEFAULT ARRAY[]::TEXT[], -- what went wrong
    user_notes TEXT,
    cooking_context JSONB DEFAULT '{}', -- conditions during cooking (time_of_day, stress_level, etc.)
    feature_vector JSONB DEFAULT '{}', -- ML features for model training (using JSONB instead of VECTOR for compatibility)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_actual_outcome CHECK (actual_outcome IS NULL OR actual_outcome IN ('success', 'partial_success', 'failure', 'abandoned')),
    CONSTRAINT valid_user_rating CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5)),
    CONSTRAINT valid_difficulty_experienced CHECK (difficulty_experienced IS NULL OR (difficulty_experienced >= 1 AND difficulty_experienced <= 5)),
    CONSTRAINT valid_predicted_score CHECK (predicted_success_score IS NULL OR (predicted_success_score >= 0.00 AND predicted_success_score <= 1.00))
);

-- 6. AI Learning Progress Tracking
CREATE TABLE IF NOT EXISTS user_skill_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_category TEXT NOT NULL, -- 'knife_skills', 'timing', 'seasoning', 'heat_control', etc.
    current_level INTEGER DEFAULT 1,
    progress_points INTEGER DEFAULT 0,
    achievements TEXT[] DEFAULT ARRAY[]::TEXT[], -- unlocked achievements
    practice_recipes UUID[] DEFAULT ARRAY[]::UUID[], -- recipes that help develop this skill
    last_practice_date TIMESTAMP WITH TIME ZONE,
    improvement_rate DECIMAL(3,2) DEFAULT 0.00, -- rate of improvement per month
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_current_level CHECK (current_level >= 1 AND current_level <= 10),
    CONSTRAINT unique_user_skill UNIQUE(user_id, skill_category)
);

-- 7. Recipe Embeddings for Semantic Search (using JSONB for compatibility)
CREATE TABLE IF NOT EXISTS recipe_embeddings (
    recipe_id UUID PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
    content_embedding JSONB DEFAULT '[]', -- recipe content embedding as JSON array
    ingredient_embedding JSONB DEFAULT '[]', -- ingredients-only embedding
    technique_embedding JSONB DEFAULT '[]', -- cooking techniques embedding
    flavor_profile_embedding JSONB DEFAULT '[]', -- flavor characteristics
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_profiles_skill_level ON ai_cooking_profiles(skill_level);
CREATE INDEX IF NOT EXISTS idx_ai_profiles_equipment ON ai_cooking_profiles USING GIN(equipment_available);
CREATE INDEX IF NOT EXISTS idx_ai_profiles_dietary ON ai_cooking_profiles USING GIN(dietary_restrictions);
CREATE INDEX IF NOT EXISTS idx_ai_profiles_allergies ON ai_cooking_profiles USING GIN(allergies);

CREATE INDEX IF NOT EXISTS idx_recipe_adaptations_user ON recipe_adaptations(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_adaptations_recipe ON recipe_adaptations(original_recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_adaptations_type ON recipe_adaptations(adaptation_type);

CREATE INDEX IF NOT EXISTS idx_substitutions_original ON ingredient_substitutions(original_ingredient);
CREATE INDEX IF NOT EXISTS idx_substitutions_substitute ON ingredient_substitutions(substitute_ingredient);
CREATE INDEX IF NOT EXISTS idx_substitutions_context ON ingredient_substitutions USING GIN(context_tags);

CREATE INDEX IF NOT EXISTS idx_insights_user ON cooking_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_recipe ON cooking_insights(recipe_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON cooking_insights(insight_type);

CREATE INDEX IF NOT EXISTS idx_outcomes_user ON cooking_outcomes(user_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_recipe ON cooking_outcomes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_prediction ON cooking_outcomes(predicted_success_score);
CREATE INDEX IF NOT EXISTS idx_outcomes_actual ON cooking_outcomes(actual_outcome);

CREATE INDEX IF NOT EXISTS idx_skill_progress_user ON user_skill_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_progress_category ON user_skill_progress(skill_category);

CREATE INDEX IF NOT EXISTS idx_recipe_embeddings_recipe ON recipe_embeddings(recipe_id);

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_ai_profiles_updated_at ON ai_cooking_profiles;
CREATE TRIGGER update_ai_profiles_updated_at 
    BEFORE UPDATE ON ai_cooking_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipe_adaptations_updated_at ON recipe_adaptations;
CREATE TRIGGER update_recipe_adaptations_updated_at 
    BEFORE UPDATE ON recipe_adaptations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_substitutions_updated_at ON ingredient_substitutions;
CREATE TRIGGER update_substitutions_updated_at 
    BEFORE UPDATE ON ingredient_substitutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_insights_updated_at ON cooking_insights;
CREATE TRIGGER update_insights_updated_at 
    BEFORE UPDATE ON cooking_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_skill_progress_updated_at ON user_skill_progress;
CREATE TRIGGER update_skill_progress_updated_at 
    BEFORE UPDATE ON user_skill_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE ai_cooking_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_embeddings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own AI profile" ON ai_cooking_profiles;
DROP POLICY IF EXISTS "Users can update their own AI profile" ON ai_cooking_profiles;
DROP POLICY IF EXISTS "Users can view their own adaptations" ON recipe_adaptations;
DROP POLICY IF EXISTS "Users can insert their own adaptations" ON recipe_adaptations;
DROP POLICY IF EXISTS "Users can update their own adaptations" ON recipe_adaptations;
DROP POLICY IF EXISTS "Users can view insights for their recipes" ON cooking_insights;
DROP POLICY IF EXISTS "Users can view their own cooking outcomes" ON cooking_outcomes;
DROP POLICY IF EXISTS "Users can insert their own cooking outcomes" ON cooking_outcomes;
DROP POLICY IF EXISTS "Users can view their own skill progress" ON user_skill_progress;
DROP POLICY IF EXISTS "Users can update their own skill progress" ON user_skill_progress;
DROP POLICY IF EXISTS "Substitutions are viewable by everyone" ON ingredient_substitutions;
DROP POLICY IF EXISTS "Recipe embeddings are viewable by everyone" ON recipe_embeddings;

-- RLS Policies
CREATE POLICY "Users can view their own AI profile" ON ai_cooking_profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own AI profile" ON ai_cooking_profiles
    FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view their own adaptations" ON recipe_adaptations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own adaptations" ON recipe_adaptations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own adaptations" ON recipe_adaptations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view insights for their recipes" ON cooking_insights
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own cooking outcomes" ON cooking_outcomes
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own cooking outcomes" ON cooking_outcomes
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own skill progress" ON user_skill_progress
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own skill progress" ON user_skill_progress
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Ingredient substitutions and recipe embeddings are public read-only for better AI recommendations
CREATE POLICY "Substitutions are viewable by everyone" ON ingredient_substitutions
    FOR SELECT USING (true);

CREATE POLICY "Recipe embeddings are viewable by everyone" ON recipe_embeddings
    FOR SELECT USING (true);

-- Insert some sample ingredient substitutions
INSERT INTO ingredient_substitutions (original_ingredient, substitute_ingredient, substitution_ratio, context_tags, dietary_reasons, flavor_impact, texture_impact) VALUES
('butter', 'olive oil', 0.75, ARRAY['baking', 'sauteing'], ARRAY['dairy_free', 'vegan'], 2, 2),
('heavy cream', 'coconut milk', 1.00, ARRAY['soup', 'sauce'], ARRAY['dairy_free', 'vegan'], 3, 2),
('eggs', 'flax eggs', 1.00, ARRAY['baking'], ARRAY['vegan'], 1, 3),
('all-purpose flour', 'almond flour', 1.25, ARRAY['baking'], ARRAY['gluten_free', 'keto'], 2, 3),
('sugar', 'honey', 0.75, ARRAY['baking', 'dessert'], ARRAY['natural_sweetener'], 2, 1),
('milk', 'oat milk', 1.00, ARRAY['baking', 'cereal', 'smoothie'], ARRAY['dairy_free', 'vegan'], 1, 1),
('ground beef', 'lentils', 1.00, ARRAY['sauce', 'soup'], ARRAY['vegetarian', 'vegan'], 4, 4),
('chicken stock', 'vegetable stock', 1.00, ARRAY['soup', 'rice', 'sauce'], ARRAY['vegetarian', 'vegan'], 2, 1)
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'AI Cooking Assistant schema created successfully!';
    RAISE NOTICE 'Tables created: ai_cooking_profiles, recipe_adaptations, ingredient_substitutions, cooking_insights, cooking_outcomes, user_skill_progress, recipe_embeddings';
    RAISE NOTICE 'Sample data inserted into ingredient_substitutions table';
END
$$;