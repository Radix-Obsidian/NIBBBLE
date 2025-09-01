#!/usr/bin/env node

/**
 * Test Recipe Import API
 * 
 * This script tests the recipe import API endpoint to populate the database
 */

const https = require('https');

async function testImportAPI() {
  try {
    console.log('🚀 Testing recipe import API...')
    
    // Test data for import
    const importData = {
      type: 'cuisine',
      cuisines: ['italian'],
      count: 3,
      creatorId: 'test-user-123',
      dryRun: false
    }
    
    console.log('📤 Sending import request...')
    console.log('Data:', JSON.stringify(importData, null, 2))
    
    // For now, just log what we would send
    console.log('✅ Import request prepared successfully!')
    console.log('📝 To actually import recipes, you would need to:')
    console.log('   1. Start the development server: npm run dev')
    console.log('   2. Send a POST request to: http://localhost:3000/api/recipes/import')
    console.log('   3. With the data shown above')
    
  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

// Run the test
if (require.main === module) {
  testImportAPI()
}

module.exports = { testImportAPI }
