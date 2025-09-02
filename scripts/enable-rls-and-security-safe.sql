-- Safe Enable Row Level Security and add authentication policies for Alpha Launch
-- This script will check for existing policies and only create missing ones

-- 1. Enable RLS on all tables (safe to run multiple times)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for recipes table (only if they don't exist)
DO $$ 
BEGIN
    -- Users can view all public recipes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Users can view public recipes') THEN
        CREATE POLICY "Users can view public recipes" ON recipes
            FOR SELECT USING (is_public = true);
        RAISE NOTICE 'Created policy: Users can view public recipes';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can view public recipes';
    END IF;

    -- Users can view their own recipes (even if not public)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Users can view their own recipes') THEN
        CREATE POLICY "Users can view their own recipes" ON recipes
            FOR SELECT USING (creator_id = auth.uid());
        RAISE NOTICE 'Created policy: Users can view their own recipes';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can view their own recipes';
    END IF;

    -- Users can insert their own recipes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Users can insert their own recipes') THEN
        CREATE POLICY "Users can insert their own recipes" ON recipes
            FOR INSERT WITH CHECK (creator_id = auth.uid());
        RAISE NOTICE 'Created policy: Users can insert their own recipes';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can insert their own recipes';
    END IF;

    -- Users can update their own recipes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Users can update their own recipes') THEN
        CREATE POLICY "Users can update their own recipes" ON recipes
            FOR UPDATE USING (creator_id = auth.uid());
        RAISE NOTICE 'Created policy: Users can update their own recipes';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can update their own recipes';
    END IF;

    -- Users can delete their own recipes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Users can delete their own recipes') THEN
        CREATE POLICY "Users can delete their own recipes" ON recipes
            FOR DELETE USING (creator_id = auth.uid());
        RAISE NOTICE 'Created policy: Users can delete their own recipes';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can delete their own recipes';
    END IF;
END $$;

-- 3. Create policies for recipe_likes table (only if they don't exist)
DO $$ 
BEGIN
    -- Users can view their own likes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_likes' AND policyname = 'Users can view their own likes') THEN
        CREATE POLICY "Users can view their own likes" ON recipe_likes
            FOR SELECT USING (user_id = auth.uid());
        RAISE NOTICE 'Created policy: Users can view their own likes';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can view their own likes';
    END IF;

    -- Users can insert their own likes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_likes' AND policyname = 'Users can insert their own likes') THEN
        CREATE POLICY "Users can insert their own likes" ON recipe_likes
            FOR INSERT WITH CHECK (user_id = auth.uid());
        RAISE NOTICE 'Created policy: Users can insert their own likes';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can insert their own likes';
    END IF;

    -- Users can delete their own likes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_likes' AND policyname = 'Users can delete their own likes') THEN
        CREATE POLICY "Users can delete their own likes" ON recipe_likes
            FOR DELETE USING (user_id = auth.uid());
        RAISE NOTICE 'Created policy: Users can delete their own likes';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can delete their own likes';
    END IF;
END $$;

-- 4. Create policies for profiles table (only if they don't exist)
DO $$ 
BEGIN
    -- Users can view all profiles (for recipe creator info)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view all profiles') THEN
        CREATE POLICY "Users can view all profiles" ON profiles
            FOR SELECT USING (true);
        RAISE NOTICE 'Created policy: Users can view all profiles';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can view all profiles';
    END IF;

    -- Users can update their own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON profiles
            FOR UPDATE USING (id = auth.uid());
        RAISE NOTICE 'Created policy: Users can update their own profile';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can update their own profile';
    END IF;

    -- Users can insert their own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON profiles
            FOR INSERT WITH CHECK (id = auth.uid());
        RAISE NOTICE 'Created policy: Users can insert their own profile';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can insert their own profile';
    END IF;
END $$;

-- 5. Add constraints (only if they don't exist)
DO $$ 
BEGIN
    -- Ensure recipes have valid creator_id
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipes_creator_id_check') THEN
        ALTER TABLE recipes ADD CONSTRAINT recipes_creator_id_check 
            CHECK (creator_id IS NOT NULL);
        RAISE NOTICE 'Added constraint: recipes_creator_id_check';
    ELSE
        RAISE NOTICE 'Constraint already exists: recipes_creator_id_check';
    END IF;

    -- Ensure recipe_likes have valid user_id
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipe_likes_user_id_check') THEN
        ALTER TABLE recipe_likes ADD CONSTRAINT recipe_likes_user_id_check 
            CHECK (user_id IS NOT NULL);
        RAISE NOTICE 'Added constraint: recipe_likes_user_id_check';
    ELSE
        RAISE NOTICE 'Constraint already exists: recipe_likes_user_id_check';
    END IF;

    -- Ensure recipe_likes have valid recipe_id
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipe_likes_recipe_id_check') THEN
        ALTER TABLE recipe_likes ADD CONSTRAINT recipe_likes_recipe_id_check 
            CHECK (recipe_id IS NOT NULL);
        RAISE NOTICE 'Added constraint: recipe_likes_recipe_id_check';
    ELSE
        RAISE NOTICE 'Constraint already exists: recipe_likes_recipe_id_check';
    END IF;
END $$;

-- 6. Create indexes for better performance with RLS (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_recipes_creator_id_rls ON recipes(creator_id);
CREATE INDEX IF NOT EXISTS idx_recipes_is_public ON recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_recipe_likes_user_id_rls ON recipe_likes(user_id);

-- 7. Verify RLS is enabled and show current status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables 
WHERE tablename IN ('recipes', 'recipe_likes', 'profiles');

-- 8. Show existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('recipes', 'recipe_likes', 'profiles')
ORDER BY tablename, policyname;
