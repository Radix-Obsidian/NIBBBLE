#!/usr/bin/env node

/**
 * Call Recipe Import API
 * 
 * This script calls the test import API to populate the database with sample recipes
 */

const https = require('https');
const http = require('http');

async function callImportAPI() {
  try {
    console.log('🚀 Calling recipe import API...')
    
    // Use the production URL from the latest deployment
    const baseUrl = 'https://pantrypals-o6zexgm1k-fusion-mind-ais-projects.vercel.app'
    const apiUrl = `${baseUrl}/api/test/import-recipes`
    
    console.log(`📤 Sending POST request to: ${apiUrl}`)
    
    const postData = JSON.stringify({})
    
    const url = new URL(apiUrl)
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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
            console.log('🎉 Recipe import successful!')
            console.log(`📊 Imported ${response.recipes?.length || 0} recipes`)
            console.log('🌐 You can now check the Discover page to see the recipes!')
          } else {
            console.log('❌ Recipe import failed')
          }
        } catch (error) {
          console.log('📄 Raw response:', data)
        }
      })
    })
    
    req.on('error', (error) => {
      console.error('💥 Request error:', error.message)
    })
    
    req.write(postData)
    req.end()
    
  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

// Run the script
if (require.main === module) {
  callImportAPI()
}

module.exports = { callImportAPI }
