import { NutritionCalculator } from '../lib/services/nutrition-calculator';
import { VideoIngredient } from '../types';

// Mock fetch for testing
global.fetch = jest.fn();

describe('NutritionCalculator', () => {
  let nutritionCalculator: NutritionCalculator;
  
  beforeEach(() => {
    nutritionCalculator = new NutritionCalculator();
    jest.clearAllMocks();
  });

  const mockIngredients: VideoIngredient[] = [
    {
      name: 'Flour',
      amount: 2,
      unit: 'cups',
      notes: 'All-purpose flour'
    },
    {
      name: 'Sugar',
      amount: 1,
      unit: 'cup',
      notes: 'Granulated sugar'
    },
    {
      name: 'Eggs',
      amount: 2,
      unit: 'large',
      notes: 'Large eggs'
    },
    {
      name: 'Milk',
      amount: 1,
      unit: 'cup',
      notes: 'Whole milk'
    }
  ];

  describe('searchUSDAFood', () => {
    it('should search for food items successfully', async () => {
      const mockSearchResponse = {
        foods: [
          {
            fdcId: 12345,
            description: 'Wheat flour, white, all-purpose, enriched, bleached',
            brandOwner: 'Test Brand'
          }
        ]
      };

      const mockDetailResponse = {
        foodNutrients: [
          {
            nutrientId: 1008,
            nutrientName: 'Calories',
            value: 364
          },
          {
            nutrientId: 1003,
            nutrientName: 'Protein',
            value: 10
          },
          {
            nutrientId: 1004,
            nutrientName: 'Total lipid (fat)',
            value: 1
          },
          {
            nutrientId: 1005,
            nutrientName: 'Carbohydrate, by difference',
            value: 76
          }
        ]
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSearchResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDetailResponse
        });

      const result = await nutritionCalculator.searchUSDAFood('flour');

      expect(result).toEqual({
        fdcId: 12345,
        description: 'Wheat flour, white, all-purpose, enriched, bleached',
        brandOwner: 'Test Brand',
        nutrients: {
          calories: 364,
          protein: 10,
          fat: 1,
          carbs: 76
        }
      });
    });

    it('should handle search API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await nutritionCalculator.searchUSDAFood('flour');
      expect(result).toBeNull();
    });

    it('should handle empty search results', async () => {
      const mockSearchResponse = { foods: [] };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse
      });

      const result = await nutritionCalculator.searchUSDAFood('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await nutritionCalculator.searchUSDAFood('flour');
      expect(result).toBeNull();
    });
  });

  describe('getNutritionForIngredient', () => {
    it('should return nutrition data for known ingredients', async () => {
      const mockUSDAResponse = {
        fdcId: 12345,
        description: 'Wheat flour, white, all-purpose, enriched, bleached',
        brandOwner: 'Test Brand',
        nutrients: {
          calories: 364,
          protein: 10,
          fat: 1,
          carbs: 76
        }
      };

      jest.spyOn(nutritionCalculator, 'searchUSDAFood').mockResolvedValue(mockUSDAResponse);

      const result = await nutritionCalculator.getNutritionForIngredient('Flour', 2, 'cups');

      expect(result).toEqual({
        calories: 728, // 364 * 2
        protein: 20,   // 10 * 2
        fat: 2,        // 1 * 2
        carbs: 152     // 76 * 2
      });
    });

    it('should use fallback nutrition for unknown ingredients', async () => {
      jest.spyOn(nutritionCalculator, 'searchUSDAFood').mockResolvedValue(null);

      const result = await nutritionCalculator.getNutritionForIngredient('Unknown Ingredient', 1, 'cup');

      expect(result).toEqual({
        calories: 100,
        protein: 2,
        fat: 1,
        carbs: 20
      });
    });

    it('should handle unit conversions for fallback nutrition', async () => {
      jest.spyOn(nutritionCalculator, 'searchUSDAFood').mockResolvedValue(null);

      const result = await nutritionCalculator.getNutritionForIngredient('Flour', 2, 'tablespoons');

      // 2 tablespoons = 1/8 cup, so nutrition should be scaled accordingly
      expect(result.calories).toBe(12.5); // 100 * (1/8)
      expect(result.protein).toBe(0.25);  // 2 * (1/8)
    });

    it('should handle zero amounts', async () => {
      const result = await nutritionCalculator.getNutritionForIngredient('Flour', 0, 'cups');
      
      expect(result).toEqual({
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
      });
    });
  });

  describe('calculateNutritionForRecipe', () => {
    it('should aggregate nutrition from all ingredients', async () => {
      // Mock USDA responses for different ingredients
      const mockUSDAResponses = {
        'Flour': {
          fdcId: 12345,
          description: 'Wheat flour',
          brandOwner: 'Test Brand',
          nutrients: { calories: 364, protein: 10, fat: 1, carbs: 76 }
        },
        'Sugar': {
          fdcId: 12346,
          description: 'Granulated sugar',
          brandOwner: 'Test Brand',
          nutrients: { calories: 387, protein: 0, fat: 0, carbs: 100 }
        },
        'Eggs': {
          fdcId: 12347,
          description: 'Large eggs',
          brandOwner: 'Test Brand',
          nutrients: { calories: 74, protein: 6, fat: 5, carbs: 0.4 }
        },
        'Milk': {
          fdcId: 12348,
          description: 'Whole milk',
          brandOwner: 'Test Brand',
          nutrients: { calories: 61, protein: 3.2, fat: 3.3, carbs: 4.8 }
        }
      };

      jest.spyOn(nutritionCalculator, 'searchUSDAFood').mockImplementation(async (query) => {
        const ingredient = Object.keys(mockUSDAResponses).find(key => 
          query.toLowerCase().includes(key.toLowerCase())
        );
        return ingredient ? mockUSDAResponses[ingredient as keyof typeof mockUSDAResponses] : null;
      });

      const result = await nutritionCalculator.calculateNutritionForRecipe(mockIngredients, 4);

      // Expected totals (per serving):
      // Flour: 2 cups = 728 cal, 20g protein, 2g fat, 152g carbs
      // Sugar: 1 cup = 387 cal, 0g protein, 0g fat, 100g carbs  
      // Eggs: 2 large = 148 cal, 12g protein, 10g fat, 0.8g carbs
      // Milk: 1 cup = 61 cal, 3.2g protein, 3.3g fat, 4.8g carbs
      // Total: 1324 cal, 35.2g protein, 15.3g fat, 257.6g carbs
      // Per serving (4): 331 cal, 8.8g protein, 3.8g fat, 64.4g carbs

      expect(result.calories).toBeCloseTo(331, 0);
      expect(result.protein).toBeCloseTo(8.8, 1);
      expect(result.fat).toBeCloseTo(3.8, 1);
      expect(result.carbs).toBeCloseTo(64.4, 1);
      expect(result.perServing).toBe(true);
    });

    it('should handle mixed USDA and fallback nutrition', async () => {
      // Mock some ingredients with USDA data, others with fallback
      jest.spyOn(nutritionCalculator, 'searchUSDAFood')
        .mockResolvedValueOnce({
          fdcId: 12345,
          description: 'Wheat flour',
          brandOwner: 'Test Brand',
          nutrients: { calories: 364, protein: 10, fat: 1, carbs: 76 }
        })
        .mockResolvedValueOnce(null) // Sugar - use fallback
        .mockResolvedValueOnce(null) // Eggs - use fallback
        .mockResolvedValueOnce(null); // Milk - use fallback

      const result = await nutritionCalculator.calculateNutritionForRecipe(mockIngredients, 4);

      expect(result.calories).toBeGreaterThan(0);
      expect(result.protein).toBeGreaterThan(0);
      expect(result.fat).toBeGreaterThan(0);
      expect(result.carbs).toBeGreaterThan(0);
      expect(result.perServing).toBe(true);
    });

    it('should handle empty ingredients array', async () => {
      const result = await nutritionCalculator.calculateNutritionForRecipe([], 4);

      expect(result).toEqual({
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        perServing: true
      });
    });

    it('should handle zero servings', async () => {
      const result = await nutritionCalculator.calculateNutritionForRecipe(mockIngredients, 0);

      expect(result).toEqual({
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        perServing: true
      });
    });

    it('should handle negative servings by using absolute value', async () => {
      const result = await nutritionCalculator.calculateNutritionForRecipe(mockIngredients, -4);

      expect(result.calories).toBeGreaterThan(0);
      expect(result.perServing).toBe(true);
    });
  });

  describe('getFallbackNutrition', () => {
    it('should return fallback nutrition for common ingredients', () => {
      const result = nutritionCalculator.getFallbackNutrition('Flour', 1, 'cup');
      
      expect(result).toEqual({
        calories: 100,
        protein: 2,
        fat: 1,
        carbs: 20
      });
    });

    it('should handle unknown ingredients with default values', () => {
      const result = nutritionCalculator.getFallbackNutrition('Unknown Ingredient', 1, 'cup');
      
      expect(result).toEqual({
        calories: 100,
        protein: 2,
        fat: 1,
        carbs: 20
      });
    });

    it('should scale nutrition based on amount', () => {
      const result = nutritionCalculator.getFallbackNutrition('Flour', 2, 'cups');
      
      expect(result).toEqual({
        calories: 200, // 100 * 2
        protein: 4,    // 2 * 2
        fat: 2,        // 1 * 2
        carbs: 40      // 20 * 2
      });
    });

    it('should handle different units appropriately', () => {
      const tablespoonResult = nutritionCalculator.getFallbackNutrition('Flour', 1, 'tablespoon');
      const cupResult = nutritionCalculator.getFallbackNutrition('Flour', 1, 'cup');
      
      expect(tablespoonResult.calories).toBeLessThan(cupResult.calories);
      expect(tablespoonResult.calories).toBeCloseTo(cupResult.calories / 16, 0); // 1 cup = 16 tablespoons
    });
  });

  describe('unitConversion', () => {
    it('should convert cups to tablespoons', () => {
      const result = nutritionCalculator.convertToStandardUnit(1, 'cup');
      expect(result.amount).toBe(16);
      expect(result.unit).toBe('tablespoons');
    });

    it('should convert tablespoons to teaspoons', () => {
      const result = nutritionCalculator.convertToStandardUnit(1, 'tablespoon');
      expect(result.amount).toBe(3);
      expect(result.unit).toBe('teaspoons');
    });

    it('should handle non-convertible units', () => {
      const result = nutritionCalculator.convertToStandardUnit(1, 'large');
      expect(result.amount).toBe(1);
      expect(result.unit).toBe('large');
    });

    it('should handle zero amounts', () => {
      const result = nutritionCalculator.convertToStandardUnit(0, 'cup');
      expect(result.amount).toBe(0);
      expect(result.unit).toBe('tablespoons');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed USDA API responses', async () => {
      const mockMalformedResponse = {
        foods: [
          {
            fdcId: 12345,
            description: 'Wheat flour'
            // Missing required fields
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMalformedResponse
      });

      const result = await nutritionCalculator.searchUSDAFood('flour');
      expect(result).toBeNull();
    });

    it('should handle USDA API rate limiting', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      const result = await nutritionCalculator.searchUSDAFood('flour');
      expect(result).toBeNull();
    });

    it('should handle missing API key gracefully', async () => {
      // Temporarily remove API key
      const originalKey = process.env.USDA_API_KEY;
      delete process.env.USDA_API_KEY;

      const result = await nutritionCalculator.searchUSDAFood('flour');
      expect(result).toBeNull();

      // Restore API key
      process.env.USDA_API_KEY = originalKey;
    });

    it('should handle very large ingredient amounts', async () => {
      const largeIngredients = [
        { name: 'Flour', amount: 1000, unit: 'cups', notes: undefined }
      ];

      const result = await nutritionCalculator.calculateNutritionForRecipe(largeIngredients, 1);
      
      expect(result.calories).toBeGreaterThan(0);
      expect(result.calories).toBeLessThan(Infinity);
      expect(isNaN(result.calories)).toBe(false);
    });
  });
});
