import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { amazonAPI, AmazonProduct } from '@/lib/amazon-api'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

// Initialize rate limiter (in-memory for development, use Redis for production)
let ratelimit: Ratelimit | null = null

try {
  // Only initialize Redis if valid environment variables are provided
  if (process.env.UPSTASH_REDIS_REST_URL && 
      process.env.UPSTASH_REDIS_REST_URL !== 'your_redis_url_here' &&
      process.env.UPSTASH_REDIS_REST_TOKEN &&
      process.env.UPSTASH_REDIS_REST_TOKEN !== 'your_redis_token_here') {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
      analytics: true,
    })
    console.log('✅ Redis rate limiting initialized')
  } else {
    console.log('⚠️ Redis not configured, using in-memory rate limiting')
  }
} catch (error) {
  console.warn('⚠️ Redis initialization failed, using in-memory rate limiting:', error instanceof Error ? error.message : error)
}

// Fallback in-memory rate limiting
const memoryStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10
const WINDOW_MS = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): { success: boolean; retryAfter?: number } {
  if (ratelimit) {
    // Use Redis-based rate limiting if available
    return { success: true } // Will be checked in the actual handler
  }
  
  // Use in-memory rate limiting
  const now = Date.now()
  const record = memoryStore.get(ip)
  
  if (!record || now > record.resetTime) {
    memoryStore.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return { success: true }
  }
  
  if (record.count >= RATE_LIMIT) {
    return { success: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) }
  }
  
  record.count++
  return { success: true }
}

// Types for the API
interface ChatRequest {
  userMessage: string
  courtContext: {
    courtType?: string
    location?: string
    surface?: string
    environment?: 'indoor' | 'outdoor'
    sport?: string
    amenities?: string[]
    priceRange?: string
  }
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
  abTestVariant?: string
  promptOverride?: string
  maxTokens?: number
  temperature?: number
}

interface ProductRecommendation {
  brand: string
  model: string
  priceRange: string
  description: string
  whyRecommended: string
  purchaseLinks: {
    amazon?: string
    retailer?: string
    direct?: string
  }
  userRating: string
  features: string[]
  suitableFor: string[]
  category: string
  imageUrl?: string
}

interface RecommendationResponse {
  message: string
  recommendations: ProductRecommendation[]
  courtSpecificTips: string[]
  totalRecommendations: number
  generatedAt: string
  success: boolean
}

// Construct the specialized Claude prompt
function buildClaudePrompt(
  userMessage: string, 
  courtContext: ChatRequest['courtContext'],
  promptOverride?: string
): string {
  const {
    courtType = 'General sports court',
    location = 'Not specified',
    surface = 'Not specified',
    environment = 'outdoor',
    sport = 'Not specified',
    amenities = [],
    priceRange = 'Not specified'
  } = courtContext

  // Use A/B test prompt override if provided
  if (promptOverride) {
    return promptOverride
  }

  return `You are a sports equipment expert for CourtsFinders.com.

Current Context:
- Court Type: ${courtType}
- Location: ${location}
- Surface: ${surface}
- Indoor/Outdoor: ${environment}
- Sport: ${sport}
- Available Amenities: ${amenities.length > 0 ? amenities.join(', ') : 'Not specified'}
- User Budget: ${priceRange}

User Question: ${userMessage}

Provide 3-5 specific product recommendations with:
- Exact brand and model names
- Price ranges ($50-100, $100-200, etc.)
- Why it's perfect for this court type and surface
- Amazon or retailer links
- User rating (4.5/5 stars, etc.)
- Brief reason why it's recommended
- Specific features that match the court environment
- What makes it suitable for ${environment} ${surface} courts

Additional guidelines:
- Consider the specific court surface (${surface}) when recommending equipment
- Factor in ${environment} play conditions
- If budget range is specified, stay within those constraints
- Prioritize equipment that performs well on ${surface} surfaces
- Consider the climate and location if specified
- Include sport-specific recommendations for ${sport} if applicable

Format as clean JSON with this exact structure:
{
  "message": "Your helpful response to the user",
  "recommendations": [
    {
      "brand": "Brand Name",
      "model": "Specific Model Name",
      "priceRange": "$X-Y",
      "description": "Brief product description",
      "whyRecommended": "Why this is perfect for their specific court/situation",
      "purchaseLinks": {
        "amazon": "https://www.amazon.com/s?k=[PRODUCT_NAME_SEARCH]&tag=lovesalve1915-20",
        "retailer": "https://www.amazon.com/s?k=[PRODUCT_NAME_SEARCH]&tag=lovesalve1915-20",
        "direct": "https://www.amazon.com/s?k=[PRODUCT_NAME_SEARCH]&tag=lovesalve1915-20"
      },
      "userRating": "4.5/5 stars (1,234 reviews)",
      "features": ["Feature 1", "Feature 2", "Feature 3"],
      "suitableFor": ["court type", "player level", "conditions"],
      "category": "Equipment Category",
      "imageUrl": "https://via.placeholder.com/300x300/f3f4f6/374151?text=[BRAND]+[MODEL]"
    }
  ],
  "courtSpecificTips": [
    "Tip 1 for this specific court type",
    "Tip 2 for this surface",
    "Tip 3 for this environment"
  ]
}

IMPORTANT: 
- Replace [PRODUCT_NAME_SEARCH] with URL-encoded product name (Brand+Model+Category)
- Replace [BRAND] and [MODEL] in imageUrl with actual brand and model names
- Use only Amazon affiliate links with tag=lovesalve1915-20 to ensure working links and commission
- All links should lead to Amazon search results for maximum compatibility

Make sure all recommendations are specifically tailored to ${surface} ${environment} courts and the sport of ${sport}.`
}

