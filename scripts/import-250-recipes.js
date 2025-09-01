const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.development.local' })

// Use the correct Supabase project (tsqtruntoqahnewlotka)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY

if (!supabaseUrl || !supabaseServiceKey || !SPOONACULAR_API_KEY) {
  console.error('Missing required environment variables')
  console.error('SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
  console.error('SERVICE_KEY:', supabaseServiceKey ? '✅ Found' : '❌ Missing')
  console.error('SPOONACULAR_KEY:', SPOONACULAR_API_KEY ? '✅ Found' : '❌ Missing')
  process.exit(1)
}

console.log('✅ Environment variables loaded successfully')
console.log('SUPABASE_URL:', supabaseUrl)
console.log('SPOONACULAR_KEY:', SPOONACULAR_API_KEY ? '✅ Found' : '❌ Missing')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Popular recipe categories for Alpha Launch
const POPULAR_CATEGORIES = [
  'italian', 'mexican', 'chinese', 'japanese', 'indian', 'thai', 'french', 
  'mediterranean', 'american', 'greek', 'spanish', 'korean', 'vietnamese'
]

const POPULAR_DIETS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb'
]

const POPULAR_TYPES = [
  'main course', 'breakfast', 'dessert', 'appetizer', 'soup', 'salad', 'side dish'
]

async function importRecipes() {
  try {
    console.log('🚀 Starting Alpha Launch Recipe Import (Target: 250 recipes)')
    
    let totalImported = 0
    const batchSize = 20 // Spoonacular allows up to 20 per request
    
    // First, check how many recipes we already have
    const { count: existingCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Current recipe count: ${existingCount}`)
    
    if (existingCount >= 250) {
      console.log('✅ Already have 250+ recipes! Alpha Launch ready!')
      return
    }
    
    const targetRecipes = 250 - existingCount
    console.log(`🎯 Need to import ${targetRecipes} more recipes`)
    
    // Import recipes from multiple categories to ensure variety
    for (const category of POPULAR_CATEGORIES) {
      if (totalImported >= targetRecipes) break
      
      console.log(`\n🍕 Importing ${category} recipes...`)
      
      for (let offset = 0; offset < 100; offset += batchSize) {
        if (totalImported >= targetRecipes) break
        
        try {
          const recipes = await fetchRecipesFromSpoonacular({
            cuisine: category,
            number: Math.min(batchSize, targetRecipes - totalImported),
            offset: offset
          })
          
          if (!recipes || recipes.length === 0) break
          
          const imported = await saveRecipesToDatabase(recipes)
          totalImported += imported
          
          console.log(`  ✅ Imported ${imported} ${category} recipes (Total: ${totalImported}/${targetRecipes})`)
          
          // Rate limiting - Spoonacular allows 150 requests per day
          await sleep(1000) // 1 second delay between requests
          
        } catch (error) {
          console.error(`  ❌ Error importing ${category} recipes:`, error.message)
          continue
        }
      }
    }
    
    // If we still need more recipes, try popular types
    if (totalImported < targetRecipes) {
      console.log('\n🍽️ Importing recipes by type...')
      
      for (const type of POPULAR_TYPES) {
        if (totalImported >= targetRecipes) break
        
        try {
          const recipes = await fetchRecipesFromSpoonacular({
            type: type,
            number: Math.min(batchSize, targetRecipes - totalImported),
            offset: 0
          })
          
          if (!recipes || recipes.length === 0) break
          
          const imported = await saveRecipesToDatabase(recipes)
          totalImported += imported
          
          console.log(`  ✅ Imported ${imported} ${type} recipes (Total: ${totalImported}/${targetRecipes})`)
          await sleep(1000)
          
        } catch (error) {
          console.error(`  ❌ Error importing ${type} recipes:`, error.message)
          continue
        }
      }
    }
    
    // Final count
    const { count: finalCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n🎉 Alpha Launch Recipe Import Complete!`)
    console.log(`📊 Final recipe count: ${finalCount}`)
    console.log(`✅ Alpha Launch Ready: ${finalCount >= 250 ? 'YES' : 'NO'}`)
    
    if (finalCount < 250) {
      console.log(`⚠️  Still need ${250 - finalCount} more recipes`)
      console.log(`💡 Consider running this script again or manually adding recipes`)
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error)
  }
}

