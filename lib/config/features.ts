// File: lib/config/features.ts

// Alpha launch configuration
const ALPHA_MODE = process.env.NEXT_PUBLIC_ALPHA_MODE === 'true';
const ALPHA_USER_LIMIT = parseInt(process.env.NEXT_PUBLIC_ALPHA_USER_LIMIT || '20');

export const FEATURES = {
  // Alpha Launch Configuration
  alphaMode: ALPHA_MODE,
  alphaUserLimit: ALPHA_USER_LIMIT,
  alphaManualOnboarding: ALPHA_MODE,
  
  // ALPHA ENABLED - Core AI Cooking Experience
  enableAIRecipeAdaptation: true,
  enableCookingIntelligence: true,
  enableSuccessPrediction: true,
  enablePersonalCookingProfile: true,
  enableBasicAuth: true,
  enableUserProfiles: true,
  enableFeedbackSystem: true,
  enableCookingAssistant: true,
  
  // ALPHA DISABLED - Beta Features
  enableSocialFeatures: false,
  enableNibbleCollections: false,
  enableCreatorProfiles: false,
  enableMonetization: false,
  enableGroceryOrdering: false,
  enablePaymentProcessing: false,
  enableCollaborativeBoards: false,
  enableSocialSharing: false,
  enableFollowSystem: false,
  enableReviews: false,
  enableCommerce: false,
  enableShopping: false,
  enableInventoryManagement: false,
  enableCreatorEconomy: false,
  enableRecipeMonetization: false,
  enableCreatorDashboard: false,
  
  // Alpha Configuration
  feedbackSamplingRate: 1.0,
  
  // Analytics and Monitoring (always enabled)
  enableAnalytics: true,
  enableErrorTracking: true,
  enablePerformanceMonitoring: true,
  enableRealTimeMetrics: true,
  enableDetailedLogging: ALPHA_MODE,
} as const;

export type FeatureFlag = keyof typeof FEATURES;

// Alpha user access control
export const isAlphaUser = (userId: string): Promise<boolean> => {
  // This will be implemented with database check
  return Promise.resolve(false);
};

export const canAccessAlpha = async (userId?: string): Promise<boolean> => {
  if (!FEATURES.alphaMode) return true;
  if (!userId) return false;
  
  return await isAlphaUser(userId);
};

// Feature gate utility
export const useFeatureGate = () => {
  const isFeatureEnabled = (flag: FeatureFlag): boolean => {
    return FEATURES[flag] as boolean;
  };
  
  const requiresAlphaAccess = (userId?: string): Promise<boolean> => {
    return canAccessAlpha(userId);
  };
  
  return {
    isFeatureEnabled,
    requiresAlphaAccess,
    isAlphaMode: FEATURES.alphaMode,
    alphaUserLimit: FEATURES.alphaUserLimit
  };
};
