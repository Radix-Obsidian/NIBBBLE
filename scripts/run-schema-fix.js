#!/usr/bin/env node

/**
 * Run Database Schema Fix
 * 
 * This script will execute the SQL to fix the database schema
 */

const fs = require('fs');
const path = require('path');

async function runSchemaFix() {
  try {
    console.log('🚀 Database Schema Fix Script')
    console.log('================================')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-database-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 SQL Script Contents:')
    console.log('========================')
    console.log(sqlContent)
    console.log('\n')
    
    console.log('📝 Instructions to run this SQL:')
    console.log('================================')
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
    console.log('2. Select your project: tsqtruntoqahnewlotka')
    console.log('3. Go to SQL Editor')
    console.log('4. Copy and paste the SQL above')
    console.log('5. Click "Run" to execute')
    console.log('\n')
    
    console.log('⚠️  WARNING: This will:')
    console.log('   - Drop the existing recipes table (if it exists)')
    console.log('   - Create a new recipes table with proper schema')
    console.log('   - Disable Row Level Security (RLS) temporarily')
    console.log('   - Insert 5 sample recipes')
    console.log('\n')
    
    console.log('✅ After running the SQL:')
    console.log('   - Your database will have the correct schema')
    console.log('   - RLS will be disabled for testing')
    console.log('   - You can test the Discover page')
    console.log('   - The Spoonacular API import should work')
    console.log('\n')
    
    console.log('🔗 Test URLs after running:')
    console.log('   - Discover page: http://localhost:3003/dashboard/discover')
    console.log('   - Schema check: http://localhost:3003/api/test/check-schema')
    console.log('   - Recipe import: Use the curl command you provided')
    
  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

// Run the script
if (require.main === module) {
  runSchemaFix()
}

module.exports = { runSchemaFix }
