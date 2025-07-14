// Analytics tracking for ProductChatBot
import { Court } from '@/types/court'

// Analytics event types
export interface ChatbotAnalyticsEvent {
  id: string
  timestamp: Date
  sessionId: string
  userId?: string
  eventType: 'question_asked' | 'product_clicked' | 'chat_opened' | 'chat_closed' | 'error_occurred' | 'fallback_triggered'
  data: Record<string, any>
  courtContext?: CourtContextAnalytics
  abTestVariant?: string
}

export interface CourtContextAnalytics {
  courtId?: string | number
  courtName?: string
  sport?: string
  surface?: string
  environment?: 'indoor' | 'outdoor'
  location?: string
  priceRange?: string
  amenities?: string[]
  searchQuery?: string
  selectedSport?: string
}

export interface QuestionAnalytics {
  question: string
  normalizedQuestion: string
  category: string
  frequency: number
  firstAsked: Date
  lastAsked: Date
  courtContexts: CourtContextAnalytics[]
  avgResponseTime: number
  satisfactionScore?: number
}

export interface ProductClickAnalytics {
  productId: string
  productName: string
  brand: string
  category: string
  priceRange: string
  clickedAt: Date
  purchaseLink: string
  linkType: 'amazon' | 'retailer' | 'direct'
  courtContext: CourtContextAnalytics
  questionContext: string
  conversionTracked?: boolean
}

export interface ABTestVariant {
  id: string
  name: string
  promptTemplate: string
  isActive: boolean
  trafficPercentage: number
  metrics: {
    impressions: number
    clickThroughRate: number
    userSatisfaction: number
    avgResponseTime: number
  }
}

export interface ErrorAnalytics {
  errorType: string
  errorMessage: string
  stack?: string
  courtContext?: CourtContextAnalytics
  userAction: string
  recoveryAction?: string
  timestamp: Date
}

// FAQ Question Categories (based on the 250 questions provided)
export const FAQ_CATEGORIES = {
  TENNIS_EQUIPMENT: 'tennis_equipment',
  BASKETBALL_EQUIPMENT: 'basketball_equipment',
  PICKLEBALL_EQUIPMENT: 'pickleball_equipment',
  VOLLEYBALL_EQUIPMENT: 'volleyball_equipment',
  COURT_SURFACES: 'court_surfaces',
  BEGINNER_ADVICE: 'beginner_advice',
  ADVANCED_TECHNIQUES: 'advanced_techniques',
  EQUIPMENT_MAINTENANCE: 'equipment_maintenance',
  SIZING_FIT: 'sizing_fit',
  BUDGET_OPTIONS: 'budget_options',
  BRAND_COMPARISONS: 'brand_comparisons',
  SEASONAL_GEAR: 'seasonal_gear',
  SAFETY_EQUIPMENT: 'safety_equipment',
  TRAINING_EQUIPMENT: 'training_equipment',
  ACCESSORIES: 'accessories'
} as const

