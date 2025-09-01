#!/usr/bin/env node

/**
 * Quick test script to import a few recipes from Spoonacular
 * This will help us verify the API integration is working
 */

const { searchRecipes, getMultipleRecipeDetails } = require('../lib/services/spoonacular-api')
const { importRecipesFromSpoonacular } = require('../lib/services/recipe-import')

async function testImport() {
  try {
    console.log('🚀 Starting test import...')
    
    // Test user ID (you'll need to replace this with a real user ID)
    const testUserId = 'test-user-123'
    
    console.log('📡 Searching for Italian recipes...')
    
    // Search for some Italian recipes
    const searchResponse = await searchRecipes({
      cuisine: 'italian',
      number: 5,
      addRecipeInformation: true,
      fillIngredients: true
    })
    
    console.log(`✅ Found ${searchResponse.results.length} Italian recipes`)
    
    if (searchResponse.results.length === 0) {
      console.log('❌ No recipes found. Check API key and rate limits.')
      return
    }
    
    // Get detailed information for each recipe
    const recipeIds = searchResponse.results.map(recipe => recipe.id)
    console.log(`📋 Getting details for recipes: ${recipeIds.join(', ')}`)
    
    const detailedRecipes = await getMultipleRecipeDetails(recipeIds)
    console.log(`✅ Retrieved details for ${detailedRecipes.length} recipes`)
    
    // Import the recipes
    console.log('💾 Importing recipes to database...')
    
    const importOptions = {
      batchSize: 5,
      skipDuplicates: true,
      dryRun: false, // Set to true to test without actually importing
      creatorId: testUserId
    }
    
    const result = await importRecipesFromSpoonacular(detailedRecipes, importOptions, (progress) => {
      const percentage = Math.round((progress.processed / progress.total) * 100)
      console.log(`📊 Progress: ${percentage}% (${progress.processed}/${progress.total}) - ${progress.currentRecipe}`)
    })
    
    console.log('📊 Import Results:')
    console.log(`  ✅ Imported: ${result.imported}`)
    console.log(`  ❌ Failed: ${result.failed}`)
    console.log(`  🎯 Success: ${result.success}`)
    
    if (result.errors.length > 0) {
      console.log('⚠️  Errors:')
      result.errors.forEach(error => console.log(`    - ${error}`))
    }
    
    if (result.imported > 0) {
      console.log('🎉 Test import completed successfully!')
      console.log('🔍 Check the Discover page to see the imported recipes.')
    } else {
      console.log('❌ No recipes were imported. Check the errors above.')
    }
    
  } catch (error) {
    console.error('💥 Test import failed:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the test
testImport()
