#!/usr/bin/env node

/**
 * Call Seed Recipes API
 * 
 * This script calls the seed recipes API to populate the database with sample recipes
 */

const https = require('https');
const http = require('http');

async function callSeedAPI() {
  try {
    console.log('🚀 Calling seed recipes API...')
    
    // Use the production URL from the latest deployment
    const baseUrl = 'https://pantrypals-15r1jbm64-fusion-mind-ais-projects.vercel.app'
    const apiUrl = `${baseUrl}/api/seed-recipes`
    
    console.log(`📤 Sending GET request to: ${apiUrl}`)
    
    const url = new URL(apiUrl)
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    const protocol = url.protocol === 'https:' ? https : http
    
    const req = protocol.request(options, (res) => {
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
            console.log('🎉 Recipe seeding successful!')
            console.log(`📊 Seeded ${response.recipes?.length || 0} recipes`)
            console.log('🌐 You can now check the Discover page to see the recipes!')
            console.log(`🔗 Discover page: ${baseUrl}/dashboard/discover`)
          } else {
            console.log('❌ Recipe seeding failed')
          }
        } catch (error) {
          console.log('📄 Raw response:', data)
        }
      })
    })
    
    req.on('error', (error) => {
      console.error('💥 Request error:', error.message)
    })
    
    req.end()
    
  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

// Run the script
if (require.main === module) {
  callSeedAPI()
}

module.exports = { callSeedAPI }
