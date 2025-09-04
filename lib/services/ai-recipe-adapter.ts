import { RecipeService } from './recipe-service';
import { aiCookingService } from './ai-cooking-service';
import { 
  VideoRecipe, 
  AICookingProfile, 
  RecipeAdaptation, 
  IngredientSubstitution,
  CookingInsight,
  AdaptRecipeRequest,
  AdaptRecipeResponse 
} from '@/types';
import { logger } from '@/lib/logger';

export class AIRecipeAdapter {
  private recipeService: RecipeService;

  constructor(isServer = false) {
    this.recipeService = new RecipeService(isServer);
  }

  /**
   * Get an adapted recipe based on user's AI profile and preferences
   */
  async getAdaptedRecipe(
    recipeId: string, 
    userId: string, 
    adaptationOptions?: {
      targetSkillLevel?: number;
      timeConstraints?: number;
      portionAdjustment?: number;
      equipmentRestrictions?: string[];
      dietaryOverrides?: string[];
    }
  ): Promise<{
    originalRecipe: VideoRecipe;
    adaptedRecipe: VideoRecipe;
    adaptations: RecipeAdaptation[];
    substitutions: IngredientSubstitution[];
    insights: CookingInsight[];
    successPrediction: number;
  }> {
    try {
      // Get original recipe
      const originalRecipe = await this.recipeService.getRecipe(recipeId);
      if (!originalRecipe) {
        throw new Error('Recipe not found');
      }

      // Get user's AI profile
      const aiProfile = await aiCookingService.getAICookingProfile(userId);
      if (!aiProfile) {
        throw new Error('AI cooking profile not found. Please complete your cooking profile first.');
      }

      // Determine adaptation requirements
      const adaptationReasons = this.determineAdaptationNeeds(originalRecipe, aiProfile, adaptationOptions);
      
      if (adaptationReasons.length === 0) {
        // No adaptation needed - return original with success prediction
        const successPrediction = await aiCookingService.predictCookingSuccess({
          userId,
          recipeId
        });

        return {
          originalRecipe,
          adaptedRecipe: originalRecipe,
          adaptations: [],
          substitutions: [],
          insights: [],
          successPrediction: successPrediction.successScore
        };
      }

      // Request recipe adaptation
      const adaptationRequest: AdaptRecipeRequest = {
        recipeId,
        userId,
        adaptationReasons,
        targetSkillLevel: adaptationOptions?.targetSkillLevel || aiProfile.skillLevel,
        dietaryRestrictions: adaptationOptions?.dietaryOverrides || aiProfile.dietaryRestrictions,
        availableEquipment: adaptationOptions?.equipmentRestrictions || aiProfile.equipmentAvailable,
        timeConstraints: adaptationOptions?.timeConstraints || aiProfile.preferredCookingTime,
        portionAdjustment: adaptationOptions?.portionAdjustment
      };

      const adaptationResponse = await aiCookingService.adaptRecipe(adaptationRequest);

      // Create adapted recipe from the adaptation data
      const adaptedRecipe = this.createAdaptedRecipe(originalRecipe, adaptationResponse.adaptation);

      // Get success prediction for adapted recipe
      const successPrediction = await aiCookingService.predictCookingSuccess({
        userId,
        recipeId,
        adaptationId: adaptationResponse.adaptation.id
      });

      return {
        originalRecipe,
        adaptedRecipe,
        adaptations: [adaptationResponse.adaptation],
        substitutions: adaptationResponse.substitutions,
        insights: adaptationResponse.insights,
        successPrediction: successPrediction.successScore
      };
    } catch (error) {
      logger.error('Get adapted recipe error:', error);
      throw error;
    }
  }

