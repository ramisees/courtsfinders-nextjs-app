// Simple test to verify API endpoints work
// Run this with: node test-api-fixed.js

const baseURL = 'http://localhost:3002'; // Update port as needed

async function testAPI() {
  console.log('🧪 Testing Courts Finder API...\n');

  try {
    // Test 1: Courts endpoint
    console.log('1️⃣ Testing /api/courts...');
    const courtsResponse = await fetch(`${baseURL}/api/courts`);
    console.log(`Status: ${courtsResponse.status}`);
    
    if (courtsResponse.ok) {
      const courtsData = await courtsResponse.json();
      console.log(`✅ Courts endpoint working - Found ${courtsData.courts?.length || courtsData.length} courts`);
    } else {
      console.log(`❌ Courts endpoint failed: ${courtsResponse.statusText}`);
    }

    // Test 2: Search endpoint
    console.log('\n2️⃣ Testing /api/search...');
    const searchResponse = await fetch(`${baseURL}/api/search?q=tennis`);
    console.log(`Status: ${searchResponse.status}`);
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log(`✅ Search endpoint working - Found ${searchData.length} tennis courts`);
    } else {
      console.log(`❌ Search endpoint failed: ${searchResponse.statusText}`);
    }

    // Test 3: Search by sport
    console.log('\n3️⃣ Testing search by sport...');
    const sportResponse = await fetch(`${baseURL}/api/search?sport=basketball`);
    console.log(`Status: ${sportResponse.status}`);
    
    if (sportResponse.ok) {
      const sportData = await sportResponse.json();
      console.log(`✅ Sport filter working - Found ${sportData.length} basketball courts`);
    } else {
      console.log(`❌ Sport filter failed: ${sportResponse.statusText}`);
    }

    console.log('\n🎉 API test complete!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure your Next.js dev server is running on port 3002');
    console.log('   Run: npm run dev');
  }
}

testAPI();