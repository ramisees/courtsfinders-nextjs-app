#!/usr/bin/env node

/**
 * Test the search API endpoint
 */

async function testSearchAPI() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 Testing Search API...')
  
  const testCases = [
    { name: 'Basic search', url: `${baseUrl}/api/search` },
    { name: 'Search with query', url: `${baseUrl}/api/search?q=tennis` },
    { name: 'Search with sport', url: `${baseUrl}/api/search?sport=basketball` },
    { name: 'Search with location', url: `${baseUrl}/api/search?location=raleigh` },
  ]
  
  for (const testCase of testCases) {
    try {
      console.log(`\n📞 Testing: ${testCase.name}`)
      console.log(`🌐 URL: ${testCase.url}`)
      
      const response = await fetch(testCase.url)
      
      console.log(`📊 Status: ${response.status} ${response.statusText}`)
      console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Success: Found ${Array.isArray(data) ? data.length : 'N/A'} results`)
        if (Array.isArray(data) && data.length > 0) {
          console.log(`📌 First result: ${data[0].name}`)
        }
      } else {
        const errorText = await response.text()
        console.log(`❌ Error: ${errorText}`)
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`)
    }
  }
}

// Only run if server is available
fetch('http://localhost:3000/api/courts')
  .then(() => {
    console.log('✅ Server is running, starting tests...')
    return testSearchAPI()
  })
  .catch(() => {
    console.log('❌ Server not running. Please start with: npm run dev')
  })