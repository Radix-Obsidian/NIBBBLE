import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { VideoRecipe, VideoIngredient, NutritionInfo, Creator } from '@/types';
import { nutritionCalculator } from './nutrition-calculator';

export interface CreateRecipeData {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  ingredients: VideoIngredient[];
  instructions: string[];
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  id: string;
}

export interface RecipeFilters {
  creatorId?: string;
  isPublic?: boolean;
  difficultyLevel?: string[];
  tags?: string[];
  maxTime?: number;
  maxServings?: number;
}

export class RecipeService {
  private supabase;

  constructor(isServer = false) {
    if (isServer) {
      this.supabase = createServerComponentClient({ cookies });
    } else {
      this.supabase = createClientComponentClient();
    }
  }

  /**
   * Create a new recipe
   */
  async createRecipe(recipeData: CreateRecipeData): Promise<VideoRecipe> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Calculate nutrition if ingredients are provided
      let nutrition: NutritionInfo = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        perServing: true
      };

      if (recipeData.ingredients.length > 0) {
        try {
          nutrition = await nutritionCalculator.calculateNutrition(
            recipeData.ingredients,
            recipeData.servings
          );
        } catch (error) {
          console.warn('Failed to calculate nutrition, using defaults:', error);
        }
      }

      // Ensure creator exists
      const creator = await this.ensureCreator(user.id);

      const recipeToInsert = {
        creator_id: creator.id,
        title: recipeData.title,
        description: recipeData.description,
        video_url: recipeData.videoUrl,
        thumbnail_url: recipeData.thumbnailUrl,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        nutrition,
        servings: recipeData.servings,
        prep_time_minutes: recipeData.prepTimeMinutes,
        cook_time_minutes: recipeData.cookTimeMinutes,
        total_time_minutes: recipeData.prepTimeMinutes + recipeData.cookTimeMinutes,
        difficulty_level: recipeData.difficultyLevel || 'medium',
        tags: recipeData.tags || [],
        is_public: recipeData.isPublic ?? true
      };

      const { data, error } = await this.supabase
        .from('recipes')
        .insert(recipeToInsert)
        .select(`
          *,
          creator:creators(*)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create recipe: ${error.message}`);
      }

      return this.transformRecipeData(data);
    } catch (error) {
      console.error('Create recipe error:', error);
      throw error;
    }
  }

  /**
   * Get a recipe by ID
   */
  async getRecipe(id: string): Promise<VideoRecipe | null> {
    try {
      const { data, error } = await this.supabase
        .from('recipes')
        .select(`
          *,
          creator:creators(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Recipe not found
        }
        throw new Error(`Failed to get recipe: ${error.message}`);
      }

      return this.transformRecipeData(data);
    } catch (error) {
      console.error('Get recipe error:', error);
      throw error;
    }
  }

  /**
   * Get recipes with filters
   */
  async getRecipes(filters: RecipeFilters = {}, page = 1, limit = 20): Promise<{
    recipes: VideoRecipe[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      let query = this.supabase
        .from('recipes')
        .select(`
          *,
          creator:creators(*)
        `, { count: 'exact' });

      // Apply filters
      if (filters.creatorId) {
        query = query.eq('creator_id', filters.creatorId);
      }

      if (filters.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic);
      }

      if (filters.difficultyLevel && filters.difficultyLevel.length > 0) {
        query = query.in('difficulty_level', filters.difficultyLevel);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.maxTime) {
        query = query.lte('total_time_minutes', filters.maxTime);
      }

      if (filters.maxServings) {
        query = query.lte('servings', filters.maxServings);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to get recipes: ${error.message}`);
      }

      const recipes = (data || []).map(this.transformRecipeData);
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        recipes,
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error('Get recipes error:', error);
      throw error;
    }
  }

  /**
   * Update a recipe
   */
  async updateRecipe(updateData: UpdateRecipeData): Promise<VideoRecipe> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership
      const existingRecipe = await this.getRecipe(updateData.id);
      if (!existingRecipe || existingRecipe.creatorId !== user.id) {
        throw new Error('Recipe not found or access denied');
      }

      const updateFields: any = {};
      
      if (updateData.title !== undefined) updateFields.title = updateData.title;
      if (updateData.description !== undefined) updateFields.description = updateData.description;
      if (updateData.videoUrl !== undefined) updateFields.video_url = updateData.videoUrl;
      if (updateData.thumbnailUrl !== undefined) updateFields.thumbnail_url = updateData.thumbnailUrl;
      if (updateData.ingredients !== undefined) updateFields.ingredients = updateData.ingredients;
      if (updateData.instructions !== undefined) updateFields.instructions = updateData.instructions;
      if (updateData.servings !== undefined) updateFields.servings = updateData.servings;
      if (updateData.prepTimeMinutes !== undefined) updateFields.prep_time_minutes = updateData.prepTimeMinutes;
      if (updateData.cookTimeMinutes !== undefined) updateFields.cook_time_minutes = updateData.cookTimeMinutes;
      if (updateData.difficultyLevel !== undefined) updateFields.difficulty_level = updateData.difficultyLevel;
      if (updateData.tags !== undefined) updateFields.tags = updateData.tags;
      if (updateData.isPublic !== undefined) updateFields.is_public = updateData.isPublic;

      // Recalculate nutrition if ingredients changed
      if (updateData.ingredients || updateData.servings) {
        const ingredients = updateData.ingredients || existingRecipe.ingredients;
        const servings = updateData.servings || existingRecipe.servings;
        
        try {
          const nutrition = await nutritionCalculator.calculateNutrition(ingredients, servings);
          updateFields.nutrition = nutrition;
        } catch (error) {
          console.warn('Failed to recalculate nutrition:', error);
        }
      }

      // Update total time
      if (updateData.prepTimeMinutes !== undefined || updateData.cookTimeMinutes !== undefined) {
        const prepTime = updateData.prepTimeMinutes ?? existingRecipe.prepTimeMinutes;
        const cookTime = updateData.cookTimeMinutes ?? existingRecipe.cookTimeMinutes;
        updateFields.total_time_minutes = prepTime + cookTime;
      }

      const { data, error } = await this.supabase
        .from('recipes')
        .update(updateFields)
        .eq('id', updateData.id)
        .select(`
          *,
          creator:creators(*)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to update recipe: ${error.message}`);
      }

      return this.transformRecipeData(data);
    } catch (error) {
      console.error('Update recipe error:', error);
      throw error;
    }
  }

  /**
   * Delete a recipe
   */
  async deleteRecipe(id: string): Promise<void> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Verify ownership
      const existingRecipe = await this.getRecipe(id);
      if (!existingRecipe || existingRecipe.creatorId !== user.id) {
        throw new Error('Recipe not found or access denied');
      }

      const { error } = await this.supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete recipe: ${error.message}`);
      }
    } catch (error) {
      console.error('Delete recipe error:', error);
      throw error;
    }
  }

  /**
   * Ensure creator profile exists for user
   */
  private async ensureCreator(userId: string): Promise<Creator> {
    try {
      // Check if creator already exists
      const { data: existingCreator, error: selectError } = await this.supabase
        .from('creators')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingCreator && !selectError) {
        return this.transformCreatorData(existingCreator);
      }

      // Get user profile
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not found');
      }

      // Create creator profile
      const { data: newCreator, error: insertError } = await this.supabase
        .from('creators')
        .insert({
          id: userId,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
          bio: user.user_metadata?.bio || ''
        })
        .select('*')
        .single();

      if (insertError) {
        throw new Error(`Failed to create creator profile: ${insertError.message}`);
      }

      return this.transformCreatorData(newCreator);
    } catch (error) {
      console.error('Ensure creator error:', error);
      throw error;
    }
  }

  /**
   * Transform database data to VideoRecipe type
   */
  private transformRecipeData(data: any): VideoRecipe {
    return {
      id: data.id,
      creatorId: data.creator_id,
      creator: this.transformCreatorData(data.creator),
      title: data.title,
      description: data.description,
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      ingredients: data.ingredients || [],
      instructions: data.instructions || [],
      nutrition: data.nutrition || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        perServing: true
      },
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

  /**
   * Transform database data to Creator type
   */
  private transformCreatorData(data: any): Creator {
    return {
      id: data.id,
      name: data.name,
      profileImageUrl: data.profile_image_url,
      bio: data.bio,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

// Export singleton instances
export const recipeService = new RecipeService(false); // Client-side
export const serverRecipeService = new RecipeService(true); // Server-side
