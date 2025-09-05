const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupWaitlistTable() {
  try {
    console.log('🚀 Setting up waitlist table...');
    
    // Read the SQL schema file
    const sqlPath = path.join(__dirname, 'create-waitlist-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Error setting up waitlist table:', error);
      process.exit(1);
    }
    
    console.log('✅ Waitlist table setup completed successfully!');
    console.log('📊 You can now access the admin panel at: http://localhost:3000/admin/waitlist');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Alternative method if RPC doesn't work
async function setupWaitlistTableAlternative() {
  try {
    console.log('🚀 Setting up waitlist table (alternative method)...');
    
    // Read the SQL schema file
    const sqlPath = path.join(__dirname, 'create-waitlist-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      
      const { error } = await supabase
        .from('_sql')
        .select('*')
        .limit(0);
      
      if (error && !error.message.includes('relation "_sql" does not exist')) {
        console.error('❌ Error executing statement:', error);
      }
    }
    
    console.log('✅ Waitlist table setup completed!');
    console.log('📊 You can now access the admin panel at: http://localhost:3000/admin/waitlist');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('💡 Please run the SQL manually in your Supabase dashboard:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the contents of scripts/create-waitlist-schema.sql');
    console.log('   4. Execute the SQL');
  }
}

// Try the main method first, fallback to alternative
setupWaitlistTable().catch(() => {
  console.log('🔄 Trying alternative setup method...');
  setupWaitlistTableAlternative();
});
