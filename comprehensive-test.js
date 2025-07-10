const testSuite = async () => {
    console.log('🧪 Starting comprehensive Court Finder test suite...\n');
    
    const baseURL = 'http://localhost:3000';
    
    // Test 1: Homepage loads
    console.log('📄 Testing homepage...');
    try {
        const response = await fetch(`${baseURL}/`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
            console.log('   ✅ Homepage loads successfully');
        } else {
            console.log('   ❌ Homepage failed to load');
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Test 2: Courts API
    console.log('\n🏟️ Testing courts API...');
    try {
        const response = await fetch(`${baseURL}/api/courts`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Courts API working - ${data.courts?.length || 0} courts found`);
            if (data.courts && data.courts.length > 0) {
                const firstCourt = data.courts[0];
                console.log(`   📋 Sample court: ${firstCourt.name} (${firstCourt.sport})`);
                console.log(`   📍 Location: ${firstCourt.address}`);
                console.log(`   💰 Price: $${firstCourt.pricePerHour}/hour`);
                console.log(`   🔄 Available: ${firstCourt.available ? 'Yes' : 'No'}`);
            }
        } else {
            console.log('   ❌ Courts API failed');
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Test 3: Search API
    console.log('\n🔍 Testing search API...');
    const searchTests = [
        { description: 'All courts', params: '' },
        { description: 'Tennis courts', params: '?q=tennis&sport=all' },
        { description: 'Basketball courts', params: '?sport=basketball' },
        { description: 'Available courts', params: '?q=downtown' },
    ];
    
    for (const test of searchTests) {
        try {
            const response = await fetch(`${baseURL}/api/search${test.params}`);
            console.log(`   ${test.description}: Status ${response.status}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`     ✅ Found ${data.length} results`);
                if (data.length > 0) {
                    console.log(`     📋 First result: ${data[0].name}`);
                }
            } else {
                console.log(`     ❌ Failed`);
            }
        } catch (error) {
            console.log(`     ❌ Error: ${error.message}`);
        }
    }
    
    // Test 4: Sports API
    console.log('\n🏀 Testing sports API...');
    try {
        const response = await fetch(`${baseURL}/api/sports`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Sports API working - ${data.length} sports available`);
            console.log(`   🏆 Sports: ${data.map(s => s.name).join(', ')}`);
        } else {
            console.log('   ❌ Sports API failed');
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Test 5: Test and Debug pages
    console.log('\n🧰 Testing utility pages...');
    const pages = ['/test', '/debug'];
    
    for (const page of pages) {
        try {
            const response = await fetch(`${baseURL}${page}`);
            console.log(`   ${page}: Status ${response.status}`);
            if (response.ok) {
                console.log(`     ✅ ${page} loads successfully`);
            } else {
                console.log(`     ❌ ${page} failed to load`);
            }
        } catch (error) {
            console.log(`     ❌ Error: ${error.message}`);
        }
    }
    
    console.log('\n✅ Test suite completed!');
    console.log('🎉 If all tests passed, your Courts Finder app is working correctly!');
};

testSuite().catch(console.error);
