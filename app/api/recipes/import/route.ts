import { NextRequest, NextResponse } from 'next/server'
import { searchRecipes, getMultipleRecipeDetails, getRateLimitStatus } from '@/lib/services/spoonacular-api'
import { importRecipesFromSpoonacular, importRecipesByIds, getImportStats } from '@/lib/services/recipe-import'
import { logger } from '@/lib/logger'

export const maxDuration = 300 // 5 minutes

interface ImportRequest {
  type: 'cuisine' | 'ids'
  cuisines?: string[]
  ids?: number[]
  count?: number
  creatorId: string
  dryRun?: boolean
  batchSize?: number
  skipDuplicates?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json()
    
    // Validate request
    if (!body.creatorId) {
      return NextResponse.json(
        { error: 'creatorId is required' },
        { status: 400 }
      )
    }
    
    if (!body.type || !['cuisine', 'ids'].includes(body.type)) {
      return NextResponse.json(
        { error: 'type must be either "cuisine" or "ids"' },
        { status: 400 }
      )
    }
    
    if (body.type === 'cuisine' && (!body.cuisines || body.cuisines.length === 0)) {
      return NextResponse.json(
        { error: 'cuisines array is required when type is "cuisine"' },
        { status: 400 }
      )
    }
    
    if (body.type === 'ids' && (!body.ids || body.ids.length === 0)) {
      return NextResponse.json(
        { error: 'ids array is required when type is "ids"' },
        { status: 400 }
      )
    }
    
    logger.info('Recipe import request received', {
      type: body.type,
      cuisines: body.cuisines,
      ids: body.ids,
      count: body.count,
      creatorId: body.creatorId,
      dryRun: body.dryRun
    })
    
    // Check rate limit
    const rateLimit = getRateLimitStatus()
    if (rateLimit.requestsRemaining < 10) {
      return NextResponse.json(
        { 
          error: 'API rate limit low', 
          rateLimit,
          message: 'Please try again later or reduce the number of recipes to import'
        },
        { status: 429 }
      )
    }
    
    let result
    
    if (body.type === 'cuisine') {
      // Import by cuisine
      const allRecipes = []
      
      for (const cuisine of body.cuisines!) {
        try {
          const searchParams = {
            cuisine: cuisine,
            number: Math.min(body.count || 10, 100),
            addRecipeInformation: true,
            fillIngredients: true
          }
          
          const searchResponse = await searchRecipes(searchParams)
          const recipeIds = searchResponse.results.map(recipe => recipe.id)
          const detailedRecipes = await getMultipleRecipeDetails(recipeIds)
          
          allRecipes.push(...detailedRecipes)
          
        } catch (error) {
          logger.error('Error searching for recipes', { 
            cuisine, 
            error: error instanceof Error ? error.message : String(error)
          })
          // Continue with other cuisines
        }
      }
      
      if (allRecipes.length === 0) {
        return NextResponse.json(
          { error: 'No recipes found for the specified cuisines' },
          { status: 404 }
        )
      }
      
      const importOptions = {
        batchSize: body.batchSize || 10,
        skipDuplicates: body.skipDuplicates !== false,
        dryRun: body.dryRun || false,
        creatorId: body.creatorId
      }
      
      result = await importRecipesFromSpoonacular(allRecipes, importOptions)
      
    } else {
      // Import by IDs
      const importOptions = {
        batchSize: body.batchSize || 10,
        skipDuplicates: body.skipDuplicates !== false,
        dryRun: body.dryRun || false,
        creatorId: body.creatorId
      }
      
      result = await importRecipesByIds(body.ids!, importOptions)
    }
    
    // Get updated stats
    const stats = await getImportStats(body.creatorId)
    
    logger.info('Recipe import completed', {
      imported: result.imported,
      failed: result.failed,
      success: result.success,
      creatorId: body.creatorId
    })
    
    return NextResponse.json({
      success: result.success,
      imported: result.imported,
      failed: result.failed,
      errors: result.errors,
      recipeIds: result.recipeIds,
      stats,
      rateLimit: getRateLimitStatus()
    })
    
  } catch (error) {
    logger.error('Recipe import API error', { 
      error: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get('creatorId')
    
    if (!creatorId) {
      return NextResponse.json(
        { error: 'creatorId query parameter is required' },
        { status: 400 }
      )
    }
    
    const stats = await getImportStats(creatorId)
    const rateLimit = getRateLimitStatus()
    
    return NextResponse.json({
      stats,
      rateLimit
    })
    
  } catch (error) {
    logger.error('Error getting import stats', { 
      error: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
