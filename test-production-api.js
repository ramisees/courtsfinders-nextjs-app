const https = require('https');

function testSearchAPI(query) {
  const url = `https://courtsfinders-nextjs-3wdgo3zw2-ramsey-dellingers-projects.vercel.app/api/search?q=${encodeURIComponent(query)}`;
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          console.log('Raw response:', data.substring(0, 500));
          reject(error);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function runTests() {
  console.log('🧪 Testing Production Search API...\n');
  
  const testCases = [
    'Boulder',
    'Los Angeles',
    'London'
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`🔍 Testing search for: "${testCase}"`);
      const results = await testSearchAPI(testCase);
      
      if (Array.isArray(results)) {
        console.log(`✅ Found ${results.length} courts`);
        if (results.length > 0) {
          console.log(`   First result: ${results[0].name} (${results[0].address})`);
        }
      } else {
        console.log('❌ Unexpected response format:', Object.keys(results));
      }
    } catch (error) {
      console.log(`❌ Error testing "${testCase}":`, error.message);
    }
    
    console.log('');
  }
  
  // Test NC courts fallback
  try {
    console.log('🔍 Testing NC courts (no query)');
    const results = await testSearchAPI('');
    console.log(`✅ Found ${results.length} NC courts`);
  } catch (error) {
    console.log('❌ Error testing NC courts:', error.message);
  }
}

runTests().catch(console.error);
