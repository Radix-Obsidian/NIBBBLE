const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.development.local' })

// Multi-Provider Recipe Import System
// Primary: USDA_FoodData (Zero rate limits, completely free)
// Secondary: Edamam (30-day trial, then $9/month)
// Tertiary: FatSecret (International coverage)
// Fallback: Spoonacular (Already working, 50/day limit)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// API Keys for different providers
const API_KEYS = {
  USDA_FOODDATA: process.env.USDA_FOODDATA_API_KEY || null,
  EDAMAM_APP_ID: process.env.EDAMAM_APP_ID || null,
  EDAMAM_APP_KEY: process.env.EDAMAM_APP_KEY || null,
  FATSECRET: process.env.FATSECRET_API_KEY || null,
  SPOONACULAR: process.env.SPOONACULAR_API_KEY || null
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Provider priority and capabilities
const PROVIDERS = [
  {
    name: 'USDA_FoodData',
    priority: 1,
    rateLimit: 'unlimited',
    cost: 'free',
    nutrition: 'excellent',
    recipes: 'good',
    apiKey: API_KEYS.USDA_FOODDATA
  },
  {
    name: 'Edamam',
    priority: 2,
    rateLimit: '10k/month',
    cost: 'free_trial_30days',
    nutrition: 'excellent',
    recipes: 'excellent',
    apiKey: API_KEYS.EDAMAM_APP_ID && API_KEYS.EDAMAM_APP_KEY
  },
  {
    name: 'FatSecret',
    priority: 3,
    rateLimit: 'generous',
    cost: 'free_tier',
    nutrition: 'good',
    recipes: 'good',
    apiKey: API_KEYS.FATSECRET
  },
  {
    name: 'Spoonacular',
    priority: 4,
    rateLimit: '50/day',
    cost: 'free_tier',
    nutrition: 'excellent',
    recipes: 'excellent',
    apiKey: API_KEYS.SPOONACULAR
  }
]

// Filter available providers
const AVAILABLE_PROVIDERS = PROVIDERS.filter(p => p.apiKey)

console.log('🔌 Available Recipe Providers:')
AVAILABLE_PROVIDERS.forEach(p => {
  console.log(`  ${p.priority}. ${p.name} - ${p.rateLimit} - ${p.cost} - ${p.nutrition} nutrition`)
})

async function importRecipesMultiProvider() {
  try {
    console.log('\n🚀 Starting Multi-Provider Recipe Import (Target: 250 recipes)')
    
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
    
    let totalImported = 0
    
    // Try each provider in priority order
    for (const provider of AVAILABLE_PROVIDERS) {
      if (totalImported >= targetRecipes) break
      
      console.log(`\n🔌 Trying ${provider.name} (Priority: ${provider.priority})...`)
      
      try {
        const remainingNeeded = targetRecipes - totalImported
        const imported = await importFromProvider(provider, remainingNeeded)
        
        if (imported > 0) {
          totalImported += imported
          console.log(`  ✅ ${provider.name} imported ${imported} recipes (Total: ${totalImported}/${targetRecipes})`)
        } else {
          console.log(`  ⚠️  ${provider.name} returned no recipes, trying next provider...`)
        }
        
      } catch (error) {
        console.error(`  ❌ ${provider.name} failed:`, error.message)
        console.log(`  🔄 Falling back to next provider...`)
        continue
      }
    }
    
    // Final count
    const { count: finalCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n🎉 Multi-Provider Import Complete!`)
    console.log(`📊 Final recipe count: ${finalCount}`)
    console.log(`✅ Alpha Launch Ready: ${finalCount >= 250 ? 'YES' : 'NO'}`)
    
    if (finalCount < 250) {
      console.log(`⚠️  Still need ${250 - finalCount} more recipes`)
      console.log(`💡 Consider: 1) Running again tomorrow, 2) Adding more providers, 3) Manual entry`)
    }
    
  } catch (error) {
    console.error('❌ Multi-provider import failed:', error)
  }
}

async function importFromProvider(provider, count) {
  switch (provider.name) {
    case 'USDA_FoodData':
      return await importFromUSDA(count)
    case 'Edamam':
      return await importFromEdamam(count)
    case 'FatSecret':
      return await importFromFatSecret(count)
    case 'Spoonacular':
      return await importFromSpoonacular(count)
    default:
      throw new Error(`Unknown provider: ${provider.name}`)
  }
}

// Provider-specific import functions will go here...
async function importFromUSDA(count) {
  console.log(`    🥗 Importing ${count} recipes from USDA FoodData...`)
  // USDA implementation
  return 0 // Placeholder
}

async function importFromEdamam(count) {
  console.log(`    🍎 Importing ${count} recipes from Edamam...`)
  // Edamam implementation
  return 0 // Placeholder
}

async function importFromFatSecret(count) {
  console.log(`    🌍 Importing ${count} recipes from FatSecret...`)
  // FatSecret implementation
  return 0 // Placeholder
}

async function importFromSpoonacular(count) {
  console.log(`    🥘 Importing ${count} recipes from Spoonacular...`)
  // Spoonacular implementation
  return 0 // Placeholder
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Run the multi-provider import
importRecipesMultiProvider()
