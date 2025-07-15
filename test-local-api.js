// Test the actual API route used by the chatbot
require('dotenv').config({ path: '.env.local' });

async function testChatbotAPI() {
  console.log('🧪 Testing local chatbot API...');
  
  const payload = {
    "userMessage": "What balls should I use for tennis",
    "courtContext": {
      "courtType": "Tennis court",
      "location": "Not specified",
      "surface": "Hard",
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
    const response = await fetch('http://127.0.0.1:3000/api/chat/recommendations', {
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
      console.log('Message:', data.message.substring(0, 100) + '...');
      console.log('Number of recommendations:', data.recommendations?.length || 0);
      
      if (data.recommendations && data.recommendations.length > 0) {
        const firstRec = data.recommendations[0];
        console.log('\nFirst recommendation:');
        console.log('- Brand:', firstRec.brand);
        console.log('- Model:', firstRec.model);
        console.log('- Image URL:', firstRec.imageUrl);
        console.log('- Contains ASIN?', firstRec.purchaseLinks?.amazon?.includes('/dp/') ? 'Yes' : 'No');
        console.log('- Is placeholder image?', firstRec.imageUrl?.includes('placeholder') ? 'Yes' : 'No');
      }
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testChatbotAPI();