// Common FAQ patterns for categorization
export const FAQ_PATTERNS = [
  // Tennis Equipment
  { pattern: /tennis.*racket|racquet.*tennis/i, category: FAQ_CATEGORIES.TENNIS_EQUIPMENT },
  { pattern: /tennis.*string|string.*tennis/i, category: FAQ_CATEGORIES.TENNIS_EQUIPMENT },
  { pattern: /tennis.*ball|ball.*tennis/i, category: FAQ_CATEGORIES.TENNIS_EQUIPMENT },
  { pattern: /tennis.*shoe|shoe.*tennis/i, category: FAQ_CATEGORIES.TENNIS_EQUIPMENT },
  
  // Basketball Equipment
  { pattern: /basketball.*shoe|shoe.*basketball/i, category: FAQ_CATEGORIES.BASKETBALL_EQUIPMENT },
  { pattern: /basketball.*ball|ball.*basketball/i, category: FAQ_CATEGORIES.BASKETBALL_EQUIPMENT },
  { pattern: /basketball.*hoop|hoop.*basketball/i, category: FAQ_CATEGORIES.BASKETBALL_EQUIPMENT },
  
  // Pickleball Equipment
  { pattern: /pickleball.*paddle|paddle.*pickleball/i, category: FAQ_CATEGORIES.PICKLEBALL_EQUIPMENT },
  { pattern: /pickleball.*ball|ball.*pickleball/i, category: FAQ_CATEGORIES.PICKLEBALL_EQUIPMENT },
  { pattern: /pickleball.*net|net.*pickleball/i, category: FAQ_CATEGORIES.PICKLEBALL_EQUIPMENT },
  
  // Volleyball Equipment
  { pattern: /volleyball.*ball|ball.*volleyball/i, category: FAQ_CATEGORIES.VOLLEYBALL_EQUIPMENT },
  { pattern: /volleyball.*net|net.*volleyball/i, category: FAQ_CATEGORIES.VOLLEYBALL_EQUIPMENT },
  { pattern: /volleyball.*knee.*pad|knee.*pad.*volleyball/i, category: FAQ_CATEGORIES.VOLLEYBALL_EQUIPMENT },
  
  // Court Surfaces
  { pattern: /clay.*court|hard.*court|grass.*court/i, category: FAQ_CATEGORIES.COURT_SURFACES },
  { pattern: /indoor.*outdoor|surface.*type/i, category: FAQ_CATEGORIES.COURT_SURFACES },
  
  // Beginner/Advanced
  { pattern: /beginner|start|first.*time|new.*to/i, category: FAQ_CATEGORIES.BEGINNER_ADVICE },
  { pattern: /advanced|professional|pro.*level|tournament/i, category: FAQ_CATEGORIES.ADVANCED_TECHNIQUES },
  
  // Budget/Pricing
  { pattern: /budget|cheap|affordable|under.*\$|price/i, category: FAQ_CATEGORIES.BUDGET_OPTIONS },
  { pattern: /best.*value|cost.*effective|worth.*money/i, category: FAQ_CATEGORIES.BUDGET_OPTIONS },
  
  // Brand Comparisons
  { pattern: /wilson.*vs|nike.*vs|adidas.*vs|compare.*brand/i, category: FAQ_CATEGORIES.BRAND_COMPARISONS },
  { pattern: /which.*brand|best.*brand|recommend.*brand/i, category: FAQ_CATEGORIES.BRAND_COMPARISONS },
  
  // Sizing and Fit
  { pattern: /size|fit|measurement|how.*big|what.*size/i, category: FAQ_CATEGORIES.SIZING_FIT },
  
  // Maintenance
  { pattern: /care|clean|maintain|last.*long|durability/i, category: FAQ_CATEGORIES.EQUIPMENT_MAINTENANCE },
  
  // Safety
  { pattern: /safety|protect|injury|prevent/i, category: FAQ_CATEGORIES.SAFETY_EQUIPMENT },
  
  // Training
  { pattern: /training|practice|drill|improve.*skill/i, category: FAQ_CATEGORIES.TRAINING_EQUIPMENT },
  
  // Accessories
  { pattern: /bag|grip|accessory|extra|additional/i, category: FAQ_CATEGORIES.ACCESSORIES }
]

class ChatbotAnalytics {
  private sessionId: string
  private userId?: string
  private abTestVariant?: string

