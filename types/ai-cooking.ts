// AI Cooking Assistant Types

export interface AICookingProfile {
  id: string;
  skillLevel: number; // 1-10
  cookingExperienceYears: number;
  preferredCookingTime: number; // minutes
  equipmentAvailable: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  spiceTolerance: number; // 1-5
  preferredPortionSizes: {
    small: boolean;
    medium: boolean;
    large: boolean;
  };
  cookingGoals: string[];
  learningPreferences: {
    video: boolean;
    text: boolean;
    stepByStep: boolean;
  };
  successHistory: {
    attempts: number;
    successes: number;
    failures: number;
  };
  preferredCuisinesRanked: string[];
  ingredientPreferences: {
    loved: string[];
    disliked: string[];
    neverTried: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeAdaptation {
  id: string;
  originalRecipeId: string;
  userId: string;
  adaptationType: 'skill_adjusted' | 'dietary_modified' | 'equipment_adapted' | 'portion_scaled' | 'ingredient_substituted';
  adaptedRecipe: any; // Full recipe data with modifications
  adaptationReasons: string[];
  confidenceScore: number; // 0.00-1.00
  userFeedback?: number; // 1-5 rating
  successRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IngredientSubstitution {
  id: string;
  originalIngredient: string;
  substituteIngredient: string;
  substitutionRatio: number;
  contextTags: string[];
  dietaryReasons: string[];
  flavorImpact: number; // 1-5
  textureImpact: number; // 1-5
  nutritionalImpact: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    [key: string]: number | undefined;
  };
  successRate: number;
  userRatings: {
    count: number;
    average: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CookingInsight {
  id: string;
  userId: string;
  recipeId?: string;
  insightType: 'technique_tip' | 'timing_adjustment' | 'temperature_guidance' | 'troubleshooting' | 'flavor_enhancement' | 'safety_warning';
  insightContent: string;
  skillLevelTarget: number[];
  contextConditions: {
    equipment?: string[];
    skillLevel?: number[];
    weather?: string;
    timeConstraints?: boolean;
    [key: string]: any;
  };
  confidenceScore: number;
  userHelpfulnessRating?: number;
  shownCount: number;
  actedUponCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CookingOutcome {
  id: string;
  userId: string;
  recipeId: string;
  adaptationId?: string;
  predictedSuccessScore?: number;
  actualOutcome: 'success' | 'partial_success' | 'failure' | 'abandoned';
  userRating: number; // 1-5
  timeTakenMinutes?: number;
  difficultyExperienced: number; // 1-5
  issuesEncountered: string[];
  userNotes?: string;
  cookingContext: {
    timeOfDay?: string;
    stressLevel?: number;
    helpAvailable?: boolean;
    [key: string]: any;
  };
  createdAt: Date;
}

export interface UserSkillProgress {
  id: string;
  userId: string;
  skillCategory: string;
  currentLevel: number; // 1-10
  progressPoints: number;
  achievements: string[];
  practiceRecipes: string[];
  lastPracticeDate?: Date;
  improvementRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeEmbedding {
  recipeId: string;
  contentEmbedding: number[];
  ingredientEmbedding: number[];
  techniqueEmbedding: number[];
  flavorProfileEmbedding: number[];
  lastUpdated: Date;
}

// AI Service Request/Response Types
export interface AdaptRecipeRequest {
  recipeId: string;
  userId: string;
  adaptationReasons: string[];
  targetSkillLevel?: number;
  dietaryRestrictions?: string[];
  availableEquipment?: string[];
  timeConstraints?: number;
  portionAdjustment?: number;
}

export interface AdaptRecipeResponse {
  adaptation: RecipeAdaptation;
  substitutions: IngredientSubstitution[];
  insights: CookingInsight[];
  confidenceScore: number;
}

export interface PredictSuccessRequest {
  userId: string;
  recipeId: string;
  adaptationId?: string;
  cookingContext?: {
    timeOfDay?: string;
    availableTime?: number;
    stressLevel?: number;
    [key: string]: any;
  };
}

export interface PredictSuccessResponse {
  successScore: number; // 0.00-1.00
  confidenceInterval: [number, number];
  riskFactors: string[];
  recommendations: string[];
  alternativeRecipes?: string[];
}

export interface SmartSearchRequest {
  query?: string;
  userProfile: AICookingProfile;
  context?: {
    timeAvailable?: number;
    mealType?: string;
    ingredientsOnHand?: string[];
    mood?: string;
    [key: string]: any;
  };
  filters?: {
    maxDifficulty?: number;
    maxTime?: number;
    requiredEquipment?: string[];
    [key: string]: any;
  };
}

export interface SmartSearchResponse {
  recipes: {
    recipe: any; // Recipe with adaptations applied
    matchScore: number;
    adaptations: RecipeAdaptation[];
    predictedSuccess: number;
    reasoning: string[];
  }[];
  insights: CookingInsight[];
  suggestions: {
    skillDevelopment: string[];
    equipmentRecommendations: string[];
    ingredientExplorations: string[];
  };
}

// Learning and Progress Types
export interface LearningPathway {
  id: string;
  name: string;
  description: string;
  targetSkills: string[];
  difficulty: number; // 1-10
  estimatedDuration: number; // weeks
  milestones: LearningMilestone[];
  recipes: string[]; // Recipe IDs in recommended order
}

export interface LearningMilestone {
  id: string;
  name: string;
  description: string;
  requiredSkillLevel: number;
  practiceRecipes: string[];
  assessmentCriteria: string[];
  unlockConditions: string[];
}

export interface CookingChallenge {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  skillFocus: string[];
  requirements: {
    equipment?: string[];
    ingredients?: string[];
    timeLimit?: number;
    [key: string]: any;
  };
  rewards: {
    points: number;
    achievements: string[];
    skillBoosts: { [skill: string]: number };
  };
}

// AI Model Configuration Types
export interface ModelConfig {
  version: string;
  embeddings: {
    model: string;
    dimensions: number;
    apiEndpoint: string;
  };
  classification: {
    skillAssessment: string;
    successPrediction: string;
    adaptationGeneration: string;
  };
  thresholds: {
    confidenceMinimum: number;
    adaptationTrigger: number;
    riskWarning: number;
  };
}

// Real-time Cooking Assistant Types
export interface CookingSession {
  id: string;
  userId: string;
  recipeId: string;
  adaptationId?: string;
  status: 'preparing' | 'cooking' | 'completed' | 'abandoned';
  currentStep: number;
  startTime: Date;
  estimatedEndTime: Date;
  actualEndTime?: Date;
  insights: CookingInsight[];
  issues: CookingIssue[];
  adaptations: RecipeAdaptation[];
}

export interface CookingIssue {
  id: string;
  sessionId: string;
  step: number;
  issueType: 'timing' | 'technique' | 'ingredient' | 'equipment' | 'safety';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestions: string[];
  resolved: boolean;
  resolvedAt?: Date;
}

export interface RealtimeGuidance {
  sessionId: string;
  currentStep: number;
  guidance: {
    nextAction: string;
    estimatedTime: number;
    techniques: string[];
    warnings?: string[];
    alternatives?: string[];
  };
  contextualTips: CookingInsight[];
  adaptiveAdjustments?: RecipeAdaptation[];
}