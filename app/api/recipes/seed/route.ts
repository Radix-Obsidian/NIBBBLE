import { NextRequest, NextResponse } from 'next/server'
import { searchRecipes, getMultipleRecipeDetails } from '@/lib/services/spoonacular-api'
import { importRecipesFromSpoonacular } from '@/lib/services/recipe-import'
import { logger } from '@/lib/logger'

export const maxDuration = 60 // 1 minute

/**
 * Seed the database with initial recipes from Spoonacular
 * This endpoint imports a small batch of recipes from different cuisines
 */
export async function POST(request: NextRequest) {
  try {
    logger.info('Starting recipe seeding process')
    
    // Check if we have the required environment variables
    if (!process.env.SPOONACULAR_API_KEY) {
      logger.error('SPOONACULAR_API_KEY is not set')
      return NextResponse.json(
        { error: 'Spoonacular API key is not configured' },
        { status: 500 }
      )
    }
    
    // Default seeding configuration
    const seedConfig = {
      cuisines: ['italian', 'mexican', 'asian', 'american'],
      recipesPerCuisine: 5,
      creatorId: 'system-seed' // Use a system creator ID for seeded recipes
    }
    
    const allRecipes = []
    
    // Import recipes from each cuisine
    for (const cuisine of seedConfig.cuisines) {
      try {
        logger.info(`Seeding ${cuisine} recipes...`)
        
        const searchParams = {
          cuisine: cuisine,
          number: seedConfig.recipesPerCuisine,
          addRecipeInformation: true,
          fillIngredients: true
        }
        
        const searchResponse = await searchRecipes(searchParams)
        const recipeIds = searchResponse.results.map(recipe => recipe.id)
        const detailedRecipes = await getMultipleRecipeDetails(recipeIds)
        
        allRecipes.push(...detailedRecipes)
        logger.info(`Found ${detailedRecipes.length} ${cuisine} recipes`)
        
      } catch (error) {
        logger.error(`Error seeding ${cuisine} recipes`, { 
          error: error instanceof Error ? error.message : String(error)
        })
        // Continue with other cuisines
      }
    }
    
    if (allRecipes.length === 0) {
      return NextResponse.json(
        { error: 'No recipes found to seed' },
        { status: 404 }
      )
    }
    
    logger.info(`Total recipes to seed: ${allRecipes.length}`)
    
    // Import the recipes
    const importOptions = {
      batchSize: 10,
      skipDuplicates: true,
      dryRun: false,
      creatorId: seedConfig.creatorId
    }
    
    const result = await importRecipesFromSpoonacular(allRecipes, importOptions)
    
    logger.info('Recipe seeding completed', {
      imported: result.imported,
      failed: result.failed,
      success: result.success
    })
    
    return NextResponse.json({
      success: result.success,
      message: `Successfully seeded ${result.imported} recipes`,
      imported: result.imported,
      failed: result.failed,
      errors: result.errors,
      recipeIds: result.recipeIds
    })
    
  } catch (error) {
    logger.error('Recipe seeding failed', { 
      error: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      { 
        error: 'Recipe seeding failed',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Get seeding status
 */
export async function GET() {
  try {
    // Check if we already have recipes in the database
    const { supabase } = await import('@/lib/supabase/client')
    
    const { data, error } = await supabase
      .from('recipes')
      .select('id, title, cuisine')
      .limit(5)
    
    if (error) {
      logger.error('Error checking seeding status', { 
        error: error.message 
      })
      return NextResponse.json(
        { error: 'Failed to check seeding status' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      isSeeded: (data && data.length > 0),
      recipeCount: data?.length || 0,
      sampleRecipes: data || []
    })
    
  } catch (error) {
    logger.error('Error getting seeding status', { 
      error: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      { error: 'Failed to get seeding status' },
      { status: 500 }
    )
  }
}
