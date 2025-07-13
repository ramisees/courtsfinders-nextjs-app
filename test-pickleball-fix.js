// Test the pickleball search fix
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Pickleball Search Fix...');
console.log('===================================');

// Function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Function to wait for server to start
function waitForServer(port, maxWait = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const checkServer = () => {
      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > maxWait) {
          reject(new Error('Server failed to start within timeout'));
        } else {
          setTimeout(checkServer, 1000);
        }
      });
      req.setTimeout(1000, () => {
        req.destroy();
        if (Date.now() - start > maxWait) {
          reject(new Error('Server failed to start within timeout'));
        } else {
          setTimeout(checkServer, 1000);
        }
      });
    };
    checkServer();
  });
}

async function testPickleballSearch() {
  console.log('🚀 Starting Next.js server...');
  
  // Start the server
  const serverProcess = spawn('node', [
    path.join(__dirname, 'node_modules', '.bin', 'next'),
    'dev',
    '-H',
    '127.0.0.1',
    '-p',
    '3000'
  ], {
    stdio: 'pipe'
  });

  let serverOutput = '';
  serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
    console.log('Server:', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    console.log('Server Error:', data.toString().trim());
  });

  try {
    console.log('⏳ Waiting for server to start...');
    await waitForServer(3000);
    console.log('✅ Server started successfully!');

    // Test the pickleball search
    console.log('\\n🔍 Testing pickleball search...');
    const searchUrl = 'http://127.0.0.1:3000/api/search?sport=pickleball';
    const searchResult = await makeRequest(searchUrl);
    
    console.log('🎯 Search Results:');
    console.log('URL:', searchUrl);
    console.log('Total courts found:', searchResult.total || 0);
    
    if (searchResult.courts && searchResult.courts.length > 0) {
      console.log('\\n✅ SUCCESS: Pickleball courts found!');
      console.log('\\nPickleball courts:');
      searchResult.courts.forEach((court, index) => {
        console.log(`${index + 1}. ${court.name} (${court.sports.join(', ')})`);
      });
    } else {
      console.log('\\n❌ FAILED: No pickleball courts found');
      console.log('Response:', JSON.stringify(searchResult, null, 2));
    }

    // Test all courts to verify database connection
    console.log('\\n📊 Testing total courts...');
    const allCourtsUrl = 'http://127.0.0.1:3000/api/courts';
    const allCourtsResult = await makeRequest(allCourtsUrl);
    console.log('Total courts in database:', allCourtsResult.length || 0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up
    console.log('\\n🧹 Cleaning up...');
    serverProcess.kill();
  }
}

testPickleballSearch().catch(console.error);
