-- AI-powered Cooking Assistant Database Schema Extensions
-- This script adds AI-specific tables to enhance the existing NIBBBLE schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- 1. AI Cooking Profiles - extends existing profiles with AI capabilities
CREATE TABLE IF NOT EXISTS ai_cooking_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    skill_level INTEGER DEFAULT 1 CHECK (skill_level >= 1 AND skill_level <= 10),
    cooking_experience_years INTEGER DEFAULT 0,
    preferred_cooking_time INTEGER DEFAULT 30, -- in minutes
    equipment_available TEXT[] DEFAULT '{}', -- ['oven', 'stovetop', 'microwave', 'air_fryer', etc.]
    dietary_restrictions TEXT[] DEFAULT '{}', -- ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', etc.]
    allergies TEXT[] DEFAULT '{}', -- ['nuts', 'shellfish', 'eggs', etc.]
    spice_tolerance INTEGER DEFAULT 3 CHECK (spice_tolerance >= 1 AND spice_tolerance <= 5),
    preferred_portion_sizes JSONB DEFAULT '{"small": false, "medium": true, "large": false}',
    cooking_goals TEXT[] DEFAULT '{}', -- ['weight_loss', 'muscle_gain', 'heart_health', 'budget_friendly', etc.]
    learning_preferences JSONB DEFAULT '{"video": true, "text": true, "step_by_step": true}',
    success_history JSONB DEFAULT '{"attempts": 0, "successes": 0, "failures": 0}',
    preferred_cuisines_ranked TEXT[] DEFAULT '{}', -- ordered list of cuisine preferences
    ingredient_preferences JSONB DEFAULT '{}', -- {'loved': [], 'disliked': [], 'never_tried': []}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Recipe Adaptations - stores AI-generated recipe modifications
CREATE TABLE IF NOT EXISTS recipe_adaptations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    adaptation_type TEXT NOT NULL CHECK (adaptation_type IN ('skill_adjusted', 'dietary_modified', 'equipment_adapted', 'portion_scaled', 'ingredient_substituted')),
    adapted_recipe JSONB NOT NULL, -- full adapted recipe data
    adaptation_reasons TEXT[] NOT NULL, -- reasons for adaptation
    confidence_score DECIMAL(3,2) DEFAULT 0.80, -- AI confidence in adaptation (0.00-1.00)
    user_feedback INTEGER, -- user rating of adaptation (1-5)
    success_rate DECIMAL(3,2) DEFAULT NULL, -- historical success rate for similar adaptations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Smart Ingredient Substitutions
CREATE TABLE IF NOT EXISTS ingredient_substitutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_ingredient TEXT NOT NULL,
    substitute_ingredient TEXT NOT NULL,
    substitution_ratio DECIMAL(5,2) DEFAULT 1.00, -- how much substitute to use (1.00 = 1:1 ratio)
    context_tags TEXT[] DEFAULT '{}', -- ['baking', 'frying', 'soup', etc.]
    dietary_reasons TEXT[] DEFAULT '{}', -- why this substitution might be chosen
    flavor_impact INTEGER DEFAULT 3 CHECK (flavor_impact >= 1 AND flavor_impact <= 5), -- impact on taste (1=minimal, 5=significant)
    texture_impact INTEGER DEFAULT 3 CHECK (texture_impact >= 1 AND texture_impact <= 5),
    nutritional_impact JSONB DEFAULT '{}', -- changes in nutrition
    success_rate DECIMAL(3,2) DEFAULT 0.85,
    user_ratings JSONB DEFAULT '{"count": 0, "average": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(original_ingredient, substitute_ingredient, context_tags)
);

