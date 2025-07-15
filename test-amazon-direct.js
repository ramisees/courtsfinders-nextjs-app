// Direct Amazon API test with detailed logging
const crypto = require('crypto');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Test environment variables
console.log('=== Environment Variables Check ===');
console.log('AMAZON_ACCESS_KEY_ID:', process.env.AMAZON_ACCESS_KEY_ID ? 'Set' : 'Not set');
console.log('AMAZON_SECRET_ACCESS_KEY:', process.env.AMAZON_SECRET_ACCESS_KEY ? 'Set' : 'Not set');
console.log('AMAZON_PARTNER_TAG:', process.env.AMAZON_PARTNER_TAG ? 'Set' : 'Not set');

if (!process.env.AMAZON_ACCESS_KEY_ID) {
  console.log('❌ Amazon credentials not found in environment variables');
  process.exit(1);
}

// Simulate the exact same API call that the app makes
function createSignature(canonicalRequest, secretKey) {
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const credentialScope = `${dateStamp}/us-east-1/ProductAdvertisingAPI/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '')}Z\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex')}`;
  
  const kDate = crypto.createHmac('sha256', `AWS4${secretKey}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update('us-east-1').digest();
  const kService = crypto.createHmac('sha256', kRegion).update('ProductAdvertisingAPI').digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  
  return crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
}

async function testDirectAmazonAPI() {
  console.log('\n=== Testing Direct Amazon API Call ===');
  
  const accessKey = process.env.AMAZON_ACCESS_KEY_ID;
  const secretKey = process.env.AMAZON_SECRET_ACCESS_KEY;
  const partnerTag = process.env.AMAZON_PARTNER_TAG;
  
  const host = 'webservices.amazon.com';
  const uri = '/paapi5/searchitems';
  const service = 'ProductAdvertisingAPI';
  const region = 'us-east-1';
  
  const payload = JSON.stringify({
    Keywords: 'basketball',
    SearchIndex: 'SportingGoods',
    ItemCount: 5,
    PartnerTag: partnerTag,
    PartnerType: 'Associates',
    Resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'Offers.Listings.Price'
    ]
  });
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '') + 'Z';
  const dateStamp = timestamp.slice(0, 8);
  
  const canonicalHeaders = [
    `content-type:application/json; charset=utf-8`,
    `host:${host}`,
    `x-amz-date:${timestamp}`,
    `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems`
  ].join('\n') + '\n';
  
  const signedHeaders = 'content-type;host;x-amz-date;x-amz-target';
  const payloadHash = crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
  
  const canonicalRequest = [
    'POST',
    uri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    timestamp,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex')
  ].join('\n');
  
  const kDate = crypto.createHmac('sha256', `AWS4${secretKey}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  console.log('Request payload:', payload);
  console.log('Authorization header length:', authorization.length);
  console.log('Timestamp:', timestamp);
  
  try {
    const response = await fetch(`https://${host}${uri}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': authorization,
        'X-Amz-Date': timestamp,
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
      },
      body: payload
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    if (response.status === 200) {
      const data = JSON.parse(responseText);
      console.log('✅ Amazon API call successful!');
      if (data.SearchResult && data.SearchResult.Items) {
        console.log(`Found ${data.SearchResult.Items.length} items`);
        console.log('First item:', data.SearchResult.Items[0]?.ItemInfo?.Title?.DisplayValue);
      }
    } else {
      console.log('❌ Amazon API call failed');
      console.log('Error response:', responseText);
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testDirectAmazonAPI().catch(console.error);
