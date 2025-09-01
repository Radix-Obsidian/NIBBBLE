#!/usr/bin/env node

/**
 * Initial Recipe Import Script
 * 
 * This script imports a small batch of recipes from Spoonacular to populate the database
 * for testing the Discover page.
 */

const { searchRecipes, getMultipleRecipeDetails } = require('../lib/services/spoonacular-api')
const { importRecipesFromSpoonacular } = require('../lib/services/recipe-import')

async function importInitialRecipes() {
  try {
    console.log('🚀 Starting initial recipe import...')
    
    // Test creator ID (you'll need to replace this with a real user ID)
    const creatorId = 'test-user-123'
    
    // Search for popular recipes from different cuisines
    const cuisines = ['italian', 'mexican', 'american', 'asian']
    const allRecipes = []
    
    for (const cuisine of cuisines) {
      console.log(`🔍 Searching for ${cuisine} recipes...`)
      
      try {
        const searchParams = {
          cuisine: cuisine,
          number: 5, // 5 recipes per cuisine = 20 total
          addRecipeInformation: true,
          fillIngredients: true,
          sort: 'popularity'
        }
        
        const searchResponse = await searchRecipes(searchParams)
        console.log(`✅ Found ${searchResponse.results.length} ${cuisine} recipes`)
        
        // Get detailed information for each recipe
        const recipeIds = searchResponse.results.map(recipe => recipe.id)
        const detailedRecipes = await getMultipleRecipeDetails(recipeIds)
        
        allRecipes.push(...detailedRecipes)
        console.log(`📋 Retrieved details for ${detailedRecipes.length} ${cuisine} recipes`)
        
      } catch (error) {
        console.error(`❌ Error searching for ${cuisine} recipes:`, error.message)
      }
    }
    
    if (allRecipes.length === 0) {
      console.log('❌ No recipes found to import')
      return
    }
    
    console.log(`📦 Total recipes to import: ${allRecipes.length}`)
    
    // Import the recipes
    const importOptions = {
      batchSize: 5,
      skipDuplicates: true,
      dryRun: false, // Set to true for testing
      creatorId: creatorId
    }
    
    const onProgress = (progress) => {
      const percentage = Math.round((progress.processed / progress.total) * 100)
      console.log(`📊 Progress: ${percentage}% (${progress.processed}/${progress.total}) - ${progress.currentRecipe}`)
    }
    
    const result = await importRecipesFromSpoonacular(allRecipes, importOptions, onProgress)
    
    console.log('🎉 Import completed!')
    console.log(`✅ Imported: ${result.imported}`)
    console.log(`❌ Failed: ${result.failed}`)
    
    if (result.errors.length > 0) {
      console.log('⚠️  Errors encountered:')
      result.errors.forEach(error => console.log(`  - ${error}`))
    }
    
    console.log('✨ Initial recipe import completed successfully!')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  importInitialRecipes()
}

module.exports = { importInitialRecipes }