// Get IP address for rate limiting
function getIP(request: NextRequest): string {
  const ip = request.ip 
    ?? request.headers.get('x-forwarded-for')
    ?? request.headers.get('x-real-ip')
    ?? request.headers.get('cf-connecting-ip')
    ?? 'anonymous'
  
  return Array.isArray(ip) ? ip[0] : ip
}

// Enhanced error handling with specific error types
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public errorCode: string = 'INTERNAL_ERROR'
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Validate request payload
function validateRequest(body: any): ChatRequest {
  if (!body.userMessage || typeof body.userMessage !== 'string') {
    throw new APIError('userMessage is required and must be a string', 400, 'INVALID_MESSAGE')
  }

  if (body.userMessage.length > 1000) {
    throw new APIError('userMessage must be less than 1000 characters', 400, 'MESSAGE_TOO_LONG')
  }

  if (!body.courtContext || typeof body.courtContext !== 'object') {
    throw new APIError('courtContext is required and must be an object', 400, 'INVALID_CONTEXT')
  }

  return {
    userMessage: body.userMessage.trim(),
    courtContext: {
      courtType: body.courtContext.courtType || 'General sports court',
      location: body.courtContext.location || 'Not specified',
      surface: body.courtContext.surface || 'Not specified',
      environment: body.courtContext.environment || 'outdoor',
      sport: body.courtContext.sport || 'Not specified',
      amenities: Array.isArray(body.courtContext.amenities) ? body.courtContext.amenities : [],
      priceRange: body.courtContext.priceRange || 'Not specified'
    },
    conversationHistory: Array.isArray(body.conversationHistory) ? body.conversationHistory.slice(-5) : []
  }
}

