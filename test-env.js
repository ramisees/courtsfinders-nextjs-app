// Simple test to check if environment variables are loaded correctly
console.log('Environment variables:');
console.log('AMAZON_ACCESS_KEY_ID:', process.env.AMAZON_ACCESS_KEY_ID ? 'Set (length: ' + process.env.AMAZON_ACCESS_KEY_ID.length + ')' : 'Not set');
console.log('AMAZON_SECRET_ACCESS_KEY:', process.env.AMAZON_SECRET_ACCESS_KEY ? 'Set (length: ' + process.env.AMAZON_SECRET_ACCESS_KEY.length + ')' : 'Not set');
console.log('AMAZON_PARTNER_TAG:', process.env.AMAZON_PARTNER_TAG || 'Not set');
console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'Set (length: ' + process.env.ANTHROPIC_API_KEY.length + ')' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

// Test require .env loading
try {
  require('dotenv').config({ path: '.env.local' });
  console.log('\n✅ .env.local loaded successfully');
  console.log('After dotenv:');
  console.log('AMAZON_ACCESS_KEY_ID:', process.env.AMAZON_ACCESS_KEY_ID ? 'Set (length: ' + process.env.AMAZON_ACCESS_KEY_ID.length + ')' : 'Not set');
  console.log('AMAZON_SECRET_ACCESS_KEY:', process.env.AMAZON_SECRET_ACCESS_KEY ? 'Set (length: ' + process.env.AMAZON_SECRET_ACCESS_KEY.length + ')' : 'Not set');
  console.log('AMAZON_PARTNER_TAG:', process.env.AMAZON_PARTNER_TAG || 'Not set');
} catch (error) {
  console.log('❌ dotenv not available:', error.message);
}
