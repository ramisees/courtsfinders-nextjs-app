const http = require('http');

// Test function for API endpoints
function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data.substring(0, 200) + '...', raw: true });
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Test multiple endpoints
async function runTests() {
  console.log('🧪 Testing API Endpoints...\n');
  
  const tests = [
    '/api/courts',
    '/api/search',
    '/api/search?q=tennis',
    '/'
  ];
  
  for (const path of tests) {
    try {
      console.log(`Testing: ${path}`);
      const result = await testEndpoint(path);
      console.log(`✅ Status: ${result.status}`);
      
      if (result.raw) {
        console.log(`📄 Response: ${result.data}\n`);
      } else {
        console.log(`📊 Data: ${JSON.stringify(result.data, null, 2).substring(0, 300)}...\n`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
}

runTests().catch(console.error);
