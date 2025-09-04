// File: lib/config/features.ts

export const FEATURES = {
  enableNibbleCollections: process.env.NEXT_PUBLIC_ENABLE_NIBBLE_COLLECTIONS === 'true' || false,
  enableSocialFeatures: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES === 'true' || false,
  enableCollaborativeBoards: process.env.NEXT_PUBLIC_ENABLE_COLLABORATIVE_BOARDS === 'true' || false,
  
  // Tier 1 AI Features
  enableAIRecipeAdaptation: process.env.NEXT_PUBLIC_ENABLE_AI_RECIPE_ADAPTATION === 'true' || false,
  enableCookingIntelligence: process.env.NEXT_PUBLIC_ENABLE_COOKING_INTELLIGENCE === 'true' || false,
  enableSuccessPrediction: process.env.NEXT_PUBLIC_ENABLE_SUCCESS_PREDICTION === 'true' || false,
  enablePersonalCookingProfile: process.env.NEXT_PUBLIC_ENABLE_PERSONAL_COOKING_PROFILE === 'true' || false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;