-- 4. Cooking Intelligence Insights
CREATE TABLE IF NOT EXISTS cooking_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('technique_tip', 'timing_adjustment', 'temperature_guidance', 'troubleshooting', 'flavor_enhancement', 'safety_warning')),
    insight_content TEXT NOT NULL,
    skill_level_target INTEGER[] DEFAULT '{1,2,3,4,5,6,7,8,9,10}', -- which skill levels this applies to
    context_conditions JSONB DEFAULT '{}', -- when this insight is relevant
    confidence_score DECIMAL(3,2) DEFAULT 0.80,
    user_helpfulness_rating DECIMAL(3,2) DEFAULT NULL, -- user feedback on helpfulness
    shown_count INTEGER DEFAULT 0,
    acted_upon_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Success Prediction Model Data
CREATE TABLE IF NOT EXISTS cooking_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    adaptation_id UUID REFERENCES recipe_adaptations(id),
    predicted_success_score DECIMAL(3,2) DEFAULT NULL, -- ML model prediction (0.00-1.00)
    actual_outcome TEXT CHECK (actual_outcome IN ('success', 'partial_success', 'failure', 'abandoned')),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    time_taken_minutes INTEGER,
    difficulty_experienced INTEGER CHECK (difficulty_experienced >= 1 AND difficulty_experienced <= 5),
    issues_encountered TEXT[] DEFAULT '{}', -- what went wrong
    user_notes TEXT,
    cooking_context JSONB DEFAULT '{}', -- conditions during cooking (time_of_day, stress_level, etc.)
    feature_vector VECTOR(50), -- ML features for model training
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AI Learning Progress Tracking
CREATE TABLE IF NOT EXISTS user_skill_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_category TEXT NOT NULL, -- 'knife_skills', 'timing', 'seasoning', 'heat_control', etc.
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 10),
    progress_points INTEGER DEFAULT 0,
    achievements TEXT[] DEFAULT '{}', -- unlocked achievements
    practice_recipes UUID[] DEFAULT '{}', -- recipes that help develop this skill
    last_practice_date TIMESTAMP WITH TIME ZONE,
    improvement_rate DECIMAL(3,2) DEFAULT 0.00, -- rate of improvement per month
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_category)
);

-- 7. Recipe Embeddings for Semantic Search
CREATE TABLE IF NOT EXISTS recipe_embeddings (
    recipe_id UUID PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
    content_embedding VECTOR(384), -- recipe content embedding
    ingredient_embedding VECTOR(384), -- ingredients-only embedding
    technique_embedding VECTOR(384), -- cooking techniques embedding
    flavor_profile_embedding VECTOR(384), -- flavor characteristics
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
CREATE INDEX IF NOT EXISTS idx_substitutions_context ON ingredient_substitutions USING GIN(context_tags);

CREATE INDEX IF NOT EXISTS idx_insights_user ON cooking_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON cooking_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_skill_level ON cooking_insights USING GIN(skill_level_target);

CREATE INDEX IF NOT EXISTS idx_outcomes_user ON cooking_outcomes(user_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_recipe ON cooking_outcomes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_prediction ON cooking_outcomes(predicted_success_score);
CREATE INDEX IF NOT EXISTS idx_outcomes_actual ON cooking_outcomes(actual_outcome);

CREATE INDEX IF NOT EXISTS idx_skill_progress_user ON user_skill_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_progress_category ON user_skill_progress(skill_category);

-- Vector similarity search indexes
CREATE INDEX IF NOT EXISTS idx_recipe_content_embedding ON recipe_embeddings USING hnsw (content_embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredient_embedding ON recipe_embeddings USING hnsw (ingredient_embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_recipe_technique_embedding ON recipe_embeddings USING hnsw (technique_embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_recipe_flavor_embedding ON recipe_embeddings USING hnsw (flavor_profile_embedding vector_cosine_ops);

-- Updated_at triggers
CREATE TRIGGER update_ai_profiles_updated_at BEFORE UPDATE ON ai_cooking_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_adaptations_updated_at BEFORE UPDATE ON recipe_adaptations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_substitutions_updated_at BEFORE UPDATE ON ingredient_substitutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON cooking_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_progress_updated_at BEFORE UPDATE ON user_skill_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE ai_cooking_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_progress ENABLE ROW LEVEL SECURITY;

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