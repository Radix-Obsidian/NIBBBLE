import { supabase } from '@/lib/supabase/client';
import { 
  AICookingProfile, 
  RecipeAdaptation, 
  IngredientSubstitution, 
  CookingInsight,
  CookingOutcome,
  UserSkillProgress,
  AdaptRecipeRequest,
  AdaptRecipeResponse,
  PredictSuccessRequest,
  PredictSuccessResponse,
  SmartSearchRequest,
  SmartSearchResponse
} from '@/types/ai-cooking';

export class AICookingService {
  private supabase = supabase;

  constructor() {
    // Using the global supabase client
  }

  // AI Cooking Profile Management
  async getAICookingProfile(userId: string): Promise<AICookingProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('ai_cooking_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Profile doesn't exist
        throw new Error(`Failed to get AI cooking profile: ${error.message}`);
      }

      return this.transformAIProfileData(data);
    } catch (error) {
      console.error('Get AI cooking profile error:', error);
      throw error;
    }
  }

  async createOrUpdateAICookingProfile(userId: string, profileData: Partial<AICookingProfile>): Promise<AICookingProfile> {
    try {
      const profileToUpsert = {
        id: userId,
        skill_level: profileData.skillLevel || 1,
        cooking_experience_years: profileData.cookingExperienceYears || 0,
        preferred_cooking_time: profileData.preferredCookingTime || 30,
        equipment_available: profileData.equipmentAvailable || [],
        dietary_restrictions: profileData.dietaryRestrictions || [],
        allergies: profileData.allergies || [],
        spice_tolerance: profileData.spiceTolerance || 3,
        preferred_portion_sizes: profileData.preferredPortionSizes || { small: false, medium: true, large: false },
        cooking_goals: profileData.cookingGoals || [],
        learning_preferences: profileData.learningPreferences || { video: true, text: true, stepByStep: true },
        success_history: profileData.successHistory || { attempts: 0, successes: 0, failures: 0 },
        preferred_cuisines_ranked: profileData.preferredCuisinesRanked || [],
        ingredient_preferences: profileData.ingredientPreferences || { loved: [], disliked: [], neverTried: [] }
      };

      const { data, error } = await this.supabase
        .from('ai_cooking_profiles')
        .upsert(profileToUpsert)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to create/update AI cooking profile: ${error.message}`);
      }

      return this.transformAIProfileData(data);
    } catch (error) {
      console.error('Create/update AI cooking profile error:', error);
      throw error;
    }
  }

  // Recipe Adaptation
  async adaptRecipe(request: AdaptRecipeRequest): Promise<AdaptRecipeResponse> {
    try {
      // Get user's AI profile
      const aiProfile = await this.getAICookingProfile(request.userId);
      if (!aiProfile) {
        throw new Error('AI cooking profile not found');
      }

      // Get original recipe
      const { data: recipe, error: recipeError } = await this.supabase
        .from('recipes')
        .select('*')
        .eq('id', request.recipeId)
        .single();

      if (recipeError) {
        throw new Error(`Failed to get recipe: ${recipeError.message}`);
      }

      // Generate adaptations based on user profile and request
      const adaptedRecipe = await this.generateRecipeAdaptation(recipe, aiProfile, request);
      const substitutions = await this.getRelevantSubstitutions(recipe.ingredients, aiProfile);
      const insights = await this.generateCookingInsights(recipe, aiProfile);

      // Calculate overall confidence score
      const confidenceScore = this.calculateAdaptationConfidence(adaptedRecipe, aiProfile);

      // Store the adaptation
      const adaptation = await this.saveRecipeAdaptation({
        originalRecipeId: request.recipeId,
        userId: request.userId,
        adaptationType: this.determineAdaptationType(request.adaptationReasons),
        adaptedRecipe,
        adaptationReasons: request.adaptationReasons,
        confidenceScore
      });

      return {
        adaptation,
        substitutions,
        insights,
        confidenceScore
      };
    } catch (error) {
      console.error('Adapt recipe error:', error);
      throw error;
    }
  }

  private async generateRecipeAdaptation(
    originalRecipe: any, 
    aiProfile: AICookingProfile, 
    request: AdaptRecipeRequest
  ): Promise<any> {
    const adapted = { ...originalRecipe };

    // Skill level adjustments
    if (request.targetSkillLevel && request.targetSkillLevel < aiProfile.skillLevel) {
      adapted.instructions = this.simplifyInstructions(adapted.instructions, request.targetSkillLevel);
      adapted.prep_time_minutes = Math.ceil(adapted.prep_time_minutes * 1.2);
    }

    // Dietary adaptations
    if (request.dietaryRestrictions?.length > 0) {
      adapted.ingredients = await this.adaptIngredientsForDiet(adapted.ingredients, request.dietaryRestrictions);
    }

    // Equipment adaptations
    if (request.availableEquipment?.length > 0) {
      adapted.instructions = this.adaptInstructionsForEquipment(adapted.instructions, request.availableEquipment);
    }

    // Portion adjustments
    if (request.portionAdjustment && request.portionAdjustment !== 1) {
      adapted.ingredients = this.scaleIngredients(adapted.ingredients, request.portionAdjustment);
      adapted.servings = Math.ceil(adapted.servings * request.portionAdjustment);
    }

    // Time constraint adjustments
    if (request.timeConstraints) {
      adapted.instructions = this.optimizeForTime(adapted.instructions, request.timeConstraints);
    }

    return adapted;
  }

  private async getRelevantSubstitutions(
    ingredients: any[], 
    aiProfile: AICookingProfile
  ): Promise<IngredientSubstitution[]> {
    const allergensAndRestrictions = [...aiProfile.allergies, ...aiProfile.dietaryRestrictions];
    
    if (allergensAndRestrictions.length === 0) return [];

    const ingredientNames = ingredients.map(ing => ing.name.toLowerCase());
    
    const { data, error } = await this.supabase
      .from('ingredient_substitutions')
      .select('*')
      .in('original_ingredient', ingredientNames)
      .overlaps('dietary_reasons', allergensAndRestrictions)
      .order('success_rate', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching substitutions:', error);
      return [];
    }

    return data.map(this.transformSubstitutionData);
  }

  private async generateCookingInsights(
    recipe: any, 
    aiProfile: AICookingProfile
  ): Promise<CookingInsight[]> {
    const insights: CookingInsight[] = [];

    // Generate insights based on skill level
    if (aiProfile.skillLevel <= 3) {
      insights.push({
        id: `insight-${Date.now()}`,
        userId: aiProfile.id,
        recipeId: recipe.id,
        insightType: 'technique_tip',
        insightContent: 'Take your time with each step. Cooking is about patience and practice.',
        skillLevelTarget: [1, 2, 3],
        contextConditions: {},
        confidenceScore: 0.9,
        shownCount: 0,
        actedUponCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Equipment-specific insights
    if (!aiProfile.equipmentAvailable.includes('thermometer') && recipe.difficulty_level === 'hard') {
      insights.push({
        id: `insight-${Date.now() + 1}`,
        userId: aiProfile.id,
        recipeId: recipe.id,
        insightType: 'equipment_recommendation',
        insightContent: 'Consider using a meat thermometer for best results with this recipe.',
        skillLevelTarget: [1, 2, 3, 4, 5],
        contextConditions: { equipment: ['thermometer'] },
        confidenceScore: 0.8,
        shownCount: 0,
        actedUponCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      } as CookingInsight);
    }

    return insights;
  }

  // Success Prediction
  async predictCookingSuccess(request: PredictSuccessRequest): Promise<PredictSuccessResponse> {
    try {
      const aiProfile = await this.getAICookingProfile(request.userId);
      if (!aiProfile) {
        throw new Error('AI cooking profile not found');
      }

      const { data: recipe, error } = await this.supabase
        .from('recipes')
        .select('*')
        .eq('id', request.recipeId)
        .single();

      if (error) {
        throw new Error(`Failed to get recipe: ${error.message}`);
      }

      // Simple ML-like prediction based on historical data and user profile
      const successScore = this.calculateSuccessProbability(recipe, aiProfile, request.cookingContext);
      const confidenceInterval: [number, number] = [
        Math.max(0, successScore - 0.1),
        Math.min(1, successScore + 0.1)
      ];

      const riskFactors = this.identifyRiskFactors(recipe, aiProfile);
      const recommendations = this.generateSuccessRecommendations(recipe, aiProfile, riskFactors);

      return {
        successScore,
        confidenceInterval,
        riskFactors,
        recommendations
      };
    } catch (error) {
      console.error('Predict cooking success error:', error);
      throw error;
    }
  }

  private calculateSuccessProbability(
    recipe: any, 
    aiProfile: AICookingProfile, 
    context?: any
  ): number {
    let baseScore = 0.7; // Base success rate

    // Adjust based on skill level vs recipe difficulty
    const skillDifficultyMap = { 'easy': 3, 'medium': 6, 'hard': 9 };
    const recipeDifficulty = skillDifficultyMap[recipe.difficulty_level] || 6;
    const skillGap = aiProfile.skillLevel - recipeDifficulty;
    
    if (skillGap >= 0) {
      baseScore += Math.min(0.2, skillGap * 0.03);
    } else {
      baseScore -= Math.min(0.3, Math.abs(skillGap) * 0.05);
    }

    // Adjust based on success history
    const successRate = aiProfile.successHistory.attempts > 0 
      ? aiProfile.successHistory.successes / aiProfile.successHistory.attempts 
      : 0.7;
    baseScore = (baseScore + successRate) / 2;

    // Time constraint adjustments
    if (context?.availableTime && context.availableTime < recipe.total_time_minutes) {
      baseScore -= 0.15;
    }

    // Stress level impact
    if (context?.stressLevel > 3) {
      baseScore -= (context.stressLevel - 3) * 0.05;
    }

    return Math.max(0.1, Math.min(1.0, baseScore));
  }

  private identifyRiskFactors(recipe: any, aiProfile: AICookingProfile): string[] {
    const risks: string[] = [];

    const skillDifficultyMap = { 'easy': 3, 'medium': 6, 'hard': 9 };
    const recipeDifficulty = skillDifficultyMap[recipe.difficulty_level] || 6;
    
    if (aiProfile.skillLevel < recipeDifficulty - 2) {
      risks.push('Recipe difficulty exceeds current skill level');
    }

    if (recipe.cook_time_minutes > aiProfile.preferredCookingTime * 1.5) {
      risks.push('Recipe takes significantly longer than preferred cooking time');
    }

    const requiredEquipment = this.extractRequiredEquipment(recipe.instructions);
    const missingEquipment = requiredEquipment.filter(eq => !aiProfile.equipmentAvailable.includes(eq));
    if (missingEquipment.length > 0) {
      risks.push(`Missing equipment: ${missingEquipment.join(', ')}`);
    }

    return risks;
  }

  private generateSuccessRecommendations(
    recipe: any, 
    aiProfile: AICookingProfile, 
    riskFactors: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (riskFactors.some(r => r.includes('skill level'))) {
      recommendations.push('Consider starting with the simplified version of this recipe');
      recommendations.push('Watch tutorial videos before beginning');
    }

    if (riskFactors.some(r => r.includes('cooking time'))) {
      recommendations.push('Set aside extra time for this recipe');
      recommendations.push('Prep ingredients in advance to save time during cooking');
    }

    if (riskFactors.some(r => r.includes('equipment'))) {
      recommendations.push('Consider equipment substitutions or alternatives');
    }

    if (aiProfile.successHistory.attempts < 5) {
      recommendations.push('Take photos of each step to track your progress');
    }

    return recommendations;
  }

  // Smart Recipe Search
  async smartSearch(request: SmartSearchRequest): Promise<SmartSearchResponse> {
    try {
      let query = this.supabase
        .from('recipes')
        .select('*')
        .eq('is_public', true);

      // Apply filters
      if (request.filters?.maxTime) {
        query = query.lte('total_time_minutes', request.filters.maxTime);
      }

      if (request.filters?.maxDifficulty) {
        const difficultyLevels = ['easy', 'medium', 'hard'].slice(0, request.filters.maxDifficulty);
        query = query.in('difficulty_level', difficultyLevels);
      }

      // Apply user dietary restrictions
      const restrictedIngredients = this.getRestrictedIngredients(request.userProfile);
      if (restrictedIngredients.length > 0) {
        // This would need more sophisticated ingredient filtering in production
      }

      const { data: recipes, error } = await query.limit(20);

      if (error) {
        throw new Error(`Search failed: ${error.message}`);
      }

      // Score and rank recipes
      const scoredRecipes = recipes.map(recipe => ({
        recipe,
        matchScore: this.calculateRecipeMatchScore(recipe, request),
        adaptations: [],
        predictedSuccess: this.calculateSuccessProbability(recipe, request.userProfile),
        reasoning: this.generateMatchReasoning(recipe, request)
      })).sort((a, b) => b.matchScore - a.matchScore);

      const insights = await this.generateSearchInsights(request.userProfile);
      const suggestions = this.generateSkillSuggestions(request.userProfile);

      return {
        recipes: scoredRecipes,
        insights,
        suggestions
      };
    } catch (error) {
      console.error('Smart search error:', error);
      throw error;
    }
  }

  private calculateRecipeMatchScore(recipe: any, request: SmartSearchRequest): number {
    let score = 0.5; // Base score

    // Cuisine preference matching
    if (request.userProfile.preferredCuisinesRanked.includes(recipe.cuisine)) {
      const index = request.userProfile.preferredCuisinesRanked.indexOf(recipe.cuisine);
      score += (10 - index) / 20; // Higher score for more preferred cuisines
    }

    // Time preference matching
    if (recipe.total_time_minutes <= request.userProfile.preferredCookingTime) {
      score += 0.2;
    }

    // Skill level appropriateness
    const skillDifficultyMap = { 'easy': 3, 'medium': 6, 'hard': 9 };
    const recipeDifficulty = skillDifficultyMap[recipe.difficulty_level] || 6;
    const skillMatch = Math.max(0, 1 - Math.abs(request.userProfile.skillLevel - recipeDifficulty) / 10);
    score += skillMatch * 0.3;

    return Math.min(1.0, score);
  }

  private generateMatchReasoning(recipe: any, request: SmartSearchRequest): string[] {
    const reasons: string[] = [];

    if (request.userProfile.preferredCuisinesRanked.includes(recipe.cuisine)) {
      reasons.push(`Matches your ${recipe.cuisine} cuisine preference`);
    }

    if (recipe.total_time_minutes <= request.userProfile.preferredCookingTime) {
      reasons.push('Fits within your preferred cooking time');
    }

    const skillDifficultyMap = { 'easy': 3, 'medium': 6, 'hard': 9 };
    const recipeDifficulty = skillDifficultyMap[recipe.difficulty_level] || 6;
    if (Math.abs(request.userProfile.skillLevel - recipeDifficulty) <= 2) {
      reasons.push('Appropriate for your skill level');
    }

    return reasons;
  }

  // Utility methods
  private async saveRecipeAdaptation(adaptationData: any): Promise<RecipeAdaptation> {
    const { data, error } = await this.supabase
      .from('recipe_adaptations')
      .insert({
        original_recipe_id: adaptationData.originalRecipeId,
        user_id: adaptationData.userId,
        adaptation_type: adaptationData.adaptationType,
        adapted_recipe: adaptationData.adaptedRecipe,
        adaptation_reasons: adaptationData.adaptationReasons,
        confidence_score: adaptationData.confidenceScore
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to save adaptation: ${error.message}`);
    }

    return this.transformAdaptationData(data);
  }

  private simplifyInstructions(instructions: string[], targetSkillLevel: number): string[] {
    return instructions.map(instruction => {
      if (targetSkillLevel <= 2) {
        // Add more detailed explanations for beginners
        return instruction + ' (Take your time and don\'t rush this step)';
      }
      return instruction;
    });
  }

  private async adaptIngredientsForDiet(ingredients: any[], restrictions: string[]): Promise<any[]> {
    // This would integrate with the substitutions table in a real implementation
    return ingredients;
  }

  private adaptInstructionsForEquipment(instructions: string[], availableEquipment: string[]): string[] {
    // Equipment-specific instruction adaptations
    return instructions;
  }

  private scaleIngredients(ingredients: any[], scale: number): any[] {
    return ingredients.map(ing => ({
      ...ing,
      amount: ing.amount * scale
    }));
  }

  private optimizeForTime(instructions: string[], timeConstraint: number): string[] {
    // Time optimization strategies
    return instructions;
  }

  private calculateAdaptationConfidence(adaptedRecipe: any, aiProfile: AICookingProfile): number {
    return 0.85; // Simplified confidence calculation
  }

  private determineAdaptationType(reasons: string[]): RecipeAdaptation['adaptationType'] {
    if (reasons.some(r => r.includes('skill'))) return 'skill_adjusted';
    if (reasons.some(r => r.includes('dietary'))) return 'dietary_modified';
    if (reasons.some(r => r.includes('equipment'))) return 'equipment_adapted';
    if (reasons.some(r => r.includes('portion'))) return 'portion_scaled';
    return 'ingredient_substituted';
  }

  private extractRequiredEquipment(instructions: string[]): string[] {
    const equipmentKeywords = ['oven', 'stovetop', 'microwave', 'blender', 'mixer', 'thermometer'];
    const found = new Set<string>();
    
    instructions.forEach(instruction => {
      equipmentKeywords.forEach(equipment => {
        if (instruction.toLowerCase().includes(equipment)) {
          found.add(equipment);
        }
      });
    });
    
    return Array.from(found);
  }

  private getRestrictedIngredients(profile: AICookingProfile): string[] {
    return [...profile.allergies, ...profile.ingredientPreferences.disliked];
  }

  private async generateSearchInsights(profile: AICookingProfile): Promise<CookingInsight[]> {
    return []; // Simplified for now
  }

  private generateSkillSuggestions(profile: AICookingProfile): SmartSearchResponse['suggestions'] {
    return {
      skillDevelopment: ['Practice knife skills with simple chopping exercises'],
      equipmentRecommendations: ['Consider getting a digital thermometer'],
      ingredientExplorations: ['Try cooking with herbs and spices you haven\'t used before']
    };
  }

  // Data transformation methods
  private transformAIProfileData(data: any): AICookingProfile {
    return {
      id: data.id,
      skillLevel: data.skill_level,
      cookingExperienceYears: data.cooking_experience_years,
      preferredCookingTime: data.preferred_cooking_time,
      equipmentAvailable: data.equipment_available,
      dietaryRestrictions: data.dietary_restrictions,
      allergies: data.allergies,
      spiceTolerance: data.spice_tolerance,
      preferredPortionSizes: data.preferred_portion_sizes,
      cookingGoals: data.cooking_goals,
      learningPreferences: data.learning_preferences,
      successHistory: data.success_history,
      preferredCuisinesRanked: data.preferred_cuisines_ranked,
      ingredientPreferences: data.ingredient_preferences,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private transformAdaptationData(data: any): RecipeAdaptation {
    return {
      id: data.id,
      originalRecipeId: data.original_recipe_id,
      userId: data.user_id,
      adaptationType: data.adaptation_type,
      adaptedRecipe: data.adapted_recipe,
      adaptationReasons: data.adaptation_reasons,
      confidenceScore: data.confidence_score,
      userFeedback: data.user_feedback,
      successRate: data.success_rate,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private transformSubstitutionData(data: any): IngredientSubstitution {
    return {
      id: data.id,
      originalIngredient: data.original_ingredient,
      substituteIngredient: data.substitute_ingredient,
      substitutionRatio: data.substitution_ratio,
      contextTags: data.context_tags,
      dietaryReasons: data.dietary_reasons,
      flavorImpact: data.flavor_impact,
      textureImpact: data.texture_impact,
      nutritionalImpact: data.nutritional_impact,
      successRate: data.success_rate,
      userRatings: data.user_ratings,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

// Export singleton instances
export const aiCookingService = new AICookingService(false);
export const serverAiCookingService = new AICookingService(true);