// File: types/nibble-collections.ts

export interface NibbleCollection {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_image?: string;
  mood_tags: string[];
  cuisine_type?: string;
  dietary_tags: string[];
  is_public: boolean;
  collaborators: string[];
  created_at: string;
  updated_at: string;
}

export interface NibbleItem {
  id: string;
  collection_id: string;
  title?: string;
  media_url?: string;
  link_url?: string;
  description?: string;
  recipe_metadata?: RecipeMetadata;
  creator_id?: string;
  created_at: string;
}

export interface RecipeMetadata {
  cook_time?: number;
  prep_time?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  ingredients_preview?: string[];
  tags?: string[];
}

export interface CreateCollectionInput {
  title: string;
  description?: string;
  mood_tags?: string[];
  cuisine_type?: string;
  dietary_tags?: string[];
  is_public?: boolean;
  collaborators?: string[];
}

export interface UpdateCollectionInput {
  title?: string;
  description?: string;
  mood_tags?: string[];
  cuisine_type?: string;
  dietary_tags?: string[];
  is_public?: boolean;
  collaborators?: string[];
  cover_image?: string;
}

export interface AddItemInput {
  collection_id: string;
  title?: string;
  media_url?: string;
  link_url?: string;
  description?: string;
  recipe_metadata?: RecipeMetadata;
}

// Predefined options for better UX
export const MOOD_TAGS = [
  'Comfort Food',
  'Quick & Easy',
  'Date Night',
  'Weekend Project',
  'Healthy',
  'Indulgent',
  'Family Friendly',
  'Party Food',
  'Cozy',
  'Adventurous'
] as const;

export const CUISINE_TYPES = [
  'Italian',
  'Asian Fusion',
  'Mediterranean',
  'Mexican',
  'Indian',
  'French',
  'American',
  'Middle Eastern',
  'African',
  'Caribbean'
] as const;

export const DIETARY_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'High-Protein',
  'Nut-Free',
  'Halal',
  'Kosher'
] as const;
