// Fallback response system for chatbot errors and failures

import { FAQ_CATEGORIES, FAQ_RESPONSES } from './chatbot-analytics'

export interface FallbackConfig {
  trigger: string
  priority: number
  condition: (context: any) => boolean
  responses: string[]
  followUpSuggestions?: string[]
  escalationPath?: 'human' | 'retry' | 'alternative'
}

export interface FallbackContext {
  errorType?: string
  userMessage: string
  courtContext?: any
  conversationHistory?: any[]
  attemptCount: number
  lastError?: Error
  abTestVariant?: string
}

// Comprehensive fallback response configurations
export const FALLBACK_CONFIGS: FallbackConfig[] = [
  // API/Network Errors
  {
    trigger: 'api_error',
    priority: 1,
    condition: (ctx) => ctx.errorType === 'api_error' || ctx.errorType === 'network_error',
    responses: [
      "I'm having trouble connecting to our recommendation service right now. Let me try to help you with some general guidance based on your question.",
      "Our system is experiencing some connectivity issues, but I can still provide you with popular equipment recommendations for your sport.",
      "While I work on reconnecting to our database, here are some highly-rated options that might interest you."
    ],
    followUpSuggestions: [
      "Would you like me to try again in a moment?",
      "Can I help you with general equipment advice while the system recovers?",
      "Would you prefer some popular product categories to browse?"
    ],
    escalationPath: 'retry'
  },

  // Rate Limiting
  {
    trigger: 'rate_limit',
    priority: 1,
    condition: (ctx) => ctx.errorType === 'rate_limit',
    responses: [
      "I'm getting a lot of questions right now! Please wait a moment and I'll be right with you.",
      "Thanks for your patience! I'm helping several players find great equipment. I'll be with you shortly.",
      "You're eager to find great gear - I like that! Give me just a moment to catch up."
    ],
    followUpSuggestions: [
      "Try asking again in 30 seconds",
      "Browse our popular equipment categories while you wait",
      "Check out our featured recommendations below"
    ],
    escalationPath: 'retry'
  },

  // Claude AI Errors
  {
    trigger: 'claude_error',
    priority: 2,
    condition: (ctx) => ctx.errorType === 'claude_error' || ctx.errorType === 'ai_error',
    responses: [
      "I'm having a brief moment of confusion, but I can still help! Let me provide some tried-and-true recommendations.",
      "My AI brain is having a hiccup, but my knowledge base is still here! Here are some reliable options.",
      "Technical difficulties aside, I've got plenty of great equipment knowledge to share with you."
    ],
    followUpSuggestions: [
      "Ask me about specific equipment types",
      "Tell me your skill level for better recommendations",
      "Let me know your budget range"
    ],
    escalationPath: 'alternative'
  },

  // Validation Errors
  {
    trigger: 'validation_error',
    priority: 3,
    condition: (ctx) => ctx.errorType === 'validation_error',
    responses: [
      "I didn't quite catch what you're looking for. Could you be more specific about the equipment you need?",
      "Help me understand better - what sport are you shopping for?",
      "I want to give you the best recommendations. Can you tell me more about what you're looking for?"
    ],
    followUpSuggestions: [
      "Try asking about tennis, basketball, pickleball, or volleyball equipment",
      "Mention your skill level (beginner, intermediate, advanced)",
      "Include your budget range if you have one"
    ],
    escalationPath: 'alternative'
  },

  // Unknown/Uncategorized Questions
  {
    trigger: 'unknown_question',
    priority: 4,
    condition: (ctx) => !ctx.errorType && ctx.attemptCount > 0,
    responses: [
      "That's an interesting question! While I specialize in sports equipment, let me see what I can suggest.",
      "I might not have specific info on that, but I can definitely help with equipment recommendations for your sport.",
      "Let me focus on what I do best - finding you amazing sports gear! What sport are you playing?"
    ],
    followUpSuggestions: [
      "Ask about racquets, shoes, balls, or accessories",
      "Tell me about the court you're playing on",
      "Let me know if you're a beginner or experienced player"
    ],
    escalationPath: 'alternative'
  },

  // Multiple Failures
  {
    trigger: 'multiple_failures',
    priority: 1,
    condition: (ctx) => ctx.attemptCount >= 3,
    responses: [
      "I'm really sorry for the trouble! Let me connect you with some of our most popular equipment categories instead.",
      "This is frustrating - let me try a completely different approach to help you find what you need.",
      "I apologize for the technical difficulties. Here are some universally loved products while I get my act together!"
    ],
    followUpSuggestions: [
      "Browse our bestsellers section",
      "Check out beginner-friendly options",
      "See our expert-recommended gear"
    ],
    escalationPath: 'human'
  },

  // Court-Specific Fallbacks
  {
    trigger: 'court_specific',
    priority: 3,
    condition: (ctx) => ctx.courtContext && ctx.courtContext.sport,
    responses: [
      `Great question about {sport} equipment! Even though I'm having technical issues, I can share some popular {sport} gear recommendations.`,
      `{sport} is awesome! While my main system catches up, here are some {sport} essentials that players love.`,
      `Perfect timing - {sport} season is always a good time to upgrade your gear! Let me suggest some favorites.`
    ],
    followUpSuggestions: [
      "Ask about specific {sport} equipment types",
      "Tell me about your {sport} skill level", 
      "Mention if you play indoor or outdoor {sport}"
    ],
    escalationPath: 'alternative'
  }
]

