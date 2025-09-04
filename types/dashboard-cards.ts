// Shared types for dashboard recipe cards
// These interfaces match what the dashboard pages are actually creating

export interface DashboardRecipeCard {
  id: any;
  title: any;
  description: any;
  cookTime: any;
  difficulty: any;
  rating: any;
  creator: { name: string; avatar: string; initials: string };
  resource?: { name: string; initials: string };
  cuisine?: any;
  isTrending: boolean;
  isLiked: boolean;
  nutrition?: any;
}

export interface RecentRecipeCard {
  id: any;
  title: any;
  description: any;
  cookTime: any;
  difficulty: any;
  rating: any;
  creator: { name: string; avatar: string; initials: string };
  isTrending: boolean;
  isLiked: boolean;
}

export interface RecipePageCard {
  id: any;
  title: any;
  description: any;
  cookTime: any;
  difficulty: any;
  rating: any;
  creator: { name: string; avatar: string; initials: string };
  resource?: any;
  isTrending: boolean;
  isLiked: boolean;
}
