#!/usr/bin/env node

/**
 * NIBBBLE Recipe Import Script
 * 
 * This script imports recipes from Spoonacular API into the NIBBBLE database.
 * 
 * Usage:
 *   node scripts/import-recipes.js --cuisine=italian --count=20
 *   node scripts/import-recipes.js --cuisine=mexican,asian --count=10 --dry-run
 *   node scripts/import-recipes.js --ids=123,456,789
 * 
 * Options:
 *   --cuisine: Comma-separated list of cuisines (italian, mexican, asian, etc.)
 *   --count: Number of recipes to import (default: 10, max: 100)
 *   --ids: Comma-separated list of Spoonacular recipe IDs
 *   --creator-id: User ID to assign as creator (required)
 *   --dry-run: Test mode, don't actually import
 *   --batch-size: Number of recipes to process in each batch (default: 10)
 *   --skip-duplicates: Skip recipes that already exist
 *   --verbose: Enable verbose logging
 */

const { searchRecipes, getRecipeDetails, getMultipleRecipeDetails, getRateLimitStatus } = require('../lib/services/spoonacular-api')
const { importRecipesFromSpoonacular, importRecipesByIds, getImportStats } = require('../lib/services/recipe-import')

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    cuisine: null,
    count: 10,
    ids: null,
    creatorId: null,
    dryRun: false,
    batchSize: 10,
    skipDuplicates: true,
    verbose: false
  }
  
  for (const arg of args) {
    if (arg.startsWith('--cuisine=')) {
      options.cuisine = arg.split('=')[1].split(',').map(c => c.trim())
    } else if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1])
    } else if (arg.startsWith('--ids=')) {
      options.ids = arg.split('=')[1].split(',').map(id => parseInt(id.trim()))
    } else if (arg.startsWith('--creator-id=')) {
      options.creatorId = arg.split('=')[1]
    } else if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg.startsWith('--batch-size=')) {
      options.batchSize = parseInt(arg.split('=')[1])
    } else if (arg === '--skip-duplicates') {
      options.skipDuplicates = true
    } else if (arg === '--verbose') {
      options.verbose = true
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
  }
  
  return options
}

function printHelp() {
  console.log(`
NIBBBLE Recipe Import Script

Usage:
  node scripts/import-recipes.js [options]

Options:
  --cuisine=<cuisines>    Comma-separated list of cuisines (italian, mexican, asian, etc.)
  --count=<number>        Number of recipes to import (default: 10, max: 100)
  --ids=<ids>             Comma-separated list of Spoonacular recipe IDs
  --creator-id=<id>       User ID to assign as creator (required)
  --dry-run               Test mode, don't actually import
  --batch-size=<number>   Number of recipes to process in each batch (default: 10)
  --skip-duplicates       Skip recipes that already exist (default: true)
  --verbose               Enable verbose logging
  --help, -h              Show this help message

Examples:
  # Import 20 Italian recipes
  node scripts/import-recipes.js --cuisine=italian --count=20 --creator-id=user123

  # Import recipes by specific IDs
  node scripts/import-recipes.js --ids=123,456,789 --creator-id=user123

  # Test import without actually saving
  node scripts/import-recipes.js --cuisine=mexican --count=5 --dry-run --creator-id=user123

  # Import multiple cuisines
  node scripts/import-recipes.js --cuisine=italian,mexican,asian --count=10 --creator-id=user123
`)
}