  /**
   * Get smart recipe recommendations based on user profile and context
   */
  async getSmartRecommendations(
    userId: string,
    context?: {
      ingredientsOnHand?: string[];
      timeAvailable?: number;
      mealType?: string;
      mood?: string;
      skillFocus?: string[];
    },
    limit = 10
  ): Promise<{
    recipe: VideoRecipe;
    matchScore: number;
    adaptations: RecipeAdaptation[];
    predictedSuccess: number;
    reasoning: string[];
  }[]> {
    try {
      const aiProfile = await aiCookingService.getAICookingProfile(userId);
      if (!aiProfile) {
        throw new Error('AI cooking profile not found');
      }

      const smartSearchResponse = await aiCookingService.smartSearch({
        userProfile: aiProfile,
        context,
        filters: {
          maxTime: context?.timeAvailable || aiProfile.preferredCookingTime,
          maxDifficulty: Math.min(10, aiProfile.skillLevel + 2)
        }
      });

      const recommendations = await Promise.all(
        smartSearchResponse.recipes.slice(0, limit).map(async (result) => {
          const recipe = await this.recipeService.getRecipe(result.recipe.id);
          if (!recipe) return null;

          return {
            recipe,
            matchScore: result.matchScore,
            adaptations: result.adaptations,
            predictedSuccess: result.predictedSuccess,
            reasoning: result.reasoning
          };
        })
      );

      return recommendations.filter(Boolean) as any[];
    } catch (error) {
      logger.error('Get smart recommendations error:', error);
      throw error;
    }
  }

  /**
   * Provide cooking guidance for a specific recipe step
   */
  async getCookingGuidance(
    userId: string,
    recipeId: string,
    currentStep: number,
    context?: {
      issuesEncountered?: string[];
      timeElapsed?: number;
      currentTemperature?: number;
    }
  ): Promise<{
    guidance: string;
    tips: string[];
    warnings: string[];
    alternatives: string[];
    nextStepPreparation: string[];
  }> {
    try {
      const aiProfile = await aiCookingService.getAICookingProfile(userId);
      if (!aiProfile) {
        throw new Error('AI cooking profile not found');
      }

      const recipe = await this.recipeService.getRecipe(recipeId);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      const currentInstruction = recipe.instructions[currentStep - 1];
      if (!currentInstruction) {
        throw new Error('Invalid step number');
      }

      // Generate contextual guidance based on skill level and issues
      const guidance = this.generateStepGuidance(currentInstruction, aiProfile, context);
      const tips = this.generateSkillAppropiateTips(currentInstruction, aiProfile.skillLevel);
      const warnings = this.generateSafetyWarnings(currentInstruction, recipe);
      const alternatives = this.generateAlternativeMethods(currentInstruction, aiProfile);
      const nextStepPreparation = this.generateNextStepPrep(recipe, currentStep);

      return {
        guidance,
        tips,
        warnings,
        alternatives,
        nextStepPreparation
      };
    } catch (error) {
      logger.error('Get cooking guidance error:', error);
      throw error;
    }
  }

  /**
   * Record cooking outcome for ML training
   */
  async recordCookingOutcome(
    userId: string,
    recipeId: string,
    outcome: {
      success: 'success' | 'partial_success' | 'failure' | 'abandoned';
      rating: number; // 1-5
      timeTaken?: number;
      difficultyExperienced?: number; // 1-5
      issuesEncountered?: string[];
      notes?: string;
      adaptationId?: string;
    }
  ): Promise<void> {
    try {
      // This would typically integrate with the cooking_outcomes table
      // and update the user's success history in their AI profile
      logger.info('Recording cooking outcome:', { userId, recipeId, outcome });
      
      // Update user's success history
      const aiProfile = await aiCookingService.getAICookingProfile(userId);
      if (aiProfile) {
        const updatedHistory = {
          ...aiProfile.successHistory,
          attempts: aiProfile.successHistory.attempts + 1,
          successes: outcome.success === 'success' 
            ? aiProfile.successHistory.successes + 1 
            : aiProfile.successHistory.successes,
          failures: outcome.success === 'failure'
            ? aiProfile.successHistory.failures + 1
            : aiProfile.successHistory.failures
        };

        await aiCookingService.createOrUpdateAICookingProfile(userId, {
          ...aiProfile,
          successHistory: updatedHistory
        });
      }
    } catch (error) {
      logger.error('Record cooking outcome error:', error);
      throw error;
    }
  }

