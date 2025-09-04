// User types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  favoriteCuisines: string[];
  followersCount: number;
  followingCount: number;
  recipesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Creator types for video recipes
export interface Creator {
  id: string;
  name: string;
  profileImageUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Video Recipe types
export interface VideoRecipe {
  id: string;
  creatorId: string;
  creator: Creator;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  ingredients: VideoIngredient[];
  instructions: string[];
  nutrition: NutritionInfo;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoIngredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugar?: number;
  };
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  perServing: boolean;
}

// Video Processing types
export interface VideoProcessingResult {
  title?: string; // Add title field for AI-generated recipe titles
  ingredients: VideoIngredient[];
  servings: number;
  prepTime: number;
  cookTime: number;
  instructions?: string[];
  description?: string;
}

export interface VideoUploadResult {
  videoUrl: string;
  thumbnailUrl?: string;
  processingResult: VideoProcessingResult;
}

export interface VideoProcessingStatus {
  status: 'uploading' | 'processing' | 'extracting' | 'analyzing' | 'completed' | 'error';
  message: string;
  progress?: number;
  error?: string;
}

// Audio and Video Analysis types
export interface AudioTranscript {
  text: string;
  confidence: number;
  duration: number;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
  type: string;
}

// Recipe types
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  totalTime: number; // in minutes
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert';
  dietaryTags: string[]; // e.g., ['Vegetarian', 'Gluten-Free']
  tags: string[];
  images: string[];
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  likesCount: number;
  isPublished: boolean;
  creatorId: string;
  creator: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

// Recipe interaction types
export interface RecipeReview {
  id: string;
  recipeId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeLike {
  id: string;
  recipeId: string;
  userId: string;
  createdAt: Date;
}

// Activity types
export interface Activity {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'recipe';
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  target?: {
    id: string;
    type: 'recipe' | 'user';
    title?: string;
    name?: string;
  };
  message: string;
  createdAt: Date;
}

// Collection types
export interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  userId: string;
  recipes: Recipe[];
  createdAt: Date;
  updatedAt: Date;
}

// Search and filter types
export interface RecipeFilters {
  cuisine?: string[];
  mealType?: string[];
  difficulty?: string[];
  dietaryTags?: string[];
  maxTime?: number;
  maxServings?: number;
  ingredients?: string[];
  tags?: string[];
}

export interface SearchParams {
  query: string;
  filters: RecipeFilters;
  sortBy: 'relevance' | 'rating' | 'time' | 'newest' | 'popular';
  page: number;
  limit: number;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface CreateRecipeForm {
  title: string;
  description: string;
  ingredients: Omit<Ingredient, 'id'>[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert';
  dietaryTags: string[];
  tags: string[];
  images: File[];
  coverImageUrl?: string;
  nutritionCalories?: number;
  nutritionProtein?: number;
  nutritionFats?: number;
  nutritionCarbs?: number;
  videoUrl?: string;
}

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
}

// Theme types
export interface Theme {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
}

// NIBBBLE Collections types
export * from './nibble-collections';
export * from './dashboard-cards';

// AI Cooking Assistant types
export * from './ai-cooking';
