import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { 
  AICookingProfile, 
  VideoRecipe, 
  CookingOutcome,
  PredictSuccessRequest,
  PredictSuccessResponse 
} from '@/types';
import { logger } from '@/lib/logger';

export interface MLFeatureVector {
  // User features
  userSkillLevel: number;
  userExperience: number;
  userSuccessRate: number;
  
  // Recipe features
  recipeComplexity: number;
  recipeTotalTime: number;
  recipeIngredientCount: number;
  recipeInstructionCount: number;
  recipeDifficulty: number; // encoded: easy=1, medium=2, hard=3
  
  // Context features
  skillGap: number; // difference between user skill and recipe difficulty
  timeConstraint: number; // ratio of available time to recipe time
  equipmentMatch: number; // percentage of required equipment available
  dietaryMatch: number; // how well recipe matches dietary restrictions
  experienceMatch: number; // user experience with similar recipes
  
  // Environmental features
  timeOfDay?: number; // encoded: morning=1, afternoon=2, evening=3
  stressLevel?: number;
  cookingFrequency: number; // how often user cooks
  
  // Historical features
  similarRecipeSuccess: number; // success rate on similar recipes
  recentPerformance: number; // success rate in last 10 attempts
}

export interface MLPrediction {
  successProbability: number;
  confidenceInterval: [number, number];
  keyFactors: {
    factor: string;
    impact: number; // positive or negative impact
    description: string;
  }[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export class MLPredictionService {
  private supabase;

  constructor(isServer = false) {
    if (isServer) {
      this.supabase = createServerComponentClient({ cookies });
    } else {
      this.supabase = createClientComponentClient();
    }
  }

  /**
   * Predict cooking success using ML features
   */
  async predictCookingSuccess(request: PredictSuccessRequest): Promise<PredictSuccessResponse> {
    try {
      // Get user profile and recipe data
      const [userProfile, recipe, historicalData] = await Promise.all([
        this.getUserProfile(request.userId),
        this.getRecipe(request.recipeId),
        this.getUserHistoricalData(request.userId)
      ]);

      if (!userProfile || !recipe) {
        throw new Error('Required data not found');
      }

      // Extract features for ML model
      const features = await this.extractFeatures(
        userProfile, 
        recipe, 
        historicalData, 
        request.cookingContext
      );

      // Run ML prediction
      const prediction = await this.runMLPrediction(features);

      // Generate insights and recommendations
      const insights = this.generatePredictionInsights(features, prediction);
      const recommendations = this.generateRecommendations(features, prediction);
      const riskFactors = this.identifyRiskFactors(features);

      // Get alternative recipes if success probability is low
      const alternativeRecipes = prediction.successProbability < 0.6 
        ? await this.getAlternativeRecipes(request.userId, recipe)
        : [];

      return {
        successScore: prediction.successProbability,
        confidenceInterval: prediction.confidenceInterval,
        riskFactors,
        recommendations,
        alternativeRecipes
      };
    } catch (error) {
      logger.error('Predict cooking success error:', error);
      throw error;
    }
  }

  /**
   * Train the ML model with new cooking outcome data
   */
  async recordOutcomeAndUpdateModel(
    userId: string,
    recipeId: string,
    outcome: CookingOutcome
  ): Promise<void> {
    try {
      // Extract features from the cooking session
      const [userProfile, recipe] = await Promise.all([
        this.getUserProfile(userId),
        this.getRecipe(recipeId)
      ]);

      if (!userProfile || !recipe) {
        throw new Error('Required data not found');
      }

      const features = await this.extractFeatures(
        userProfile, 
        recipe, 
        await this.getUserHistoricalData(userId),
        outcome.cookingContext
      );

      // Convert outcome to training label
      const label = this.outcomeToLabel(outcome.actualOutcome);

      // Store training data with feature vector
      await this.storeTrainingData(features, label, outcome);

      // Update model weights (in production, this would be done in batches)
      await this.updateModelWeights(features, label);

      logger.info('Recorded outcome and updated model', { userId, recipeId, outcome: outcome.actualOutcome });
    } catch (error) {
      logger.error('Record outcome error:', error);
      throw error;
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelMetrics(): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    totalPredictions: number;
    recentAccuracy: number; // last 100 predictions
  }> {
    try {
      const { data: outcomes, error } = await this.supabase
        .from('cooking_outcomes')
        .select('predicted_success_score, actual_outcome, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        throw new Error(`Failed to get outcomes: ${error.message}`);
      }

      const metrics = this.calculateMetrics(outcomes || []);
      return metrics;
    } catch (error) {
      logger.error('Get model metrics error:', error);
      throw error;
    }
  }

  // Private methods

  private async getUserProfile(userId: string): Promise<AICookingProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('ai_cooking_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) return null;
      return this.transformAIProfileData(data);
    } catch {
      return null;
    }
  }

  private async getRecipe(recipeId: string): Promise<VideoRecipe | null> {
    try {
      const { data, error } = await this.supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) return null;
      return this.transformRecipeData(data);
    } catch {
      return null;
    }
  }

  private async getUserHistoricalData(userId: string): Promise<CookingOutcome[]> {
    try {
      const { data, error } = await this.supabase
        .from('cooking_outcomes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) return [];
      return (data || []).map(this.transformOutcomeData);
    } catch {
      return [];
    }
  }

  private async extractFeatures(
    userProfile: AICookingProfile,
    recipe: VideoRecipe,
    historicalData: CookingOutcome[],
    context?: any
  ): Promise<MLFeatureVector> {
    // Calculate user success rate
    const userSuccessRate = historicalData.length > 0 
      ? historicalData.filter(h => h.actualOutcome === 'success').length / historicalData.length 
      : 0.5; // default for new users

    // Calculate recipe complexity
    const recipeComplexity = this.calculateRecipeComplexity(recipe);

    // Calculate skill gap
    const recipeDifficultyNum = { 'easy': 1, 'medium': 2, 'hard': 3 }[recipe.difficultyLevel] || 2;
    const skillGap = userProfile.skillLevel - (recipeDifficultyNum * 3); // normalize to 1-10 scale

    // Calculate equipment match
    const requiredEquipment = this.extractRequiredEquipment(recipe);
    const equipmentMatch = requiredEquipment.length > 0 
      ? requiredEquipment.filter(eq => userProfile.equipmentAvailable.includes(eq)).length / requiredEquipment.length
      : 1.0;

    // Calculate dietary match
    const dietaryIssues = this.findDietaryConflicts(recipe, userProfile);
    const dietaryMatch = 1.0 - (dietaryIssues.length / Math.max(1, recipe.ingredients.length));

    // Calculate experience match
    const similarRecipes = historicalData.filter(h => 
      h.recipeId !== recipe.id && this.recipesAreSimilar(recipe, h)
    );
    const similarRecipeSuccess = similarRecipes.length > 0
      ? similarRecipes.filter(h => h.actualOutcome === 'success').length / similarRecipes.length
      : userSuccessRate;

    // Calculate recent performance
    const recentOutcomes = historicalData.slice(0, 10);
    const recentPerformance = recentOutcomes.length > 0
      ? recentOutcomes.filter(h => h.actualOutcome === 'success').length / recentOutcomes.length
      : userSuccessRate;

    // Calculate time constraint
    const totalRecipeTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    const availableTime = context?.availableTime || userProfile.preferredCookingTime;
    const timeConstraint = availableTime / Math.max(1, totalRecipeTime);

    return {
      userSkillLevel: userProfile.skillLevel / 10, // normalize to 0-1
      userExperience: userProfile.cookingExperienceYears / 20, // normalize assuming max 20 years
      userSuccessRate,
      
      recipeComplexity: recipeComplexity / 10, // normalize to 0-1
      recipeTotalTime: Math.min(1, totalRecipeTime / 180), // normalize, cap at 3 hours
      recipeIngredientCount: Math.min(1, recipe.ingredients.length / 20), // normalize, cap at 20
      recipeInstructionCount: Math.min(1, recipe.instructions.length / 15), // normalize, cap at 15
      recipeDifficulty: recipeDifficultyNum / 3, // normalize to 0-1
      
      skillGap: Math.max(-1, Math.min(1, skillGap / 5)), // normalize to -1 to 1
      timeConstraint: Math.min(2, timeConstraint), // allow up to 2x time
      equipmentMatch,
      dietaryMatch,
      experienceMatch: similarRecipeSuccess,
      
      timeOfDay: context?.timeOfDay ? this.encodeTimeOfDay(context.timeOfDay) / 3 : 0.5,
      stressLevel: (context?.stressLevel || 3) / 5, // normalize to 0-1
      cookingFrequency: this.calculateCookingFrequency(historicalData) / 7, // normalize to daily
      
      similarRecipeSuccess,
      recentPerformance
    };
  }

  private async runMLPrediction(features: MLFeatureVector): Promise<MLPrediction> {
    // This is a simplified ML model. In production, you'd use a trained model
    // like TensorFlow.js, or call an external ML service
    
    // Simple weighted linear model for demonstration
    const weights = {
      userSkillLevel: 0.15,
      userSuccessRate: 0.20,
      skillGap: 0.18,
      equipmentMatch: 0.12,
      dietaryMatch: 0.08,
      timeConstraint: 0.10,
      recentPerformance: 0.12,
      recipeComplexity: -0.15,
      experienceMatch: 0.10
    };

    let prediction = 0.5; // base probability
    const factorImpacts: { factor: string; impact: number; description: string }[] = [];

    Object.entries(weights).forEach(([factor, weight]) => {
      const featureValue = (features as any)[factor] || 0;
      const impact = weight * featureValue;
      prediction += impact;
      
      factorImpacts.push({
        factor,
        impact,
        description: this.getFactorDescription(factor, featureValue, impact)
      });
    });

    // Ensure prediction is between 0 and 1
    prediction = Math.max(0.05, Math.min(0.95, prediction));

    // Calculate confidence interval (simplified)
    const confidence = 0.8; // In production, this would be model-dependent
    const margin = (1 - confidence) * 0.2;
    const confidenceInterval: [number, number] = [
      Math.max(0, prediction - margin),
      Math.min(1, prediction + margin)
    ];

    // Determine risk level
    const riskLevel = prediction >= 0.7 ? 'low' : prediction >= 0.4 ? 'medium' : 'high';

    // Generate recommendations
    const recommendations = this.generateMLRecommendations(features, factorImpacts, prediction);

    return {
      successProbability: prediction,
      confidenceInterval,
      keyFactors: factorImpacts.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 5),
      riskLevel,
      recommendations
    };
  }

  private calculateRecipeComplexity(recipe: VideoRecipe): number {
    let complexity = 0;

    // Base complexity from difficulty
    switch (recipe.difficultyLevel) {
      case 'easy': complexity = 2; break;
      case 'medium': complexity = 5; break;
      case 'hard': complexity = 8; break;
      default: complexity = 4;
    }

    // Adjust for ingredient count
    if (recipe.ingredients.length > 15) complexity += 2;
    else if (recipe.ingredients.length > 10) complexity += 1;

    // Adjust for instruction count
    if (recipe.instructions.length > 12) complexity += 2;
    else if (recipe.instructions.length > 8) complexity += 1;

    // Adjust for time
    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    if (totalTime > 120) complexity += 2;
    else if (totalTime > 60) complexity += 1;

    return Math.min(10, complexity);
  }

  private extractRequiredEquipment(recipe: VideoRecipe): string[] {
    const equipment = new Set<string>();
    const instructionsText = recipe.instructions.join(' ').toLowerCase();

    const equipmentKeywords = {
      'oven': ['oven', 'bake', 'roast'],
      'stovetop': ['stovetop', 'burner', 'sauté', 'boil'],
      'grill': ['grill', 'grilling'],
      'blender': ['blend', 'blender'],
      'mixer': ['mix', 'mixer', 'whip'],
      'thermometer': ['temperature', 'thermometer']
    };

    Object.entries(equipmentKeywords).forEach(([equip, keywords]) => {
      if (keywords.some(keyword => instructionsText.includes(keyword))) {
        equipment.add(equip);
      }
    });

    return Array.from(equipment);
  }

  private findDietaryConflicts(recipe: VideoRecipe, userProfile: AICookingProfile): string[] {
    const conflicts: string[] = [];
    const restrictions = [...userProfile.dietaryRestrictions, ...userProfile.allergies];
    
    recipe.ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();
      
      restrictions.forEach(restriction => {
        if (this.ingredientConflictsWithRestriction(name, restriction)) {
          conflicts.push(ingredient.name);
        }
      });
    });

