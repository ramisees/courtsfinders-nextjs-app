// Test script for the chatbot API
// Using native fetch (available in Node.js 18+)

async function testChatbotAPI() {
  const testPayload = {
    userMessage: "What balls should I use on clay",
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

  console.log('🧪 Testing chatbot API...');
  console.log('📤 Payload:', JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch('https://courtsfinders.com/api/chat/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Test with basketball context
async function testBasketballContext() {
  const testPayload = {
    userMessage: "I clicked on Basketball. What gear do I need?",
    courtContext: {
      courtType: "Basketball court",
      location: "Not specified", 
      surface: "Not specified",
      environment: "outdoor",
      sport: "basketball",
      amenities: [],
      priceRange: "Not specified",
      autoDetectSport: true,
      availableSports: ['tennis', 'basketball', 'pickleball', 'volleyball', 'racquetball']
    },
    conversationHistory: []
  };

  console.log('\n🏀 Testing basketball context...');
  console.log('📤 Payload:', JSON.stringify(testPayload, null, 2));

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
    console.log('✅ Basketball response message:', data.message);

  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Run both tests
testChatbotAPI().then(() => {
  return testBasketballContext();
});
