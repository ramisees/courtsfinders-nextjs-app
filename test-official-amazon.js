// Test Amazon PA-API with exact official format
require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function testOfficialAmazonFormat() {
  console.log('🧪 Testing Amazon PA-API with official format...');
  
  const config = {
    accessKey: process.env.AMAZON_ACCESS_KEY_ID,
    secretKey: process.env.AMAZON_SECRET_ACCESS_KEY,
    partnerTag: process.env.AMAZON_PARTNER_TAG,
    host: 'webservices.amazon.com',
    region: 'us-east-1'
  };

  if (!config.accessKey || !config.secretKey || !config.partnerTag) {
    console.log('❌ Missing Amazon credentials');
    return;
  }

  console.log('Credentials check:');
  console.log('- Access Key:', config.accessKey);
  console.log('- Secret Key:', config.secretKey.substring(0, 10) + '...');
  console.log('- Partner Tag:', config.partnerTag);

  const serviceName = 'ProductAdvertisingAPI';
  const method = 'POST';
  const canonicalUri = '/paapi5/searchitems';
  const canonicalQuerystring = '';

  const payload = JSON.stringify({
    Keywords: 'basketball',
    Resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'Offers.Listings.Price'
    ],
    SearchIndex: 'SportingGoods',
    ItemCount: 5,
    PartnerTag: config.partnerTag,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com'
  });

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substr(0, 8);

  // Create canonical headers
  const canonicalHeaders = [
    `content-type:application/json; charset=utf-8`,
    `host:${config.host}`,
    `x-amz-date:${amzDate}`,
    `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems`
  ].join('\n') + '\n';

  const signedHeaders = 'content-type;host;x-amz-date;x-amz-target';
  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

  // Create canonical request
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuerystring,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${config.region}/${serviceName}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');

  // Calculate signature
  const kDate = crypto.createHmac('sha256', `AWS4${config.secretKey}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(config.region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  // Create authorization header
  const authorizationHeader = `${algorithm} Credential=${config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  console.log('\nRequest details:');
  console.log('- Payload:', payload.substring(0, 100) + '...');
  console.log('- Timestamp:', amzDate);
  console.log('- Canonical request hash:', crypto.createHash('sha256').update(canonicalRequest).digest('hex'));

  try {
    const response = await fetch(`https://${config.host}${canonicalUri}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': authorizationHeader,
        'X-Amz-Date': amzDate,
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
      },
      body: payload
    });

    console.log('\nResponse:');
    console.log('- Status:', response.status);
    console.log('- Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('- Body:', responseText);

    if (response.status === 200) {
      const data = JSON.parse(responseText);
      if (data.SearchResult && data.SearchResult.Items) {
        console.log('✅ SUCCESS! Found', data.SearchResult.Items.length, 'items');
        data.SearchResult.Items.forEach((item, i) => {
          console.log(`${i+1}. ${item.ItemInfo?.Title?.DisplayValue || 'Unknown title'}`);
        });
      }
    } else {
      console.log('❌ API call failed');
      
      // Check for common error causes
      if (response.status === 403) {
        console.log('🔍 403 Forbidden - likely authentication issue');
      } else if (response.status === 404) {
        console.log('🔍 404 Not Found - check API endpoint');
      } else if (response.status === 429) {
        console.log('🔍 429 Rate Limited - too many requests');
      }
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testOfficialAmazonFormat();
