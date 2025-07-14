import crypto from 'crypto'

// Amazon Product Advertising API configuration
interface AmazonConfig {
  accessKeyId: string
  secretAccessKey: string
  partnerTag: string
  host: string
  region: string
}

interface AmazonSearchParams {
  keywords: string
  searchIndex?: string
  itemPage?: number
  itemCount?: number
  sortBy?: string
  minPrice?: number
  maxPrice?: number
  brand?: string
}

interface AmazonProduct {
  asin: string
  title: string
  brand?: string
  price?: {
    displayAmount: string
    amount: number
    currency: string
  }
  images?: {
    primary: {
      small: { url: string }
      medium: { url: string }
      large: { url: string }
    }
  }
  customerReviews?: {
    count: number
    starRating: number
  }
  features?: string[]
  url: string
  availability?: string
}

interface AmazonApiResponse {
  searchResult?: {
    items: AmazonProduct[]
    totalResultCount: number
  }
  errors?: Array<{
    code: string
    message: string
  }>
}

class AmazonProductAPI {
  private config: AmazonConfig

  constructor() {
    this.config = {
      accessKeyId: process.env.AMAZON_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY || '',
      partnerTag: process.env.AMAZON_PARTNER_TAG || '',
      host: 'webservices.amazon.com',
      region: 'us-east-1'
    }
  }

  private createSignature(stringToSign: string): string {
    return crypto
      .createHmac('sha256', this.config.secretAccessKey)
      .update(stringToSign)
      .digest('base64')
  }

  private createCanonicalRequest(
    method: string,
    uri: string,
    queryString: string,
    headers: Record<string, string>,
    payload: string
  ): string {
    const sortedHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}`)
      .join('\n')

    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';')

    const hashedPayload = crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex')

    return [
      method,
      uri,
      queryString,
      sortedHeaders,
      '',
      signedHeaders,
      hashedPayload
    ].join('\n')
  }

  private createStringToSign(
    timestamp: string,
    canonicalRequest: string
  ): string {
    const algorithm = 'AWS4-HMAC-SHA256'
    const credentialScope = `${timestamp.slice(0, 8)}/${this.config.region}/ProductAdvertisingAPI/aws4_request`
    const hashedCanonicalRequest = crypto
      .createHash('sha256')
      .update(canonicalRequest)
      .digest('hex')

    return [
      algorithm,
      timestamp,
      credentialScope,
      hashedCanonicalRequest
    ].join('\n')
  }

  private getSigningKey(dateStamp: string): Buffer {
    const kDate = crypto
      .createHmac('sha256', `AWS4${this.config.secretAccessKey}`)
      .update(dateStamp)
      .digest()

    const kRegion = crypto
      .createHmac('sha256', kDate)
      .update(this.config.region)
      .digest()

    const kService = crypto
      .createHmac('sha256', kRegion)
      .update('ProductAdvertisingAPI')
      .digest()

    const kSigning = crypto
      .createHmac('sha256', kService)
      .update('aws4_request')
      .digest()

    return kSigning
  }

  private createAuthorizationHeader(
    accessKeyId: string,
    timestamp: string,
    signature: string,
    signedHeaders: string
  ): string {
    const dateStamp = timestamp.slice(0, 8)
    const credentialScope = `${dateStamp}/${this.config.region}/ProductAdvertisingAPI/aws4_request`
    
    return `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
  }

  async searchProducts(params: AmazonSearchParams): Promise<AmazonProduct[]> {
    if (!this.config.accessKeyId || !this.config.secretAccessKey || !this.config.partnerTag) {
      console.warn('Amazon API credentials not configured, returning empty results')
      return []
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '')
      const payload = JSON.stringify({
        Keywords: params.keywords,
        Resources: [
          'Images.Primary.Small',
          'Images.Primary.Medium', 
          'Images.Primary.Large',
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ByLineInfo',
          'Offers.Listings.Price',
          'CustomerReviews.Count',
          'CustomerReviews.StarRating'
        ],
        SearchIndex: params.searchIndex || 'SportingGoods',
        ItemPage: params.itemPage || 1,
        ItemCount: Math.min(params.itemCount || 10, 10),
        PartnerTag: this.config.partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.com',
        ...(params.sortBy && { SortBy: params.sortBy }),
        ...(params.minPrice && { MinPrice: params.minPrice * 100 }), // Amazon expects cents
        ...(params.maxPrice && { MaxPrice: params.maxPrice * 100 }),
        ...(params.brand && { Brand: params.brand })
      })

      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Encoding': 'amz-1.0',
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
        'X-Amz-Date': timestamp,
        'Authorization': '' // Will be set below
      }

      const canonicalRequest = this.createCanonicalRequest(
        'POST',
        '/paapi5/searchitems',
        '',
        headers,
        payload
      )

      const stringToSign = this.createStringToSign(timestamp, canonicalRequest)
      const dateStamp = timestamp.slice(0, 8)
      const signingKey = this.getSigningKey(dateStamp)
      
      const signature = crypto
        .createHmac('sha256', signingKey)
        .update(stringToSign)
        .digest('hex')

      headers.Authorization = this.createAuthorizationHeader(
        this.config.accessKeyId,
        timestamp,
        signature,
        'content-type;host;x-amz-date;x-amz-target'
      )

      const response = await fetch(`https://${this.config.host}/paapi5/searchitems`, {
        method: 'POST',
        headers,
        body: payload
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Amazon API error:', error)
        return []
      }

      const data: AmazonApiResponse = await response.json()

      if (data.errors) {
        console.error('Amazon API errors:', data.errors)
        return []
      }

      return (data.searchResult?.items || []).map(item => ({
        ...item,
        url: `https://www.amazon.com/dp/${item.asin}?tag=${this.config.partnerTag}`
      }))

    } catch (error) {
      console.error('Error searching Amazon products:', error)
      return []
    }
  }

  // Sport-specific search mappings
  async searchSportEquipment(sport: string, query: string, surface?: string, environment?: string): Promise<AmazonProduct[]> {
    const sportMappings: Record<string, string> = {
      'basketball': 'Basketball',
      'tennis': 'Tennis',
      'volleyball': 'Volleyball',
      'pickleball': 'Pickleball',
      'badminton': 'Badminton',
      'squash': 'Racquetball',
      'handball': 'Handball',
      'multi-sport': 'Sports'
    }

    const searchIndex = sportMappings[sport.toLowerCase()] ? 'SportingGoods' : 'All'
    const enhancedQuery = `${sportMappings[sport.toLowerCase()] || sport} ${query} ${surface || ''} ${environment || ''}`.trim()

    return this.searchProducts({
      keywords: enhancedQuery,
      searchIndex,
      itemCount: 8,
      sortBy: 'Relevance'
    })
  }
}

export const amazonAPI = new AmazonProductAPI()
export type { AmazonProduct, AmazonSearchParams }