// Main recommendation function
async function getEquipmentRecommendations(
  userMessage: string,
  courtContext: ChatRequest['courtContext'],
  conversationHistory: ChatRequest['conversationHistory'] = []
): Promise<RecommendationResponse> {
  try {
    console.log('🤖 Generating equipment recommendations with Claude AI...')
    console.log('📍 Court context:', courtContext)

    // Build conversation messages for Claude
    const messages: any[] = []
    
    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      })
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    })

    // Generate Claude response with A/B test parameters
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      system: buildClaudePrompt(userMessage, courtContext),
      messages: messages
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
    console.log('🤖 Claude raw response:', responseText)

    // Parse Claude's JSON response
    let claudeData: any
    try {
      // Clean the response to extract just the JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        claudeData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON found in response')
      }
    } catch (parseError) {
      console.warn('❌ Failed to parse Claude JSON response:', parseError)
      
      // Fallback response structure
      claudeData = {
        message: responseText,
        recommendations: [],
        courtSpecificTips: ['Unable to generate specific tips at this time.']
      }
    }

    // Validate and structure the response with Amazon integration
    let recommendations: ProductRecommendation[] = []
    
    if (Array.isArray(claudeData.recommendations) && claudeData.recommendations.length > 0) {
      // Enhance Claude recommendations with real Amazon products
      recommendations = await enhanceRecommendationsWithAmazon(
        claudeData.recommendations,
        userMessage,
        courtContext
      )
    } else {
      // If no Claude recommendations, get direct Amazon results
      recommendations = await enhanceRecommendationsWithAmazon(
        [],
        userMessage,
        courtContext
      )
    }

    // Ensure we have at least one recommendation
    if (recommendations.length === 0) {
      const associateId = process.env.AMAZON_ASSOCIATE_ID || 'courtsfinder-20'
      recommendations.push({
        brand: 'Various',
        model: 'Recommended Equipment',
        priceRange: '$50-200',
        description: 'Quality sports equipment suitable for your court type',
        whyRecommended: `Perfect for ${courtContext.surface} ${courtContext.environment} courts`,
        purchaseLinks: {
          amazon: `https://www.amazon.com/s?k=${encodeURIComponent(courtContext.sport || 'sports equipment')}&tag=${associateId}`,
          retailer: '',
          direct: ''
        },
        userRating: '4.0/5 stars',
        features: ['Durable construction', 'Good performance'],
        suitableFor: [`${courtContext.surface} courts`, `${courtContext.environment} play`],
        category: 'Sports Equipment',
        imageUrl: generatePlaceholderImage('sports')
      })
    }

    const result: RecommendationResponse = {
      message: claudeData.message || 'Here are my equipment recommendations based on your court and playing conditions:',
      recommendations,
      courtSpecificTips: Array.isArray(claudeData.courtSpecificTips) 
        ? claudeData.courtSpecificTips 
        : ['Check court regulations before bringing equipment', 'Consider the surface type when choosing gear'],
      totalRecommendations: recommendations.length,
      generatedAt: new Date().toISOString(),
      success: true
    }

    console.log(`✅ Generated ${recommendations.length} equipment recommendations`)
    return result

  } catch (error) {
    console.error('❌ Error generating recommendations:', error)
    
    if (error instanceof Error && error.message.includes('rate limit')) {
      throw new APIError('Rate limit exceeded for AI service', 429, 'RATE_LIMIT_EXCEEDED')
    }
    
    if (error instanceof Error && error.message.includes('authentication')) {
      throw new APIError('AI service authentication failed', 401, 'AUTH_FAILED')
    }

    throw new APIError('Failed to generate equipment recommendations', 500, 'RECOMMENDATION_FAILED')
  }
}

