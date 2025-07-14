// A/B Testing system for chatbot prompts and responses

export interface ABTestConfig {
  id: string
  name: string
  description: string
  isActive: boolean
  trafficSplit: Record<string, number> // variant -> percentage
  variants: Record<string, ABTestVariant>
  startDate: Date
  endDate?: Date
  targetMetric: 'ctr' | 'satisfaction' | 'response_time' | 'error_rate'
  minimumSampleSize: number
}

export interface ABTestVariant {
  id: string
  name: string
  promptTemplate: string
  systemPrompt?: string
  fallbackResponses?: string[]
  maxTokens?: number
  temperature?: number
  metadata?: Record<string, any>
}

export interface ABTestResult {
  variantId: string
  metric: string
  value: number
  sampleSize: number
  confidenceInterval: [number, number]
  significance: number
  isSignificant: boolean
}

// Active A/B tests configuration
export const ACTIVE_AB_TESTS: Record<string, ABTestConfig> = {
  prompt_optimization: {
    id: 'prompt_optimization',
    name: 'Recommendation Prompt Optimization',
    description: 'Testing different prompt styles for better product recommendations',
    isActive: true,
    trafficSplit: {
      control: 40,
      variant_a: 30,
      variant_b: 30
    },
    variants: {
      control: {
        id: 'control',
        name: 'Original Prompt',
        promptTemplate: `You are a sports equipment expert for CourtsFinders.com.

Current Context:
- Court Type: {courtType}
- Location: {location}
- Surface: {surface}
- Indoor/Outdoor: {environment}

User Question: {userMessage}

Provide 3-5 specific product recommendations with:
- Brand and model names
- Price ranges
- Why it's perfect for this court/context
- Purchase links (prioritize Amazon affiliate links)
- User ratings and reviews

Be helpful, specific, and focus on equipment that matches the court conditions.`,
        maxTokens: 1500,
        temperature: 0.7
      },
      variant_a: {
        id: 'variant_a',
        name: 'Enthusiastic Assistant',
        promptTemplate: `🎾 Hey there, sports enthusiast! I'm your personal equipment expert at CourtsFinders.com, and I'm EXCITED to help you find the perfect gear!

Here's what I know about your situation:
🏟️ Court: {courtType}
📍 Location: {location}
🎯 Surface: {surface}
🌤️ Environment: {environment}

Your Question: {userMessage}

Let me hook you up with 3-5 AMAZING product recommendations that'll level up your game:

For each recommendation, I'll give you:
✨ The exact brand and model (no generic stuff!)
💰 Real price ranges (I shop around for you!)
🔥 Why it's PERFECT for your specific court setup
🛒 Direct purchase links (Amazon affiliate when available)
⭐ Real user ratings and honest reviews
🏆 Pro tips on how to get the most out of each product

Let's find you some game-changing equipment! 🚀`,
        maxTokens: 1800,
        temperature: 0.8,
        fallbackResponses: [
          "🎾 Awesome question! While I search for the perfect recommendations, here are some quick tips...",
          "🏆 Great choice asking about equipment! Let me find you something amazing...",
          "🚀 I love helping players find their perfect gear! Give me a second to curate the best options..."
        ]
      },
      variant_b: {
        id: 'variant_b',
        name: 'Technical Expert',
        promptTemplate: `SPORTS EQUIPMENT ANALYSIS - CourtsFinders.com Technical Advisory

CONTEXT PARAMETERS:
- Court Classification: {courtType}
- Geographic Location: {location}  
- Playing Surface: {surface}
- Environment Type: {environment}

USER INQUIRY: {userMessage}

RECOMMENDATION PROTOCOL:
Generate 3-5 evidence-based equipment recommendations using the following criteria:

1. TECHNICAL SPECIFICATIONS
   - Brand and model identification
   - Performance characteristics matching court parameters
   - Material composition and durability ratings

2. COST-BENEFIT ANALYSIS
   - Price range with market comparison
   - Value proposition relative to performance
   - Long-term cost considerations

3. CONTEXTUAL OPTIMIZATION
   - Surface-specific performance benefits
   - Environmental factor considerations (indoor/outdoor, climate)
   - Skill level appropriateness

4. PROCUREMENT INFORMATION
   - Primary purchase channels (Amazon affiliate preferred)
   - User feedback aggregation (ratings/reviews)
   - Availability and shipping considerations

5. PERFORMANCE ENHANCEMENT NOTES
   - Technical advantages for specified court conditions
   - Maintenance and care requirements
   - Compatibility with existing equipment

Provide scientifically-backed recommendations with quantifiable benefits.`,
        maxTokens: 2000,
        temperature: 0.6,
        fallbackResponses: [
          "Analyzing optimal equipment parameters for your court specifications...",
          "Processing technical requirements against available product database...",
          "Evaluating performance metrics for your specific playing conditions..."
        ]
      }
    },
    startDate: new Date('2024-01-01'),
    targetMetric: 'ctr',
    minimumSampleSize: 100
  },

  response_style: {
    id: 'response_style',
    name: 'Response Style Testing',
    description: 'Testing different response formats and lengths',
    isActive: true,
    trafficSplit: {
      concise: 50,
      detailed: 50
    },
    variants: {
      concise: {
        id: 'concise',
        name: 'Concise Responses',
        promptTemplate: `You are a sports equipment expert. Give CONCISE, focused recommendations.

Context: {courtType} | {surface} | {environment} | {location}
Question: {userMessage}

Provide 3 quick recommendations:
- Brand & Model
- Price
- Why it's good for {surface} {courtType}
- Buy link

Keep it short and actionable.`,
        maxTokens: 800,
        temperature: 0.7
      },
      detailed: {
        id: 'detailed',
        name: 'Detailed Responses',
        promptTemplate: `You are a comprehensive sports equipment advisor for CourtsFinders.com.

Detailed Context Analysis:
- Court Type: {courtType}
- Location: {location}
- Surface: {surface}
- Environment: {environment}

User Question: {userMessage}

Provide comprehensive recommendations (4-5 products) with:

1. EQUIPMENT OVERVIEW
   - Brand, model, and key specifications
   - Target skill level and playing style

2. COURT-SPECIFIC BENEFITS
   - How it performs on {surface} surfaces
   - {environment} playing considerations
   - Climate and location factors

3. PRICING & VALUE
   - Current price range
   - Comparison to similar products
   - Long-term value assessment

4. USER EXPERIENCE
   - Customer ratings and feedback
   - Common pros and cons
   - Who should consider this product

5. PURCHASE GUIDANCE
   - Best places to buy (Amazon preferred)
   - Sizing and fitting tips
   - Warranty and return information

Provide expert-level detail to help users make informed decisions.`,
        maxTokens: 2500,
        temperature: 0.7
      }
    },
    startDate: new Date('2024-01-01'),
    targetMetric: 'satisfaction',
    minimumSampleSize: 150
  }
}

