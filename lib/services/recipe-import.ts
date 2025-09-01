import { supabase } from '@/lib/supabase/client'
import { PantryPalsRecipe, transformMultipleRecipes, validateTransformedRecipe } from './recipe-transform'
import { SpoonacularRecipeDetails, getRecipeDetails, getMultipleRecipeDetails } from './spoonacular-api'
import { logger } from '@/lib/logger'

export interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: string[]
  recipeIds: string[]
}

export interface ImportOptions {
  batchSize?: number
  skipDuplicates?: boolean
  dryRun?: boolean
  creatorId: string
}

export interface ImportProgress {
  total: number
  processed: number
  imported: number
  failed: number
  currentRecipe?: string
}

/**
 * Check if a recipe already exists in the database
 */
async function checkDuplicateRecipe(title: string, creatorId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id')
      .eq('title', title)
      .eq('creator_id', creatorId)
      .limit(1)
    
    if (error) {
      logger.error('Error checking for duplicate recipe', { error: error.message, title })
      return false
    }
    
    return data && data.length > 0
  } catch (error) {
    logger.error('Error checking for duplicate recipe', { error: error.message, title })
    return false
  }
}

/**
 * Import a single recipe to the database
 */
async function importSingleRecipe(
  recipe: PantryPalsRecipe, 
  options: ImportOptions
): Promise<{ success: boolean; recipeId?: string; error?: string }> {
  try {
    // Check for duplicates if enabled
    if (options.skipDuplicates) {
      const isDuplicate = await checkDuplicateRecipe(recipe.title, options.creatorId)
      if (isDuplicate) {
        logger.info('Skipping duplicate recipe', { title: recipe.title })
        return { success: false, error: 'Duplicate recipe' }
      }
    }
    
    // Validate recipe
    const validationErrors = validateTransformedRecipe(recipe)
    if (validationErrors.length > 0) {
      return { 
        success: false, 
        error: `Validation failed: ${validationErrors.join(', ')}` 
      }
    }
    
    if (options.dryRun) {
      logger.info('Dry run: Would import recipe', { title: recipe.title })
      return { success: true, recipeId: 'dry-run-id' }
    }
    
    // Insert recipe
    const { data: insertedRecipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cook_time: recipe.cook_time,
        prep_time: recipe.prep_time,
        difficulty: recipe.difficulty,
        cuisine: recipe.cuisine,
        tags: recipe.tags,
        image_url: recipe.image_url,
        video_url: recipe.video_url,
        creator_id: recipe.creator_id,
        rating: recipe.rating,
        likes_count: recipe.likes_count,
        views_count: recipe.views_count,
        is_public: recipe.is_public
      })
      .select('id')
      .single()
    
    if (recipeError) {
      logger.error('Failed to insert recipe', { 
        error: recipeError.message, 
        title: recipe.title 
      })
      return { 
        success: false, 
        error: `Database error: ${recipeError.message}` 
      }
    }
    
    logger.info('Successfully imported recipe', { 
      id: insertedRecipe.id, 
      title: recipe.title 
    })
    
    return { success: true, recipeId: insertedRecipe.id }
    
  } catch (error) {
    logger.error('Error importing recipe', { 
      error: error.message, 
      title: recipe.title 
    })
    return { 
      success: false, 
      error: `Unexpected error: ${error.message}` 
    }
  }
}

/**
 * Import recipes from Spoonacular recipe details
 */
