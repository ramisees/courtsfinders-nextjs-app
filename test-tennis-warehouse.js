// Test Tennis Warehouse link fix
async function testTennisWarehouseLinks() {
  console.log('🎾 Testing Tennis Warehouse link fix...');
  
  const payload = {
    "userMessage": "What tennis racquet should I buy for clay courts?",
    "courtContext": {
      "courtType": "Tennis court",
      "location": "Not specified",
      "surface": "Clay",
      "environment": "outdoor",
      "sport": "tennis",
      "amenities": [],
      "priceRange": "Not specified",
      "autoDetectSport": true,
      "availableSports": ["tennis", "basketball", "pickleball", "volleyball", "racquetball"]
    },
    "conversationHistory": []
  };

  try {
    const response = await fetch('https://courtsfinders.com/api/chat/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success!');
      console.log('Number of recommendations:', data.recommendations?.length || 0);
      
      if (data.recommendations && data.recommendations.length > 0) {
        data.recommendations.forEach((rec, index) => {
          console.log(`\n🎾 Recommendation ${index + 1}:`);
          console.log('- Brand:', rec.brand);
          console.log('- Model:', rec.model);
          console.log('- Amazon URL:', rec.purchaseLinks?.amazon);
          console.log('- Retailer URL:', rec.purchaseLinks?.retailer);
          console.log('- Direct URL:', rec.purchaseLinks?.direct);
          
          // Check if Tennis Warehouse links are properly formatted
          if (rec.purchaseLinks?.retailer) {
            const isTennisWarehouse = rec.purchaseLinks.retailer.includes('tennis-warehouse.com');
            const hasCorrectPath = rec.purchaseLinks.retailer.includes('searchresults.html');
            console.log('- Tennis Warehouse?', isTennisWarehouse ? '✅ Yes' : '❌ No');
            console.log('- Correct format?', hasCorrectPath ? '✅ Yes' : '❌ No');
          }
        });
      }
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testTennisWarehouseLinks();