class ABTestManager {
  // Assign user to A/B test variant
  static assignVariant(testId: string, userId?: string, sessionId?: string): string {
    const test = ACTIVE_AB_TESTS[testId]
    if (!test || !test.isActive) {
      return 'control'
    }

    // Use consistent hashing for user assignment
    const identifier = userId || sessionId || 'anonymous'
    const hash = this.simpleHash(identifier + testId)
    const percentage = hash % 100

    let cumulative = 0
    for (const [variant, split] of Object.entries(test.trafficSplit)) {
      cumulative += split
      if (percentage < cumulative) {
        return variant
      }
    }

    return 'control'
  }

  // Get prompt template for assigned variant
  static getPromptTemplate(testId: string, variantId: string): string {
    const test = ACTIVE_AB_TESTS[testId]
    if (!test || !test.variants[variantId]) {
      return test?.variants.control?.promptTemplate || ''
    }

    return test.variants[variantId].promptTemplate
  }

  // Get variant configuration
  static getVariantConfig(testId: string, variantId: string): ABTestVariant | null {
    const test = ACTIVE_AB_TESTS[testId]
    if (!test || !test.variants[variantId]) {
      return test?.variants.control || null
    }

    return test.variants[variantId]
  }

  // Get fallback responses for variant
  static getFallbackResponses(testId: string, variantId: string): string[] {
    const variant = this.getVariantConfig(testId, variantId)
    return variant?.fallbackResponses || [
      "I'm having trouble finding specific recommendations right now, but I can help you with general guidance.",
      "Let me try a different approach to find the best equipment for you.",
      "I'm experiencing some technical difficulties, but I can still provide basic recommendations."
    ]
  }

  // Record A/B test event
  static async recordEvent(
    testId: string,
    variantId: string,
    eventType: string,
    value: number,
    sessionId: string
  ): Promise<void> {
    try {
      await fetch('/api/analytics/ab-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          variantId,
          eventType,
          value,
          sessionId,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to record A/B test event:', error)
    }
  }

  // Calculate statistical significance
  static calculateSignificance(
    controlSuccess: number,
    controlTotal: number,
    variantSuccess: number,
    variantTotal: number
  ): { pValue: number; isSignificant: boolean; improvement: number } {
    // Simple z-test for proportions
    const p1 = controlSuccess / controlTotal
    const p2 = variantSuccess / variantTotal
    
    const pooledP = (controlSuccess + variantSuccess) / (controlTotal + variantTotal)
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/controlTotal + 1/variantTotal))
    
    const z = Math.abs(p2 - p1) / se
    const pValue = 2 * (1 - this.normalCDF(Math.abs(z)))
    
    const improvement = ((p2 - p1) / p1) * 100
    
    return {
      pValue,
      isSignificant: pValue < 0.05,
      improvement
    }
  }

  // Helper: Simple hash function
  private static simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Helper: Normal CDF approximation
  private static normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)))
  }

  // Helper: Error function approximation
  private static erf(x: number): number {
    const a1 =  0.254829592
    const a2 = -0.284496736
    const a3 =  1.421413741
    const a4 = -1.453152027
    const a5 =  1.061405429
    const p  =  0.3275911

    const sign = x >= 0 ? 1 : -1
    x = Math.abs(x)

    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

    return sign * y
  }
}

export default ABTestManager

// Utility function to build prompts with A/B testing
export function buildPromptWithABTest(
  testId: string,
  userMessage: string,
  courtContext: any,
  sessionId: string,
  userId?: string
): { prompt: string; variantId: string; config: ABTestVariant | null } {
  const variantId = ABTestManager.assignVariant(testId, userId, sessionId)
  const config = ABTestManager.getVariantConfig(testId, variantId)
  
  if (!config) {
    return {
      prompt: userMessage,
      variantId: 'control',
      config: null
    }
  }

  const prompt = config.promptTemplate
    .replace('{userMessage}', userMessage)
    .replace('{courtType}', courtContext.courtType || 'General sports court')
    .replace('{location}', courtContext.location || 'Not specified')
    .replace('{surface}', courtContext.surface || 'Not specified')
    .replace('{environment}', courtContext.environment || 'outdoor')

  return { prompt, variantId, config }
}