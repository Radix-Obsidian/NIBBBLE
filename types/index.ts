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
