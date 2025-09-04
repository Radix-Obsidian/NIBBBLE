import { VideoIngredient, NutritionInfo } from '@/types';

export interface USDANutritionData {
  fdcId: number;
  description: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
}

export interface USDASearchResult {
  foods: Array<{
    fdcId: number;
    description: string;
    brandOwner?: string;
    ingredients?: string;
  }>;
}

export class NutritionCalculator {
  private apiKey: string;
  private baseUrl = 'https://api.nal.usda.gov/fdc/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Calculate nutrition facts for a recipe
   */
  async calculateNutrition(
    ingredients: VideoIngredient[],
    servings: number
  ): Promise<NutritionInfo> {
    try {
      const nutritionData = await this.getIngredientsNutrition(ingredients);
      const totalNutrition = this.aggregateNutrition(nutritionData, servings);
      
      return {
        ...totalNutrition,
        perServing: true
      };
    } catch (error) {
      console.error('Nutrition calculation failed:', error);
      return this.getFallbackNutrition(ingredients, servings);
    }
  }

  /**
   * Get nutrition data for all ingredients from USDA API
   */
  private async getIngredientsNutrition(
    ingredients: VideoIngredient[]
  ): Promise<Array<{ ingredient: VideoIngredient; nutrition: USDANutritionData | null }>> {
    const results = await Promise.all(
      ingredients.map(async (ingredient) => {
        try {
          const nutrition = await this.searchUSDAFood(ingredient.name);
          return { ingredient, nutrition };
        } catch (error) {
          console.warn(`Failed to get nutrition for ${ingredient.name}:`, error);
          return { ingredient, nutrition: null };
        }
      })
    );

    return results;
  }

  /**
   * Search for food in USDA database
   */
  private async searchUSDAFood(foodName: string): Promise<USDANutritionData | null> {
    try {
      // First search for the food
      const searchUrl = `${this.baseUrl}/foods/search?api_key=${this.apiKey}&query=${encodeURIComponent(foodName)}&pageSize=1&dataType=Foundation,SR Legacy`;
      
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        throw new Error(`USDA search failed: ${searchResponse.statusText}`);
      }

      const searchData: USDASearchResult = await searchResponse.json();
      
      if (!searchData.foods || searchData.foods.length === 0) {
        return null;
      }

      // Get detailed nutrition data for the first result
      const fdcId = searchData.foods[0].fdcId;
      const detailUrl = `${this.baseUrl}/food/${fdcId}?api_key=${this.apiKey}`;
      
      const detailResponse = await fetch(detailUrl);
      if (!detailResponse.ok) {
        throw new Error(`USDA detail fetch failed: ${detailResponse.statusText}`);
      }

      const nutritionData: USDANutritionData = await detailResponse.json();
      return nutritionData;
    } catch (error) {
      console.error(`USDA API error for ${foodName}:`, error);
      return null;
    }
  }

  /**
   * Aggregate nutrition data from all ingredients
   */
  private aggregateNutrition(
    nutritionData: Array<{ ingredient: VideoIngredient; nutrition: USDANutritionData | null }>,
    servings: number
  ): Omit<NutritionInfo, 'perServing'> {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;
    let totalCholesterol = 0;

    nutritionData.forEach(({ ingredient, nutrition }) => {
      if (nutrition) {
        const multiplier = ingredient.amount / servings;
        
        nutrition.foodNutrients.forEach((nutrient) => {
          const value = nutrient.value * multiplier;
          
          switch (nutrient.nutrientName.toLowerCase()) {
            case 'energy':
              totalCalories += value;
              break;
            case 'protein':
              totalProtein += value;
              break;
            case 'total lipid (fat)':
            case 'fat':
              totalFat += value;
              break;
            case 'carbohydrate, by difference':
            case 'carbohydrates':
              totalCarbs += value;
              break;
            case 'fiber, total dietary':
            case 'fiber':
              totalFiber += value;
              break;
            case 'sugars, total including nlea':
            case 'sugar':
              totalSugar += value;
              break;
            case 'sodium, na':
            case 'sodium':
              totalSodium += value;
              break;
            case 'cholesterol':
              totalCholesterol += value;
              break;
          }
        });
      }
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
      sugar: Math.round(totalSugar * 10) / 10,
      sodium: Math.round(totalSodium),
      cholesterol: Math.round(totalCholesterol)
    };
  }

  /**
   * Get fallback nutrition data when USDA API fails
   */
  private getFallbackNutrition(
    ingredients: VideoIngredient[],
    servings: number
  ): NutritionInfo {
    // Estimate nutrition based on common ingredient values
    const commonNutrition = {
      'flour': { calories: 455, protein: 13, fat: 1, carbs: 95 },
      'eggs': { calories: 155, protein: 13, fat: 11, carbs: 1 },
      'milk': { calories: 103, protein: 8, fat: 5, carbs: 12 },
      'butter': { calories: 102, protein: 0, fat: 12, carbs: 0 },
      'sugar': { calories: 387, protein: 0, fat: 0, carbs: 100 },
      'salt': { calories: 0, protein: 0, fat: 0, carbs: 0 }
    };

    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    ingredients.forEach(ingredient => {
      const lowerName = ingredient.name.toLowerCase();
      const nutrition = commonNutrition[lowerName as keyof typeof commonNutrition];
      
      if (nutrition) {
        const multiplier = ingredient.amount / servings;
        totalCalories += nutrition.calories * multiplier;
        totalProtein += nutrition.protein * multiplier;
        totalFat += nutrition.fat * multiplier;
        totalCarbs += nutrition.carbs * multiplier;
      }
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      perServing: true
    };
  }

  /**
   * Get nutrition data for a single ingredient
   */
  async getIngredientNutrition(ingredient: VideoIngredient): Promise<VideoIngredient> {
    try {
      const nutrition = await this.searchUSDAFood(ingredient.name);
      
      if (nutrition) {
        const nutritionInfo = this.extractNutritionFromUSDA(nutrition);
        return {
          ...ingredient,
          nutrition: nutritionInfo
        };
      }
    } catch (error) {
      console.warn(`Failed to get nutrition for ${ingredient.name}:`, error);
    }

    return ingredient;
  }

  /**
   * Extract nutrition info from USDA data
   */
  private extractNutritionFromUSDA(nutrition: USDANutritionData): VideoIngredient['nutrition'] {
    const nutritionMap: Record<string, number> = {};
    
    nutrition.foodNutrients.forEach((nutrient) => {
      switch (nutrient.nutrientName.toLowerCase()) {
        case 'energy':
          nutritionMap.calories = nutrient.value;
          break;
        case 'protein':
          nutritionMap.protein = nutrient.value;
          break;
        case 'total lipid (fat)':
        case 'fat':
          nutritionMap.fat = nutrient.value;
          break;
        case 'carbohydrate, by difference':
        case 'carbohydrates':
          nutritionMap.carbs = nutrient.value;
          break;
        case 'fiber, total dietary':
        case 'fiber':
          nutritionMap.fiber = nutrient.value;
          break;
        case 'sugars, total including nlea':
        case 'sugar':
          nutritionMap.sugar = nutrient.value;
          break;
      }
    });

    return {
      calories: nutritionMap.calories || 0,
      protein: nutritionMap.protein || 0,
      fat: nutritionMap.fat || 0,
      carbs: nutritionMap.carbs || 0,
      fiber: nutritionMap.fiber,
      sugar: nutritionMap.sugar
    };
  }
}

// Export a singleton instance
export const nutritionCalculator = new NutritionCalculator(
  process.env.USDA_API_KEY || 'DEMO_KEY'
);