export async function importRecipesFromSpoonacular(
  spoonacularRecipes: SpoonacularRecipeDetails[],
  options: ImportOptions,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
    recipeIds: []
  }
  
  try {
    logger.info('Starting recipe import', { 
      count: spoonacularRecipes.length, 
      options 
    })
    
    // Transform recipes
    const transformedRecipes = transformMultipleRecipes(spoonacularRecipes, options.creatorId)
    
    if (transformedRecipes.length === 0) {
      result.success = false
      result.errors.push('No valid recipes to import after transformation')
      return result
    }
    
    // Process in batches
    const batchSize = options.batchSize || 10
    const batches = []
    
    for (let i = 0; i < transformedRecipes.length; i += batchSize) {
      batches.push(transformedRecipes.slice(i, i + batchSize))
    }
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      
      logger.info('Processing batch', { 
        batchIndex: batchIndex + 1, 
        totalBatches: batches.length,
        batchSize: batch.length 
      })
      
      // Process batch with transaction-like behavior
      const batchResults = await Promise.allSettled(
        batch.map(recipe => importSingleRecipe(recipe, options))
      )
      
      // Process results
      for (let i = 0; i < batchResults.length; i++) {
        const recipe = batch[i]
        const batchResult = batchResults[i]
        
        // Update progress
        if (onProgress) {
          onProgress({
            total: transformedRecipes.length,
            processed: (batchIndex * batchSize) + i + 1,
            imported: result.imported,
            failed: result.failed,
            currentRecipe: recipe.title
          })
        }
        
        if (batchResult.status === 'fulfilled') {
          const importResult = batchResult.value
          if (importResult.success) {
            result.imported++
            if (importResult.recipeId && importResult.recipeId !== 'dry-run-id') {
              result.recipeIds.push(importResult.recipeId)
            }
          } else {
            result.failed++
            result.errors.push(`${recipe.title}: ${importResult.error}`)
          }
        } else {
          result.failed++
          result.errors.push(`${recipe.title}: ${batchResult.reason}`)
        }
      }
      
      // Small delay between batches to avoid overwhelming the database
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    result.success = result.failed === 0
    
    logger.info('Recipe import completed', {
      total: transformedRecipes.length,
      imported: result.imported,
      failed: result.failed,
      success: result.success
    })
    
    return result
    
  } catch (error) {
    logger.error('Recipe import failed', { error: error.message })
    result.success = false
    result.errors.push(`Import failed: ${error.message}`)
    return result
  }
}

/**
 * Import recipes by Spoonacular IDs
 */
export async function importRecipesByIds(
  spoonacularIds: number[],
  options: ImportOptions,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    logger.info('Fetching recipe details from Spoonacular', { ids: spoonacularIds })
    
    // Fetch recipe details from Spoonacular
    const spoonacularRecipes = await getMultipleRecipeDetails(spoonacularIds)
    
    if (spoonacularRecipes.length === 0) {
      return {
        success: false,
        imported: 0,
        failed: 0,
        errors: ['No recipes found for the provided IDs'],
        recipeIds: []
      }
    }
    
    // Import the recipes
    return await importRecipesFromSpoonacular(spoonacularRecipes, options, onProgress)
    
  } catch (error) {
    logger.error('Error importing recipes by IDs', { error: error.message })
    return {
      success: false,
      imported: 0,
      failed: 0,
      errors: [`Failed to fetch recipes: ${error.message}`],
      recipeIds: []
    }
  }
}

/**
 * Get import statistics
 */
export async function getImportStats(creatorId: string): Promise<{
  totalRecipes: number
  importedToday: number
  importedThisWeek: number
  importedThisMonth: number
}> {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getFullYear(), now.getMonth() - 1, now.getDate())
    
    const [totalResult, todayResult, weekResult, monthResult] = await Promise.all([
      supabase
        .from('recipes')
        .select('id', { count: 'exact' })
        .eq('creator_id', creatorId),
      
      supabase
        .from('recipes')
        .select('id', { count: 'exact' })
        .eq('creator_id', creatorId)
        .gte('created_at', today.toISOString()),
      
      supabase
        .from('recipes')
        .select('id', { count: 'exact' })
        .eq('creator_id', creatorId)
        .gte('created_at', weekAgo.toISOString()),
      
      supabase
        .from('recipes')
        .select('id', { count: 'exact' })
        .eq('creator_id', creatorId)
        .gte('created_at', monthAgo.toISOString())
    ])
    
    return {
      totalRecipes: totalResult.count || 0,
      importedToday: todayResult.count || 0,
      importedThisWeek: weekResult.count || 0,
      importedThisMonth: monthResult.count || 0
    }
    
  } catch (error) {
    logger.error('Error getting import stats', { error: error.message })
    return {
      totalRecipes: 0,
      importedToday: 0,
      importedThisWeek: 0,
      importedThisMonth: 0
    }
  }
}

/**
 * Clean up failed imports (remove recipes that failed validation)
 */
export async function cleanupFailedImports(creatorId: string): Promise<{
  cleaned: number
  errors: string[]
}> {
  try {
    // This would be implemented based on your specific cleanup needs
    // For now, return empty result
    return {
      cleaned: 0,
      errors: []
    }
  } catch (error) {
    logger.error('Error cleaning up failed imports', { error: error.message })
    return {
      cleaned: 0,
      errors: [`Cleanup failed: ${error.message}`]
    }
  }
}
