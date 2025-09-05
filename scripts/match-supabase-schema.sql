-- =====================================================
-- NIBBBLE Database Schema - Exact Match to Current Supabase
-- =====================================================
-- This script matches exactly what's currently in your Supabase database

BEGIN;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES (Main user profiles table)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  username character varying NOT NULL UNIQUE,
  display_name character varying NOT NULL,
  bio text,
  avatar_url text,
  favorite_cuisines text[],
  location character varying,
  website character varying,
  is_verified boolean DEFAULT false,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  recipes_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tiktok_handle text,
  instagram_handle text,
  social_media_connected boolean DEFAULT false,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- =====================================================
-- RECIPES (Main recipe storage)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  ingredients text[], -- Changed from JSONB to match current structure
  instructions text[],
  cook_time integer NOT NULL,
  prep_time integer NOT NULL,
  difficulty text NOT NULL CHECK (difficulty = ANY (ARRAY['Easy'::text, 'Medium'::text, 'Hard'::text])),
  cuisine text,
  tags text[],
  image_url text,
  video_url text,
  creator_id uuid NOT NULL CHECK (creator_id IS NOT NULL),
  rating numeric DEFAULT 0,
  likes_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT recipes_pkey PRIMARY KEY (id)
);

-- =====================================================
-- RECIPE LIKES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.recipe_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL CHECK (recipe_id IS NOT NULL),
  user_id uuid NOT NULL CHECK (user_id IS NOT NULL),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT recipe_likes_pkey PRIMARY KEY (id),
  CONSTRAINT recipe_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- =====================================================
-- WAITLIST SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['creator'::character varying, 'cooker'::character varying]::text[])),
  name character varying NOT NULL,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying]::text[])),
  social_handle character varying,
  cooking_experience character varying,
  specialty text,
  audience_size character varying,
  content_type character varying,
  goals text,
  kitchen_setup character varying,
  cooking_goals text,
  frequency character varying,
  challenges text,
  interests text,
  submitted_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  approved_by uuid,
  CONSTRAINT waitlist_entries_pkey PRIMARY KEY (id),
  CONSTRAINT waitlist_entries_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id)
);

-- =====================================================
-- AI COOKING SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_cooking_profiles (
  id uuid NOT NULL,
  skill_level integer DEFAULT 1 CHECK (skill_level >= 1 AND skill_level <= 10),
  cooking_experience_years integer DEFAULT 0,
  preferred_cooking_time integer DEFAULT 30,
  equipment_available text[] DEFAULT '{}'::text[],
  dietary_restrictions text[] DEFAULT '{}'::text[],
  allergies text[] DEFAULT '{}'::text[],
  spice_tolerance integer DEFAULT 3 CHECK (spice_tolerance >= 1 AND spice_tolerance <= 5),
  preferred_portion_sizes jsonb DEFAULT '{"large": false, "small": false, "medium": true}'::jsonb,
  cooking_goals text[] DEFAULT '{}'::text[],
  learning_preferences jsonb DEFAULT '{"text": true, "video": true, "step_by_step": true}'::jsonb,
  success_history jsonb DEFAULT '{"attempts": 0, "failures": 0, "successes": 0}'::jsonb,
  preferred_cuisines_ranked text[] DEFAULT '{}'::text[],
  ingredient_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_cooking_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT ai_cooking_profiles_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id)
);

-- Recipe Adaptations
CREATE TABLE IF NOT EXISTS public.recipe_adaptations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  original_recipe_id uuid NOT NULL,
  user_id uuid NOT NULL,
  adaptation_type text NOT NULL CHECK (adaptation_type = ANY (ARRAY['skill_adjusted'::text, 'dietary_modified'::text, 'equipment_adapted'::text, 'portion_scaled'::text, 'ingredient_substituted'::text])),
  adapted_recipe jsonb NOT NULL,
  adaptation_reasons text[] NOT NULL,
  confidence_score numeric DEFAULT 0.80,
  user_feedback integer,
  success_rate numeric DEFAULT NULL::numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT recipe_adaptations_pkey PRIMARY KEY (id),
  CONSTRAINT recipe_adaptations_original_recipe_id_fkey FOREIGN KEY (original_recipe_id) REFERENCES public.recipes(id),
  CONSTRAINT recipe_adaptations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Ingredient Substitutions
CREATE TABLE IF NOT EXISTS public.ingredient_substitutions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  original_ingredient text NOT NULL,
  substitute_ingredient text NOT NULL,
  substitution_ratio numeric DEFAULT 1.00,
  context_tags text[] DEFAULT '{}'::text[],
  dietary_reasons text[] DEFAULT '{}'::text[],
  flavor_impact integer DEFAULT 3 CHECK (flavor_impact >= 1 AND flavor_impact <= 5),
  texture_impact integer DEFAULT 3 CHECK (texture_impact >= 1 AND texture_impact <= 5),
  nutritional_impact jsonb DEFAULT '{}'::jsonb,
  success_rate numeric DEFAULT 0.85,
  user_ratings jsonb DEFAULT '{"count": 0, "average": 0}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ingredient_substitutions_pkey PRIMARY KEY (id)
);

-- Cooking Insights
CREATE TABLE IF NOT EXISTS public.cooking_insights (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  recipe_id uuid,
  insight_type text NOT NULL CHECK (insight_type = ANY (ARRAY['technique_tip'::text, 'timing_adjustment'::text, 'temperature_guidance'::text, 'troubleshooting'::text, 'flavor_enhancement'::text, 'safety_warning'::text])),
  insight_content text NOT NULL,
  skill_level_target integer[] DEFAULT '{1,2,3,4,5,6,7,8,9,10}'::integer[],
  context_conditions jsonb DEFAULT '{}'::jsonb,
  confidence_score numeric DEFAULT 0.80,
  user_helpfulness_rating numeric DEFAULT NULL::numeric,
  shown_count integer DEFAULT 0,
  acted_upon_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cooking_insights_pkey PRIMARY KEY (id),
  CONSTRAINT cooking_insights_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT cooking_insights_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id)
);

