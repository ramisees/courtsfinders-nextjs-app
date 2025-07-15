// Detailed Amazon API test to debug the integration
// This will help us see exactly what's happening with the Amazon API calls

async function testAmazonAPIDirectly() {
  console.log('🔍 Testing Amazon API integration in detail...');
  
  // First, let's make a request that should trigger Amazon API calls
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
    console.log('📤 Making request to chatbot API...');
    const start = Date.now();
    
    const response = await fetch('https://courtsfinders.com/api/chat/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    const duration = Date.now() - start;
    console.log(`⏱️ Response time: ${duration}ms`);
    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    
    // Detailed analysis
    console.log('\n🔬 Detailed Analysis:');
    console.log('✅ API Success:', data.success);
    console.log('📊 Total recommendations:', data.totalRecommendations);
    console.log('⏰ Generated at:', data.generatedAt);
    
    // Check response time - real Amazon API calls are slower
    if (duration < 2000) {
      console.log('⚡ Fast response (likely cached/fallback data)');
    } else {
      console.log('🐌 Slower response (likely real API calls)');
    }
    
    // Analyze first product for real vs AI-generated data
    if (data.recommendations && data.recommendations.length > 0) {
      const firstProduct = data.recommendations[0];
      console.log('\n📦 First Product Analysis:');
      console.log('🏷️ Brand:', firstProduct.brand);
      console.log('📝 Model:', firstProduct.model);
      console.log('💰 Price:', firstProduct.priceRange);
      console.log('⭐ Rating:', firstProduct.userRating);
      console.log('🖼️ Image:', firstProduct.imageUrl);
      
      // Check for signs of real Amazon data
      const hasASIN = firstProduct.asin !== undefined;
      const hasRealImage = !firstProduct.imageUrl?.includes('placeholder');
      const hasPrecisePrice = firstProduct.priceRange?.includes('.');
      const hasHighReviewCount = firstProduct.userRating?.includes('1,') || firstProduct.userRating?.includes('2,');
      
      console.log('\n🔎 Data Source Indicators:');
      console.log('🆔 Has ASIN:', hasASIN ? '✅' : '❌');
      console.log('🖼️ Real image:', hasRealImage ? '✅' : '❌');
      console.log('💵 Precise pricing:', hasPrecisePrice ? '✅' : '❌');
      console.log('📊 High review count:', hasHighReviewCount ? '✅' : '❌');
      
      const realDataScore = [hasASIN, hasRealImage, hasPrecisePrice, hasHighReviewCount].filter(Boolean).length;
      
      if (realDataScore >= 3) {
        console.log('🎯 LIKELY REAL AMAZON DATA! 🎉');
      } else if (realDataScore >= 1) {
        console.log('🤔 MIXED - Some real data detected');
      } else {
        console.log('🤖 LIKELY AI-GENERATED DATA');
      }
    }

  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Test with explicit Amazon search terms
async function testWithAmazonTerms() {
  console.log('\n🎾 Testing with explicit Amazon-friendly terms...');
  
  const testPayload = {
    userMessage: "Wilson tennis balls clay court",
    courtContext: {
      courtType: "Tennis court",
      surface: "Clay",
      environment: "outdoor", 
      sport: "tennis",
      priceRange: "$5-25"
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

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Products found:', data.totalRecommendations);
      
      if (data.recommendations?.[0]) {
        const product = data.recommendations[0];
        console.log('🏷️ First product:', product.brand, product.model);
        console.log('💰 Price:', product.priceRange);
        console.log('🔗 Link type:', product.purchaseLinks?.amazon?.includes('/dp/') ? 'Direct product link' : 'Search link');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run comprehensive test
console.log('🚀 Starting comprehensive Amazon API debugging...\n');
testAmazonAPIDirectly().then(() => {
  return testWithAmazonTerms();
}).then(() => {
  console.log('\n📋 Debug Summary:');
  console.log('- Fast responses suggest fallback mode');
  console.log('- Placeholder images confirm AI-generated data');
  console.log('- Real Amazon data would have ASINs and precise pricing');
  console.log('- Check server logs for Amazon API authentication errors');
});
