const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.development.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanImageUrls() {
  try {
    console.log('🧹 Cleaning image URLs in database...')
    
    // Get all recipes with image URLs
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('id, title, image_url')
      .not('image_url', 'is', null)
    
    if (error) {
      console.error('❌ Error fetching recipes:', error)
      return
    }
    
    console.log(`📊 Found ${recipes.length} recipes with images to clean`)
    
    let cleaned = 0
    let skipped = 0
    
    for (const recipe of recipes) {
      if (!recipe.image_url) {
        skipped++
        continue
      }
      
      // Clean the URL by removing query parameters
      const cleanUrl = recipe.image_url.split('?')[0]
      
      if (cleanUrl !== recipe.image_url) {
        try {
          // Update the recipe with clean URL
          const { error: updateError } = await supabase
            .from('recipes')
            .update({ image_url: cleanUrl })
            .eq('id', recipe.id)
          
          if (!updateError) {
            cleaned++
            console.log(`  ✅ Cleaned: ${recipe.title}`)
            console.log(`     Before: ${recipe.image_url.substring(0, 80)}...`)
            console.log(`     After:  ${cleanUrl}`)
          } else {
            console.log(`  ❌ Error updating ${recipe.title}: ${updateError.message}`)
          }
        } catch (error) {
          console.log(`  ❌ Error processing ${recipe.title}: ${error.message}`)
        }
      } else {
        skipped++
        console.log(`  ⏭️  Already clean: ${recipe.title}`)
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log(`\n🎉 Image URL cleaning complete!`)
    console.log(`  Cleaned: ${cleaned} recipes`)
    console.log(`  Skipped: ${skipped} recipes (already clean)`)
    console.log(`  Total: ${recipes.length} recipes`)
    
    // Show a few examples of cleaned URLs
    if (cleaned > 0) {
      console.log(`\n📸 Example cleaned URLs:`)
      const { data: sampleRecipes } = await supabase
        .from('recipes')
        .select('title, image_url')
        .not('image_url', 'is', null)
        .limit(3)
      
      sampleRecipes?.forEach(recipe => {
        console.log(`  ${recipe.title}: ${recipe.image_url}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Cleaning failed:', error)
  }
}

cleanImageUrls()