  // Private helper methods

  private determineAdaptationNeeds(
    recipe: VideoRecipe,
    aiProfile: AICookingProfile,
    options?: any
  ): string[] {
    const reasons: string[] = [];

    // Skill level adaptation
    const recipeComplexity = this.estimateRecipeComplexity(recipe);
    if (recipeComplexity > aiProfile.skillLevel + 1) {
      reasons.push('skill_adjustment');
    }

    // Time constraint adaptation
    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    const preferredTime = options?.timeConstraints || aiProfile.preferredCookingTime;
    if (totalTime > preferredTime * 1.2) {
      reasons.push('time_optimization');
    }

    // Dietary adaptation
    const conflictingIngredients = this.findDietaryConflicts(recipe, aiProfile);
    if (conflictingIngredients.length > 0) {
      reasons.push('dietary_modification');
    }

    // Equipment adaptation
    const missingEquipment = this.findMissingEquipment(recipe, aiProfile);
    if (missingEquipment.length > 0) {
      reasons.push('equipment_adaptation');
    }

    // Portion adaptation
    if (options?.portionAdjustment && options.portionAdjustment !== 1) {
      reasons.push('portion_scaling');
    }

    return reasons;
  }

  private createAdaptedRecipe(
    original: VideoRecipe,
    adaptation: RecipeAdaptation
  ): VideoRecipe {
    return {
      ...original,
      ...adaptation.adaptedRecipe,
      id: `${original.id}-adapted-${adaptation.id}`,
      title: `${original.title} (Adapted for You)`,
      description: `${original.description || ''}\n\nThis recipe has been adapted based on your cooking profile and preferences.`
    };
  }

  private estimateRecipeComplexity(recipe: VideoRecipe): number {
    let complexity = 0;

    // Base complexity from difficulty level
    switch (recipe.difficultyLevel) {
      case 'easy': complexity = 3; break;
      case 'medium': complexity = 6; break;
      case 'hard': complexity = 9; break;
      default: complexity = 5;
    }

    // Adjust based on number of ingredients
    if (recipe.ingredients.length > 15) complexity += 2;
    else if (recipe.ingredients.length > 10) complexity += 1;

    // Adjust based on cooking time
    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    if (totalTime > 120) complexity += 2;
    else if (totalTime > 60) complexity += 1;

    // Adjust based on number of instructions
    if (recipe.instructions.length > 12) complexity += 1;

    return Math.min(10, complexity);
  }

  private findDietaryConflicts(
    recipe: VideoRecipe,
    aiProfile: AICookingProfile
  ): string[] {
    const conflicts: string[] = [];
    const restrictions = [...aiProfile.dietaryRestrictions, ...aiProfile.allergies];
    
    // This would need more sophisticated ingredient analysis
    recipe.ingredients.forEach(ingredient => {
      const ingredientName = ingredient.name.toLowerCase();
      
      if (restrictions.includes('dairy_free') && 
          (ingredientName.includes('milk') || ingredientName.includes('cheese') || ingredientName.includes('butter'))) {
        conflicts.push(ingredient.name);
      }
      
      if (restrictions.includes('gluten_free') && 
          (ingredientName.includes('flour') || ingredientName.includes('bread'))) {
        conflicts.push(ingredient.name);
      }
      
      // Add more dietary conflict detection logic
    });

    return conflicts;
  }

  private findMissingEquipment(
    recipe: VideoRecipe,
    aiProfile: AICookingProfile
  ): string[] {
    const required: string[] = [];
    const available = aiProfile.equipmentAvailable;

    // Extract required equipment from instructions
    recipe.instructions.forEach(instruction => {
      const lowerInstruction = instruction.toLowerCase();
      
      if (lowerInstruction.includes('oven') && !available.includes('oven')) {
        required.push('oven');
      }
      if (lowerInstruction.includes('blend') && !available.includes('blender')) {
        required.push('blender');
      }
      if (lowerInstruction.includes('grill') && !available.includes('grill')) {
        required.push('grill');
      }
      // Add more equipment detection logic
    });

    return [...new Set(required)];
  }

