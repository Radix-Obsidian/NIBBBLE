#!/usr/bin/env node

/**
 * Quick Recipe Seeding Script
 * 
 * This script quickly seeds the database with sample recipes from Spoonacular
 * for testing and development purposes.
 * 
 * Usage:
 *   node scripts/seed-recipes.js
 */

const { searchRecipes, getMultipleRecipeDetails } = require('../lib/services/spoonacular-api')
const { importRecipesFromSpoonacular } = require('../lib/services/recipe-import')

function log(message, level = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`
  console.log(`${prefix} ${message}`)
}

async function seedRecipes() {
  try {
    log('Starting recipe seeding process...')
    
    const seedConfig = {
      cuisines: ['italian', 'mexican', 'asian', 'american'],
      recipesPerCuisine: 5,
      creatorId: 'system-seed'
    }
    
    const allRecipes = []
    
    // Import recipes from each cuisine
    for (const cuisine of seedConfig.cuisines) {
      try {
        log(`Seeding ${cuisine} recipes...`)
        
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
        log(`Found ${detailedRecipes.length} ${cuisine} recipes`)
        
      } catch (error) {
        log(`Error seeding ${cuisine} recipes: ${error.message}`, 'error')
        // Continue with other cuisines
      }
    }
    
    if (allRecipes.length === 0) {
      log('No recipes found to seed', 'error')
      return
    }
    
    log(`Total recipes to seed: ${allRecipes.length}`)
    
    // Import the recipes
    const importOptions = {
      batchSize: 10,
      skipDuplicates: true,
      dryRun: false,
      creatorId: seedConfig.creatorId
    }
    
    const onProgress = (progress) => {
      const percentage = Math.round((progress.processed / progress.total) * 100)
      log(`Progress: ${percentage}% (${progress.processed}/${progress.total}) - ${progress.currentRecipe}`)
    }
    
    const result = await importRecipesFromSpoonacular(allRecipes, importOptions, onProgress)
    
    log(`Recipe seeding completed: ${result.imported} imported, ${result.failed} failed`)
    
    if (result.errors.length > 0) {
      log('Errors encountered:', 'warn')
      result.errors.forEach(error => log(`  - ${error}`, 'warn'))
    }
    
    if (result.imported > 0) {
      log('✅ Successfully seeded recipes! You can now see them in the Discover tab.')
    } else {
      log('❌ No recipes were imported. Check the errors above.', 'error')
    }
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error')
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

// Run the seeding
if (require.main === module) {
  seedRecipes()
}

module.exports = { seedRecipes }
