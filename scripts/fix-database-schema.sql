-- NIBBBLE Database Schema Fix
-- This script will create/update the recipes table to match our TypeScript definitions

-- Step 1: Drop the existing recipes table if it exists (WARNING: This will delete all data)
DROP TABLE IF EXISTS recipes CASCADE;

-- Step 2: Create the recipes table with all required columns
CREATE TABLE recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    ingredients TEXT[],
    instructions TEXT[],
    cook_time INTEGER NOT NULL,
    prep_time INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    cuisine TEXT,
    tags TEXT[],
    image_url TEXT,
    video_url TEXT,
    creator_id UUID NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_recipes_creator_id ON recipes(creator_id);
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);
CREATE INDEX idx_recipes_rating ON recipes(rating);
CREATE INDEX idx_recipes_likes_count ON recipes(likes_count);

-- Step 4: Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipes_updated_at 
    BEFORE UPDATE ON recipes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Disable RLS temporarily for testing (you can re-enable later)
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;

-- Step 6: Insert some sample data for testing
INSERT INTO recipes (
    title, 
    description, 
    ingredients, 
    instructions, 
    cook_time, 
    prep_time, 
    difficulty, 
    cuisine, 
    tags, 
    creator_id, 
    rating, 
    likes_count, 
    views_count, 
    is_public
) VALUES 
(
    'Classic Margherita Pizza',
    'A traditional Italian pizza with tomato sauce, mozzarella, and fresh basil.',
    ARRAY['Pizza dough', 'Tomato sauce', 'Fresh mozzarella', 'Fresh basil', 'Olive oil'],
    ARRAY[
        'Preheat oven to 450°F (230°C).',
        'Roll out the pizza dough on a floured surface.',
        'Spread tomato sauce evenly over the dough.',
        'Add slices of fresh mozzarella.',
        'Bake for 12-15 minutes until crust is golden.',
        'Top with fresh basil leaves and drizzle with olive oil.'
    ],
    15, 20, 'Medium', 'Italian', ARRAY['Pizza', 'Italian', 'Vegetarian'],
    '00000000-0000-0000-0000-000000000000', 4.5, 150, 1200, true
),
(
    'Spaghetti Carbonara',
    'A creamy Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
    ARRAY['Spaghetti', 'Eggs', 'Parmesan cheese', 'Pancetta', 'Black pepper', 'Salt'],
    ARRAY[
        'Cook spaghetti in salted water until al dente.',
        'In a separate pan, cook pancetta until crispy.',
        'Beat eggs with grated parmesan cheese.',
        'Drain pasta and immediately mix with egg mixture.',
        'Add crispy pancetta and black pepper.',
        'Serve immediately while hot.'
    ],
    20, 10, 'Medium', 'Italian', ARRAY['Pasta', 'Italian', 'Creamy'],
    '00000000-0000-0000-0000-000000000000', 4.8, 200, 1800, true
),
(
    'Chicken Tacos',
    'Delicious Mexican tacos with seasoned chicken, fresh vegetables, and salsa.',
    ARRAY['Chicken breast', 'Tortillas', 'Onion', 'Tomato', 'Lettuce', 'Cheese', 'Salsa'],
    ARRAY[
        'Season chicken breast with Mexican spices.',
        'Cook chicken in a pan until fully cooked.',
        'Warm tortillas in a dry pan.',
        'Shred the cooked chicken.',
        'Assemble tacos with chicken, vegetables, and salsa.',
        'Serve with lime wedges and hot sauce.'
    ],
    25, 15, 'Easy', 'Mexican', ARRAY['Tacos', 'Mexican', 'Chicken'],
    '00000000-0000-0000-0000-000000000000', 4.3, 120, 950, true
),
(
    'Beef Stir Fry',
    'Quick and healthy Asian stir fry with tender beef and fresh vegetables.',
    ARRAY['Beef strips', 'Broccoli', 'Carrots', 'Soy sauce', 'Garlic', 'Ginger', 'Rice'],
    ARRAY[
        'Cook rice according to package instructions.',
        'Heat oil in a wok or large pan.',
        'Stir fry beef until browned.',
        'Add vegetables and stir fry until tender.',
        'Add soy sauce, garlic, and ginger.',
        'Serve hot over rice.'
    ],
    15, 10, 'Easy', 'Asian', ARRAY['Stir Fry', 'Asian', 'Beef'],
    '00000000-0000-0000-0000-000000000000', 4.6, 180, 1400, true
),
(
    'Classic Burger',
    'Juicy American burger with all the traditional toppings.',
    ARRAY['Ground beef', 'Burger buns', 'Lettuce', 'Tomato', 'Onion', 'Cheese', 'Pickles'],
    ARRAY[
        'Form ground beef into patties.',
        'Season with salt and pepper.',
        'Grill or pan-fry until desired doneness.',
        'Add cheese during last minute of cooking.',
        'Toast burger buns.',
        'Assemble burger with all toppings.'
    ],
    12, 8, 'Easy', 'American', ARRAY['Burger', 'American', 'Beef'],
    '00000000-0000-0000-0000-000000000000', 4.4, 160, 1100, true
);

-- Step 7: Verify the data was inserted
SELECT COUNT(*) as total_recipes FROM recipes;
SELECT title, cuisine, difficulty, rating FROM recipes LIMIT 5;
