// Debug environment variables in Next.js context
require('dotenv').config({ path: '.env.local' });

console.log('=== Environment Debug ===');
console.log('ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
console.log('ANTHROPIC_API_KEY length:', process.env.ANTHROPIC_API_KEY?.length);
console.log('ANTHROPIC_API_KEY format:', process.env.ANTHROPIC_API_KEY?.substring(0, 15) + '...');

console.log('AMAZON_ACCESS_KEY_ID exists:', !!process.env.AMAZON_ACCESS_KEY_ID);
console.log('AMAZON_SECRET_ACCESS_KEY exists:', !!process.env.AMAZON_SECRET_ACCESS_KEY);  
console.log('AMAZON_PARTNER_TAG:', process.env.AMAZON_PARTNER_TAG);

// Test Anthropic initialization
try {
  const Anthropic = require('@anthropic-ai/sdk');
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
  console.log('✅ Anthropic client created successfully');
  
  // Test a simple API call
  anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 50,
    messages: [{ role: 'user', content: 'Hello' }]
  }).then(() => {
    console.log('✅ Anthropic API call successful');
  }).catch(error => {
    console.log('❌ Anthropic API call failed:', error.message);
  });
  
} catch (error) {
  console.log('❌ Anthropic client creation failed:', error.message);
}