-- Cooking Outcomes
CREATE TABLE IF NOT EXISTS public.cooking_outcomes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  recipe_id uuid NOT NULL,
  adaptation_id uuid,
  predicted_success_score numeric DEFAULT NULL::numeric,
  actual_outcome text CHECK (actual_outcome = ANY (ARRAY['success'::text, 'partial_success'::text, 'failure'::text, 'abandoned'::text])),
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  time_taken_minutes integer,
  difficulty_experienced integer CHECK (difficulty_experienced >= 1 AND difficulty_experienced <= 5),
  issues_encountered text[] DEFAULT '{}'::text[],
  user_notes text,
  cooking_context jsonb DEFAULT '{}'::jsonb,
  feature_vector jsonb, -- Using JSONB instead of VECTOR type for compatibility
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cooking_outcomes_pkey PRIMARY KEY (id),
  CONSTRAINT cooking_outcomes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT cooking_outcomes_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id),
  CONSTRAINT cooking_outcomes_adaptation_id_fkey FOREIGN KEY (adaptation_id) REFERENCES public.recipe_adaptations(id)
);

-- User Skill Progress
CREATE TABLE IF NOT EXISTS public.user_skill_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  skill_category text NOT NULL,
  current_level integer DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 10),
  progress_points integer DEFAULT 0,
  achievements text[] DEFAULT '{}'::text[],
  practice_recipes uuid[] DEFAULT '{}'::uuid[],
  last_practice_date timestamp with time zone,
  improvement_rate numeric DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_skill_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_skill_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Recipe Embeddings (using JSONB for compatibility)
CREATE TABLE IF NOT EXISTS public.recipe_embeddings (
  recipe_id uuid NOT NULL,
  content_embedding jsonb, -- Using JSONB instead of VECTOR
  ingredient_embedding jsonb,
  technique_embedding jsonb,
  flavor_profile_embedding jsonb,
  last_updated timestamp with time zone DEFAULT now(),
  CONSTRAINT recipe_embeddings_pkey PRIMARY KEY (recipe_id),
  CONSTRAINT recipe_embeddings_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id)
);

-- =====================================================
-- COMMERCE SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.grocery_providers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  api_endpoint character varying,
  api_key_required boolean DEFAULT true,
  logo_url character varying,
  supported_regions text[],
  delivery_available boolean DEFAULT true,
  pickup_available boolean DEFAULT true,
  min_order_amount numeric,
  delivery_fee numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT grocery_providers_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.grocery_stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_id uuid,
  name character varying NOT NULL,
  address text NOT NULL,
  city character varying NOT NULL,
  state character varying NOT NULL,
  zip_code character varying NOT NULL,
  latitude numeric,
  longitude numeric,
  phone character varying,
  hours jsonb,
  services text[],
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT grocery_stores_pkey PRIMARY KEY (id),
  CONSTRAINT grocery_stores_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.grocery_providers(id)
);

CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text,
  icon_name character varying,
  parent_category_id uuid,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_categories_pkey PRIMARY KEY (id),
  CONSTRAINT product_categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.product_categories(id)
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  brand character varying,
  category_id uuid,
  upc_code character varying,
  description text,
  image_url character varying,
  unit_type character varying NOT NULL,
  organic boolean DEFAULT false,
  gluten_free boolean DEFAULT false,
  vegetarian boolean DEFAULT false,
  vegan boolean DEFAULT false,
  nutrition jsonb,
  allergens text[],
  ingredients text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id)
);

CREATE TABLE IF NOT EXISTS public.shopping_carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  store_id uuid,
  status character varying DEFAULT 'active'::character varying,
  estimated_total numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  delivery_fee numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shopping_carts_pkey PRIMARY KEY (id),
  CONSTRAINT shopping_carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT shopping_carts_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.grocery_stores(id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cart_id uuid,
  product_id uuid,
  recipe_id uuid,
  quantity numeric NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  notes text,
  priority integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.shopping_carts(id),
  CONSTRAINT cart_items_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id)
);

-- =====================================================
-- COLLECTIONS SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  cover_image text,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT collections_pkey PRIMARY KEY (id),
  CONSTRAINT collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.collection_recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL,
  recipe_id uuid NOT NULL,
  added_at timestamp with time zone DEFAULT now(),
  CONSTRAINT collection_recipes_pkey PRIMARY KEY (id),
  CONSTRAINT collection_recipes_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id)
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- Recipe indexes
CREATE INDEX IF NOT EXISTS idx_recipes_creator_id ON public.recipes(creator_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON public.recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON public.recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON public.recipes USING GIN(tags);

-- Recipe likes indexes
CREATE INDEX IF NOT EXISTS idx_recipe_likes_recipe_id ON public.recipe_likes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_likes_user_id ON public.recipe_likes(user_id);

-- AI system indexes
CREATE INDEX IF NOT EXISTS idx_ai_profiles_skill_level ON public.ai_cooking_profiles(skill_level);
CREATE INDEX IF NOT EXISTS idx_recipe_adaptations_user ON public.recipe_adaptations(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_adaptations_recipe ON public.recipe_adaptations(original_recipe_id);

-- Commerce indexes
CREATE INDEX IF NOT EXISTS idx_shopping_carts_user_id ON public.shopping_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cooking_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooking_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooking_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

COMMIT;