#!/usr/bin/env node

/**
 * Test Script for Spoonacular API Integration
 * 
 * This script tests the Spoonacular API integration without importing to database.
 * 
 * Usage:
 *   node scripts/test-spoonacular.js
 */

const { searchRecipes, getRecipeDetails, getRateLimitStatus } = require('../lib/services/spoonacular-api')
const { transformSpoonacularRecipe } = require('../lib/services/recipe-transform')

function log(message, level = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`
  console.log(`${prefix} ${message}`)
}

async function testRateLimit() {
  log('Testing rate limit status...')
  try {
    const rateLimit = getRateLimitStatus()
    log(`Rate limit status: ${rateLimit.requestsRemaining} requests remaining`)
    log(`Requests used: ${rateLimit.requestsUsed}`)
    log(`Reset time: ${rateLimit.resetTime}`)
    return true
  } catch (error) {
    log(`Error checking rate limit: ${error.message}`, 'error')
    return false
  }
}

async function testSearchRecipes() {
  log('Testing recipe search...')
  try {
    const searchParams = {
      cuisine: 'italian',
      number: 5,
      addRecipeInformation: true,
      fillIngredients: true
    }
    
    const response = await searchRecipes(searchParams)
    log(`Found ${response.results.length} Italian recipes`)
    
    if (response.results.length > 0) {
      const firstRecipe = response.results[0]
      log(`First recipe: ${firstRecipe.title}`)
      log(`Ready in: ${firstRecipe.readyInMinutes} minutes`)
      log(`Servings: ${firstRecipe.servings}`)
    }
    
    return response.results
  } catch (error) {
    log(`Error searching recipes: ${error.message}`, 'error')
    return []
  }
}

async function testGetRecipeDetails(recipeId) {
  log(`Testing recipe details for ID: ${recipeId}`)
  try {
    const details = await getRecipeDetails(recipeId)
    log(`Recipe details retrieved: ${details.title}`)
    log(`Ingredients count: ${details.extendedIngredients.length}`)
    log(`Instructions count: ${details.analyzedInstructions.length}`)
    log(`Cuisines: ${details.cuisines.join(', ')}`)
    log(`Diets: ${details.diets.join(', ')}`)
    log(`Dish types: ${details.dishTypes.join(', ')}`)
    
    return details
  } catch (error) {
    log(`Error getting recipe details: ${error.message}`, 'error')
    return null
  }
}

async function testTransformRecipe(recipeDetails) {
  log('Testing recipe transformation...')
  try {
    const transformed = transformSpoonacularRecipe(recipeDetails, 'test-creator-id')
    
    log(`Transformed recipe: ${transformed.title}`)
    log(`Difficulty: ${transformed.difficulty}`)
    log(`Cuisine: ${transformed.cuisine}`)
    log(`Cook time: ${transformed.cook_time} minutes`)
    log(`Prep time: ${transformed.prep_time} minutes`)
    log(`Ingredients: ${transformed.ingredients.length}`)
    log(`Instructions: ${transformed.instructions.length}`)
    log(`Tags: ${transformed.tags.join(', ')}`)
    
    // Show first few ingredients
    if (transformed.ingredients.length > 0) {
      log('First 3 ingredients:')
      transformed.ingredients.slice(0, 3).forEach((ingredient, index) => {
        log(`  ${index + 1}. ${ingredient}`)
      })
    }
    
    // Show first few instructions
    if (transformed.instructions.length > 0) {
      log('First 3 instructions:')
      transformed.instructions.slice(0, 3).forEach((instruction, index) => {
        log(`  ${index + 1}. ${instruction}`)
      })
    }
    
    return transformed
  } catch (error) {
    log(`Error transforming recipe: ${error.message}`, 'error')
    return null
  }
}

async function testMultipleCuisines() {
  log('Testing multiple cuisines...')
  const cuisines = ['italian', 'mexican', 'asian']
  const results = {}
  
  for (const cuisine of cuisines) {
    try {
      log(`Searching for ${cuisine} recipes...`)
      const searchParams = {
        cuisine: cuisine,
        number: 3,
        addRecipeInformation: true,
        fillIngredients: true
      }
      
      const response = await searchRecipes(searchParams)
      results[cuisine] = response.results.length
      log(`Found ${response.results.length} ${cuisine} recipes`)
      
    } catch (error) {
      log(`Error searching ${cuisine} recipes: ${error.message}`, 'error')
      results[cuisine] = 0
    }
  }
  
  return results
}

async function main() {
  try {
    log('Starting Spoonacular API Integration Test...')
    
    // Test 1: Rate limit
    const rateLimitOk = await testRateLimit()
    if (!rateLimitOk) {
      log('Rate limit test failed, stopping tests', 'error')
      return
    }
    
    // Test 2: Search recipes
    const searchResults = await testSearchRecipes()
    if (searchResults.length === 0) {
      log('No recipes found in search, stopping tests', 'error')
      return
    }
    
    // Test 3: Get recipe details
    const firstRecipeId = searchResults[0].id
    const recipeDetails = await testGetRecipeDetails(firstRecipeId)
    if (!recipeDetails) {
      log('Failed to get recipe details, stopping tests', 'error')
      return
    }
    
    // Test 4: Transform recipe
    const transformedRecipe = await testTransformRecipe(recipeDetails)
    if (!transformedRecipe) {
      log('Failed to transform recipe, stopping tests', 'error')
      return
    }
    
    // Test 5: Multiple cuisines
    const multiCuisineResults = await testMultipleCuisines()
    log('Multiple cuisine test results:')
    Object.entries(multiCuisineResults).forEach(([cuisine, count]) => {
      log(`  ${cuisine}: ${count} recipes`)
    })
    
    // Final rate limit check
    log('Final rate limit status:')
    const finalRateLimit = getRateLimitStatus()
    log(`Requests remaining: ${finalRateLimit.requestsRemaining}`)
    log(`Requests used: ${finalRateLimit.requestsUsed}`)
    
    log('All tests completed successfully! ✅')
    
  } catch (error) {
    log(`Test failed with error: ${error.message}`, 'error')
    log(`Stack trace: ${error.stack}`, 'error')
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'error')
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection at: ${promise}, reason: ${reason}`, 'error')
  process.exit(1)
})

// Run the tests
if (require.main === module) {
  main()
}

module.exports = {
  testRateLimit,
  testSearchRecipes,
  testGetRecipeDetails,
  testTransformRecipe,
  testMultipleCuisines
}
