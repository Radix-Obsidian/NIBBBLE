import { cookingIntelligence } from '@/lib/services/cooking-intelligence';
import { VideoIngredient, AICookingProfile, VideoRecipe } from '@/types';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn()
        }))
      }))
    }))
  }))
};

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => mockSupabase,
  createServerComponentClient: () => mockSupabase
}));

describe('CookingIntelligenceService', () => {
  const mockUserProfile: AICookingProfile = {
    id: 'test-user-id',
    skillLevel: 3,
    cookingExperienceYears: 1,
    preferredCookingTime: 30,
    equipmentAvailable: ['oven', 'stovetop', 'microwave'],
    dietaryRestrictions: ['vegetarian'],
    allergies: ['nuts'],
    spice_tolerance: 2,
    preferredPortionSizes: { small: false, medium: true, large: false },
    cookingGoals: ['healthy_eating'],
    learningPreferences: { video: true, text: true, stepByStep: true },
    successHistory: { attempts: 10, successes: 7, failures: 3 },
    preferredCuisinesRanked: ['Italian', 'Mediterranean'],
    ingredientPreferences: { 
      loved: ['basil', 'tomatoes'], 
      disliked: ['mushrooms'], 
      neverTried: ['quinoa'] 
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockRecipe: VideoRecipe = {
    id: 'test-recipe-id',
    creatorId: 'creator-id',
    creator: {} as any,
    title: 'Test Recipe',
    description: 'A test recipe',
    videoUrl: 'http://example.com/video.mp4',
    ingredients: [
      { name: 'chicken', amount: 1, unit: 'lb', notes: '' },
      { name: 'mushrooms', amount: 8, unit: 'oz', notes: '' },
      { name: 'heavy cream', amount: 1, unit: 'cup', notes: '' }
    ],
    instructions: [
      'Heat oil in a large pan',
      'Sauté the chicken until golden brown',
      'Add mushrooms and cook for 5 minutes',
      'Pour in cream and simmer'
    ],
    nutrition: { calories: 450, protein: 35, fat: 25, carbs: 10, perServing: true },
    servings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    totalTimeMinutes: 40,
    difficultyLevel: 'medium',
    tags: ['main-course', 'comfort-food'],
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSmartSubstitutions', () => {
    it('should identify dietary restriction conflicts and suggest substitutions', async () => {
      const mockSubstitutions = [
        {
          id: '1',
          original_ingredient: 'chicken',
          substitute_ingredient: 'tofu',
          substitution_ratio: 1.0,
          context_tags: ['main-protein'],
          dietary_reasons: ['vegetarian', 'vegan'],
          flavor_impact: 3,
          texture_impact: 4,
          nutritional_impact: { protein: -5, fat: -10 },
          success_rate: 0.85,
          user_ratings: { count: 150, average: 4.2 },
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '2',
          original_ingredient: 'heavy cream',
          substitute_ingredient: 'coconut milk',
          substitution_ratio: 1.0,
          context_tags: ['sauce', 'liquid'],
          dietary_reasons: ['dairy_free', 'vegan'],
          flavor_impact: 2,
          texture_impact: 1,
          nutritional_impact: { fat: -5 },
          success_rate: 0.90,
          user_ratings: { count: 200, average: 4.5 },
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockSupabase.from().select().eq().order().limit
        .mockResolvedValue({ data: mockSubstitutions, error: null });

      const result = await cookingIntelligence.getSmartSubstitutions(
        mockRecipe.ingredients,
        mockUserProfile
      );

      expect(result).toHaveLength(2);
      
      const chickenSub = result.find(s => s.original.name === 'chicken');
      expect(chickenSub).toBeDefined();
      expect(chickenSub?.substitutes[0].ingredient.substituteIngredient).toBe('tofu');
      expect(chickenSub?.substitutes[0].reasonsForSuggestion).toContain(
        expect.stringMatching(/vegetarian/i)
      );

      const creamSub = result.find(s => s.original.name === 'heavy cream');
      expect(creamSub).toBeDefined();
      expect(creamSub?.substitutes[0].ingredient.substituteIngredient).toBe('coconut milk');
    });

    it('should handle allergies correctly', async () => {
      const nutAllergicProfile = {
        ...mockUserProfile,
        allergies: ['nuts', 'tree nuts'],
        dietaryRestrictions: []
      };

      const ingredientsWithNuts: VideoIngredient[] = [
        { name: 'almonds', amount: 0.5, unit: 'cup', notes: '' },
        { name: 'flour', amount: 2, unit: 'cups', notes: '' }
      ];

      const mockSubstitutions = [{
        id: '1',
        original_ingredient: 'almonds',
        substitute_ingredient: 'sunflower seeds',
        substitution_ratio: 1.0,
        context_tags: ['nuts', 'protein'],
        dietary_reasons: ['nut_free'],
        flavor_impact: 2,
        texture_impact: 2,
        nutritional_impact: {},
        success_rate: 0.75,
        user_ratings: { count: 50, average: 3.8 },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }];

      mockSupabase.from().select().eq().order().limit
        .mockResolvedValue({ data: mockSubstitutions, error: null });

      const result = await cookingIntelligence.getSmartSubstitutions(
        ingredientsWithNuts,
        nutAllergicProfile
      );

      expect(result.length).toBeGreaterThan(0);
      const almondSub = result.find(s => s.original.name === 'almonds');
      expect(almondSub).toBeDefined();
      expect(almondSub?.substitutes[0].reasonsForSuggestion).toContain(
        expect.stringMatching(/allerg/i)
      );
    });

    it('should return empty array for compatible ingredients', async () => {
      const compatibleProfile = {
        ...mockUserProfile,
        dietaryRestrictions: [],
        allergies: [],
        ingredientPreferences: { loved: [], disliked: [], neverTried: [] }
      };

      const result = await cookingIntelligence.getSmartSubstitutions(
        mockRecipe.ingredients,
        compatibleProfile
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('adjustInstructionsForSkillLevel', () => {
    it('should simplify instructions for beginners', async () => {
      const beginnerProfile = { ...mockUserProfile, skillLevel: 1 };
      
      const result = await cookingIntelligence.adjustInstructionsForSkillLevel(
        mockRecipe.instructions,
        1,
        beginnerProfile,
        mockRecipe
      );

      expect(result.length).toBeGreaterThan(0);
      
      const sauteAdjustment = result.find(adj => 
        adj.originalInstruction.includes('Sauté')
      );
      expect(sauteAdjustment).toBeDefined();
      expect(sauteAdjustment?.adjustedInstruction).toContain('Sautéing means');
      expect(sauteAdjustment?.adjustmentType).toBe('technique_explanation');
    });

    it('should add safety warnings for dangerous steps', async () => {
      const instructionsWithHeat = [
        'Heat oil in pan until very hot and smoking',
        'Carefully add ingredients to hot oil'
      ];

      const result = await cookingIntelligence.adjustInstructionsForSkillLevel(
        instructionsWithHeat,
        2,
        mockUserProfile
      );

      const safetyAdjustment = result.find(adj => adj.adjustmentType === 'safety_added');
      expect(safetyAdjustment).toBeDefined();
      expect(safetyAdjustment?.adjustedInstruction).toContain('Safety:');
    });

    it('should not modify instructions for experienced cooks', async () => {
      const expertProfile = { ...mockUserProfile, skillLevel: 9 };
      
      const result = await cookingIntelligence.adjustInstructionsForSkillLevel(
        mockRecipe.instructions,
        9,
        expertProfile,
        mockRecipe
      );

      expect(result).toHaveLength(0);
    });

    it('should handle edge cases in instruction text', async () => {
      const edgeCaseInstructions = [
        '', // Empty instruction
        'Season to taste', // Vague instruction
        'Cook until done' // Unclear timing
      ];

      const result = await cookingIntelligence.adjustInstructionsForSkillLevel(
        edgeCaseInstructions,
        2,
        mockUserProfile
      );

      const seasonAdjustment = result.find(adj => 
        adj.originalInstruction.includes('season to taste')
      );
      expect(seasonAdjustment?.adjustedInstruction).toContain('start with a pinch');
    });
  });

  describe('getCookingTechnique', () => {
    it('should return technique data for appropriate skill level', async () => {
      const technique = await cookingIntelligence.getCookingTechnique('sauté', 3);

      expect(technique).toBeDefined();
      expect(technique?.name).toBe('Sauté');
      expect(technique?.skillLevel).toBeLessThanOrEqual(5); // 3 + 2 buffer
      expect(technique?.tips).toBeDefined();
      expect(technique?.alternatives).toBeDefined();
    });

    it('should return null for techniques above skill level', async () => {
      const technique = await cookingIntelligence.getCookingTechnique('braise', 1);

      expect(technique).toBeNull();
    });

    it('should provide alternatives for lower skill levels', async () => {
      const technique = await cookingIntelligence.getCookingTechnique('braise', 3);

      expect(technique?.alternatives.length).toBeGreaterThan(0);
    });
  });

  describe('generateCookingInsights', () => {
    it('should generate skill-appropriate insights', async () => {
      const insights = await cookingIntelligence.generateCookingInsights(
        mockRecipe,
        mockUserProfile
      );

      expect(insights.length).toBeGreaterThan(0);
      
      const skillInsight = insights.find(i => i.insightType === 'technique_tip');
      expect(skillInsight).toBeDefined();
      expect(skillInsight?.skillLevelTarget).toContain(mockUserProfile.skillLevel);
    });

    it('should identify equipment issues', async () => {
      const profileMissingEquipment = {
        ...mockUserProfile,
        equipmentAvailable: ['microwave'] // Missing oven and stovetop
      };

      const ovenRecipe = {
        ...mockRecipe,
        instructions: ['Preheat oven to 350°F', 'Bake for 30 minutes']
      };

      const insights = await cookingIntelligence.generateCookingInsights(
        ovenRecipe,
        profileMissingEquipment
      );

      const equipmentInsight = insights.find(i => i.insightType === 'equipment_recommendation');
      expect(equipmentInsight).toBeDefined();
      expect(equipmentInsight?.insightContent).toContain('oven');
    });

    it('should warn about time constraints', async () => {
      const quickProfile = {
        ...mockUserProfile,
        preferredCookingTime: 15 // Recipe takes 40 minutes
      };

      const insights = await cookingIntelligence.generateCookingInsights(
        mockRecipe,
        quickProfile
      );

      const timeInsight = insights.find(i => i.insightType === 'timing_adjustment');
      expect(timeInsight).toBeDefined();
      expect(timeInsight?.insightContent).toContain('longer than your usual');
    });

    it('should provide safety warnings for beginners', async () => {
      const beginnerProfile = {
        ...mockUserProfile,
        skillLevel: 2
      };

      const dangerousRecipe = {
        ...mockRecipe,
        instructions: [
          'Heat oil until smoking',
          'Carefully slice with sharp knife',
          'Handle boiling water'
        ]
      };

      const insights = await cookingIntelligence.generateCookingInsights(
        dangerousRecipe,
        beginnerProfile
      );

      const safetyInsights = insights.filter(i => i.insightType === 'safety_warning');
      expect(safetyInsights.length).toBeGreaterThan(0);
    });
  });

  describe('assessRecipeDifficulty', () => {
    it('should accurately assess recipe complexity', async () => {
      const assessment = await cookingIntelligence.assessRecipeDifficulty(
        mockRecipe,
        mockUserProfile
      );

      expect(assessment.overallDifficulty).toBeGreaterThan(0);
      expect(assessment.overallDifficulty).toBeLessThanOrEqual(10);
      expect(assessment.preparationComplexity).toBeDefined();
      expect(assessment.equipmentComplexity).toBeDefined();
      expect(assessment.techniqueComplexity).toBeDefined();
      expect(assessment.recommendations).toBeDefined();
    });

    it('should identify skill gaps', async () => {
      const complexRecipe = {
        ...mockRecipe,
        instructions: [
          'Tempering the chocolate requires precise temperature control',
          'Perform a brunoise cut on all vegetables',
          'Emulsify the sauce using proper technique'
        ]
      };

      const assessment = await cookingIntelligence.assessRecipeDifficulty(
        complexRecipe,
        mockUserProfile
      );

      expect(assessment.skillGaps.length).toBeGreaterThan(0);
      assessment.skillGaps.forEach(gap => {
        expect(gap.requiredLevel).toBeGreaterThan(gap.userLevel);
        expect(gap.recommendation).toBeDefined();
      });
    });

    it('should account for missing equipment', async () => {
      const limitedProfile = {
        ...mockUserProfile,
        equipmentAvailable: ['microwave']
      };

      const equipmentHeavyRecipe = {
        ...mockRecipe,
        instructions: [
          'Using your stand mixer, whip the cream',
          'Blend the mixture in a high-speed blender',
          'Use a thermometer to check temperature'
        ]
      };

      const assessment = await cookingIntelligence.assessRecipeDifficulty(
        equipmentHeavyRecipe,
        limitedProfile
      );

      expect(assessment.equipmentComplexity).toBeGreaterThan(5);
      expect(assessment.recommendations).toContain(
        expect.stringMatching(/equipment|alternative/i)
      );
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from().select().eq().order().limit
        .mockResolvedValue({ data: null, error: { message: 'Database error' } });

      const result = await cookingIntelligence.getSmartSubstitutions(
        mockRecipe.ingredients,
        mockUserProfile
      );

      expect(result).toEqual([]);
    });

    it('should handle malformed substitution data', async () => {
      const malformedData = [{
        id: '1',
        original_ingredient: null,
        substitute_ingredient: '',
        substitution_ratio: 'invalid',
        dietary_reasons: 'not an array',
        success_rate: 'high'
      }];

      mockSupabase.from().select().eq().order().limit
        .mockResolvedValue({ data: malformedData, error: null });

      // Should not throw error
      await expect(cookingIntelligence.getSmartSubstitutions(
        mockRecipe.ingredients,
        mockUserProfile
      )).resolves.toBeDefined();
    });

    it('should handle empty or null instructions', async () => {
      const result = await cookingIntelligence.adjustInstructionsForSkillLevel(
        [],
        2,
        mockUserProfile
      );

      expect(result).toEqual([]);
    });

    it('should validate input parameters', async () => {
      // Test with invalid skill level
      const result = await cookingIntelligence.adjustInstructionsForSkillLevel(
        mockRecipe.instructions,
        -1, // Invalid skill level
        mockUserProfile
      );

      expect(result).toBeDefined(); // Should handle gracefully
    });
  });
});