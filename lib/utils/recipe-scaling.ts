import { VideoIngredient } from '@/types';

export interface ScaledIngredient extends VideoIngredient {
  originalAmount: number;
  originalUnit: string;
  scaleFactor: number;
}

export interface ScalingOptions {
  roundTo?: number; // Decimal places to round to
  unitConversions?: Record<string, Record<string, number>>;
  maxServings?: number; // Safety limit
}

/**
 * Scale recipe ingredients proportionally
 */
export function scaleRecipe(
  ingredients: VideoIngredient[],
  currentServings: number,
  targetServings: number,
  options: ScalingOptions = {}
): ScaledIngredient[] {
  // Validate inputs
  if (currentServings <= 0 || targetServings <= 0) {
    throw new Error('Servings must be positive numbers');
  }

  if (options.maxServings && targetServings > options.maxServings) {
    throw new Error(`Target servings (${targetServings}) exceeds maximum allowed (${options.maxServings})`);
  }

  const scaleFactor = targetServings / currentServings;
  const roundTo = options.roundTo ?? 2;

  return ingredients.map(ingredient => {
    const scaledAmount = ingredient.amount * scaleFactor;
    const roundedAmount = Math.round(scaledAmount * Math.pow(10, roundTo)) / Math.pow(10, roundTo);

    return {
      ...ingredient,
      amount: roundedAmount,
      originalAmount: ingredient.amount,
      originalUnit: ingredient.unit,
      scaleFactor
    };
  });
}

/**
 * Scale a single ingredient
 */
export function scaleIngredient(
  ingredient: VideoIngredient,
  scaleFactor: number,
  options: ScalingOptions = {}
): ScaledIngredient {
  const roundTo = options.roundTo ?? 2;
  const scaledAmount = ingredient.amount * scaleFactor;
  const roundedAmount = Math.round(scaledAmount * Math.pow(10, roundTo)) / Math.pow(10, roundTo);

  return {
    ...ingredient,
    amount: roundedAmount,
    originalAmount: ingredient.amount,
    originalUnit: ingredient.unit,
    scaleFactor
  };
}

/**
 * Convert units while scaling (e.g., cups to tablespoons)
 */
export function scaleRecipeWithUnitConversion(
  ingredients: VideoIngredient[],
  currentServings: number,
  targetServings: number,
  options: ScalingOptions = {}
): ScaledIngredient[] {
  const scaleFactor = targetServings / currentServings;
  const roundTo = options.roundTo ?? 2;

  // Default unit conversions for common cooking measurements
  const defaultConversions: Record<string, Record<string, number>> = {
    'cups': {
      'tablespoons': 16,
      'teaspoons': 48,
      'fluid ounces': 8,
      'milliliters': 236.588
    },
    'tablespoons': {
      'teaspoons': 3,
      'fluid ounces': 0.5,
      'milliliters': 14.7868
    },
    'teaspoons': {
      'fluid ounces': 0.166667,
      'milliliters': 4.92892
    },
    'pounds': {
      'ounces': 16,
      'grams': 453.592
    },
    'ounces': {
      'grams': 28.3495
    }
  };

  const conversions = options.unitConversions || defaultConversions;

  return ingredients.map(ingredient => {
    let scaledAmount = ingredient.amount * scaleFactor;
    let finalUnit = ingredient.unit;
    let originalAmount = ingredient.amount;
    let originalUnit = ingredient.unit;

    // Check if we should convert to a smaller unit for better precision
    if (scaleFactor < 1 && ingredient.unit in conversions) {
      const possibleConversions = conversions[ingredient.unit];
      
      // Find the best unit conversion for small amounts
      for (const [unit, factor] of Object.entries(possibleConversions)) {
        if (scaledAmount * factor >= 0.5) { // At least 0.5 of the smaller unit
          scaledAmount = scaledAmount * factor;
          finalUnit = unit;
          break;
        }
      }
    }

    const roundedAmount = Math.round(scaledAmount * Math.pow(10, roundTo)) / Math.pow(10, roundTo);

    return {
      ...ingredient,
      amount: roundedAmount,
      unit: finalUnit,
      originalAmount,
      originalUnit,
      scaleFactor
    };
  });
}

/**
 * Get common serving sizes for scaling
 */
export function getCommonServingSizes(currentServings: number): number[] {
  const commonMultipliers = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 10, 12];
  
  return commonMultipliers
    .map(multiplier => Math.round(currentServings * multiplier))
    .filter(servings => servings > 0 && servings <= 50) // Reasonable range
    .sort((a, b) => a - b);
}

/**
 * Format scaled amount with appropriate precision
 */
export function formatScaledAmount(amount: number, unit: string): string {
  if (amount === Math.floor(amount)) {
    return `${amount} ${unit}`;
  }
  
  // For fractional amounts, use common fractions
  const commonFractions: Record<number, string> = {
    0.25: '¼',
    0.33: '⅓',
    0.5: '½',
    0.67: '⅔',
    0.75: '¾'
  };

  const fraction = commonFractions[amount];
  if (fraction) {
    return `${fraction} ${unit}`;
  }

  // For other decimal amounts, round to 1 decimal place
  return `${Math.round(amount * 10) / 10} ${unit}`;
}

/**
 * Calculate nutrition for scaled recipe
 */
export function scaleNutrition(
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    [key: string]: number;
  },
  scaleFactor: number
): typeof nutrition {
  const scaled: typeof nutrition = {} as typeof nutrition;
  
  Object.entries(nutrition).forEach(([key, value]) => {
    if (typeof value === 'number') {
      scaled[key as keyof typeof nutrition] = Math.round(value * scaleFactor * 10) / 10;
    }
  });
  
  return scaled;
}

/**
 * Validate scaling operation
 */
export function validateScaling(
  currentServings: number,
  targetServings: number,
  options: ScalingOptions = {}
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (currentServings <= 0) {
    errors.push('Current servings must be positive');
  }

  if (targetServings <= 0) {
    errors.push('Target servings must be positive');
  }

  if (options.maxServings && targetServings > options.maxServings) {
    errors.push(`Target servings (${targetServings}) exceeds maximum allowed (${options.maxServings})`);
  }

  if (targetServings > 100) {
    errors.push('Target servings seems unreasonably high');
  }

  const scaleFactor = targetServings / currentServings;
  if (scaleFactor > 10) {
    errors.push('Scaling factor is very high - consider if this is correct');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