class FallbackResponseManager {
  private static fallbackHistory = new Map<string, number>()

  static getFallbackResponse(context: FallbackContext): {
    message: string
    suggestions: string[]
    escalationPath?: string
    fallbackType: string
  } {
    // Find the most appropriate fallback config
    const configs = FALLBACK_CONFIGS
      .filter(config => config.condition(context))
      .sort((a, b) => a.priority - b.priority)

    let selectedConfig = configs[0]
    let fallbackType = selectedConfig?.trigger || 'generic'

    // If no specific config found, use generic fallback
    if (!selectedConfig) {
      selectedConfig = this.getGenericFallback(context)
      fallbackType = 'generic'
    }

    // Select response based on usage history to avoid repetition
    const historyKey = `${context.userMessage}_${fallbackType}`
    const usageCount = this.fallbackHistory.get(historyKey) || 0
    const responseIndex = usageCount % selectedConfig.responses.length
    
    let message = selectedConfig.responses[responseIndex]
    
    // Replace placeholders with context
    if (context.courtContext?.sport) {
      message = message.replace(/\{sport\}/g, context.courtContext.sport)
    }

    // Increment usage counter
    this.fallbackHistory.set(historyKey, usageCount + 1)

    // Get contextual suggestions
    const suggestions = this.getContextualSuggestions(context, selectedConfig)

    return {
      message,
      suggestions,
      escalationPath: selectedConfig.escalationPath,
      fallbackType
    }
  }

  private static getGenericFallback(context: FallbackContext): FallbackConfig {
    return {
      trigger: 'generic',
      priority: 10,
      condition: () => true,
      responses: [
        "I'm here to help you find the perfect sports equipment! What sport are you playing?",
        "Let's get you equipped for success! Tell me about the sport you're interested in.",
        "I love helping athletes find great gear! What equipment are you shopping for?"
      ],
      followUpSuggestions: [
        "Browse tennis equipment",
        "Check out basketball gear", 
        "Explore pickleball equipment",
        "See volleyball essentials"
      ]
    }
  }

  private static getContextualSuggestions(context: FallbackContext, config: FallbackConfig): string[] {
    const baseSuggestions = config.followUpSuggestions || []
    const contextualSuggestions: string[] = []

    // Add sport-specific suggestions
    if (context.courtContext?.sport) {
      const sport = context.courtContext.sport
      contextualSuggestions.push(`Show me ${sport} equipment`)
      
      if (context.courtContext.surface) {
        contextualSuggestions.push(`Best gear for ${context.courtContext.surface} courts`)
      }
      
      if (context.courtContext.environment) {
        contextualSuggestions.push(`${context.courtContext.environment} ${sport} equipment`)
      }
    }

    // Add FAQ-based suggestions
    const category = this.categorizeUserMessage(context.userMessage)
    if (category && FAQ_RESPONSES[category]) {
      const faqSuggestions = this.getFAQSuggestions(category)
      contextualSuggestions.push(...faqSuggestions.slice(0, 2))
    }

    // Combine and limit suggestions
    return [...contextualSuggestions, ...baseSuggestions].slice(0, 4)
  }

  private static categorizeUserMessage(message: string): string | null {
    const lowerMessage = message.toLowerCase()
    
    // Simple keyword matching for categorization
    if (lowerMessage.includes('tennis')) return FAQ_CATEGORIES.TENNIS_EQUIPMENT
    if (lowerMessage.includes('basketball')) return FAQ_CATEGORIES.BASKETBALL_EQUIPMENT
    if (lowerMessage.includes('pickleball')) return FAQ_CATEGORIES.PICKLEBALL_EQUIPMENT
    if (lowerMessage.includes('volleyball')) return FAQ_CATEGORIES.VOLLEYBALL_EQUIPMENT
    if (lowerMessage.includes('beginner') || lowerMessage.includes('start')) return FAQ_CATEGORIES.BEGINNER_ADVICE
    if (lowerMessage.includes('budget') || lowerMessage.includes('cheap')) return FAQ_CATEGORIES.BUDGET_OPTIONS
    
    return null
  }

