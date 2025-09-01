-- Create recipe_likes table for user likes functionality
-- This table tracks which users have liked which recipes

-- Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS recipe_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recipe_id, user_id) -- Prevent duplicate likes
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipe_likes_recipe_id ON recipe_likes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_likes_user_id ON recipe_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_likes_created_at ON recipe_likes(created_at);

-- Disable RLS temporarily for testing (you can re-enable later)
ALTER TABLE recipe_likes DISABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE recipe_likes IS 'Tracks user likes for recipes';
COMMENT ON COLUMN recipe_likes.recipe_id IS 'Reference to the liked recipe';
COMMENT ON COLUMN recipe_likes.user_id IS 'Reference to the user who liked the recipe';