function log(message, level = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`
  console.log(`${prefix} ${message}`)
}

function logVerbose(message, options) {
  if (options.verbose) {
    log(message, 'debug')
  }
}

async function validateOptions(options) {
  const errors = []
  
  if (!options.creatorId) {
    errors.push('--creator-id is required')
  }
  
  if (!options.cuisine && !options.ids) {
    errors.push('Either --cuisine or --ids must be specified')
  }
  
  if (options.count && (options.count < 1 || options.count > 100)) {
    errors.push('--count must be between 1 and 100')
  }
  
  if (options.batchSize && (options.batchSize < 1 || options.batchSize > 50)) {
    errors.push('--batch-size must be between 1 and 50')
  }
  
  if (errors.length > 0) {
    console.error('Validation errors:')
    errors.forEach(error => console.error(`  - ${error}`))
    console.error('\nUse --help for usage information')
    process.exit(1)
  }
}

async function checkRateLimit() {
  try {
    const rateLimit = getRateLimitStatus()
    log(`Rate limit status: ${rateLimit.requestsRemaining} requests remaining`)
    
    if (rateLimit.requestsRemaining < 10) {
      log('WARNING: Low API requests remaining. Consider reducing batch size.', 'warn')
    }
    
    return rateLimit
  } catch (error) {
    log(`Error checking rate limit: ${error.message}`, 'error')
    return null
  }
}

async function importByCuisine(options) {
  log(`Starting import for cuisines: ${options.cuisine.join(', ')}`)
  log(`Count: ${options.count}, Dry run: ${options.dryRun}`)
  
  const allRecipes = []
  
  for (const cuisine of options.cuisine) {
    log(`Searching for ${cuisine} recipes...`)
    
    try {
      const searchParams = {
        cuisine: cuisine,
        number: Math.min(options.count, 100),
        addRecipeInformation: true,
        fillIngredients: true
      }
      
      const searchResponse = await searchRecipes(searchParams)
      log(`Found ${searchResponse.results.length} ${cuisine} recipes`)
      
      // Get detailed information for each recipe
      const recipeIds = searchResponse.results.map(recipe => recipe.id)
      const detailedRecipes = await getMultipleRecipeDetails(recipeIds)
      
      allRecipes.push(...detailedRecipes)
      logVerbose(`Retrieved details for ${detailedRecipes.length} ${cuisine} recipes`, options)
      
    } catch (error) {
      log(`Error searching for ${cuisine} recipes: ${error.message}`, 'error')
    }
  }
  
  if (allRecipes.length === 0) {
    log('No recipes found to import', 'warn')
    return
  }
  
  log(`Total recipes to import: ${allRecipes.length}`)
  
  // Import the recipes
  const importOptions = {
    batchSize: options.batchSize,
    skipDuplicates: options.skipDuplicates,
    dryRun: options.dryRun,
    creatorId: options.creatorId
  }
  
  const onProgress = (progress) => {
    const percentage = Math.round((progress.processed / progress.total) * 100)
    log(`Progress: ${percentage}% (${progress.processed}/${progress.total}) - ${progress.currentRecipe}`)
  }
  
  const result = await importRecipesFromSpoonacular(allRecipes, importOptions, onProgress)
  
  log(`Import completed: ${result.imported} imported, ${result.failed} failed`)
  
  if (result.errors.length > 0) {
    log('Errors encountered:', 'warn')
    result.errors.forEach(error => log(`  - ${error}`, 'warn'))
  }
}

async function importByIds(options) {
  log(`Starting import for recipe IDs: ${options.ids.join(', ')}`)
  log(`Dry run: ${options.dryRun}`)
  
  const importOptions = {
    batchSize: options.batchSize,
    skipDuplicates: options.skipDuplicates,
    dryRun: options.dryRun,
    creatorId: options.creatorId
  }
  
  const onProgress = (progress) => {
    const percentage = Math.round((progress.processed / progress.total) * 100)
    log(`Progress: ${percentage}% (${progress.processed}/${progress.total}) - ${progress.currentRecipe}`)
  }
  
  const result = await importRecipesByIds(options.ids, importOptions, onProgress)
  
  log(`Import completed: ${result.imported} imported, ${result.failed} failed`)
  
  if (result.errors.length > 0) {
    log('Errors encountered:', 'warn')
    result.errors.forEach(error => log(`  - ${error}`, 'warn'))
  }
}

async function showImportStats(creatorId) {
  try {
    const stats = await getImportStats(creatorId)
    log('Import Statistics:')
    log(`  Total recipes: ${stats.totalRecipes}`)
    log(`  Imported today: ${stats.importedToday}`)
    log(`  Imported this week: ${stats.importedThisWeek}`)
    log(`  Imported this month: ${stats.importedThisMonth}`)
  } catch (error) {
    log(`Error getting import stats: ${error.message}`, 'error')
  }
}

async function main() {
  try {
    const options = parseArgs()
    
    log('NIBBBLE Recipe Import Script Starting...')
    logVerbose(`Options: ${JSON.stringify(options, null, 2)}`, options)
    
    await validateOptions(options)
    
    // Check rate limit
    await checkRateLimit()
    
    // Show current stats
    await showImportStats(options.creatorId)
    
    // Perform import
    if (options.ids) {
      await importByIds(options)
    } else if (options.cuisine) {
      await importByCuisine(options)
    }
    
    // Show final stats
    log('Final Statistics:')
    await showImportStats(options.creatorId)
    
    log('Import script completed successfully!')
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error')
    logVerbose(`Stack trace: ${error.stack}`, { verbose: true })
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

// Run the script
if (require.main === module) {
  main()
}

module.exports = {
  parseArgs,
  validateOptions,
  importByCuisine,
  importByIds,
  showImportStats
}
