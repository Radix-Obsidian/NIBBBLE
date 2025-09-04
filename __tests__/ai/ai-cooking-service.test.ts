import { aiCookingService } from '@/lib/services/ai-cooking-service';
import { AICookingProfile, AdaptRecipeRequest } from '@/types/ai-cooking';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    upsert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    })),
    in: jest.fn(() => ({
      overlaps: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn()
        }))
      }))
    })),
    overlaps: jest.fn(() => ({
      order: jest.fn(() => ({
        limit: jest.fn()
      }))
    })),
    order: jest.fn(() => ({
      limit: jest.fn()
    })),
    limit: jest.fn()
  })),
  auth: {
    getUser: jest.fn()
  }
};

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => mockSupabase,
  createServerComponentClient: () => mockSupabase
}));

describe('AICookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAICookingProfile', () => {
    it('should retrieve AI cooking profile successfully', async () => {
      const mockProfile = {
        id: 'test-user-id',
        skill_level: 5,
        cooking_experience_years: 3,
        preferred_cooking_time: 30,
        equipment_available: ['oven', 'stovetop'],
        dietary_restrictions: ['vegetarian'],
        allergies: [],
        spice_tolerance: 3,
        preferred_portion_sizes: { small: false, medium: true, large: false },
        cooking_goals: ['healthy_eating'],
        learning_preferences: { video: true, text: true, stepByStep: true },
        success_history: { attempts: 10, successes: 8, failures: 2 },
        preferred_cuisines_ranked: ['Italian', 'Mexican'],
        ingredient_preferences: { loved: ['basil'], disliked: ['cilantro'], neverTried: [] },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockProfile,
        error: null
      });

      const result = await aiCookingService.getAICookingProfile('test-user-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('test-user-id');
      expect(result?.skillLevel).toBe(5);
      expect(result?.equipmentAvailable).toEqual(['oven', 'stovetop']);
    });

    it('should return null if profile not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      });

      const result = await aiCookingService.getAICookingProfile('nonexistent-user');

      expect(result).toBeNull();
    });

    it('should throw error on database error', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST000', message: 'Database error' }
      });

      await expect(aiCookingService.getAICookingProfile('test-user-id'))
        .rejects.toThrow('Failed to get AI cooking profile: Database error');
    });
  });

  describe('createOrUpdateAICookingProfile', () => {
    it('should create new AI cooking profile', async () => {
      const profileData: Partial<AICookingProfile> = {
        skillLevel: 3,
        cookingExperienceYears: 1,
        equipmentAvailable: ['microwave', 'stovetop'],
        dietaryRestrictions: ['gluten_free']
      };

      const mockCreatedProfile = {
        id: 'test-user-id',
        skill_level: 3,
        cooking_experience_years: 1,
        preferred_cooking_time: 30,
        equipment_available: ['microwave', 'stovetop'],
        dietary_restrictions: ['gluten_free'],
        allergies: [],
        spice_tolerance: 3,
        preferred_portion_sizes: { small: false, medium: true, large: false },
        cooking_goals: [],
        learning_preferences: { video: true, text: true, stepByStep: true },
        success_history: { attempts: 0, successes: 0, failures: 0 },
        preferred_cuisines_ranked: [],
        ingredient_preferences: { loved: [], disliked: [], neverTried: [] },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      };

      mockSupabase.from().upsert().select().single.mockResolvedValue({
        data: mockCreatedProfile,
        error: null
      });

      const result = await aiCookingService.createOrUpdateAICookingProfile('test-user-id', profileData);

      expect(result).toBeDefined();
      expect(result.skillLevel).toBe(3);
      expect(result.equipmentAvailable).toEqual(['microwave', 'stovetop']);
      expect(result.dietaryRestrictions).toEqual(['gluten_free']);
    });

    it('should handle upsert errors', async () => {
      mockSupabase.from().upsert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Constraint violation' }
      });

      const profileData: Partial<AICookingProfile> = { skillLevel: 5 };

      await expect(aiCookingService.createOrUpdateAICookingProfile('test-user-id', profileData))
        .rejects.toThrow('Failed to create/update AI cooking profile: Constraint violation');
    });
  });

  describe('adaptRecipe', () => {
    const mockRequest: AdaptRecipeRequest = {
      recipeId: 'test-recipe-id',
      userId: 'test-user-id',
      adaptationReasons: ['skill_adjustment', 'dietary_modification'],
      targetSkillLevel: 3
    };

    const mockAIProfile: AICookingProfile = {
      id: 'test-user-id',
      skillLevel: 3,
      cookingExperienceYears: 1,
      preferredCookingTime: 30,
      equipmentAvailable: ['oven', 'stovetop'],
      dietaryRestrictions: ['vegetarian'],
      allergies: [],
      spice_tolerance: 3,
      preferredPortionSizes: { small: false, medium: true, large: false },
      cookingGoals: ['healthy_eating'],
      learningPreferences: { video: true, text: true, stepByStep: true },
      successHistory: { attempts: 5, successes: 4, failures: 1 },
      preferredCuisinesRanked: ['Italian'],
      ingredientPreferences: { loved: [], disliked: [], neverTried: [] },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockRecipe = {
      id: 'test-recipe-id',
      title: 'Test Recipe',
      instructions: ['Step 1', 'Step 2'],
      ingredients: [{ name: 'chicken', amount: 1, unit: 'lb', notes: '' }],
      difficulty_level: 'medium',
      prep_time_minutes: 15,
      cook_time_minutes: 30,
      creator_id: 'creator-id'
    };

    beforeEach(() => {
      // Mock getAICookingProfile
      jest.spyOn(aiCookingService, 'getAICookingProfile')
        .mockResolvedValue(mockAIProfile);

      // Mock recipe fetch
      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: mockRecipe, error: null });

      // Mock substitutions fetch
      mockSupabase.from().select().in().overlaps().order().limit
        .mockResolvedValue({ data: [], error: null });

      // Mock adaptation save
      mockSupabase.from().insert().select().single
        .mockResolvedValue({
          data: {
            id: 'adaptation-id',
            original_recipe_id: 'test-recipe-id',
            user_id: 'test-user-id',
            adaptation_type: 'skill_adjusted',
            adapted_recipe: { ...mockRecipe, title: 'Test Recipe (Adapted)' },
            adaptation_reasons: ['skill_adjustment'],
            confidence_score: 0.85,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
          },
          error: null
        });
    });

    it('should adapt recipe successfully', async () => {
      const result = await aiCookingService.adaptRecipe(mockRequest);

      expect(result).toBeDefined();
      expect(result.adaptation).toBeDefined();
      expect(result.substitutions).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(result.confidenceScore).toBeGreaterThan(0);
    });

    it('should throw error if user profile not found', async () => {
      jest.spyOn(aiCookingService, 'getAICookingProfile')
        .mockResolvedValue(null);

      await expect(aiCookingService.adaptRecipe(mockRequest))
        .rejects.toThrow('AI cooking profile not found');
    });

    it('should throw error if recipe not found', async () => {
      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(aiCookingService.adaptRecipe(mockRequest))
        .rejects.toThrow('Failed to get recipe');
    });
  });

  describe('predictCookingSuccess', () => {
    it('should predict cooking success', async () => {
      const mockAIProfile: AICookingProfile = {
        id: 'test-user-id',
        skillLevel: 5,
        cookingExperienceYears: 2,
        preferredCookingTime: 45,
        equipmentAvailable: ['oven', 'stovetop', 'blender'],
        dietaryRestrictions: [],
        allergies: [],
        spice_tolerance: 4,
        preferredPortionSizes: { small: false, medium: true, large: false },
        cookingGoals: ['skill_development'],
        learningPreferences: { video: true, text: true, stepByStep: true },
        successHistory: { attempts: 20, successes: 16, failures: 4 },
        preferredCuisinesRanked: ['Italian', 'Thai'],
        ingredientPreferences: { loved: ['garlic'], disliked: [], neverTried: [] },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockRecipe = {
        id: 'test-recipe-id',
        title: 'Intermediate Pasta',
        difficulty_level: 'medium',
        prep_time_minutes: 20,
        cook_time_minutes: 25,
        total_time_minutes: 45,
        ingredients: [
          { name: 'pasta', amount: 1, unit: 'lb' },
          { name: 'garlic', amount: 3, unit: 'cloves' }
        ]
      };

      jest.spyOn(aiCookingService, 'getAICookingProfile')
        .mockResolvedValue(mockAIProfile);

      mockSupabase.from().select().eq().single
        .mockResolvedValue({ data: mockRecipe, error: null });

      const result = await aiCookingService.predictCookingSuccess({
        userId: 'test-user-id',
        recipeId: 'test-recipe-id'
      });

      expect(result).toBeDefined();
      expect(result.successScore).toBeGreaterThanOrEqual(0);
      expect(result.successScore).toBeLessThanOrEqual(1);
      expect(result.confidenceInterval).toHaveLength(2);
      expect(result.riskFactors).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should identify risk factors correctly', async () => {
      const beginnerProfile: AICookingProfile = {
        id: 'beginner-user-id',
        skillLevel: 2,
        cookingExperienceYears: 0,
        preferredCookingTime: 20,
        equipmentAvailable: ['microwave'],
        dietaryRestrictions: [],
        allergies: [],
        spice_tolerance: 1,
        preferredPortionSizes: { small: true, medium: false, large: false },
        cookingGoals: [],
        learningPreferences: { video: true, text: false, stepByStep: true },
        successHistory: { attempts: 3, successes: 1, failures: 2 },
        preferredCuisinesRanked: [],
        ingredientPreferences: { loved: [], disliked: [], neverTried: [] },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const complexRecipe = {
        id: 'complex-recipe-id',
        title: 'Advanced French Dish',
        difficulty_level: 'hard',
        prep_time_minutes: 60,
        cook_time_minutes: 120,
        total_time_minutes: 180,
        ingredients: Array(20).fill(0).map((_, i) => ({ 
          name: `ingredient${i}`, 
          amount: 1, 
          unit: 'cup' 
        }))
      };

      jest.spyOn(aiCookingService, 'getAICookingProfile')
        .mockResolvedValue(beginnerProfile);

      mockSupabase.from().select().eq().single
        .mockResolvedValue({ data: complexRecipe, error: null });

      const result = await aiCookingService.predictCookingSuccess({
        userId: 'beginner-user-id',
        recipeId: 'complex-recipe-id'
      });

      expect(result.riskFactors.length).toBeGreaterThan(0);
      expect(result.riskFactors.some(factor => 
        factor.includes('skill level') || factor.includes('difficulty')
      )).toBe(true);
    });
  });

  describe('smartSearch', () => {
    it('should return personalized recipe recommendations', async () => {
      const mockAIProfile: AICookingProfile = {
        id: 'test-user-id',
        skillLevel: 4,
        cookingExperienceYears: 2,
        preferredCookingTime: 30,
        equipmentAvailable: ['oven', 'stovetop'],
        dietaryRestrictions: ['vegetarian'],
        allergies: [],
        spice_tolerance: 3,
        preferredPortionSizes: { small: false, medium: true, large: false },
        cookingGoals: ['healthy_eating'],
        learningPreferences: { video: true, text: true, stepByStep: true },
        successHistory: { attempts: 15, successes: 12, failures: 3 },
        preferredCuisinesRanked: ['Italian', 'Mediterranean'],
        ingredientPreferences: { loved: ['tomatoes'], disliked: ['mushrooms'], neverTried: [] },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Vegetarian Pasta',
          cuisine: 'Italian',
          difficulty_level: 'medium',
          total_time_minutes: 25,
          is_public: true,
          tags: ['vegetarian', 'pasta']
        },
        {
          id: 'recipe-2',
          title: 'Mediterranean Salad',
          cuisine: 'Mediterranean',
          difficulty_level: 'easy',
          total_time_minutes: 15,
          is_public: true,
          tags: ['vegetarian', 'salad', 'healthy']
        }
      ];

      jest.spyOn(aiCookingService, 'getAICookingProfile')
        .mockResolvedValue(mockAIProfile);

      mockSupabase.from().select().eq().limit.mockResolvedValue({
        data: mockRecipes,
        error: null
      });

      const result = await aiCookingService.smartSearch({
        userProfile: mockAIProfile,
        context: { timeAvailable: 30, mealType: 'lunch' }
      });

      expect(result).toBeDefined();
      expect(result.recipes).toBeDefined();
      expect(result.recipes.length).toBeGreaterThan(0);
      expect(result.insights).toBeDefined();
      expect(result.suggestions).toBeDefined();

      // Verify recipes are scored and ranked
      result.recipes.forEach(recipe => {
        expect(recipe.matchScore).toBeGreaterThanOrEqual(0);
        expect(recipe.matchScore).toBeLessThanOrEqual(1);
        expect(recipe.reasoning).toBeDefined();
      });
    });

    it('should handle empty search results', async () => {
      const mockAIProfile: AICookingProfile = {
        id: 'test-user-id',
        skillLevel: 1,
        cookingExperienceYears: 0,
        preferredCookingTime: 10,
        equipmentAvailable: [],
        dietaryRestrictions: ['vegan', 'gluten_free'],
        allergies: ['nuts', 'soy'],
        spice_tolerance: 1,
        preferredPortionSizes: { small: true, medium: false, large: false },
        cookingGoals: [],
        learningPreferences: { video: true, text: false, stepByStep: true },
        successHistory: { attempts: 0, successes: 0, failures: 0 },
        preferredCuisinesRanked: [],
        ingredientPreferences: { loved: [], disliked: [], neverTried: [] },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(aiCookingService, 'getAICookingProfile')
        .mockResolvedValue(mockAIProfile);

      mockSupabase.from().select().eq().limit.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await aiCookingService.smartSearch({
        userProfile: mockAIProfile,
        context: { timeAvailable: 10 }
      });

      expect(result.recipes).toHaveLength(0);
      expect(result.suggestions).toBeDefined();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle malformed profile data gracefully', async () => {
      const malformedProfile = {
        id: 'test-user-id',
        skill_level: null,
        cooking_experience_years: 'invalid',
        equipment_available: null,
        dietary_restrictions: 'not an array',
        created_at: 'invalid-date',
        updated_at: 'invalid-date'
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: malformedProfile,
        error: null
      });

      // Should not throw but should handle gracefully
      const result = await aiCookingService.getAICookingProfile('test-user-id');
      expect(result).toBeDefined();
    });

    it('should handle database connection errors', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(aiCookingService.getAICookingProfile('test-user-id'))
        .rejects.toThrow();
    });

    it('should validate adaptation request parameters', async () => {
      const invalidRequest = {
        recipeId: '',
        userId: '',
        adaptationReasons: []
      } as AdaptRecipeRequest;

      // Should handle invalid parameters appropriately
      await expect(aiCookingService.adaptRecipe(invalidRequest))
        .rejects.toThrow();
    });
  });
});