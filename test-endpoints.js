const http = require('http');

// Test all API endpoints
const testEndpoints = async () => {
    const baseURL = 'http://localhost:3000';
    const endpoints = [
        '/api/courts',
        '/api/search?q=tennis&sport=all',
        '/api/sports'
    ];

    console.log('🧪 Testing all API endpoints...\n');

    for (const endpoint of endpoints) {
        try {
            console.log(`📡 Testing: ${endpoint}`);
            const response = await fetch(`${baseURL}${endpoint}`);
            
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   Data type: ${Array.isArray(data) ? 'Array' : 'Object'}`);
                console.log(`   Data keys: ${Object.keys(data).join(', ')}`);
                if (Array.isArray(data)) {
                    console.log(`   Array length: ${data.length}`);
                } else if (data.courts && Array.isArray(data.courts)) {
                    console.log(`   Courts array length: ${data.courts.length}`);
                }
            } else {
                const text = await response.text();
                console.log(`   Error: ${text.slice(0, 200)}...`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        console.log('');
    }
};

// Run the test
testEndpoints().catch(console.error);