// Enhanced function to get Amazon products and merge with Claude recommendations
async function enhanceRecommendationsWithAmazon(
  claudeRecommendations: any[],
  userMessage: string,
  courtContext: ChatRequest['courtContext']
): Promise<ProductRecommendation[]> {
  const recommendations: ProductRecommendation[] = []
  const associateId = process.env.AMAZON_ASSOCIATE_ID || 'courtsfinder-20'

  // Search Amazon for each Claude recommendation
  for (const rec of claudeRecommendations) {
    if (!rec.brand || !rec.model) continue

    try {
      // Search Amazon for specific product
      const amazonQuery = `${rec.brand} ${rec.model}`.trim()
      const amazonProducts = await amazonAPI.searchSportEquipment(
        courtContext.sport || 'sports',
        amazonQuery,
        courtContext.surface,
        courtContext.environment
      )

      // Find best matching Amazon product
      const bestMatch = amazonProducts.find(product => 
        product.title.toLowerCase().includes(rec.brand.toLowerCase()) ||
        product.title.toLowerCase().includes(rec.model.toLowerCase())
      ) || amazonProducts[0] // Fallback to first result

      recommendations.push({
        brand: rec.brand,
        model: rec.model,
        priceRange: bestMatch?.price?.displayAmount || rec.priceRange || 'Price not available',
        description: rec.description || bestMatch?.title || 'No description available',
        whyRecommended: rec.whyRecommended || 'Recommended for your court type',
        purchaseLinks: {
          amazon: bestMatch ? `https://www.amazon.com/dp/${bestMatch.asin}?tag=${associateId}` : 
                  generateAmazonSearchLink(rec.brand, rec.model),
          retailer: rec.purchaseLinks?.retailer || '',
          direct: rec.purchaseLinks?.direct || ''
        },
        userRating: bestMatch?.customerReviews ? 
          `${bestMatch.customerReviews.starRating}/5 stars (${bestMatch.customerReviews.count} reviews)` :
          rec.userRating || 'Rating not available',
        features: Array.isArray(rec.features) ? rec.features : 
                 (bestMatch?.features || ['High quality', 'Durable construction']),
        suitableFor: Array.isArray(rec.suitableFor) ? rec.suitableFor : 
                    [`${courtContext.surface} courts`, `${courtContext.environment} play`],
        category: rec.category || 'Sports Equipment',
        imageUrl: bestMatch?.images?.primary?.medium?.url || 
                 rec.imageUrl || 
                 generatePlaceholderImage(rec.category)
      })
    } catch (error) {
      console.warn(`Failed to fetch Amazon data for ${rec.brand} ${rec.model}:`, error)
      
      // Fallback to Claude recommendation with Amazon search link
      recommendations.push({
        brand: rec.brand,
        model: rec.model,
        priceRange: rec.priceRange || 'Price not available',
        description: rec.description || 'No description available',
        whyRecommended: rec.whyRecommended || 'Recommended for your court type',
        purchaseLinks: {
          amazon: generateAmazonSearchLink(rec.brand, rec.model),
          retailer: rec.purchaseLinks?.retailer || '',
          direct: rec.purchaseLinks?.direct || ''
        },
        userRating: rec.userRating || 'Rating not available',
        features: Array.isArray(rec.features) ? rec.features : [],
        suitableFor: Array.isArray(rec.suitableFor) ? rec.suitableFor : [],
        category: rec.category || 'Sports Equipment',
        imageUrl: rec.imageUrl || generatePlaceholderImage(rec.category)
      })
    }
  }

  // If no Claude recommendations, search Amazon directly
  if (recommendations.length === 0) {
    try {
      const directAmazonSearch = await amazonAPI.searchSportEquipment(
        courtContext.sport || 'sports',
        userMessage,
        courtContext.surface,
        courtContext.environment
      )

      for (const amazonProduct of directAmazonSearch.slice(0, 3)) {
        const brandModel = amazonProduct.title.split(' ')
        const brand = brandModel[0] || 'Various'
        const model = brandModel.slice(1, 3).join(' ') || 'Recommended Product'

        recommendations.push({
          brand,
          model,
          priceRange: amazonProduct.price?.displayAmount || 'Price not available',
          description: amazonProduct.title,
          whyRecommended: `Perfect for ${courtContext.sport} on ${courtContext.surface} ${courtContext.environment} courts`,
          purchaseLinks: {
            amazon: amazonProduct.url,
            retailer: '',
            direct: ''
          },
          userRating: amazonProduct.customerReviews ? 
            `${amazonProduct.customerReviews.starRating}/5 stars (${amazonProduct.customerReviews.count} reviews)` :
            '4.0/5 stars',
          features: amazonProduct.features || ['High quality', 'Durable construction'],
          suitableFor: [`${courtContext.surface} courts`, `${courtContext.environment} play`],
          category: 'Sports Equipment',
          imageUrl: amazonProduct.images?.primary?.medium?.url || generatePlaceholderImage('sports')
        })
      }
    } catch (error) {
      console.warn('Failed to fetch direct Amazon search results:', error)
    }
  }

  return recommendations
}

