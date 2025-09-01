const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupRecipeLikes() {
  try {
    console.log('Setting up recipe_likes table...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-recipe-likes-table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('Error creating recipe_likes table:', error)
      
      // Fallback: try to create table manually
      console.log('Trying manual table creation...')
      const { error: createError } = await supabase
        .from('recipe_likes')
        .select('*')
        .limit(1)
      
      if (createError) {
        console.error('Table does not exist and cannot be created automatically')
        console.log('Please run the SQL manually in your Supabase dashboard:')
        console.log(sql)
      } else {
        console.log('Table already exists!')
      }
    } else {
      console.log('✅ recipe_likes table created successfully!')
    }
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupRecipeLikes()
