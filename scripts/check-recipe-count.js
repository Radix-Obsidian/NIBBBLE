const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.development.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRecipeCount() {
  try {
    console.log('🔍 Checking recipe database...')
    
    // Get total count
    const { count: totalCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Total recipes in database: ${totalCount}`)
    
    // Get sample recipes
    const { data: sampleRecipes, error } = await supabase
      .from('recipes')
      .select('id, title, cuisine, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Error fetching recipes:', error)
      return
    }
    
    console.log('\n🍽️  Sample recipes:')
    sampleRecipes?.forEach((recipe, index) => {
      console.log(`  ${index + 1}. ${recipe.title} (${recipe.cuisine})`)
    })
    
    // Check for specific cuisines
    const { count: italianCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('cuisine', 'Italian')
    
    const { count: mexicanCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('cuisine', 'Mexican')
    
    console.log(`\n🌍 Cuisine breakdown:`)
    console.log(`  Italian: ${italianCount}`)
    console.log(`  Mexican: ${mexicanCount}`)
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkRecipeCount()