// Helper function to generate Amazon search links
function generateAmazonSearchLink(brand: string, model: string): string {
  const searchQuery = encodeURIComponent(`${brand} ${model}`.trim())
  const associateId = process.env.AMAZON_ASSOCIATE_ID || 'courtsfinder-20'
  return `https://www.amazon.com/s?k=${searchQuery}&tag=${associateId}`
}

// Helper function to generate placeholder images
function generatePlaceholderImage(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'tennis': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop',
    'basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=300&fit=crop',
    'pickleball': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&h=300&fit=crop',
    'volleyball': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    'sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop'
  }
  
  return categoryMap[category.toLowerCase()] || categoryMap['sports']
}

// Main POST handler
export async function POST(request: NextRequest) {
  let requestData: ChatRequest | null = null
  
  try {
    // Rate limiting
    const ip = getIP(request)
    
    if (ratelimit) {
      // Use Redis-based rate limiting
      const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip)
      
      if (!success) {
        console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`)
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter: Math.round((reset - Date.now()) / 1000),
            success: false
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
              'Retry-After': Math.round((reset - Date.now()) / 1000).toString()
            }
          }
        )
      }
    } else {
      // Use in-memory rate limiting
      const rateLimitCheck = checkRateLimit(ip)
      
      if (!rateLimitCheck.success) {
        console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`)
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter: rateLimitCheck.retryAfter || 60,
            success: false
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': RATE_LIMIT.toString(),
              'X-RateLimit-Remaining': '0',
              'Retry-After': (rateLimitCheck.retryAfter || 60).toString()
            }
          }
        )
      }
    }

    // Parse and validate request
    const body = await request.json()
    requestData = validateRequest(body)
    
    console.log('🎾 Equipment recommendation request:', {
      message: requestData.userMessage,
      context: requestData.courtContext,
      ip: ip.substring(0, 8) + '...' // Log partial IP for debugging
    })

    // Generate recommendations
    const recommendations = await getEquipmentRecommendations(
      requestData.userMessage,
      requestData.courtContext,
      requestData.conversationHistory
    )

    // Create response without rate limit headers for now
    const response = NextResponse.json(recommendations, {
      status: 200
    })

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')

    console.log(`✅ Successfully generated ${recommendations.totalRecommendations} recommendations`)
    
    return response

  } catch (error) {
    console.error('❌ API Error:', error)

    // Handle specific error types
    if (error instanceof APIError) {
      return NextResponse.json(
        {
          error: error.errorCode,
          message: error.message,
          success: false,
          timestamp: new Date().toISOString()
        },
        { status: error.statusCode }
      )
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'INVALID_JSON',
          message: 'Invalid JSON in request body',
          success: false
        },
        { status: 400 }
      )
    }

    // Generic error handler
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while processing your request',
        success: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// GET handler for API documentation
export async function GET() {
  const documentation = {
    endpoint: '/api/chat/recommendations',
    method: 'POST',
    description: 'Get AI-powered sports equipment recommendations based on court context',
    rateLimit: '10 requests per minute per IP',
    requestBody: {
      userMessage: 'string (required, max 1000 chars)',
      courtContext: {
        courtType: 'string (optional)',
        location: 'string (optional)',
        surface: 'string (optional)',
        environment: 'indoor | outdoor (optional)',
        sport: 'string (optional)',
        amenities: 'string[] (optional)',
        priceRange: 'string (optional)'
      },
      conversationHistory: 'array (optional, max 5 messages)'
    },
    responseFormat: {
      message: 'string',
      recommendations: 'ProductRecommendation[]',
      courtSpecificTips: 'string[]',
      totalRecommendations: 'number',
      generatedAt: 'string (ISO date)',
      success: 'boolean'
    },
    examples: {
      request: {
        userMessage: 'What tennis racquet should I get for clay courts?',
        courtContext: {
          courtType: 'Tennis court',
          location: 'Paris, France',
          surface: 'clay',
          environment: 'outdoor',
          sport: 'tennis',
          priceRange: '$100-300'
        }
      }
    }
  }

  return NextResponse.json(documentation, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600' // Cache docs for 1 hour
    }
  })
}