// Test Amazon API directly with debug logging
require('dotenv').config({ path: '.env.local' });

async function testAmazonAPI() {
  console.log('🧪 Testing Amazon API directly...');
  
  // Import the amazonAPI from our lib
  const { amazonAPI } = require('./src/lib/amazon-api.ts');
  
  try {
    console.log('🔍 Searching for basketball equipment...');
    const results = await amazonAPI.searchProducts({
      keywords: 'basketball',
      searchIndex: 'SportingGoods',
      itemCount: 3
    });
    
    console.log('📊 Results:', results.length, 'items');
    
    if (results.length > 0) {
      console.log('✅ Amazon API working!');
      results.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   ASIN: ${item.asin}`);
        console.log(`   Price: ${item.price?.displayAmount || 'N/A'}`);
        console.log(`   Image: ${item.images?.primary?.large?.url || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No results returned from Amazon API');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAmazonAPI();
