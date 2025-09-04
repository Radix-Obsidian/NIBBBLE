import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  IngredientSubstitution, 
  CookingInsight, 
  VideoIngredient, 
  AICookingProfile,
  VideoRecipe 
} from '@/types';
import { logger } from '@/lib/logger';

export interface SubstitutionSuggestion {
  original: VideoIngredient;
  substitutes: {
    ingredient: IngredientSubstitution;
    confidence: number;
    reasonsForSuggestion: string[];
    impactAssessment: {
      flavor: string;
      texture: string;
      nutrition: string;
      difficulty: string;
    };
  }[];
}

export interface SkillAdjustment {
  originalInstruction: string;
  adjustedInstruction: string;
  skillLevel: number;
  adjustmentType: 'simplified' | 'detailed' | 'technique_explanation' | 'safety_added';
  confidence: number;
}

export interface CookingTechnique {
  name: string;
  description: string;
  skillLevel: number;
  videoUrl?: string;
  tips: string[];
  commonMistakes: string[];
  alternatives: string[];
}

export class CookingIntelligenceService {
  private supabase;

  constructor(isServer = false) {
    if (isServer) {
      this.supabase = createServerComponentClient({ cookies });
    } else {
      this.supabase = createClientComponentClient();
    }
  }

  /**
   * Get smart ingredient substitutions based on user profile and context
   */
  async getSmartSubstitutions(
    ingredients: VideoIngredient[],
    userProfile: AICookingProfile,
    context?: {
      recipeType?: string;
      cookingMethod?: string;
      urgency?: 'high' | 'medium' | 'low';
      budget?: 'low' | 'medium' | 'high';
    }
  ): Promise<SubstitutionSuggestion[]> {
    try {
      const suggestions: SubstitutionSuggestion[] = [];

      for (const ingredient of ingredients) {
        const substitutes = await this.findSubstitutes(ingredient, userProfile, context);
        
        if (substitutes.length > 0) {
          suggestions.push({
            original: ingredient,
            substitutes: substitutes.map(sub => ({
              ingredient: sub,
              confidence: this.calculateSubstitutionConfidence(ingredient, sub, userProfile),
              reasonsForSuggestion: this.generateSubstitutionReasons(ingredient, sub, userProfile),
              impactAssessment: this.assessSubstitutionImpact(ingredient, sub)
            }))
          });
        }
      }

      return suggestions;
    } catch (error) {
      logger.error('Get smart substitutions error:', error);
      throw error;
    }
  }

  /**
   * Adjust recipe instructions based on user skill level
   */
  async adjustInstructionsForSkillLevel(
    instructions: string[],
    targetSkillLevel: number,
    userProfile: AICookingProfile,
    recipeContext?: VideoRecipe
  ): Promise<SkillAdjustment[]> {
    try {
      const adjustments: SkillAdjustment[] = [];

      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];
        const adjustment = await this.adjustInstructionForSkill(
          instruction, 
          targetSkillLevel, 
          userProfile,
          i + 1,
          recipeContext
        );
        
        if (adjustment) {
          adjustments.push(adjustment);
        }
      }

