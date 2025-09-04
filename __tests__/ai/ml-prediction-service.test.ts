import { mlPredictionService } from '@/lib/services/ml-prediction-service';
import { AICookingProfile, VideoRecipe, CookingOutcome } from '@/types';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          limit: jest.fn()
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn()
    })),
    order: jest.fn(() => ({
      limit: jest.fn()
    }))
  }))
};

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => mockSupabase,
  createServerComponentClient: () => mockSupabase
}));

describe('MLPredictionService', () => {
  const mockAIProfile: AICookingProfile = {
    id: 'test-user-id',
    skillLevel: 5,
    cookingExperienceYears: 3,
    preferredCookingTime: 45,
    equipmentAvailable: ['oven', 'stovetop', 'blender'],
    dietaryRestrictions: ['vegetarian'],
    allergies: [],
    spice_tolerance: 4,
    preferredPortionSizes: { small: false, medium: true, large: false },
    cookingGoals: ['healthy_eating', 'skill_development'],
    learningPreferences: { video: true, text: true, stepByStep: true },
    successHistory: { attempts: 25, successes: 20, failures: 5 },
    preferredCuisinesRanked: ['Italian', 'Mediterranean', 'Thai'],
    ingredientPreferences: { 
      loved: ['garlic', 'basil', 'tomatoes'], 
      disliked: ['cilantro'], 
      neverTried: ['quinoa'] 
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockRecipe: VideoRecipe = {
    id: 'test-recipe-id',
    creatorId: 'creator-id',
    creator: {} as any,
    title: 'Mediterranean Pasta',
    description: 'A delicious pasta dish',
    videoUrl: 'http://example.com/video.mp4',
    ingredients: [
      { name: 'pasta', amount: 1, unit: 'lb', notes: '' },
      { name: 'garlic', amount: 3, unit: 'cloves', notes: '' },
      { name: 'tomatoes', amount: 2, unit: 'cups', notes: '' },
      { name: 'basil', amount: 0.25, unit: 'cup', notes: '' }
    ],
    instructions: [
      'Boil water and cook pasta according to package directions',
      'Sauté garlic in olive oil until fragrant',
      'Add tomatoes and simmer for 10 minutes',
      'Toss pasta with sauce and fresh basil'
    ],
    nutrition: { calories: 350, protein: 12, fat: 8, carbs: 65, perServing: true },
    servings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    totalTimeMinutes: 40,
    difficultyLevel: 'medium',
    tags: ['pasta', 'vegetarian', 'mediterranean'],
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockHistoricalData: CookingOutcome[] = [
    {
      id: 'outcome-1',
      userId: 'test-user-id',
      recipeId: 'recipe-1',
      predictedSuccessScore: 0.8,
      actualOutcome: 'success',
      userRating: 5,
      timeTakenMinutes: 45,
      difficultyExperienced: 3,
      issuesEncountered: [],
      userNotes: 'Delicious!',
      cookingContext: { timeOfDay: 'evening', stressLevel: 2 },
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'outcome-2',
      userId: 'test-user-id',
      recipeId: 'recipe-2',
      predictedSuccessScore: 0.6,
      actualOutcome: 'partial_success',
      userRating: 3,
      timeTakenMinutes: 60,
      difficultyExperienced: 4,
      issuesEncountered: ['timing', 'seasoning'],
      userNotes: 'A bit challenging',
      cookingContext: { timeOfDay: 'afternoon', stressLevel: 4 },
      createdAt: new Date('2024-01-10')
    },
    {
      id: 'outcome-3',
      userId: 'test-user-id',
      recipeId: 'recipe-3',
      predictedSuccessScore: 0.9,
      actualOutcome: 'success',
      userRating: 4,
      timeTakenMinutes: 30,
      difficultyExperienced: 2,
      issuesEncountered: [],
      userNotes: 'Easy and tasty',
      cookingContext: { timeOfDay: 'morning', stressLevel: 1 },
      createdAt: new Date('2024-01-05')
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock profile fetch
    mockSupabase.from().select().eq().single
      .mockResolvedValueOnce({ data: transformToDBFormat(mockAIProfile), error: null })
      .mockResolvedValueOnce({ data: transformRecipeToDBFormat(mockRecipe), error: null });
    
    // Mock historical data fetch
    mockSupabase.from().select().eq().order().limit
      .mockResolvedValue({ 
        data: mockHistoricalData.map(transformOutcomeToDBFormat), 
        error: null 
      });
  });

  describe('predictCookingSuccess', () => {
    it('should predict success for a well-matched recipe', async () => {
      const request = {
        userId: 'test-user-id',
        recipeId: 'test-recipe-id',
        cookingContext: {
          timeOfDay: 'evening',
          availableTime: 60,
          stressLevel: 2
        }
      };

      const result = await mlPredictionService.predictCookingSuccess(request);

      expect(result).toBeDefined();
      expect(result.successScore).toBeGreaterThanOrEqual(0);
      expect(result.successScore).toBeLessThanOrEqual(1);
      expect(result.confidenceInterval).toHaveLength(2);
      expect(result.confidenceInterval[0]).toBeLessThanOrEqual(result.confidenceInterval[1]);
      expect(result.riskFactors).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should predict lower success for mismatched recipe', async () => {
      const beginnerProfile = {
        ...mockAIProfile,
        skillLevel: 1,
        cookingExperienceYears: 0,
        successHistory: { attempts: 2, successes: 0, failures: 2 },
        equipmentAvailable: ['microwave']
      };

      const complexRecipe = {
        ...mockRecipe,
        difficultyLevel: 'hard' as const,
        totalTimeMinutes: 120,
        instructions: Array(15).fill('Complex cooking step')
      };

      // Mock updated profile and recipe
      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: transformToDBFormat(beginnerProfile), error: null })
        .mockResolvedValueOnce({ data: transformRecipeToDBFormat(complexRecipe), error: null });

      const request = {
        userId: 'beginner-user-id',
        recipeId: 'complex-recipe-id',
        cookingContext: {
          availableTime: 30, // Much less than recipe requires
          stressLevel: 5
        }
      };

      const result = await mlPredictionService.predictCookingSuccess(request);

      expect(result.successScore).toBeLessThan(0.6);
      expect(result.riskFactors.length).toBeGreaterThan(0);
      expect(result.riskFactors.some(factor => 
        factor.includes('skill level') || factor.includes('time') || factor.includes('difficulty')
      )).toBe(true);
    });

    it('should consider cooking context in predictions', async () => {
      const stressfulContext = {
        userId: 'test-user-id',
        recipeId: 'test-recipe-id',
        cookingContext: {
          stressLevel: 5,
          availableTime: 20, // Less than recipe time
          timeOfDay: 'night'
        }
      };

      const result = await mlPredictionService.predictCookingSuccess(stressfulContext);

      expect(result.riskFactors).toContain(
        expect.stringMatching(/time|stress/i)
      );
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle missing profile gracefully', async () => {
      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      const request = {
        userId: 'nonexistent-user',
        recipeId: 'test-recipe-id'
      };

      await expect(mlPredictionService.predictCookingSuccess(request))
        .rejects.toThrow('Required data not found');
    });

    it('should provide appropriate confidence intervals', async () => {
      const request = {
        userId: 'test-user-id',
        recipeId: 'test-recipe-id'
      };

      const result = await mlPredictionService.predictCookingSuccess(request);

      expect(result.confidenceInterval[0]).toBeGreaterThanOrEqual(0);
      expect(result.confidenceInterval[1]).toBeLessThanOrEqual(1);
      expect(result.confidenceInterval[1] - result.confidenceInterval[0]).toBeGreaterThan(0);
    });
  });

  describe('recordOutcomeAndUpdateModel', () => {
    it('should record successful cooking outcome', async () => {
      const outcome: CookingOutcome = {
        id: 'new-outcome-id',
        userId: 'test-user-id',
        recipeId: 'test-recipe-id',
        actualOutcome: 'success',
        userRating: 5,
        timeTakenMinutes: 35,
        difficultyExperienced: 3,
        issuesEncountered: [],
        userNotes: 'Perfect!',
        cookingContext: { timeOfDay: 'evening' },
        createdAt: new Date()
      };

      // Mock profile update
      const updatedProfile = {
        ...mockAIProfile,
        successHistory: {
          attempts: mockAIProfile.successHistory.attempts + 1,
          successes: mockAIProfile.successHistory.successes + 1,
          failures: mockAIProfile.successHistory.failures
        }
      };

      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: transformToDBFormat(mockAIProfile), error: null })
        .mockResolvedValueOnce({ data: transformRecipeToDBFormat(mockRecipe), error: null });

      await expect(mlPredictionService.recordOutcomeAndUpdateModel(
        'test-user-id',
        'test-recipe-id',
        outcome
      )).resolves.not.toThrow();
    });

    it('should record failed cooking outcome', async () => {
      const failedOutcome: CookingOutcome = {
        id: 'failed-outcome-id',
        userId: 'test-user-id',
        recipeId: 'test-recipe-id',
        actualOutcome: 'failure',
        userRating: 2,
        timeTakenMinutes: 90,
        difficultyExperienced: 5,
        issuesEncountered: ['burned', 'too_salty', 'timing'],
        userNotes: 'Disaster!',
        cookingContext: { stressLevel: 5 },
        createdAt: new Date()
      };

      await expect(mlPredictionService.recordOutcomeAndUpdateModel(
        'test-user-id',
        'test-recipe-id',
        failedOutcome
      )).resolves.not.toThrow();
    });

    it('should handle partial success outcomes', async () => {
      const partialOutcome: CookingOutcome = {
        id: 'partial-outcome-id',
        userId: 'test-user-id',
        recipeId: 'test-recipe-id',
        actualOutcome: 'partial_success',
        userRating: 3,
        timeTakenMinutes: 50,
        difficultyExperienced: 4,
        issuesEncountered: ['timing'],
        userNotes: 'Edible but not great',
        cookingContext: {},
        createdAt: new Date()
      };

      await expect(mlPredictionService.recordOutcomeAndUpdateModel(
        'test-user-id',
        'test-recipe-id',
        partialOutcome
      )).resolves.not.toThrow();
    });
  });

  describe('getModelMetrics', () => {
    it('should calculate accuracy metrics correctly', async () => {
      const mockOutcomes = [
        {
          predicted_success_score: 0.8,
          actual_outcome: 'success',
          created_at: '2024-01-01T00:00:00.000Z'
        },
        {
          predicted_success_score: 0.3,
          actual_outcome: 'failure',
          created_at: '2024-01-02T00:00:00.000Z'
        },
        {
          predicted_success_score: 0.7,
          actual_outcome: 'success',
          created_at: '2024-01-03T00:00:00.000Z'
        },
        {
          predicted_success_score: 0.4,
          actual_outcome: 'partial_success', // Treated as failure in binary classification
          created_at: '2024-01-04T00:00:00.000Z'
        }
      ];

      mockSupabase.from().select().order().limit
        .mockResolvedValue({ data: mockOutcomes, error: null });

      const metrics = await mlPredictionService.getModelMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
      expect(metrics.accuracy).toBeLessThanOrEqual(1);
      expect(metrics.precision).toBeGreaterThanOrEqual(0);
      expect(metrics.precision).toBeLessThanOrEqual(1);
      expect(metrics.recall).toBeGreaterThanOrEqual(0);
      expect(metrics.recall).toBeLessThanOrEqual(1);
      expect(metrics.f1Score).toBeGreaterThanOrEqual(0);
      expect(metrics.f1Score).toBeLessThanOrEqual(1);
      expect(metrics.totalPredictions).toBe(4);
    });

    it('should handle empty outcomes gracefully', async () => {
      mockSupabase.from().select().order().limit
        .mockResolvedValue({ data: [], error: null });

      const metrics = await mlPredictionService.getModelMetrics();

      expect(metrics.accuracy).toBe(0);
      expect(metrics.precision).toBe(0);
      expect(metrics.recall).toBe(0);
      expect(metrics.f1Score).toBe(0);
      expect(metrics.totalPredictions).toBe(0);
      expect(metrics.recentAccuracy).toBe(0);
    });

    it('should calculate recent accuracy separately', async () => {
      const recentSuccesses = Array(80).fill(null).map((_, i) => ({
        predicted_success_score: 0.8,
        actual_outcome: 'success',
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      }));

      const olderFailures = Array(20).fill(null).map((_, i) => ({
        predicted_success_score: 0.8,
        actual_outcome: 'failure',
        created_at: new Date(Date.now() - (i + 200) * 24 * 60 * 60 * 1000).toISOString()
      }));

      mockSupabase.from().select().order().limit
        .mockResolvedValue({ data: [...recentSuccesses, ...olderFailures], error: null });

      const metrics = await mlPredictionService.getModelMetrics();

      // Recent accuracy should be higher than overall accuracy
      expect(metrics.recentAccuracy).toBeGreaterThan(metrics.accuracy);
    });
  });

  describe('Feature extraction', () => {
    it('should extract meaningful features for ML model', async () => {
      // This tests the private extractFeatures method indirectly through predictCookingSuccess
      const request = {
        userId: 'test-user-id',
        recipeId: 'test-recipe-id',
        cookingContext: {
          timeOfDay: 'morning',
          stressLevel: 1,
          availableTime: 60
        }
      };

      const result = await mlPredictionService.predictCookingSuccess(request);

      // Success should be relatively high for this well-matched scenario
      expect(result.successScore).toBeGreaterThan(0.5);
      
      // Should identify positive factors
      const positiveFactors = result.riskFactors.filter(factor => 
        !factor.includes('exceed') && !factor.includes('tight') && !factor.includes('conflict')
      );
      expect(positiveFactors.length).toBeLessThan(result.riskFactors.length);
    });

    it('should normalize features correctly', async () => {
      const extremeProfile = {
        ...mockAIProfile,
        skillLevel: 10,
        cookingExperienceYears: 25,
        preferredCookingTime: 300,
        successHistory: { attempts: 100, successes: 95, failures: 5 }
      };

      const extremeRecipe = {
        ...mockRecipe,
        totalTimeMinutes: 600,
        ingredients: Array(30).fill(null).map((_, i) => ({
          name: `ingredient${i}`,
          amount: 1,
          unit: 'cup',
          notes: ''
        })),
        instructions: Array(25).fill('Complex step')
      };

      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: transformToDBFormat(extremeProfile), error: null })
        .mockResolvedValueOnce({ data: transformRecipeToDBFormat(extremeRecipe), error: null });

      const request = {
        userId: 'extreme-user-id',
        recipeId: 'extreme-recipe-id'
      };

      const result = await mlPredictionService.predictCookingSuccess(request);

      // Should still produce valid prediction between 0 and 1
      expect(result.successScore).toBeGreaterThanOrEqual(0);
      expect(result.successScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from().select().eq().single
        .mockRejectedValue(new Error('Database connection failed'));

      const request = {
        userId: 'test-user-id',
        recipeId: 'test-recipe-id'
      };

      await expect(mlPredictionService.predictCookingSuccess(request))
        .rejects.toThrow();
    });

    it('should handle malformed data gracefully', async () => {
      const malformedProfile = {
        id: 'test-user-id',
        skill_level: null,
        cooking_experience_years: 'invalid',
        success_history: 'not an object',
        equipment_available: null
      };

      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: malformedProfile, error: null })
        .mockResolvedValueOnce({ data: transformRecipeToDBFormat(mockRecipe), error: null });

      const request = {
        userId: 'test-user-id',
        recipeId: 'test-recipe-id'
      };

      // Should handle gracefully without throwing
      const result = await mlPredictionService.predictCookingSuccess(request);
      expect(result).toBeDefined();
    });
  });

  // Helper functions to transform data to database format
  function transformToDBFormat(profile: AICookingProfile) {
    return {
      id: profile.id,
      skill_level: profile.skillLevel,
      cooking_experience_years: profile.cookingExperienceYears,
      preferred_cooking_time: profile.preferredCookingTime,
      equipment_available: profile.equipmentAvailable,
      dietary_restrictions: profile.dietaryRestrictions,
      allergies: profile.allergies,
      spice_tolerance: profile.spiceTolerance,
      preferred_portion_sizes: profile.preferredPortionSizes,
      cooking_goals: profile.cookingGoals,
      learning_preferences: profile.learningPreferences,
      success_history: profile.successHistory,
      preferred_cuisines_ranked: profile.preferredCuisinesRanked,
      ingredient_preferences: profile.ingredientPreferences,
      created_at: profile.createdAt.toISOString(),
      updated_at: profile.updatedAt.toISOString()
    };
  }

  function transformRecipeToDBFormat(recipe: VideoRecipe) {
    return {
      id: recipe.id,
      creator_id: recipe.creatorId,
      title: recipe.title,
      description: recipe.description,
      video_url: recipe.videoUrl,
      thumbnail_url: recipe.thumbnailUrl,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      nutrition: recipe.nutrition,
      servings: recipe.servings,
      prep_time_minutes: recipe.prepTimeMinutes,
      cook_time_minutes: recipe.cookTimeMinutes,
      total_time_minutes: recipe.totalTimeMinutes,
      difficulty_level: recipe.difficultyLevel,
      tags: recipe.tags,
      is_public: recipe.isPublic,
      created_at: recipe.createdAt.toISOString(),
      updated_at: recipe.updatedAt.toISOString()
    };
  }

  function transformOutcomeToDBFormat(outcome: CookingOutcome) {
    return {
      id: outcome.id,
      user_id: outcome.userId,
      recipe_id: outcome.recipeId,
      adaptation_id: outcome.adaptationId,
      predicted_success_score: outcome.predictedSuccessScore,
      actual_outcome: outcome.actualOutcome,
      user_rating: outcome.userRating,
      time_taken_minutes: outcome.timeTakenMinutes,
      difficulty_experienced: outcome.difficultyExperienced,
      issues_encountered: outcome.issuesEncountered,
      user_notes: outcome.userNotes,
      cooking_context: outcome.cookingContext,
      created_at: outcome.createdAt.toISOString()
    };
  }
});