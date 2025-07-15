// Test updated Amazon API credentials on production
async function testUpdatedAmazonAPI() {
  console.log('🧪 Testing updated Amazon API credentials...');
  
  const payload = {
    "userMessage": "What basketball should I buy for outdoor play?",
    "courtContext": {
      "courtType": "Basketball court",
      "location": "Not specified",
      "surface": "Asphalt",
      "environment": "outdoor",
      "sport": "basketball",
      "amenities": [],
      "priceRange": "Not specified",
      "autoDetectSport": true,
      "availableSports": ["tennis", "basketball", "pickleball", "volleyball", "racquetball"]
    },
    "conversationHistory": []
  };

  try {
    const startTime = Date.now();
    const response = await fetch('https://courtsfinders.com/api/chat/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log('📊 Response status:', response.status);
    console.log('⏱️ Response time:', responseTime + 'ms');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success!');
      console.log('Number of recommendations:', data.recommendations?.length || 0);
      
      if (data.recommendations && data.recommendations.length > 0) {
        const firstRec = data.recommendations[0];
        console.log('\n🏀 First recommendation:');
        console.log('- Brand:', firstRec.brand);
        console.log('- Model:', firstRec.model);
        console.log('- Price:', firstRec.priceRange);
        console.log('- Image URL:', firstRec.imageUrl);
        console.log('- Amazon URL:', firstRec.purchaseLinks?.amazon);
        console.log('- Contains real ASIN?', firstRec.purchaseLinks?.amazon?.includes('/dp/') ? '✅ YES' : '❌ No');
        console.log('- Is placeholder image?', firstRec.imageUrl?.includes('placeholder') ? '❌ Yes' : '✅ No');
        console.log('- Rating:', firstRec.userRating);
        
        // Check if this looks like real Amazon data vs AI-generated
        const hasRealAmazonData = !firstRec.imageUrl?.includes('placeholder') && 
                                 firstRec.purchaseLinks?.amazon?.includes('/dp/');
        console.log('\n🔍 Analysis:', hasRealAmazonData ? '✅ REAL AMAZON DATA!' : '❌ Still using AI fallback');
      }
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testUpdatedAmazonAPI();
