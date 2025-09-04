// AI Cooking Assistant Configuration

export const AI_CONFIG = {
  // Model Configuration
  models: {
    // Success prediction model parameters
    successPrediction: {
      version: '1.0.0',
      confidenceThreshold: 0.7,
      updateFrequency: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      batchSize: 100, // For batch training
      learningRate: 0.001,
      features: {
        userFeatures: ['skillLevel', 'experience', 'successRate', 'equipment'],
        recipeFeatures: ['complexity', 'time', 'difficulty', 'techniques'],
        contextFeatures: ['timeOfDay', 'stress', 'availability'],
        historicalFeatures: ['recentPerformance', 'similarRecipes']
      }
    },

    // Recipe adaptation model
    adaptation: {
      version: '1.0.0',
      confidenceThreshold: 0.6,
      maxAdaptations: 5,
      adaptationTypes: [
        'skill_adjusted',
        'dietary_modified',
        'equipment_adapted',
        'portion_scaled',
        'ingredient_substituted',
        'time_optimized'
      ]
    },

    // Ingredient substitution model
    substitution: {
      version: '1.0.0',
      maxSuggestions: 3,
      minimumSuccessRate: 0.7,
      contextWeight: 0.3,
      dietaryWeight: 0.4,
      flavorWeight: 0.2,
      availabilityWeight: 0.1
    }
  },

  // Performance thresholds
  performance: {
    // Response time limits (in milliseconds)
    responseTime: {
      prediction: 2000,
      adaptation: 3000,
      search: 1500,
      substitution: 1000
    },

    // Cache settings
    cache: {
      enabled: true,
      ttl: 15 * 60 * 1000, // 15 minutes
      maxSize: 1000, // Maximum number of cached items
      keys: {
        prediction: 'ai:prediction',
        adaptation: 'ai:adaptation',
        substitution: 'ai:substitution',
        profile: 'ai:profile'
      }
    },

    // Rate limiting
    rateLimit: {
      prediction: 100, // per hour per user
      adaptation: 50,  // per hour per user
      search: 200,     // per hour per user
      profileUpdate: 10 // per hour per user
    }
  },

  // Feature flags
  features: {
    enableMLPrediction: true,
    enableRealTimeAdaptation: true,
    enableSmartSearch: true,
    enableAdvancedSubstitutions: true,
    enableCookingAssistant: true,
    enableSkillTracking: true,
    enablePersonalizedInsights: true,
    enableBatchLearning: false, // For production ML training
    enableA/BTesting: false,
    
    // Debug features (disabled in production)
    debugMode: process.env.NODE_ENV !== 'production',
    logPredictions: process.env.NODE_ENV !== 'production',
    enableTestData: process.env.NODE_ENV !== 'production'
  },

  // Data quality thresholds
  dataQuality: {
    minHistoricalOutcomes: 3, // Minimum outcomes for reliable prediction
    minSuccessRate: 0.1, // Minimum success rate to avoid zero division
    maxFeatureAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    requiredFields: {
      profile: ['skillLevel', 'cookingExperienceYears', 'successHistory'],
      recipe: ['difficultyLevel', 'totalTimeMinutes', 'ingredients'],
      outcome: ['actualOutcome', 'userRating']
    }
  },

  // External service configuration
  services: {
    // Nutrition API configuration
    nutrition: {
      enabled: true,
      apiKey: process.env.NUTRITION_API_KEY,
      baseUrl: 'https://api.edamam.com/api/nutrition-data/v2',
      timeout: 5000,
      retries: 2
    },

    // Recipe embedding service (for semantic search)
    embeddings: {
      enabled: false, // Disabled until we have embedding service
      apiKey: process.env.EMBEDDING_API_KEY,
      baseUrl: process.env.EMBEDDING_API_URL,
      model: 'text-embedding-ada-002',
      dimensions: 384,
      timeout: 10000
    },

    // Analytics and monitoring
    analytics: {
      enabled: true,
      provider: 'vercel', // or 'google-analytics', 'mixpanel'
      events: {
        predictionMade: 'ai_prediction_made',
        adaptationCreated: 'ai_adaptation_created',
        searchPerformed: 'ai_search_performed',
        cookingStarted: 'ai_cooking_started',
        outcomeRecorded: 'ai_outcome_recorded'
      }
    }
  },

  // UI Configuration
  ui: {
    // Default settings for AI components
    defaults: {
      showConfidenceScores: true,
      showReasoningExplanations: true,
      enableRealTimeGuidance: true,
      maxInsights: 5,
      maxRecommendations: 10,
      animationDuration: 300,
      
      // Color schemes for AI elements
      colors: {
        success: '#10B981', // green-500
        warning: '#F59E0B', // amber-500
        danger: '#EF4444',  // red-500
        info: '#3B82F6',    // blue-500
        ai: '#8B5CF6',      // violet-500
        confidence: {
          high: '#10B981',    // green-500
          medium: '#F59E0B',  // amber-500
          low: '#EF4444'      // red-500
        }
      }
    },

    // Component visibility settings
    components: {
      adaptiveRecipeCard: {
        showSuccessPrediction: true,
        showAdaptations: true,
        showSubstitutions: true,
        showInsights: true,
        maxAdaptationsShown: 3
      },
      smartSearch: {
        showMatchScores: true,
        showReasoningPreview: true,
        maxResults: 20,
        enableContextFilters: true
      },
      cookingAssistant: {
        enableTimers: true,
        enableVoiceAlerts: false, // Requires additional permissions
        showStepProgress: true,
        enableIssueReporting: true
      }
    }
  },

  // Monitoring and alerting
  monitoring: {
    // Performance monitoring
    performance: {
      trackResponseTimes: true,
      trackErrorRates: true,
      trackCacheHitRates: true,
      alertThresholds: {
        responseTime: 5000, // ms
        errorRate: 0.05, // 5%
        cacheHitRate: 0.8 // 80%
      }
    },

    // Model performance monitoring
    modelMetrics: {
      trackAccuracy: true,
      trackPrecision: true,
      trackRecall: true,
      trackF1Score: true,
      evaluationFrequency: 7 * 24 * 60 * 60 * 1000, // Weekly
      alertThresholds: {
        accuracy: 0.7,
        precision: 0.6,
        recall: 0.6,
        f1Score: 0.6
      }
    }
  },

  // Security settings
  security: {
    // Data privacy
    privacy: {
      anonymizeUserData: true,
      retentionPeriod: 365 * 24 * 60 * 60 * 1000, // 1 year
      allowDataExport: true,
      allowDataDeletion: true
    },

    // Input validation
    validation: {
      maxRecipeSize: 50000, // characters
      maxProfileFields: 100,
      maxHistoryEntries: 1000,
      sanitizeInputs: true
    }
  },

  // Environment-specific settings
  environments: {
    development: {
      enableDebugLogs: true,
      useTestData: true,
      skipRateLimit: true,
      mockExternalServices: true
    },
    
    staging: {
      enableDebugLogs: true,
      useTestData: false,
      skipRateLimit: false,
      mockExternalServices: false
    },
    
    production: {
      enableDebugLogs: false,
      useTestData: false,
      skipRateLimit: false,
      mockExternalServices: false
    }
  }
};