      return adjustments;
    } catch (error) {
      logger.error('Adjust instructions error:', error);
      throw error;
    }
  }

  /**
   * Get cooking technique explanations and tips
   */
  async getCookingTechnique(
    techniqueName: string,
    userSkillLevel: number
  ): Promise<CookingTechnique | null> {
    try {
      const technique = this.getCookingTechniqueData(techniqueName);
      
      if (technique && technique.skillLevel <= userSkillLevel + 2) {
        return {
          ...technique,
          tips: this.getSkillAppropriateTips(technique, userSkillLevel),
          alternatives: this.getAlternativeTechniques(technique, userSkillLevel)
        };
      }

      return null;
    } catch (error) {
      logger.error('Get cooking technique error:', error);
      throw error;
    }
  }

  /**
   * Generate contextual cooking insights
   */
  async generateCookingInsights(
    recipe: VideoRecipe,
    userProfile: AICookingProfile,
    cookingContext?: {
      timeOfDay?: string;
      weather?: string;
      cookingFor?: number;
      occasion?: string;
    }
  ): Promise<CookingInsight[]> {
    try {
      const insights: CookingInsight[] = [];

      // Skill-based insights
      insights.push(...this.generateSkillBasedInsights(recipe, userProfile));
      
      // Equipment-based insights
      insights.push(...this.generateEquipmentInsights(recipe, userProfile));
      
      // Time-based insights
      insights.push(...this.generateTimeInsights(recipe, userProfile, cookingContext));
      
      // Technique insights
      insights.push(...this.generateTechniqueInsights(recipe, userProfile));
      
      // Safety insights
      insights.push(...this.generateSafetyInsights(recipe, userProfile));

      return insights.filter(insight => insight.confidenceScore >= 0.7);
    } catch (error) {
      logger.error('Generate cooking insights error:', error);
      throw error;
    }
  }

  /**
   * Assess cooking difficulty and provide skill development recommendations
   */
  async assessRecipeDifficulty(
    recipe: VideoRecipe,
    userProfile: AICookingProfile
  ): Promise<{
    overallDifficulty: number; // 1-10
    skillGaps: {
      technique: string;
      requiredLevel: number;
      userLevel: number;
      recommendation: string;
    }[];
    preparationComplexity: number;
    equipmentComplexity: number;
    techniqueComplexity: number;
    recommendations: string[];
  }> {
    try {
      const techniques = this.extractTechniques(recipe);
      const equipment = this.extractRequiredEquipment(recipe);
      
      let overallDifficulty = 0;
      const skillGaps: any[] = [];

      // Assess technique complexity
      let techniqueComplexity = 0;
      for (const technique of techniques) {
        const techData = this.getCookingTechniqueData(technique);
        if (techData) {
          techniqueComplexity = Math.max(techniqueComplexity, techData.skillLevel);
          
          if (techData.skillLevel > userProfile.skillLevel) {
            skillGaps.push({
              technique,
              requiredLevel: techData.skillLevel,
              userLevel: userProfile.skillLevel,
              recommendation: `Practice ${technique} techniques before attempting this recipe`
            });
          }
        }
      }

      // Assess equipment complexity
      const missingEquipment = equipment.filter(eq => !userProfile.equipmentAvailable.includes(eq));
      const equipmentComplexity = missingEquipment.length > 0 ? 7 : 3;

      // Assess preparation complexity
      const preparationComplexity = Math.min(10, Math.max(1, 
        (recipe.ingredients.length / 3) + 
        (recipe.instructions.length / 2) + 
        ((recipe.prepTimeMinutes + recipe.cookTimeMinutes) / 30)
      ));

      overallDifficulty = Math.round((techniqueComplexity + equipmentComplexity + preparationComplexity) / 3);

      const recommendations = this.generateSkillDevelopmentRecommendations(
        skillGaps,
        userProfile,
        recipe
      );

      return {
        overallDifficulty,
        skillGaps,
        preparationComplexity,
        equipmentComplexity,
        techniqueComplexity,
        recommendations
      };
    } catch (error) {
      logger.error('Assess recipe difficulty error:', error);
      throw error;
    }
  }

  // Private helper methods

  private async findSubstitutes(
    ingredient: VideoIngredient,
    userProfile: AICookingProfile,
    context?: any
  ): Promise<IngredientSubstitution[]> {
    const restrictions = [...userProfile.dietaryRestrictions, ...userProfile.allergies];
    const disliked = userProfile.ingredientPreferences.disliked;

    // Check if ingredient needs substitution
    const needsSubstitution = restrictions.some(restriction => 
      this.ingredientViolatesRestriction(ingredient.name, restriction)
    ) || disliked.includes(ingredient.name.toLowerCase());

    if (!needsSubstitution && context?.urgency !== 'high') {
      return [];
    }

    const { data, error } = await this.supabase
      .from('ingredient_substitutions')
      .select('*')
      .eq('original_ingredient', ingredient.name.toLowerCase())
      .order('success_rate', { ascending: false })
      .limit(5);

    if (error) {
      logger.error('Find substitutes error:', error);
      return [];
    }

    return data?.map(this.transformSubstitutionData) || [];
  }

  private calculateSubstitutionConfidence(
    original: VideoIngredient,
    substitute: IngredientSubstitution,
    userProfile: AICookingProfile
  ): number {
    let confidence = substitute.successRate;

    // Boost confidence if substitute matches user preferences
    if (userProfile.ingredientPreferences.loved.includes(substitute.substituteIngredient)) {
      confidence += 0.1;
    }

    // Reduce confidence for high impact substitutions if user is beginner
    if (userProfile.skillLevel <= 3 && 
        (substitute.flavorImpact >= 4 || substitute.textureImpact >= 4)) {
      confidence -= 0.2;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private generateSubstitutionReasons(
    original: VideoIngredient,
    substitute: IngredientSubstitution,
    userProfile: AICookingProfile
  ): string[] {
    const reasons: string[] = [];

    // Dietary reasons
    if (substitute.dietaryReasons.some(reason => 
        userProfile.dietaryRestrictions.includes(reason))) {
      reasons.push(`Matches your ${substitute.dietaryReasons.join(', ')} dietary preferences`);
    }

    // Allergy reasons
    if (userProfile.allergies.some(allergy => 
        original.name.toLowerCase().includes(allergy))) {
      reasons.push('Avoids your known allergies');
    }

    // Availability reasons
    if (userProfile.ingredientPreferences.loved.includes(substitute.substituteIngredient)) {
      reasons.push('Uses an ingredient you love');
    }

    // Health reasons
    if (userProfile.cookingGoals.includes('healthy_eating')) {
      reasons.push('Supports your healthy eating goals');
    }

    return reasons;
  }

  private assessSubstitutionImpact(
    original: VideoIngredient,
    substitute: IngredientSubstitution
  ): {
    flavor: string;
    texture: string;
    nutrition: string;
    difficulty: string;
  } {
    const impactLevels = ['minimal', 'slight', 'moderate', 'significant', 'major'];

    return {
      flavor: impactLevels[Math.min(4, substitute.flavorImpact - 1)] || 'minimal',
      texture: impactLevels[Math.min(4, substitute.textureImpact - 1)] || 'minimal',
      nutrition: substitute.nutritionalImpact ? 'moderate' : 'minimal',
      difficulty: substitute.substitutionRatio === 1.0 ? 'minimal' : 'slight'
    };
  }

  private async adjustInstructionForSkill(
    instruction: string,
    targetSkillLevel: number,
    userProfile: AICookingProfile,
    stepNumber: number,
    recipe?: VideoRecipe
  ): Promise<SkillAdjustment | null> {
    if (targetSkillLevel >= 6) {
      return null; // No adjustment needed for experienced cooks
    }

    let adjustedInstruction = instruction;
    let adjustmentType: SkillAdjustment['adjustmentType'] = 'simplified';
    let confidence = 0.8;

    // Add technique explanations for beginners
    if (targetSkillLevel <= 3) {
      const techniques = this.extractTechniquesFromInstruction(instruction);
      
      for (const technique of techniques) {
        const explanation = this.getTechniqueExplanation(technique, targetSkillLevel);
        if (explanation) {
          adjustedInstruction += `\n\n${explanation}`;
          adjustmentType = 'technique_explanation';
        }
      }

      // Add timing guidance
      if (instruction.toLowerCase().includes('until')) {
        adjustedInstruction += '\n\nTip: Take your time with this step - it\'s better to go slowly than rush.';
      }

      // Add safety reminders
      const safetyNote = this.getSafetyNote(instruction);
      if (safetyNote) {
        adjustedInstruction += `\n\n⚠️ Safety: ${safetyNote}`;
        adjustmentType = 'safety_added';
      }
    }

    // Add detailed explanations for intermediate cooks
    else if (targetSkillLevel <= 5) {
      if (instruction.toLowerCase().includes('season to taste')) {
        adjustedInstruction = instruction.replace(
          'season to taste',
          'season to taste (start with a pinch and taste, then add more if needed)'
        );
        adjustmentType = 'detailed';
      }
    }

    if (adjustedInstruction !== instruction) {
      return {
        originalInstruction: instruction,
        adjustedInstruction,
        skillLevel: targetSkillLevel,
        adjustmentType,
        confidence
      };
    }

    return null;
  }

  private generateSkillBasedInsights(
    recipe: VideoRecipe,
    userProfile: AICookingProfile
  ): CookingInsight[] {
    const insights: CookingInsight[] = [];
    
    if (userProfile.skillLevel <= 3) {
      insights.push({
        id: `skill-${Date.now()}`,
        userId: userProfile.id,
        recipeId: recipe.id,
        insightType: 'technique_tip',
        insightContent: 'Remember: mise en place (having everything prepared and organized) is key to cooking success, especially for beginners.',
        skillLevelTarget: [1, 2, 3],
        contextConditions: {},
        confidenceScore: 0.9,
        shownCount: 0,
        actedUponCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (recipe.instructions.length > 8 && userProfile.skillLevel <= 5) {
      insights.push({
        id: `skill-${Date.now() + 1}`,
        userId: userProfile.id,
        recipeId: recipe.id,
        insightType: 'timing_adjustment',
        insightContent: 'This recipe has many steps. Consider reading through all instructions first and preparing ingredients in advance.',
        skillLevelTarget: [1, 2, 3, 4, 5],
        contextConditions: { stepCount: recipe.instructions.length },
        confidenceScore: 0.8,
        shownCount: 0,
        actedUponCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return insights;
  }

  private generateEquipmentInsights(
    recipe: VideoRecipe,
    userProfile: AICookingProfile
  ): CookingInsight[] {
    const insights: CookingInsight[] = [];
    const requiredEquipment = this.extractRequiredEquipment(recipe);
    const missing = requiredEquipment.filter(eq => !userProfile.equipmentAvailable.includes(eq));

    if (missing.length > 0) {
      insights.push({
        id: `equipment-${Date.now()}`,
        userId: userProfile.id,
        recipeId: recipe.id,
        insightType: 'equipment_recommendation',
        insightContent: `This recipe works best with: ${missing.join(', ')}. Consider alternatives if you don't have these.`,
        skillLevelTarget: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        contextConditions: { missingEquipment: missing },
        confidenceScore: 0.85,
        shownCount: 0,
        actedUponCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      } as CookingInsight);
    }

    return insights;
  }

  private generateTimeInsights(
    recipe: VideoRecipe,
    userProfile: AICookingProfile,
    context?: any
  ): CookingInsight[] {
    const insights: CookingInsight[] = [];
    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

    if (totalTime > userProfile.preferredCookingTime * 1.5) {
      insights.push({
        id: `time-${Date.now()}`,
        userId: userProfile.id,
        recipeId: recipe.id,
        insightType: 'timing_adjustment',
        insightContent: `This recipe takes ${totalTime} minutes, which is longer than your usual ${userProfile.preferredCookingTime} minutes. Consider prep work in advance or breaking into multiple sessions.`,
        skillLevelTarget: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        contextConditions: { totalTime, preferredTime: userProfile.preferredCookingTime },
        confidenceScore: 0.8,
        shownCount: 0,
        actedUponCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return insights;
  }

  private generateTechniqueInsights(
    recipe: VideoRecipe,
    userProfile: AICookingProfile
  ): CookingInsight[] {
    const insights: CookingInsight[] = [];
    const techniques = this.extractTechniques(recipe);
    const advancedTechniques = techniques.filter(t => {
      const techData = this.getCookingTechniqueData(t);
      return techData && techData.skillLevel > userProfile.skillLevel;
    });

    if (advancedTechniques.length > 0) {
      insights.push({
        id: `technique-${Date.now()}`,
        userId: userProfile.id,
        recipeId: recipe.id,
        insightType: 'technique_tip',
        insightContent: `This recipe uses advanced techniques: ${advancedTechniques.join(', ')}. Consider watching tutorial videos first.`,
        skillLevelTarget: [userProfile.skillLevel],
        contextConditions: { advancedTechniques },
        confidenceScore: 0.9,
        shownCount: 0,
        actedUponCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return insights;
  }

  private generateSafetyInsights(
    recipe: VideoRecipe,
    userProfile: AICookingProfile
  ): CookingInsight[] {
    const insights: CookingInsight[] = [];
    const hasHotOil = recipe.instructions.some(inst => 
      inst.toLowerCase().includes('hot oil') || inst.toLowerCase().includes('fry'));
    
    const hasKnifeWork = recipe.instructions.some(inst =>
      inst.toLowerCase().includes('chop') || inst.toLowerCase().includes('dice') || 
      inst.toLowerCase().includes('slice'));

    if (hasHotOil && userProfile.skillLevel <= 4) {
      insights.push({
        id: `safety-${Date.now()}`,
        userId: userProfile.id,
        recipeId: recipe.id,
        insightType: 'safety_warning',
        insightContent: 'This recipe involves hot oil. Always heat oil gradually and keep a lid nearby to cover the pan if it spatters.',
        skillLevelTarget: [1, 2, 3, 4],
        contextConditions: { hasHotOil: true },
        confidenceScore: 0.95,
        shownCount: 0,
        actedUponCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (hasKnifeWork && userProfile.skillLevel <= 2) {
      insights.push({
        id: `safety-${Date.now() + 1}`,
        userId: userProfile.id,
        recipeId: recipe.id,
        insightType: 'safety_warning',
        insightContent: 'This recipe requires knife skills. Keep your fingers curled under and cut away from your body. Take your time.',
        skillLevelTarget: [1, 2],
        contextConditions: { hasKnifeWork: true },
        confidenceScore: 0.9,
        shownCount: 0,
        actedUponCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return insights;
  }

  // Utility methods
  private ingredientViolatesRestriction(ingredient: string, restriction: string): boolean {
    const ingredientLower = ingredient.toLowerCase();
    
    switch (restriction) {
      case 'dairy_free':
        return ingredientLower.includes('milk') || ingredientLower.includes('cheese') || 
               ingredientLower.includes('butter') || ingredientLower.includes('cream');
      case 'gluten_free':
        return ingredientLower.includes('flour') || ingredientLower.includes('bread') ||
               ingredientLower.includes('pasta') || ingredientLower.includes('wheat');
      case 'vegetarian':
        return ingredientLower.includes('meat') || ingredientLower.includes('fish') ||
               ingredientLower.includes('chicken') || ingredientLower.includes('beef');
      case 'vegan':
        return this.ingredientViolatesRestriction(ingredient, 'dairy_free') ||
               this.ingredientViolatesRestriction(ingredient, 'vegetarian') ||
               ingredientLower.includes('egg') || ingredientLower.includes('honey');
      default:
        return ingredientLower.includes(restriction.toLowerCase());
    }
  }

  private extractTechniques(recipe: VideoRecipe): string[] {
    const techniques = new Set<string>();
    const instructionsText = recipe.instructions.join(' ').toLowerCase();

    const techniqueKeywords = [
      'sauté', 'braise', 'roast', 'grill', 'steam', 'poach', 'blanch',
      'caramelize', 'deglaze', 'emulsify', 'fold', 'whip', 'knead',
      'julienne', 'brunoise', 'chiffonade', 'tempering'
    ];

    techniqueKeywords.forEach(technique => {
      if (instructionsText.includes(technique)) {
        techniques.add(technique);
      }
    });

    return Array.from(techniques);
  }

  private extractTechniquesFromInstruction(instruction: string): string[] {
    const techniques: string[] = [];
    const instructionLower = instruction.toLowerCase();

    const techniqueMap = {
      'sauté': ['sauté', 'sauteing'],
      'fold': ['fold', 'folding'],
      'whisk': ['whisk', 'whisking'],
      'dice': ['dice', 'dicing'],
      'mince': ['mince', 'mincing'],
      'julienne': ['julienne'],
      'braise': ['braise', 'braising'],
      'caramelize': ['caramelize', 'caramelizing']
    };

    Object.entries(techniqueMap).forEach(([technique, keywords]) => {
      if (keywords.some(keyword => instructionLower.includes(keyword))) {
        techniques.push(technique);
      }
    });

    return techniques;
  }

  private extractRequiredEquipment(recipe: VideoRecipe): string[] {
    const equipment = new Set<string>();
    const instructionsText = recipe.instructions.join(' ').toLowerCase();

    const equipmentKeywords = {
      'oven': ['oven', 'bake', 'roast'],
      'stovetop': ['stovetop', 'burner', 'sauté', 'boil'],
      'grill': ['grill', 'grilling'],
      'blender': ['blend', 'blender'],
      'food_processor': ['food processor', 'process'],
      'stand_mixer': ['stand mixer', 'mixer'],
      'thermometer': ['temperature', 'thermometer'],
      'kitchen_scale': ['weigh', 'scale']
    };

    Object.entries(equipmentKeywords).forEach(([equip, keywords]) => {
      if (keywords.some(keyword => instructionsText.includes(keyword))) {
        equipment.add(equip);
      }
    });

    return Array.from(equipment);
  }

  private getCookingTechniqueData(technique: string): CookingTechnique | null {
    const techniques: Record<string, CookingTechnique> = {
      'sauté': {
        name: 'Sauté',
        description: 'Cooking food quickly in a hot pan with a small amount of fat',
        skillLevel: 2,
        tips: ['Use high heat', 'Keep ingredients moving', 'Don\'t overcrowd the pan'],
        commonMistakes: ['Pan not hot enough', 'Too much oil', 'Overcrowding'],
        alternatives: ['Pan frying', 'Stir frying']
      },
      'fold': {
        name: 'Fold',
        description: 'Gently combining ingredients without deflating air bubbles',
        skillLevel: 3,
        tips: ['Use a spatula', 'Cut down through center, lift up and over', 'Work gently'],
        commonMistakes: ['Overmixing', 'Using wrong motion', 'Working too vigorously'],
        alternatives: ['Gentle stirring', 'Whisking very slowly']
      },
      'braise': {
        name: 'Braise',
        description: 'Cooking in liquid at low temperature for long periods',
        skillLevel: 5,
        tips: ['Brown first for flavor', 'Use low heat', 'Keep partially covered'],
        commonMistakes: ['Too high heat', 'Not enough liquid', 'Not browning first'],
        alternatives: ['Slow cooking', 'Oven roasting']
      }
    };

    return techniques[technique] || null;
  }

  private getTechniqueExplanation(technique: string, skillLevel: number): string | null {
    const explanations: Record<string, string> = {
      'sauté': 'Sautéing means "to jump" in French - you want to keep the ingredients moving in the hot pan.',
      'fold': 'Folding preserves air in the mixture. Use a spoon or spatula to gently lift and turn ingredients.',
      'dice': 'Dicing means cutting into small, uniform cubes. Keep your fingers curled under for safety.'
    };

    return explanations[technique] || null;
  }

  private getSafetyNote(instruction: string): string | null {
    const instructionLower = instruction.toLowerCase();

    if (instructionLower.includes('hot') && instructionLower.includes('oil')) {
      return 'Hot oil can splatter. Keep a lid nearby and work carefully.';
    }
    
    if (instructionLower.includes('knife') || instructionLower.includes('cut') || 
        instructionLower.includes('chop') || instructionLower.includes('slice')) {
      return 'Keep your fingers curled under when cutting and work slowly.';
    }
    
    if (instructionLower.includes('boiling')) {
      return 'Be careful around boiling water - use pot holders and keep pot handles turned inward.';
    }

    return null;
  }

  private getSkillAppropriateTips(technique: CookingTechnique, userSkillLevel: number): string[] {
    let tips = [...technique.tips];

    if (userSkillLevel <= 2) {
      tips = tips.concat([
        'Take your time - speed comes with practice',
        'Watch tutorial videos if you\'re unsure'
      ]);
    }

    return tips;
  }

  private getAlternativeTechniques(technique: CookingTechnique, userSkillLevel: number): string[] {
    if (userSkillLevel < technique.skillLevel) {
      return technique.alternatives;
    }
    return [];
  }

  private generateSkillDevelopmentRecommendations(
    skillGaps: any[],
    userProfile: AICookingProfile,
    recipe: VideoRecipe
  ): string[] {
    const recommendations: string[] = [];

    if (skillGaps.length > 2) {
      recommendations.push('Consider starting with a simpler recipe to build foundational skills');
    }

    skillGaps.forEach(gap => {
      recommendations.push(`Practice ${gap.technique} with simpler recipes first`);
    });

    if (userProfile.skillLevel < 4) {
      recommendations.push('Consider taking your time with prep work - mise en place is key');
    }

    return recommendations;
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
export const cookingIntelligence = new CookingIntelligenceService(false);
export const serverCookingIntelligence = new CookingIntelligenceService(true);