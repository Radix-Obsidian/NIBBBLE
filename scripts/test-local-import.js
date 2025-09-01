#!/usr/bin/env node

/**
 * Test Local Recipe Import API
 * 
 * This script tests the recipe import API on the local development server
 */

const http = require('http');

async function testLocalImport() {
  try {
    console.log('🚀 Testing local recipe import API...')
    
    const postData = JSON.stringify({
      type: 'cuisine',
      cuisines: ['italian'],
      count: 5,
      creatorId: 'test-user-123'
    })
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/recipes/import',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }
    
    console.log(`📤 Sending POST request to: http://localhost:3000/api/recipes/import`)
    console.log('📋 Request data:', postData)
    
    const req = http.request(options, (res) => {
      console.log(`📥 Response status: ${res.statusCode}`)
      
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          console.log('✅ API Response:')
          console.log(JSON.stringify(response, null, 2))
          
          if (response.success) {
            console.log('🎉 Recipe import successful!')
            console.log(`📊 Imported ${response.imported || 0} recipes`)
            console.log(`❌ Failed: ${response.failed || 0} recipes`)
            console.log('🌐 You can now check the Discover page to see the recipes!')
            console.log('🔗 Discover page: http://localhost:3000/dashboard/discover')
          } else {
            console.log('❌ Recipe import failed')
            if (response.errors) {
              console.log('⚠️  Errors:')
              response.errors.forEach(error => console.log(`  - ${error}`))
            }
          }
        } catch (error) {
          console.log('📄 Raw response:', data)
        }
      })
    })
    
    req.on('error', (error) => {
      console.error('💥 Request error:', error.message)
      console.log('💡 Make sure the development server is running on port 3000')
    })
    
    req.write(postData)
    req.end()
    
  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

// Run the script
if (require.main === module) {
  // Wait a bit for the server to start
  setTimeout(() => {
    testLocalImport()
  }, 3000)
}

module.exports = { testLocalImport }