  private generateStepGuidance(
    instruction: string,
    aiProfile: AICookingProfile,
    context?: any
  ): string {
    let guidance = instruction;

    // Add beginner-friendly explanations
    if (aiProfile.skillLevel <= 3) {
      if (instruction.toLowerCase().includes('sauté')) {
        guidance += "\n\nTip: Sautéing means cooking quickly in a hot pan with a small amount of oil. The pan should be hot enough that ingredients sizzle when added.";
      }
      
      if (instruction.toLowerCase().includes('fold')) {
        guidance += "\n\nTip: Folding means gently combining ingredients without overmixing. Use a spoon or spatula to lift from the bottom and turn over.";
      }
    }

    // Add timing guidance
    if (context?.timeElapsed) {
      guidance += `\n\nYou've been cooking for ${Math.floor(context.timeElapsed / 60)} minutes. Stay focused!`;
    }

    return guidance;
  }

  private generateSkillAppropiateTips(instruction: string, skillLevel: number): string[] {
    const tips: string[] = [];

    if (skillLevel <= 3) {
      tips.push("Take your time with each step - there's no rush!");
      tips.push("Taste as you go to adjust seasoning");
    }

    if (instruction.toLowerCase().includes('temperature')) {
      tips.push("Use a thermometer for accurate temperature readings");
    }

    if (instruction.toLowerCase().includes('season')) {
      tips.push("Start with less seasoning - you can always add more");
    }

    return tips;
  }

  private generateSafetyWarnings(instruction: string, recipe: VideoRecipe): string[] {
    const warnings: string[] = [];

    if (instruction.toLowerCase().includes('oil') && instruction.toLowerCase().includes('hot')) {
      warnings.push("Be careful with hot oil - it can splatter. Keep a lid nearby to cover if needed.");
    }

    if (instruction.toLowerCase().includes('knife')) {
      warnings.push("Always cut away from your body and keep your fingers curled under.");
    }

    if (instruction.toLowerCase().includes('oven')) {
      warnings.push("Use oven mitts when handling hot items from the oven.");
    }

    return warnings;
  }

  private generateAlternativeMethods(
    instruction: string,
    aiProfile: AICookingProfile
  ): string[] {
    const alternatives: string[] = [];

    if (instruction.toLowerCase().includes('grill') && !aiProfile.equipmentAvailable.includes('grill')) {
      alternatives.push("No grill? Try using a grill pan or broiler in your oven instead.");
    }

    if (instruction.toLowerCase().includes('stand mixer') && !aiProfile.equipmentAvailable.includes('stand_mixer')) {
      alternatives.push("No stand mixer? Use a hand mixer or whisk by hand - it will just take a bit longer.");
    }

    return alternatives;
  }

  private generateNextStepPrep(recipe: VideoRecipe, currentStep: number): string[] {
    const prep: string[] = [];

    if (currentStep < recipe.instructions.length) {
      const nextInstruction = recipe.instructions[currentStep].toLowerCase();
      
      if (nextInstruction.includes('preheat')) {
        prep.push("Start preheating your oven now for the next step.");
      }
      
      if (nextInstruction.includes('chill') || nextInstruction.includes('refrigerate')) {
        prep.push("The next step requires chilling - plan accordingly.");
      }
      
      if (nextInstruction.includes('boil')) {
        prep.push("Get water boiling for the next step while you finish this one.");
      }
    }

    return prep;
  }
}

// Export singleton instances
export const aiRecipeAdapter = new AIRecipeAdapter(false);
export const serverAiRecipeAdapter = new AIRecipeAdapter(true);