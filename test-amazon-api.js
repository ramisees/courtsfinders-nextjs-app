// Test script for Amazon Affiliate API
// This will test both with and without proper credentials

async function testAmazonAPICredentials() {
  console.log('🛍️ Testing Amazon API endpoint directly...');
  
  const testPayload = {
    userMessage: "I need tennis balls for clay courts",
    courtContext: {
      courtType: "Tennis court",
      location: "Not specified",
      surface: "Clay",
      environment: "outdoor",
      sport: "tennis",
      amenities: [],
      priceRange: "Not specified",
      autoDetectSport: true,
      availableSports: ['tennis', 'basketball', 'pickleball', 'volleyball', 'racquetball']
    },
    conversationHistory: []
  };

  try {
    const response = await fetch('https://courtsfinders.com/api/chat/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    
    // Check if we got real Amazon affiliate links
    console.log('\n🔍 Analyzing Amazon Integration:');
    console.log('✅ Total recommendations:', data.totalRecommendations);
    
    if (data.recommendations && data.recommendations.length > 0) {
      data.recommendations.forEach((rec, index) => {
        console.log(`\n📦 Product ${index + 1}: ${rec.brand} ${rec.model}`);
        console.log(`💰 Price: ${rec.priceRange}`);
        console.log(`🔗 Amazon Link: ${rec.purchaseLinks?.amazon || 'No Amazon link'}`);
        console.log(`⭐ Rating: ${rec.userRating}`);
        
        // Check if this looks like a real Amazon affiliate link
        if (rec.purchaseLinks?.amazon) {
          const hasAffiliateTag = rec.purchaseLinks.amazon.includes('tag=');
          const isAmazonDomain = rec.purchaseLinks.amazon.includes('amazon.com');
          console.log(`🎯 Affiliate Link Valid: ${hasAffiliateTag && isAmazonDomain ? '✅ YES' : '❌ NO'}`);
          
          if (hasAffiliateTag) {
            const tagMatch = rec.purchaseLinks.amazon.match(/tag=([^&]+)/);
            console.log(`🏷️ Affiliate Tag: ${tagMatch ? tagMatch[1] : 'Not found'}`);
          }
        }
      });
    }

    // Check if Amazon API was actually used or if it's using fallback data
    console.log('\n🔄 API Integration Analysis:');
    console.log('📅 Generated at:', data.generatedAt);
    console.log('✅ Success status:', data.success);
    
    // Look for signs that Amazon API was used vs fallback
    const hasGenericPrices = data.recommendations?.some(rec => 
      rec.priceRange?.includes('$') && !rec.priceRange.includes('.')
    );
    
    const hasPlaceholderImages = data.recommendations?.some(rec => 
      rec.imageUrl?.includes('placeholder')
    );
    
    console.log('🤖 Likely using Amazon API:', hasGenericPrices ? '❌ NO (generic data)' : '✅ MAYBE');
    console.log('🖼️ Using placeholder images:', hasPlaceholderImages ? '✅ YES (fallback mode)' : '❌ NO');

  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Test with basketball to see different product categories
async function testBasketballProducts() {
  console.log('\n🏀 Testing Basketball Products...');
  
  const testPayload = {
    userMessage: "I need basketball shoes for outdoor courts",
    courtContext: {
      courtType: "Basketball court",
      location: "Not specified",
      surface: "Concrete",
      environment: "outdoor",
      sport: "basketball",
      amenities: [],
      priceRange: "$50-150",
      autoDetectSport: true,
      availableSports: ['tennis', 'basketball', 'pickleball', 'volleyball', 'racquetball']
    },
    conversationHistory: []
  };

  try {
    const response = await fetch('https://courtsfinders.com/api/chat/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Basketball Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('🏀 Basketball products found:', data.totalRecommendations);
    
    if (data.recommendations && data.recommendations.length > 0) {
      console.log('👟 First product:', data.recommendations[0].brand, data.recommendations[0].model);
      console.log('💰 Price range:', data.recommendations[0].priceRange);
      console.log('🔗 Amazon link:', data.recommendations[0].purchaseLinks?.amazon);
    }

  } catch (error) {
    console.error('❌ Basketball test error:', error);
  }
}

// Run comprehensive Amazon API tests
console.log('🚀 Starting Amazon Affiliate API Tests...\n');
testAmazonAPICredentials().then(() => {
  return testBasketballProducts();
}).then(() => {
  console.log('\n📋 Test Summary:');
  console.log('1. If you see placeholder images and generic prices, Amazon API needs credentials');
  console.log('2. If you see real product data and affiliate links, Amazon API is working');
  console.log('3. Missing environment variables:');
  console.log('   - AMAZON_ACCESS_KEY_ID');
  console.log('   - AMAZON_SECRET_ACCESS_KEY');
  console.log('   - AMAZON_PARTNER_TAG');
});