  constructor(userId?: string) {
    this.sessionId = this.generateSessionId()
    this.userId = userId
    this.abTestVariant = this.getABTestVariant()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getABTestVariant(): string {
    // Simple A/B test assignment (50/50 split)
    const variants = ['control', 'variant_a']
    const hash = this.sessionId.split('_')[1]
    const index = parseInt(hash) % variants.length
    return variants[index]
  }

  // Track when user asks a question
  async trackQuestion(question: string, courtContext?: CourtContextAnalytics): Promise<void> {
    const category = this.categorizeQuestion(question)
    const normalizedQuestion = this.normalizeQuestion(question)
    
    const event: ChatbotAnalyticsEvent = {
      id: `question_${Date.now()}`,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
      eventType: 'question_asked',
      data: {
        question,
        normalizedQuestion,
        category,
        questionLength: question.length,
        containsQuestionMark: question.includes('?')
      },
      courtContext,
      abTestVariant: this.abTestVariant
    }

    await this.sendEvent(event)
    await this.updateQuestionFrequency(normalizedQuestion, category, courtContext)
  }

  // Track when user clicks on a product recommendation
  async trackProductClick(
    productId: string,
    productName: string,
    brand: string,
    category: string,
    priceRange: string,
    purchaseLink: string,
    linkType: 'amazon' | 'retailer' | 'direct',
    questionContext: string,
    courtContext?: CourtContextAnalytics
  ): Promise<void> {
    const event: ChatbotAnalyticsEvent = {
      id: `product_click_${Date.now()}`,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
      eventType: 'product_clicked',
      data: {
        productId,
        productName,
        brand,
        category,
        priceRange,
        purchaseLink,
        linkType,
        questionContext
      },
      courtContext,
      abTestVariant: this.abTestVariant
    }

    await this.sendEvent(event)
    await this.updateClickThroughRates(category, linkType)
  }

  // Track chat opening/closing
  async trackChatState(isOpen: boolean, courtContext?: CourtContextAnalytics): Promise<void> {
    const event: ChatbotAnalyticsEvent = {
      id: `chat_${isOpen ? 'opened' : 'closed'}_${Date.now()}`,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
      eventType: isOpen ? 'chat_opened' : 'chat_closed',
      data: {
        action: isOpen ? 'opened' : 'closed',
        timestamp: new Date().toISOString()
      },
      courtContext,
      abTestVariant: this.abTestVariant
    }

    await this.sendEvent(event)
  }

  // Track errors and fallback responses
  async trackError(
    errorType: string,
    errorMessage: string,
    userAction: string,
    courtContext?: CourtContextAnalytics,
    stack?: string,
    recoveryAction?: string
  ): Promise<void> {
    const event: ChatbotAnalyticsEvent = {
      id: `error_${Date.now()}`,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
      eventType: 'error_occurred',
      data: {
        errorType,
        errorMessage,
        userAction,
        stack,
        recoveryAction,
        severity: this.getErrorSeverity(errorType)
      },
      courtContext,
      abTestVariant: this.abTestVariant
    }

    await this.sendEvent(event)
  }

  // Track when fallback responses are triggered
  async trackFallback(
    trigger: string,
    fallbackType: string,
    courtContext?: CourtContextAnalytics
  ): Promise<void> {
    const event: ChatbotAnalyticsEvent = {
      id: `fallback_${Date.now()}`,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
      eventType: 'fallback_triggered',
      data: {
        trigger,
        fallbackType,
        sessionLength: this.getSessionLength()
      },
      courtContext,
      abTestVariant: this.abTestVariant
    }

    await this.sendEvent(event)
  }

  // Categorize user questions using FAQ patterns
  private categorizeQuestion(question: string): string {
    const lowerQuestion = question.toLowerCase()
    
    for (const { pattern, category } of FAQ_PATTERNS) {
      if (pattern.test(lowerQuestion)) {
        return category
      }
    }
    
    return 'uncategorized'
  }

  // Normalize questions for frequency tracking
  private normalizeQuestion(question: string): string {
    return question
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  private getErrorSeverity(errorType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'network_error': 'medium',
      'api_error': 'high',
      'rate_limit': 'medium',
      'validation_error': 'low',
      'claude_error': 'high',
      'database_error': 'critical',
      'auth_error': 'medium'
    }
    
    return severityMap[errorType] || 'medium'
  }

  private getSessionLength(): number {
    const sessionStart = parseInt(this.sessionId.split('_')[1])
    return Date.now() - sessionStart
  }

  // Send event to analytics backend
  private async sendEvent(event: ChatbotAnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })
    } catch (error) {
      console.error('Failed to send analytics event:', error)
      // Store locally for retry later
      this.storeEventLocally(event)
    }
  }

  // Update question frequency tracking
  private async updateQuestionFrequency(
    normalizedQuestion: string,
    category: string,
    courtContext?: CourtContextAnalytics
  ): Promise<void> {
    try {
      await fetch('/api/analytics/chatbot/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          normalizedQuestion,
          category,
          courtContext,
          timestamp: new Date()
        })
      })
    } catch (error) {
      console.error('Failed to update question frequency:', error)
    }
  }

  // Update click-through rates
  private async updateClickThroughRates(category: string, linkType: string): Promise<void> {
    try {
      await fetch('/api/analytics/chatbot/clicks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          linkType,
          timestamp: new Date(),
          abTestVariant: this.abTestVariant
        })
      })
    } catch (error) {
      console.error('Failed to update click-through rates:', error)
    }
  }

  // Store events locally when API is unavailable
  private storeEventLocally(event: ChatbotAnalyticsEvent): void {
    try {
      const stored = localStorage.getItem('chatbot_analytics_queue') || '[]'
      const queue = JSON.parse(stored)
      queue.push(event)
      localStorage.setItem('chatbot_analytics_queue', JSON.stringify(queue))
    } catch (error) {
      console.error('Failed to store event locally:', error)
    }
  }

  // Retry failed events from local storage
  async retryFailedEvents(): Promise<void> {
    try {
      const stored = localStorage.getItem('chatbot_analytics_queue')
      if (!stored) return

      const queue = JSON.parse(stored)
      const successful: string[] = []

      for (const event of queue) {
        try {
          await this.sendEvent(event)
          successful.push(event.id)
        } catch (error) {
          console.error('Failed to retry event:', event.id, error)
        }
      }

      // Remove successful events from queue
      const remaining = queue.filter((event: ChatbotAnalyticsEvent) => 
        !successful.includes(event.id)
      )
      localStorage.setItem('chatbot_analytics_queue', JSON.stringify(remaining))
    } catch (error) {
      console.error('Failed to retry events:', error)
    }
  }

  // Get current A/B test variant
  getABTestVariantName(): string {
    return this.abTestVariant || 'control'
  }

  // Get session information
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      abTestVariant: this.abTestVariant,
      sessionLength: this.getSessionLength()
    }
  }
}

