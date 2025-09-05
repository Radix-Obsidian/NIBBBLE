-- Create video recipes schema for NIBBBLE
-- Run this with: psql -h your-project.supabase.co -U postgres -d postgres -f create-video-recipes-schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create creators table
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    profile_image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table with video support
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]',
    instructions TEXT[] NOT NULL DEFAULT '{}',
    nutrition JSONB DEFAULT '{}',
    servings INTEGER NOT NULL DEFAULT 1,
    prep_time_minutes INTEGER DEFAULT 0,
    cook_time_minutes INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    difficulty_level VARCHAR(20) DEFAULT 'medium',
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_creator_id ON recipes(creator_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_is_public ON recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN(tags);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creators
CREATE POLICY "Creators are viewable by everyone" ON creators
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own creator profile" ON creators
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own creator profile" ON creators
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for recipes
CREATE POLICY "Public recipes are viewable by everyone" ON recipes
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own recipes" ON recipes
    FOR SELECT USING (auth.uid()::text = creator_id::text);

CREATE POLICY "Users can insert their own recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid()::text = creator_id::text);

CREATE POLICY "Users can update their own recipes" ON recipes
    FOR UPDATE USING (auth.uid()::text = creator_id::text);

CREATE POLICY "Users can delete their own recipes" ON recipes
    FOR DELETE USING (auth.uid()::text = creator_id::text);

-- Insert sample creator for testing
INSERT INTO creators (id, name, bio) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Demo Creator',
    'A demo creator for testing video recipes'
) ON CONFLICT (id) DO NOTHING;
