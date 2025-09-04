-- Verify AI Schema Deployment
-- Run this to confirm all AI tables were created successfully

-- Check that all AI tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN (
    'ai_cooking_profiles',
    'recipe_adaptations', 
    'ingredient_substitutions',
    'cooking_insights',
    'cooking_outcomes',
    'user_skill_progress',
    'recipe_embeddings'
)
ORDER BY tablename;

-- Check sample substitution data was inserted
SELECT COUNT(*) as substitution_count 
FROM ingredient_substitutions;

-- Show sample substitutions
SELECT 
    original_ingredient,
    substitute_ingredient,
    substitution_ratio,
    dietary_reasons
FROM ingredient_substitutions 
LIMIT 5;

-- Check that RLS is enabled on AI tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN (
    'ai_cooking_profiles',
    'recipe_adaptations',
    'cooking_insights',
    'cooking_outcomes',
    'user_skill_progress'
)
AND rowsecurity = true
ORDER BY tablename;