  private static getFAQSuggestions(category: string): string[] {
    const suggestions: string[] = []
    
    switch (category) {
      case FAQ_CATEGORIES.TENNIS_EQUIPMENT:
        suggestions.push("What tennis racquet should I get?", "Best tennis shoes for clay courts?")
        break
      case FAQ_CATEGORIES.BASKETBALL_EQUIPMENT:
        suggestions.push("Best basketball shoes for outdoor courts?", "What basketball should I buy?")
        break
      case FAQ_CATEGORIES.PICKLEBALL_EQUIPMENT:
        suggestions.push("Pickleball paddle for beginners?", "Complete pickleball starter set?")
        break
      case FAQ_CATEGORIES.VOLLEYBALL_EQUIPMENT:
        suggestions.push("Best volleyball for indoor play?", "Volleyball knee pads recommendations?")
        break
      case FAQ_CATEGORIES.BEGINNER_ADVICE:
        suggestions.push("Equipment for tennis beginners?", "How to choose first sports gear?")
        break
      case FAQ_CATEGORIES.BUDGET_OPTIONS:
        suggestions.push("Best budget tennis racquet?", "Affordable basketball shoes?")
        break
    }
    
    return suggestions
  }

  // Generate emergency response with popular products
  static getEmergencyResponse(context: FallbackContext): {
    message: string
    products: any[]
    suggestions: string[]
  } {
    const sport = context.courtContext?.sport || 'tennis'
    
    const emergencyProducts = this.getEmergencyProducts(sport)
    
    const message = `I'm having technical difficulties, but I don't want to leave you empty-handed! Here are some universally loved ${sport} products that consistently get great reviews:`

    const suggestions = [
      `Tell me more about your ${sport} needs`,
      "What's your skill level?",
      "What's your budget range?",
      "Try asking again in a moment"
    ]

    return { message, products: emergencyProducts, suggestions }
  }

  private static getEmergencyProducts(sport: string): any[] {
    const products: Record<string, any[]> = {
      tennis: [
        {
          brand: "Wilson",
          model: "Clash 100",
          priceRange: "$200-250",
          description: "Versatile racquet perfect for intermediate players",
          whyRecommended: "Great control and power balance, works on all court surfaces",
          userRating: "4.5/5 stars (1,200+ reviews)",
          category: "Tennis Racquet"
        },
        {
          brand: "Nike",
          model: "Air Zoom Vapor",
          priceRange: "$120-150",
          description: "Professional-grade tennis shoes",
          whyRecommended: "Excellent court grip and durability",
          userRating: "4.4/5 stars (800+ reviews)",
          category: "Tennis Shoes"
        }
      ],
      basketball: [
        {
          brand: "Nike",
          model: "Air Jordan 36",
          priceRange: "$180-220",
          description: "High-performance basketball shoes",
          whyRecommended: "Superior ankle support and court traction",
          userRating: "4.6/5 stars (500+ reviews)",
          category: "Basketball Shoes"
        },
        {
          brand: "Spalding",
          model: "NBA Official",
          priceRange: "$60-80",
          description: "Official NBA game basketball",
          whyRecommended: "Professional quality for serious players",
          userRating: "4.7/5 stars (2,000+ reviews)",
          category: "Basketball"
        }
      ],
      pickleball: [
        {
          brand: "Selkirk",
          model: "AMPED S2",
          priceRange: "$120-150",
          description: "Popular all-around pickleball paddle",
          whyRecommended: "Perfect for beginners and intermediate players",
          userRating: "4.5/5 stars (300+ reviews)",
          category: "Pickleball Paddle"
        }
      ]
    }

    return products[sport] || products.tennis
  }

  // Clear usage history (for testing or reset)
  static clearHistory(): void {
    this.fallbackHistory.clear()
  }

  // Get usage statistics
  static getUsageStats(): Record<string, number> {
    return Object.fromEntries(this.fallbackHistory.entries())
  }
}

export default FallbackResponseManager

// Utility function for easy integration
export function handleChatbotError(
  error: Error,
  userMessage: string,
  courtContext?: any,
  conversationHistory?: any[],
  attemptCount = 1
): {
  message: string
  suggestions: string[]
  escalationPath?: string
  fallbackType: string
  products?: any[]
} {
  const context: FallbackContext = {
    errorType: determineErrorType(error),
    userMessage,
    courtContext,
    conversationHistory,
    attemptCount,
    lastError: error
  }

  // For critical errors or multiple failures, provide emergency response
  if (attemptCount >= 3 || context.errorType === 'critical_error') {
    return FallbackResponseManager.getEmergencyResponse(context)
  }

  return FallbackResponseManager.getFallbackResponse(context)
}

function determineErrorType(error: Error): string {
  const message = error.message.toLowerCase()
  
  if (message.includes('network') || message.includes('fetch')) return 'network_error'
  if (message.includes('rate limit')) return 'rate_limit'
  if (message.includes('api') || message.includes('500')) return 'api_error'
  if (message.includes('claude') || message.includes('anthropic')) return 'claude_error'
  if (message.includes('validation') || message.includes('400')) return 'validation_error'
  if (message.includes('timeout')) return 'timeout_error'
  
  return 'unknown_error'
}