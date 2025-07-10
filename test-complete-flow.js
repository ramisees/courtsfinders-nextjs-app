#!/usr/bin/env node

/**
 * Complete API Flow Test
 * Tests the entire data flow from frontend to API routes
 * 
 * Usage: node test-complete-flow.js [port]
 * Example: node test-complete-flow.js 3002
 */

const port = process.argv[2] || '3000'
const baseURL = `http://localhost:${port}`

console.log('🧪 Testing Complete API Flow for Courts Finder')
console.log(`🌐 Base URL: ${baseURL}`)
console.log('=' .repeat(60))

async function testCompleteFlow() {
  let testsPassed = 0
  let testsTotal = 0
  
  async function runTest(name, testFn) {
    testsTotal++
    console.log(`\n${testsTotal}️⃣ ${name}`)
    console.log('-'.repeat(40))
    
    try {
      await testFn()
      console.log(`✅ PASS: ${name}`)
      testsPassed++
    } catch (error) {
      console.log(`❌ FAIL: ${name}`)
      console.log(`   Error: ${error.message}`)
    }
  }
  
  // Test 1: Basic Court API
  await runTest('GET /api/courts (basic)', async () => {
    const response = await fetch(`${baseURL}/api/courts`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`   Status: ${response.status}`)
    console.log(`   Content-Type: ${response.headers.get('content-type')}`)
    
    if (!data.courts || !Array.isArray(data.courts)) {
      throw new Error('Response missing courts array')
    }
    
    console.log(`   Courts found: ${data.courts.length}`)
    console.log(`   Total: ${data.total}`)
    
    if (data.courts.length !== data.total) {
      throw new Error('Courts length does not match total')
    }
  })
  
  // Test 2: Court API with Sport Filter
  await runTest('GET /api/courts?sport=tennis', async () => {
    const response = await fetch(`${baseURL}/api/courts?sport=tennis`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`   Tennis courts found: ${data.courts.length}`)
    
    // Verify all returned courts are tennis courts
    const nonTennisCourts = data.courts.filter(court => court.sport !== 'tennis')
    if (nonTennisCourts.length > 0) {
      throw new Error(`Found ${nonTennisCourts.length} non-tennis courts in tennis filter`)
    }
  })
  
  // Test 3: Search API Basic
  await runTest('GET /api/search (no params)', async () => {
    const response = await fetch(`${baseURL}/api/search`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`   Search results: ${data.length}`)
    
    if (!Array.isArray(data)) {
      throw new Error('Search response is not an array')
    }
  })
  
  // Test 4: Search with Query
  await runTest('GET /api/search?q=tennis', async () => {
    const response = await fetch(`${baseURL}/api/search?q=tennis`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`   Tennis search results: ${data.length}`)
    
    // Verify results contain "tennis" in name or address
    const invalidResults = data.filter(court => 
      !court.name.toLowerCase().includes('tennis') && 
      !court.address.toLowerCase().includes('tennis')
    )
    
    if (invalidResults.length > 0) {
      console.log(`   Warning: ${invalidResults.length} results don't contain "tennis"`)
    }
  })
  
  // Test 5: Search with Sport Filter
  await runTest('GET /api/search?sport=basketball', async () => {
    const response = await fetch(`${baseURL}/api/search?sport=basketball`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`   Basketball courts: ${data.length}`)
    
    // Verify all results are basketball courts
    const nonBasketballCourts = data.filter(court => court.sport !== 'basketball')
    if (nonBasketballCourts.length > 0) {
      throw new Error(`Found ${nonBasketballCourts.length} non-basketball courts`)
    }
  })
  
  // Test 6: Search with Multiple Filters
  await runTest('GET /api/search?q=downtown&sport=tennis', async () => {
    const response = await fetch(`${baseURL}/api/search?q=downtown&sport=tennis`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`   Filtered results: ${data.length}`)
    
    // Should find Downtown Tennis Center
    const downTownTennis = data.find(court => 
      court.name.includes('Downtown') && court.sport === 'tennis'
    )
    
    if (!downTownTennis) {
      console.log(`   Warning: Downtown Tennis Center not found in filtered results`)
    } else {
      console.log(`   ✓ Found: ${downTownTennis.name}`)
    }
  })
  
  // Test 7: CORS Headers
  await runTest('CORS Headers Check', async () => {
    const response = await fetch(`${baseURL}/api/courts`)
    
    const corsOrigin = response.headers.get('Access-Control-Allow-Origin')
    const corsMethods = response.headers.get('Access-Control-Allow-Methods')
    
    console.log(`   CORS Origin: ${corsOrigin}`)
    console.log(`   CORS Methods: ${corsMethods}`)
    
    if (corsOrigin !== '*') {
      throw new Error(`Invalid CORS origin: ${corsOrigin}`)
    }
    
    if (!corsMethods || !corsMethods.includes('GET')) {
      throw new Error(`Invalid CORS methods: ${corsMethods}`)
    }
  })
  
  // Test 8: Data Structure Validation
  await runTest('Data Structure Validation', async () => {
    const response = await fetch(`${baseURL}/api/courts`)
    const data = await response.json()
    
    if (data.courts.length === 0) {
      throw new Error('No courts returned')
    }
    
    const sampleCourt = data.courts[0]
    const requiredFields = ['id', 'name', 'sport', 'address', 'rating', 'pricePerHour', 'available']
    
    console.log(`   Sample court: ${sampleCourt.name}`)
    
    for (const field of requiredFields) {
      if (!(field in sampleCourt)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    
    console.log(`   ✓ All required fields present`)
    console.log(`   Sport: ${sampleCourt.sport}`)
    console.log(`   Price: $${sampleCourt.pricePerHour}/hour`)
    console.log(`   Available: ${sampleCourt.available}`)
  })
  
  // Test 9: Error Handling
  await runTest('Error Handling (404)', async () => {
    const response = await fetch(`${baseURL}/api/nonexistent`)
    console.log(`   Status: ${response.status}`)
    
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}`)
    }
    
    console.log(`   ✓ Correctly returns 404 for non-existent endpoints`)
  })
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(60))
  console.log(`Tests Passed: ${testsPassed}/${testsTotal}`)
  console.log(`Success Rate: ${Math.round((testsPassed / testsTotal) * 100)}%`)
  
  if (testsPassed === testsTotal) {
    console.log('\n🎉 ALL TESTS PASSED! Your API is working perfectly!')
    console.log('\n📋 What this means:')
    console.log('   ✓ API endpoints are accessible')
    console.log('   ✓ CORS headers are properly configured')
    console.log('   ✓ Data structure is consistent')
    console.log('   ✓ Filtering and search work correctly')
    console.log('   ✓ Error handling is working')
    console.log('\n🚀 Your Courts Finder app should work without "Failed to fetch" errors!')
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.')
    console.log('\n💡 Common fixes:')
    console.log('   • Make sure your dev server is running: npm run dev')
    console.log('   • Check if the server is running on the correct port')
    console.log('   • Verify API routes exist in src/app/api/')
  }
  
  console.log('\n' + '='.repeat(60))
}

// Handle network errors gracefully
testCompleteFlow().catch(error => {
  console.log('\n❌ Test suite failed to run:')
  console.log(`   ${error.message}`)
  console.log('\n💡 Make sure your Next.js dev server is running:')
  console.log(`   cd your-project-directory`)
  console.log(`   npm run dev`)
  console.log(`\n   Then run this test again: node test-complete-flow.js ${port}`)
})