    return [...new Set(conflicts)];
  }

  private ingredientConflictsWithRestriction(ingredient: string, restriction: string): boolean {
    const conflictMap: Record<string, string[]> = {
      'dairy_free': ['milk', 'cheese', 'butter', 'cream', 'yogurt'],
      'gluten_free': ['flour', 'bread', 'pasta', 'wheat', 'barley'],
      'vegetarian': ['meat', 'fish', 'chicken', 'beef', 'pork'],
      'vegan': ['milk', 'cheese', 'butter', 'cream', 'egg', 'honey', 'meat', 'fish'],
      'nut_free': ['almond', 'walnut', 'peanut', 'cashew', 'pistachio']
    };

    const conflictIngredients = conflictMap[restriction] || [restriction];
    return conflictIngredients.some(conflict => ingredient.includes(conflict));
  }

  private recipesAreSimilar(recipe1: VideoRecipe, outcome: CookingOutcome): boolean {
    // In production, this would use recipe embeddings or cuisine matching
    // For now, simple heuristic based on tags and cuisine
    return recipe1.tags.length > 0 && Math.random() > 0.7; // Simplified
  }

  private encodeTimeOfDay(timeOfDay: string): number {
    const mapping: Record<string, number> = {
      'morning': 1,
      'afternoon': 2,
      'evening': 3,
      'night': 3
    };
    return mapping[timeOfDay.toLowerCase()] || 2;
  }

  private calculateCookingFrequency(historicalData: CookingOutcome[]): number {
    if (historicalData.length < 2) return 1; // default to once per week

    const recent = historicalData.slice(0, 14); // last 14 entries
    const timeSpan = recent.length > 1 
      ? (new Date(recent[0].createdAt).getTime() - new Date(recent[recent.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24)
      : 7;

    return Math.max(1, recent.length / Math.max(1, timeSpan / 7)); // recipes per week
  }

  private getFactorDescription(factor: string, value: number, impact: number): string {
    const descriptions: Record<string, string> = {
      userSkillLevel: `Your skill level (${Math.round(value * 10)}/10) ${impact > 0 ? 'helps' : 'challenges'} with this recipe`,
      userSuccessRate: `Your ${Math.round(value * 100)}% success rate ${impact > 0 ? 'boosts' : 'lowers'} confidence`,
      skillGap: `Recipe difficulty ${impact > 0 ? 'matches' : 'exceeds'} your skill level`,
      equipmentMatch: `You have ${Math.round(value * 100)}% of required equipment`,
      dietaryMatch: `Recipe ${Math.round(value * 100)}% matches your dietary preferences`,
      timeConstraint: `Time availability ${impact > 0 ? 'adequate' : 'tight'} for this recipe`,
      recentPerformance: `Recent ${Math.round(value * 100)}% success rate ${impact > 0 ? 'positive' : 'concerning'}`,
      recipeComplexity: `Recipe complexity ${impact < 0 ? 'high' : 'manageable'}`,
      experienceMatch: `${Math.round(value * 100)}% success on similar recipes`
    };

    return descriptions[factor] || `${factor}: ${Math.round(value * 100)}%`;
  }

  private generateMLRecommendations(
    features: MLFeatureVector,
    factors: { factor: string; impact: number }[],
    prediction: number
  ): string[] {
    const recommendations: string[] = [];

    // Low prediction recommendations
    if (prediction < 0.5) {
      recommendations.push('Consider starting with a simpler recipe to build confidence');
    }

    // Factor-specific recommendations
    factors.forEach(({ factor, impact }) => {
      if (impact < -0.05) { // Negative impact threshold
        switch (factor) {
          case 'skillGap':
            recommendations.push('This recipe may be challenging for your current skill level');
            break;
          case 'equipmentMatch':
            recommendations.push('Consider equipment alternatives or acquire missing tools');
            break;
          case 'timeConstraint':
            recommendations.push('Allow extra time or prep ingredients in advance');
            break;
          case 'dietaryMatch':
            recommendations.push('Review ingredients for dietary conflicts and substitutions');
            break;
          case 'recipeComplexity':
            recommendations.push('Take your time and read all instructions before starting');
            break;
        }
      }
    });

    // Success-boosting recommendations
    if (features.recentPerformance < 0.6) {
      recommendations.push('Recent cooking challenges suggest taking a simpler approach');
    }

    if (features.userSkillLevel < 0.3) {
      recommendations.push('Consider watching tutorial videos before cooking');
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private generatePredictionInsights(features: MLFeatureVector, prediction: MLPrediction): string[] {
    // Generate human-readable insights from the prediction
    return [
      `Based on your profile, you have a ${Math.round(prediction.successProbability * 100)}% chance of success`,
      `Key strength: ${prediction.keyFactors[0]?.description}`,
      `Main challenge: ${prediction.keyFactors.find(f => f.impact < 0)?.description || 'None identified'}`
    ];
  }

  private identifyRiskFactors(features: MLFeatureVector): string[] {
    const risks: string[] = [];

    if (features.skillGap < -0.3) {
      risks.push('Recipe difficulty significantly exceeds current skill level');
    }

    if (features.equipmentMatch < 0.7) {
      risks.push('Missing essential cooking equipment');
    }

    if (features.timeConstraint < 0.8) {
      risks.push('Limited time available for recipe completion');
    }

    if (features.dietaryMatch < 0.9) {
      risks.push('Recipe contains ingredients that conflict with dietary restrictions');
    }

    if (features.recentPerformance < 0.4) {
      risks.push('Recent cooking attempts have been challenging');
    }

    return risks;
  }

  private async getAlternativeRecipes(userId: string, currentRecipe: VideoRecipe): Promise<string[]> {
    // In production, this would use recipe similarity and user preferences
    // For now, return empty array - this would be filled with actual recipe recommendations
    return [];
  }

  private outcomeToLabel(outcome: CookingOutcome['actualOutcome']): number {
    switch (outcome) {
      case 'success': return 1.0;
      case 'partial_success': return 0.7;
      case 'failure': return 0.2;
      case 'abandoned': return 0.1;
      default: return 0.5;
    }
  }

  private async storeTrainingData(
    features: MLFeatureVector,
    label: number,
    outcome: CookingOutcome
  ): Promise<void> {
    // Store feature vector and label for model training
    try {
      const { error } = await this.supabase
        .from('cooking_outcomes')
        .update({
          feature_vector: Object.values(features), // Convert to array for vector storage
          predicted_success_score: label
        })
        .eq('id', outcome.id);

      if (error) {
        logger.error('Store training data error:', error);
      }
    } catch (error) {
      logger.error('Store training data exception:', error);
    }
  }

  private async updateModelWeights(features: MLFeatureVector, label: number): Promise<void> {
    // In production, this would update model weights using gradient descent
    // For now, just log the training data point
    logger.info('Model training data point', { features, label });
  }

  private calculateMetrics(outcomes: any[]): any {
    const validOutcomes = outcomes.filter(o => 
      o.predicted_success_score !== null && o.actual_outcome !== null
    );

    if (validOutcomes.length === 0) {
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        totalPredictions: 0,
        recentAccuracy: 0
      };
    }

    // Convert outcomes to binary classification (success vs not success)
    const predictions = validOutcomes.map(o => o.predicted_success_score > 0.5 ? 1 : 0);
    const actuals = validOutcomes.map(o => o.actual_outcome === 'success' ? 1 : 0);

    let tp = 0, fp = 0, tn = 0, fn = 0;
    
    predictions.forEach((pred, i) => {
      const actual = actuals[i];
      if (pred === 1 && actual === 1) tp++;
      else if (pred === 1 && actual === 0) fp++;
      else if (pred === 0 && actual === 0) tn++;
      else if (pred === 0 && actual === 1) fn++;
    });

    const accuracy = (tp + tn) / validOutcomes.length;
    const precision = tp / Math.max(1, tp + fp);
    const recall = tp / Math.max(1, tp + fn);
    const f1Score = 2 * (precision * recall) / Math.max(0.001, precision + recall);

    // Calculate recent accuracy (last 100)
    const recentOutcomes = validOutcomes.slice(0, 100);
    const recentCorrect = recentOutcomes.reduce((acc, o, i) => {
      const predicted = o.predicted_success_score > 0.5 ? 1 : 0;
      const actual = o.actual_outcome === 'success' ? 1 : 0;
      return acc + (predicted === actual ? 1 : 0);
    }, 0);
    const recentAccuracy = recentCorrect / Math.max(1, recentOutcomes.length);

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      totalPredictions: validOutcomes.length,
      recentAccuracy
    };
  }

  // Data transformation helpers
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

  private transformRecipeData(data: any): VideoRecipe {
    return {
      id: data.id,
      creatorId: data.creator_id,
      creator: {} as any, // Would be populated with creator data
      title: data.title,
      description: data.description,
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      ingredients: data.ingredients || [],
      instructions: data.instructions || [],
      nutrition: data.nutrition || { calories: 0, protein: 0, fat: 0, carbs: 0, perServing: true },
      servings: data.servings,
      prepTimeMinutes: data.prep_time_minutes,
      cookTimeMinutes: data.cook_time_minutes,
      totalTimeMinutes: data.total_time_minutes,
      difficultyLevel: data.difficulty_level,
      tags: data.tags || [],
      isPublic: data.is_public,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private transformOutcomeData(data: any): CookingOutcome {
    return {
      id: data.id,
      userId: data.user_id,
      recipeId: data.recipe_id,
      adaptationId: data.adaptation_id,
      predictedSuccessScore: data.predicted_success_score,
      actualOutcome: data.actual_outcome,
      userRating: data.user_rating,
      timeTakenMinutes: data.time_taken_minutes,
      difficultyExperienced: data.difficulty_experienced,
      issuesEncountered: data.issues_encountered || [],
      userNotes: data.user_notes,
      cookingContext: data.cooking_context || {},
      createdAt: new Date(data.created_at)
    };
  }
}

// Export singleton instances
export const mlPredictionService = new MLPredictionService(false);
export const serverMLPredictionService = new MLPredictionService(true);