async function fetchRecipesFromSpoonacular(params) {
  try {
    console.log(`    🔍 Fetching recipes with params:`, params)
    
    const queryParams = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      ...params,
      addRecipeInformation: 'true',
      addRecipeNutrition: 'true',
      fillIngredients: 'true',
      instructionsRequired: 'true'
    })
    
    const url = `https://api.spoonacular.com/recipes/complexSearch?${queryParams}`
    console.log(`    🌐 Calling: ${url}`)
    
    const response = await fetch(url, { 
      headers: { 'Accept': 'application/json' } 
    })
    
    console.log(`    📡 Response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`    ❌ Spoonacular API error: ${response.status} - ${errorText}`)
      throw new Error(`Spoonacular API error: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log(`    📊 Received ${data.results?.length || 0} recipes`)
    
    if (!data.results || data.results.length === 0) {
      console.log(`    ⚠️  No recipes returned for params:`, params)
    }
    
    return data.results || []
  } catch (error) {
    console.error(`    ❌ Error in fetchRecipesFromSpoonacular:`, error.message)
    throw error
  }
}

async function saveRecipesToDatabase(recipes) {
  let imported = 0
  
  for (const recipe of recipes) {
    try {
      // Check if recipe already exists
      const { data: existing } = await supabase
        .from('recipes')
        .select('id')
        .eq('title', recipe.title)
        .single()
      
      if (existing) {
        console.log(`    ⚠️  Recipe "${recipe.title}" already exists, skipping`)
        continue
      }
      
      // Transform recipe data
      const recipeData = {
        title: recipe.title,
        description: recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '').substring(0, 500) : null,
        ingredients: recipe.extendedIngredients?.map(ing => `${ing.amount} ${ing.unit} ${ing.name}`) || [],
        instructions: recipe.analyzedInstructions?.[0]?.steps?.map(step => step.step) || [],
        cook_time: recipe.cookingMinutes || 30,
        prep_time: recipe.preparationMinutes || 15,
        difficulty: determineDifficulty(recipe.cookingMinutes || 30, recipe.preparationMinutes || 15, 
                                     recipe.analyzedInstructions?.[0]?.steps?.length || 0,
                                     recipe.extendedIngredients?.length || 0),
        cuisine: recipe.cuisines?.[0] || 'International',
        tags: [
          ...(recipe.dishTypes || []),
          ...(recipe.diets || []),
          ...(recipe.occasions || []),
          `calories:${Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0)}`,
          `protein_g:${Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0)}`,
          `fats_g:${Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Total Fat')?.amount || 0)}`,
          `carbs_g:${Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0)}`
        ].filter(Boolean),
        image_url: recipe.image,
        creator_id: '00000000-0000-0000-0000-000000000000', // System user
        rating: recipe.spoonacularScore ? (recipe.spoonacularScore / 20) : 0, // Convert 0-100 to 0-5
        likes_count: recipe.aggregateLikes || 0,
        views_count: 0,
        is_public: true
      }
      
      const { error } = await supabase
        .from('recipes')
        .insert(recipeData)
      
      if (error) {
        console.error(`    ❌ Error saving recipe "${recipe.title}":`, error.message)
        continue
      }
      
      imported++
      console.log(`    ✅ Saved: ${recipe.title}`)
      
    } catch (error) {
      console.error(`    ❌ Error processing recipe:`, error.message)
      continue
    }
  }
  
  return imported
}

function determineDifficulty(prepTime, cookTime, instructionCount, ingredientCount) {
  const totalTime = prepTime + cookTime
  const complexity = instructionCount + (ingredientCount * 0.5)
  
  if (totalTime <= 30 && complexity <= 8) return 'Easy'
  if (totalTime <= 60 && complexity <= 15) return 'Medium'
  return 'Hard'
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Run the import
importRecipes()
