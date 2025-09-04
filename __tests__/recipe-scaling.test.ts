import {
  scaleRecipe,
  scaleRecipeWithUnitConversion,
  scaleNutrition,
  formatScaledAmount,
  getCommonServingSizes,
  validateScaling
} from '../lib/utils/recipe-scaling';
import { VideoIngredient, NutritionInfo } from '../types';

describe('Recipe Scaling Utilities', () => {
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
      notes: 'Room temperature'
    },
    {
      name: 'Milk',
      amount: 1,
      unit: 'cup',
      notes: 'Whole milk'
    }
  ];

  const mockNutrition: NutritionInfo = {
    calories: 300,
    protein: 8,
    fat: 12,
    carbs: 45,
    fiber: 2,
    sugar: 20,
    perServing: true
  };

  describe('scaleRecipe', () => {
    it('should scale ingredients proportionally', () => {
      const scaled = scaleRecipe(mockIngredients, 4, 8);
      
      expect(scaled).toHaveLength(4);
      expect(scaled[0]).toEqual({
        ...mockIngredients[0],
        amount: 4 // 2 * 2
      });
      expect(scaled[1]).toEqual({
        ...mockIngredients[1],
        amount: 2 // 1 * 2
      });
      expect(scaled[2]).toEqual({
        ...mockIngredients[2],
        amount: 4 // 2 * 2
      });
      expect(scaled[3]).toEqual({
        ...mockIngredients[3],
        amount: 2 // 1 * 2
      });
    });

    it('should scale down ingredients proportionally', () => {
      const scaled = scaleRecipe(mockIngredients, 4, 2);
      
      expect(scaled[0].amount).toBe(1); // 2 * 0.5
      expect(scaled[1].amount).toBe(0.5); // 1 * 0.5
      expect(scaled[2].amount).toBe(1); // 2 * 0.5
      expect(scaled[3].amount).toBe(0.5); // 1 * 0.5
    });

    it('should handle zero servings gracefully', () => {
      const scaled = scaleRecipe(mockIngredients, 4, 0);
      
      expect(scaled).toHaveLength(4);
      scaled.forEach(ingredient => {
        expect(ingredient.amount).toBe(0);
      });
    });

    it('should preserve ingredient properties', () => {
      const scaled = scaleRecipe(mockIngredients, 4, 6);
      
      scaled.forEach((ingredient, index) => {
        expect(ingredient.name).toBe(mockIngredients[index].name);
        expect(ingredient.unit).toBe(mockIngredients[index].unit);
        expect(ingredient.notes).toBe(mockIngredients[index].notes);
      });
    });

    it('should handle negative servings by returning original amounts', () => {
      const scaled = scaleRecipe(mockIngredients, 4, -2);
      
      scaled.forEach((ingredient, index) => {
        expect(ingredient.amount).toBe(mockIngredients[index].amount);
      });
    });
  });

  describe('scaleRecipeWithUnitConversion', () => {
    it('should convert cups to tablespoons when scaling down significantly', () => {
      const ingredients = [
        { name: 'Flour', amount: 1, unit: 'cup', notes: undefined }
      ];
      
      const scaled = scaleRecipeWithUnitConversion(ingredients, 4, 1);
      
      expect(scaled[0].amount).toBe(4); // 1/4 cup = 4 tablespoons
      expect(scaled[0].unit).toBe('tablespoons');
    });

    it('should convert tablespoons to teaspoons when scaling down further', () => {
      const ingredients = [
        { name: 'Salt', amount: 2, unit: 'tablespoons', notes: undefined }
      ];
      
      const scaled = scaleRecipeWithUnitConversion(ingredients, 4, 1);
      
      expect(scaled[0].amount).toBe(6); // 2/4 tablespoons = 6 teaspoons
      expect(scaled[0].unit).toBe('teaspoons');
    });

    it('should not convert units when scaling up', () => {
      const ingredients = [
        { name: 'Flour', amount: 1, unit: 'cup', notes: undefined }
      ];
      
      const scaled = scaleRecipeWithUnitConversion(ingredients, 2, 6);
      
      expect(scaled[0].amount).toBe(3); // 1 * 3
      expect(scaled[0].unit).toBe('cups');
    });

    it('should handle non-standard units without conversion', () => {
      const ingredients = [
        { name: 'Eggs', amount: 2, unit: 'large', notes: undefined }
      ];
      
      const scaled = scaleRecipeWithUnitConversion(ingredients, 4, 2);
      
      expect(scaled[0].amount).toBe(1); // 2 * 0.5
      expect(scaled[0].unit).toBe('large');
    });
  });

  describe('scaleNutrition', () => {
    it('should scale nutrition values proportionally', () => {
      const scaled = scaleNutrition(mockNutrition, 4, 8);
      
      expect(scaled.calories).toBe(600); // 300 * 2
      expect(scaled.protein).toBe(16); // 8 * 2
      expect(scaled.fat).toBe(24); // 12 * 2
      expect(scaled.carbs).toBe(90); // 45 * 2
      expect(scaled.fiber).toBe(4); // 2 * 2
      expect(scaled.sugar).toBe(40); // 20 * 2
    });

    it('should scale down nutrition values', () => {
      const scaled = scaleNutrition(mockNutrition, 4, 2);
      
      expect(scaled.calories).toBe(150); // 300 * 0.5
      expect(scaled.protein).toBe(4); // 8 * 0.5
      expect(scaled.fat).toBe(6); // 12 * 0.5
    });

    it('should handle undefined nutrition values', () => {
      const nutritionWithUndefined = {
        ...mockNutrition,
        fiber: undefined,
        sugar: undefined
      };
      
      const scaled = scaleNutrition(nutritionWithUndefined, 4, 6);
      
      expect(scaled.fiber).toBeUndefined();
      expect(scaled.sugar).toBeUndefined();
      expect(scaled.calories).toBe(450); // 300 * 1.5
    });

    it('should preserve perServing flag', () => {
      const scaled = scaleNutrition(mockNutrition, 4, 8);
      expect(scaled.perServing).toBe(true);
    });
  });

  describe('formatScaledAmount', () => {
    it('should format whole numbers correctly', () => {
      expect(formatScaledAmount(2)).toBe('2');
      expect(formatScaledAmount(0)).toBe('0');
      expect(formatScaledAmount(10)).toBe('10');
    });

    it('should format common fractions correctly', () => {
      expect(formatScaledAmount(0.25)).toBe('¼');
      expect(formatScaledAmount(0.5)).toBe('½');
      expect(formatScaledAmount(0.75)).toBe('¾');
      expect(formatScaledAmount(0.33)).toBe('⅓');
      expect(formatScaledAmount(0.67)).toBe('⅔');
    });

    it('should format decimal numbers with appropriate precision', () => {
      expect(formatScaledAmount(1.5)).toBe('1.5');
      expect(formatScaledAmount(0.125)).toBe('0.125');
      expect(formatScaledAmount(2.75)).toBe('2.75');
    });

    it('should handle very small numbers', () => {
      expect(formatScaledAmount(0.1)).toBe('0.1');
      expect(formatScaledAmount(0.01)).toBe('0.01');
    });
  });

  describe('getCommonServingSizes', () => {
    it('should return common serving sizes', () => {
      const servings = getCommonServingSizes();
      
      expect(servings).toContain(1);
      expect(servings).toContain(2);
      expect(servings).toContain(4);
      expect(servings).toContain(6);
      expect(servings).toContain(8);
      expect(servings).toContain(12);
    });

    it('should return array of numbers', () => {
      const servings = getCommonServingSizes();
      
      servings.forEach(serving => {
        expect(typeof serving).toBe('number');
        expect(serving).toBeGreaterThan(0);
      });
    });
  });

  describe('validateScaling', () => {
    it('should validate valid scaling parameters', () => {
      const result = validateScaling(4, 8);
      
      expect(result.isValid).toBe(true);
      expect(result.scaleFactor).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative current servings', () => {
      const result = validateScaling(-2, 4);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current servings must be positive');
    });

    it('should reject negative target servings', () => {
      const result = validateScaling(4, -2);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Target servings must be positive');
    });

    it('should reject zero servings', () => {
      const result = validateScaling(0, 4);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current servings must be positive');
    });

    it('should warn about extreme scaling', () => {
      const result = validateScaling(1, 100);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Extreme scaling detected (100x). Consider recipe feasibility.');
    });

    it('should calculate scale factor correctly', () => {
      const result = validateScaling(3, 9);
      
      expect(result.scaleFactor).toBe(3);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty ingredients array', () => {
      const scaled = scaleRecipe([], 4, 8);
      expect(scaled).toEqual([]);
    });

    it('should handle ingredients with zero amounts', () => {
      const ingredients = [
        { name: 'Salt', amount: 0, unit: 'teaspoon', notes: undefined }
      ];
      
      const scaled = scaleRecipe(ingredients, 4, 8);
      expect(scaled[0].amount).toBe(0);
    });

    it('should handle very large scaling factors', () => {
      const scaled = scaleRecipe(mockIngredients, 1, 1000);
      
      scaled.forEach(ingredient => {
        expect(ingredient.amount).toBe(ingredient.amount * 1000);
      });
    });

    it('should handle floating point precision issues', () => {
      const ingredients = [
        { name: 'Vanilla', amount: 0.33, unit: 'teaspoon', notes: undefined }
      ];
      
      const scaled = scaleRecipe(ingredients, 3, 1);
      expect(scaled[0].amount).toBeCloseTo(0.11, 2);
    });
  });
});