// Export singleton instance
export const chatbotAnalytics = new ChatbotAnalytics()

// Utility function to create analytics instance with user ID
export function createChatbotAnalytics(userId?: string): ChatbotAnalytics {
  return new ChatbotAnalytics(userId)
}

// FAQ Question Bank for fallback responses (sample from the 250 questions)
export const FAQ_RESPONSES: Record<string, string[]> = {
  [FAQ_CATEGORIES.TENNIS_EQUIPMENT]: [
    "For tennis racquets, I recommend starting with a head size between 100-110 square inches for better power and forgiveness.",
    "Tennis strings typically last 40-50 hours of play. Polyester strings offer durability, while multifilament provides comfort.",
    "For clay courts, choose racquets with open string patterns (16x19) for better topspin generation."
  ],
  [FAQ_CATEGORIES.BASKETBALL_EQUIPMENT]: [
    "Basketball shoes should provide ankle support and good traction. Look for brands like Nike, Adidas, or Jordan.",
    "For outdoor basketball, choose a rubber ball that can handle rough surfaces. Spalding and Wilson make excellent options.",
    "Indoor basketball shoes have softer soles for better court grip, while outdoor shoes need more durable rubber."
  ],
  [FAQ_CATEGORIES.PICKLEBALL_EQUIPMENT]: [
    "Beginner pickleball paddles should be lightweight (7.5-8.5 oz) with a larger sweet spot for easier play.",
    "Pickleball balls differ for indoor (softer) and outdoor (harder) play. Choose accordingly for your court type.",
    "Court shoes for pickleball should offer lateral support and non-marking soles for indoor courts."
  ],
  [FAQ_CATEGORIES.BEGINNER_ADVICE]: [
    "Start with entry-level equipment that offers forgiveness and ease of use rather than advanced performance features.",
    "Focus on proper technique first, then upgrade your equipment as your skills improve.",
    "Consider taking lessons or joining beginner groups to learn proper fundamentals."
  ],
  [FAQ_CATEGORIES.BUDGET_OPTIONS]: [
    "You don't need expensive equipment to start. Look for mid-range options that offer good value and durability.",
    "Consider previous year's models or slightly used equipment for significant savings.",
    "Invest more in items you'll use frequently, like shoes, and save on accessories."
  ]
}

export default ChatbotAnalytics