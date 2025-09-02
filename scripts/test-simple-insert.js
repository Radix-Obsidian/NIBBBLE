#!/usr/bin/env node

const http = require('http');

async function testSimpleInsert() {
  try {
    console.log('🚀 Testing simple recipe insert...')
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/test/simple-insert',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
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

testSimpleInsert()