// Environment-specific configuration
const currentEnv = process.env.NODE_ENV || 'development';
export const ENV_CONFIG = {
  ...AI_CONFIG,
  ...AI_CONFIG.environments[currentEnv as keyof typeof AI_CONFIG.environments]
};

// Type definitions for configuration
export interface AIConfig {
  models: typeof AI_CONFIG.models;
  performance: typeof AI_CONFIG.performance;
  features: typeof AI_CONFIG.features;
  dataQuality: typeof AI_CONFIG.dataQuality;
  services: typeof AI_CONFIG.services;
  ui: typeof AI_CONFIG.ui;
  monitoring: typeof AI_CONFIG.monitoring;
  security: typeof AI_CONFIG.security;
}

// Configuration validation
export function validateConfig(config: Partial<AIConfig> = AI_CONFIG): boolean {
  try {
    // Validate required environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        return false;
      }
    }

    // Validate model thresholds
    if (config.models?.successPrediction?.confidenceThreshold) {
      const threshold = config.models.successPrediction.confidenceThreshold;
      if (threshold < 0 || threshold > 1) {
        console.error('Success prediction confidence threshold must be between 0 and 1');
        return false;
      }
    }

    // Validate performance settings
    if (config.performance?.responseTime) {
      for (const [service, time] of Object.entries(config.performance.responseTime)) {
        if (time < 100) {
          console.error(`Response time for ${service} is too low: ${time}ms`);
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Configuration validation error:', error);
    return false;
  }
}

// Initialize configuration
if (!validateConfig()) {
  throw new Error('Invalid AI configuration');
}

// Export utility functions
export const getFeatureFlag = (flag: keyof typeof AI_CONFIG.features): boolean => {
  return ENV_CONFIG.features[flag] ?? false;
};

export const getPerformanceThreshold = (
  service: keyof typeof AI_CONFIG.performance.responseTime
): number => {
  return ENV_CONFIG.performance.responseTime[service] ?? 5000;
};

export const getCacheKey = (
  type: keyof typeof AI_CONFIG.performance.cache.keys,
  id: string
): string => {
  return `${ENV_CONFIG.performance.cache.keys[type]}:${id}`;
};

// Configuration change detection
let configVersion = 1;
export const getConfigVersion = (): number => configVersion;
export const updateConfigVersion = (): void => { configVersion++; };