'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Court } from '@/types/court'
import { createChatbotAnalytics, CourtContextAnalytics } from '@/lib/analytics/chatbot-analytics'
import ABTestManager, { buildPromptWithABTest } from '@/lib/analytics/ab-testing'
import { handleChatbotError } from '@/lib/analytics/fallback-responses'

// Types for chat functionality
interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  products?: ProductRecommendation[]
  isTyping?: boolean
}

interface ProductRecommendation {
  id: string
  name: string
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

interface CourtSearchContext {
  currentCourt?: Court | null
  searchQuery?: string
  selectedSport?: string
  location?: { lat: number; lng: number } | null
  searchResults?: Court[]
  filters?: {
    surface?: string
    indoor?: boolean
    priceRange?: { min?: number; max?: number }
    amenities?: string[]
  }
}

interface ProductChatBotProps {
  currentCourtSearch?: CourtSearchContext
  onChatStateChange?: (isOpen: boolean) => void
  className?: string
}

export default function ProductChatbot({ 
  currentCourtSearch = {},
  onChatStateChange,
  className = ""
}: ProductChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [analytics] = useState(() => createChatbotAnalytics())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  // Notify parent of chat state changes and track analytics
  useEffect(() => {
    onChatStateChange?.(isOpen)
    analytics.trackChatState(isOpen, buildCourtContextAnalytics())
  }, [isOpen, onChatStateChange])

  // Convert court context to analytics format
  const buildCourtContextAnalytics = (): CourtContextAnalytics => {
    const { currentCourt, selectedSport, location, filters, searchQuery } = currentCourtSearch
    
    // Determine the sport - prioritize currentCourt.sport, then selectedSport
    const detectedSport = currentCourt?.sport || selectedSport
    
    return {
      courtId: currentCourt?.id,
      courtName: currentCourt?.name,
      sport: detectedSport,
      surface: currentCourt?.surface || filters?.surface,
      environment: currentCourt?.indoor === false ? 'outdoor' : currentCourt?.indoor === true ? 'indoor' : 'outdoor',
      location: currentCourt?.address || (location ? `${location.lat}, ${location.lng}` : undefined),
      priceRange: filters?.priceRange ? `$${filters.priceRange.min || 0}-${filters.priceRange.max || 500}` : undefined,
      amenities: currentCourt?.amenities || filters?.amenities,
      searchQuery,
      selectedSport: detectedSport
    }
  }

  // Generate context-aware suggestions based on court search
  const getContextualSuggestions = (): Array<{ label: string; message: string }> => {
    const { currentCourt, selectedSport, searchResults } = currentCourtSearch

    const baseSuggestions = [
      { label: '🎾 Tennis Gear', message: 'Show me the best tennis equipment' },
      { label: '🏀 Basketball', message: 'What basketball gear do you recommend?' },
      { label: '🏓 Pickleball', message: 'I need pickleball equipment recommendations' },
      { label: '💰 Budget Options', message: 'Show me budget-friendly sports equipment' }
    ]

    // Sport-specific suggestions
    if (selectedSport && selectedSport !== 'all') {
      const sportSpecific = {
        'tennis': [
          { label: '🎾 Tennis Racquet', message: `What tennis racquet should I get for ${currentCourt?.surface || 'outdoor'} courts?` },
          { label: '👟 Tennis Shoes', message: `Best tennis shoes for ${currentCourt?.surface || 'hard court'} surfaces?` },
          { label: '🎾 Tennis Balls', message: 'Which tennis balls work best for practice?' },
          { label: '👕 Tennis Apparel', message: 'What should I wear for tennis?' }
        ],
        'basketball': [
          { label: '🏀 Basketball Shoes', message: `Best basketball shoes for ${currentCourt?.indoor ? 'indoor' : 'outdoor'} courts?` },
          { label: '🏀 Basketball', message: 'What basketball should I buy for outdoor courts?' },
          { label: '👕 Basketball Gear', message: 'Basketball clothing and accessories recommendations?' },
          { label: '🥅 Training Equipment', message: 'Basketball training equipment for beginners?' }
        ],
        'pickleball': [
          { label: '🏓 Pickleball Paddle', message: 'What pickleball paddle is best for beginners?' },
          { label: '🏓 Pickleball Set', message: 'Complete pickleball starter set recommendations?' },
          { label: '👟 Court Shoes', message: 'Best shoes for pickleball courts?' },
          { label: '🎯 Accessories', message: 'Essential pickleball accessories to buy?' }
        ],
        'volleyball': [
          { label: '🏐 Volleyball', message: `Best volleyball for ${currentCourt?.indoor ? 'indoor' : 'beach'} play?` },
          { label: '👟 Volleyball Shoes', message: 'What volleyball shoes do you recommend?' },
          { label: '🏐 Volleyball Gear', message: 'Complete volleyball equipment list?' },
          { label: '🤲 Protective Gear', message: 'Volleyball knee pads and protection?' }
        ]
      }
      
      return sportSpecific[selectedSport as keyof typeof sportSpecific] || baseSuggestions
    }

    // Surface-specific suggestions
    if (currentCourt?.surface) {
      if (currentCourt.surface.toLowerCase().includes('clay')) {
        return [
          { label: '🎾 Clay Court Racquet', message: 'Best tennis racquet for clay courts?' },
          { label: '👟 Clay Court Shoes', message: 'Tennis shoes designed for clay courts?' },
          { label: '🧤 Grip & Accessories', message: 'Accessories for playing on clay courts?' },
          { label: '👕 Clay Court Apparel', message: 'What to wear for clay court tennis?' }
        ]
      } else if (currentCourt.surface.toLowerCase().includes('hard')) {
        return [
          { label: '🎾 Hard Court Racquet', message: 'Tennis racquet for hard court play?' },
          { label: '👟 Hard Court Shoes', message: 'Best shoes for hard court tennis?' },
          { label: '🎾 Durable Equipment', message: 'Equipment that lasts on hard courts?' },
          { label: '🛡️ Protection Gear', message: 'Protective gear for hard court play?' }
        ]
      }
    }

    return baseSuggestions
  }

  // Initialize chat with context-aware welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const { currentCourt, selectedSport, searchQuery } = currentCourtSearch
      
      let welcomeText = "👋 Hi! I'm your Sports Gear Assistant!"
      
      if (currentCourt) {
        welcomeText += ` I see you're looking at ${currentCourt.name}. `
        if (currentCourt.sport !== 'multi-sport') {
          welcomeText += `Perfect for ${currentCourt.sport}! `
        }
        if (currentCourt.surface) {
          welcomeText += `This ${currentCourt.surface} court `
        }
        welcomeText += "What equipment would you like recommendations for?"
      } else if (selectedSport && selectedSport !== 'all') {
        welcomeText += ` I can help you find the perfect ${selectedSport} equipment! What are you looking for?`
      } else if (searchQuery) {
        welcomeText += ` I see you searched for "${searchQuery}". I can recommend the best equipment for your sport!`
      } else {
        welcomeText += " I can help you find the perfect equipment for any sport. What are you playing today?"
      }

      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'bot',
        content: welcomeText,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [currentCourtSearch, messages.length])

  // Build court context for API request
  const buildCourtContext = () => {
    const { currentCourt, selectedSport, location, filters } = currentCourtSearch
    
    // Determine the sport - prioritize currentCourt.sport, then selectedSport, then default
    const detectedSport = currentCourt?.sport || selectedSport || 'general sports'
    
    const context = {
      courtType: currentCourt?.sport ? `${currentCourt.sport} court` : selectedSport ? `${selectedSport} court` : 'Sports court',
      location: currentCourt?.address || (location ? `${location.lat}, ${location.lng}` : 'Not specified'),
      surface: currentCourt?.surface || filters?.surface || 'Not specified',
      environment: currentCourt?.indoor === false ? 'outdoor' : currentCourt?.indoor === true ? 'indoor' : 'outdoor',
      sport: detectedSport,
      amenities: currentCourt?.amenities || filters?.amenities || [],
      priceRange: filters?.priceRange ? `$${filters.priceRange.min || 0}-${filters.priceRange.max || 500}` : 'Not specified',
      // Add intelligent sport detection hints
      autoDetectSport: true,
      availableSports: ['tennis', 'basketball', 'pickleball', 'volleyball', 'racquetball']
    }
    
    // Debug logging to understand what context is being sent
    console.log('🔍 ProductChatbot Context Debug:', {
      currentCourtSearchProp: currentCourtSearch,
      detectedSport,
      finalContext: context
    })
    
    return context
  }

  // Send message to backend and get product recommendations
  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setAttemptCount(prev => prev + 1)

    // Track question in analytics
    await analytics.trackQuestion(message, buildCourtContextAnalytics())

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      type: 'bot',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      // Get A/B test variant and build prompt
      const sessionInfo = analytics.getSessionInfo()
      const { prompt, variantId, config } = buildPromptWithABTest(
        'prompt_optimization',
        message,
        buildCourtContext(),
        sessionInfo.sessionId
      )

      const response = await fetch('/api/chat/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userMessage: message,
          courtContext: buildCourtContext(),
          conversationHistory: messages
            .filter(m => m.type !== 'bot' || !m.isTyping)
            .slice(-5)
            .map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.content,
              timestamp: m.timestamp
            })),
          abTestVariant: variantId,
          promptOverride: config ? prompt : undefined,
          maxTokens: config?.maxTokens,
          temperature: config?.temperature
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error(`Rate limit exceeded. Please wait ${errorData.retryAfter || 60} seconds before trying again.`)
        }
        
        throw new Error(errorData.message || 'Failed to get recommendations')
      }

      const data = await response.json()

      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'))

      // Transform API response to chat format with improved image handling
      const products: ProductRecommendation[] = data.recommendations?.map((rec: any) => {
        // Ensure we have a valid image URL or use placeholder
        let imageUrl = rec.imageUrl
        if (!imageUrl || imageUrl === '' || imageUrl.includes('example.com') || imageUrl.includes('placeholder')) {
          imageUrl = `/api/placeholder/300x300`
        }
        
        return {
          id: `${rec.brand}-${rec.model}`.replace(/\s+/g, '-').toLowerCase(),
          name: `${rec.brand} ${rec.model}`,
          brand: rec.brand,
          model: rec.model,
          priceRange: rec.priceRange,
          description: rec.description,
          whyRecommended: rec.whyRecommended,
          purchaseLinks: rec.purchaseLinks || {},
          userRating: rec.userRating,
          features: rec.features || [],
          suitableFor: rec.suitableFor || [],
          category: rec.category,
          imageUrl
        }
      }) || []

      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: data.message,
        timestamp: new Date(),
        products
      }

      setMessages(prev => [...prev, botMessage])

      // Add court-specific tips as a follow-up message if available
      if (data.courtSpecificTips && data.courtSpecificTips.length > 0) {
        setTimeout(() => {
          const tipMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: `💡 Pro Tips for ${buildCourtContext().courtType}:\n${data.courtSpecificTips.map((tip: string, index: number) => `${index + 1}. ${tip}`).join('\n')}`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, tipMessage])
        }, 1000)
      }

    } catch (error) {
      console.error('Error getting recommendations:', error)
      
      // Track error in analytics
      await analytics.trackError(
        error instanceof Error ? error.name : 'unknown_error',
        error instanceof Error ? error.message : 'Unknown error occurred',
        `user_question: ${message}`,
        buildCourtContextAnalytics(),
        error instanceof Error ? error.stack : undefined
      )
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'))
      
      // Get intelligent fallback response
      const fallbackResponse = handleChatbotError(
        error instanceof Error ? error : new Error('Unknown error'),
        message,
        buildCourtContext(),
        messages,
        attemptCount
      )

      // Track fallback usage
      await analytics.trackFallback(
        error instanceof Error ? error.message : 'unknown_error',
        fallbackResponse.fallbackType,
        buildCourtContextAnalytics()
      )

      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: fallbackResponse.message,
        timestamp: new Date(),
        products: fallbackResponse.products
      }
      setMessages(prev => [...prev, errorMessage])

      // Add suggestions as a follow-up if available
      if (fallbackResponse.suggestions.length > 0) {
        setTimeout(() => {
          const suggestionMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: `Here are some things you can try:\n${fallbackResponse.suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, suggestionMessage])
        }, 1500)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleChatToggle = (newState: boolean) => {
    setIsOpen(newState)
    if (newState && isMinimized) {
      setIsMinimized(false)
    }
  }

  // Handle product click tracking
  const handleProductClick = async (
    product: ProductRecommendation, 
    linkType: 'amazon' | 'retailer' | 'direct',
    questionContext: string
  ) => {
    await analytics.trackProductClick(
      product.id,
      product.name,
      product.brand,
      product.category,
      product.priceRange,
      linkType === 'amazon' ? product.purchaseLinks.amazon! : 
      linkType === 'retailer' ? product.purchaseLinks.retailer! : 
      product.purchaseLinks.direct!,
      linkType,
      questionContext,
      buildCourtContextAnalytics()
    )

    // Record A/B test conversion event
    const sessionInfo = analytics.getSessionInfo()
    await ABTestManager.recordEvent(
      'prompt_optimization',
      sessionInfo.abTestVariant || 'control',
      'product_click',
      1,
      sessionInfo.sessionId
    )
  }

  // Get contextual quick actions based on court search
  const quickActions = getContextualSuggestions()

  // Chat button when closed
  if (!isOpen) {
    return (
      <div className={`fixed top-72 right-3 md:right-6 z-40 ${className}`}>
        <div className="flex flex-col items-end gap-2 md:gap-3">
          {/* Promotional banner with proper bounce animation */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-lg animate-custom-bounce">
            <span className="text-xs md:text-sm font-bold">🎾 Get Equipment Recommendations!</span>
          </div>
          
          {/* Main chat button */}
          <button
            onClick={() => handleChatToggle(true)}
            className="bg-gradient-to-br from-black via-gray-800 to-black hover:from-gray-800 hover:to-black text-white p-3 md:p-5 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 md:gap-4 group border-3 border-yellow-400 hover:border-yellow-300 relative overflow-hidden animate-attention-pulse"
            aria-label="Open sports gear recommendations"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative flex items-center gap-2 md:gap-4">
              <div className="relative">
                <div className="bg-yellow-400 text-black p-2 md:p-3 rounded-xl shadow-lg">
                  <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-6 md:h-6 flex items-center justify-center animate-ping font-bold">!</span>
              </div>
              
              <div className="text-left hidden md:block">
                <div className="text-lg font-bold">Sports Gear Assistant</div>
                <div className="text-yellow-400 text-sm font-medium">Find the perfect equipment</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className={`fixed top-72 right-3 md:right-6 z-40 ${className}`}>
        <div className="bg-gradient-to-r from-black to-gray-800 text-white rounded-2xl shadow-2xl p-3 md:p-4 flex items-center gap-2 md:gap-4 border-2 border-yellow-400 min-w-[240px] md:min-w-[280px] animate-pulse">
          <div className="bg-yellow-400 text-black p-1.5 md:p-2 rounded-lg">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="flex-1">
            <span className="text-xs md:text-sm font-bold">Sports Gear Assistant</span>
            <div className="text-xs text-yellow-400">Ready to help you find gear</div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="ml-2 hover:bg-yellow-400 hover:text-black rounded-lg p-2 transition-colors"
              title="Expand chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => handleChatToggle(false)}
              className="hover:bg-yellow-400 hover:text-black rounded-lg p-2 transition-colors"
              title="Close chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Full chat interface
  return (
    <div className={`fixed inset-x-3 top-20 bottom-20 md:top-72 md:right-6 md:left-auto md:bottom-auto md:w-[420px] md:h-[600px] bg-white rounded-3xl shadow-2xl border-3 border-yellow-400 flex flex-col z-40 animate-slide-up overflow-hidden ${className}`}>
      {/* Header with enhanced design */}
      <div className="bg-gradient-to-r from-black via-gray-800 to-black text-white p-4 md:p-6 rounded-t-3xl border-b-3 border-yellow-400 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20"></div>
        </div>
        
        <div className="relative flex justify-between items-start">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-black p-2 md:p-3 rounded-2xl shadow-lg">
              <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg md:text-xl text-white">Sports Gear Assistant</h3>
              <p className="text-yellow-400 text-xs md:text-sm font-medium">
                {currentCourtSearch.currentCourt ? 
                  `${currentCourtSearch.currentCourt.sport} recommendations` : 
                  currentCourtSearch.selectedSport ? 
                    `${currentCourtSearch.selectedSport} equipment` : 
                    'Find the perfect equipment'
                }
              </p>
            </div>
          </div>
          <div className="flex gap-1 md:gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-gray-300 hover:bg-yellow-400 hover:text-black rounded-xl p-1.5 md:p-2 transition-all transform hover:scale-110"
              aria-label="Minimize chat"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => handleChatToggle(false)}
              className="text-gray-300 hover:bg-yellow-400 hover:text-black rounded-xl p-1.5 md:p-2 transition-all transform hover:scale-110"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Court context indicator */}
        {currentCourtSearch.currentCourt && (
          <div className="mt-2 text-xs bg-yellow-400 text-black rounded-full px-3 py-1 inline-block font-medium">
            📍 {currentCourtSearch.currentCourt.name}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="p-2 md:p-3 bg-gradient-to-b from-gray-50 to-white">
          <p className="text-xs text-gray-600 mb-2 font-medium">
            {currentCourtSearch.selectedSport ? `${currentCourtSearch.selectedSport} recommendations:` : 'Popular searches:'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickActions.slice(0, 4).map((action, index) => (
              <button
                key={index}
                onClick={() => sendMessage(action.message)}
                className="text-left text-xs bg-white border border-gray-200 rounded-lg p-2 hover:bg-yellow-50 hover:border-yellow-400 transition-all duration-200 shadow-sm"
                disabled={isLoading}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 ${
              message.type === 'user' 
                ? 'bg-black text-white shadow-lg border border-yellow-400' 
                : 'bg-white text-gray-900 shadow-md border border-gray-100'
            }`}>
              {message.isTyping ? (
                <div className="flex space-x-2 p-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.products && message.products.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {message.products.map((product) => (
                        <div key={product.id} className="bg-gray-50 rounded-xl border border-gray-200 p-2 md:p-3 hover:shadow-md transition-shadow">
                          <div className="flex gap-2 md:gap-3">
                            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg shadow-sm bg-gray-100 overflow-hidden flex-shrink-0">
                              <img 
                                src={product.imageUrl || `/api/placeholder/300x300`} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  const container = target.parentElement as HTMLElement
                                  if (target.src !== `${window.location.origin}/api/placeholder/300x300`) {
                                    target.src = `/api/placeholder/300x300`
                                  } else {
                                    // If placeholder also fails, show a colored box with icon
                                    target.style.display = 'none'
                                    container.innerHTML = `
                                      <div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                      </div>
                                    `
                                  }
                                }}
                                onLoad={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.opacity = '1'
                                }}
                                style={{ opacity: '0', transition: 'opacity 0.3s ease' }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</h4>
                              <p className="text-gray-600 text-xs font-semibold">{product.brand}</p>
                              
                              {/* Price */}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-bold text-green-600">{product.priceRange}</span>
                              </div>
                              
                              {/* Rating */}
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-yellow-500">⭐</span>
                                <span className="text-xs text-gray-500">{product.userRating}</span>
                              </div>
                              
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.whyRecommended}</p>
                              
                              {/* Purchase buttons */}
                              <div className="flex flex-col md:flex-row gap-1 md:gap-2 mt-2">
                                {product.purchaseLinks.amazon && (
                                  <a 
                                    href={product.purchaseLinks.amazon}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleProductClick(product, 'amazon', message.content)}
                                    className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs px-2 md:px-3 py-1.5 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-sm font-medium"
                                  >
                                    🛒 Amazon
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                )}
                                {/* Always show Store button with sport-specific retailers */}
                                <a 
                                  href={(() => {
                                    const searchQuery = encodeURIComponent(`${product.brand} ${product.model}`)
                                    const category = product.category?.toLowerCase() || ''
                                    const sport = currentCourtSearch.selectedSport?.toLowerCase() || ''
                                    
                                    // First check if we have a valid non-Amazon retailer link
                                    if (product.purchaseLinks.retailer && 
                                        !product.purchaseLinks.retailer.includes('amazon') &&
                                        !product.purchaseLinks.retailer.includes('example.com') && 
                                        product.purchaseLinks.retailer.startsWith('http')) {
                                      return product.purchaseLinks.retailer
                                    }
                                    
                                    // Sport-specific retailers based on context or category
                                    if (sport.includes('tennis') || category.includes('tennis')) {
                                      return `https://www.tennis-warehouse.com/searchresults.html?search=${searchQuery}`
                                    } else if (sport.includes('basketball') || category.includes('basketball')) {
                                      return `https://www.dickssportinggoods.com/search/SearchDisplay?searchTerm=${searchQuery}`
                                    } else if (sport.includes('pickleball') || category.includes('pickleball')) {
                                      return `https://www.paddletek.com/search?q=${searchQuery}`
                                    } else if (sport.includes('volleyball') || category.includes('volleyball')) {
                                      return `https://www.volleyball.com/search?q=${searchQuery}`
                                    } else if (category.includes('shoes') || category.includes('footwear')) {
                                      return `https://www.footlocker.com/search?query=${searchQuery}`
                                    } else if (category.includes('apparel') || category.includes('clothing')) {
                                      return `https://www.underarmour.com/en-us/search?q=${searchQuery}`
                                    } else {
                                      // General sporting goods retailers as fallback
                                      return `https://www.dickssportinggoods.com/search/SearchDisplay?searchTerm=${searchQuery}`
                                    }
                                  })()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => handleProductClick(product, 'retailer', message.content)}
                                  className="inline-flex items-center justify-center gap-1 bg-blue-600 text-white text-xs px-2 md:px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                                >
                                  🏪 Store
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* More Quick Actions */}
      {messages.length > 1 && messages.length < 5 && (
        <div className="px-3 md:px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickActions.slice(4, 6).map((action, index) => (
              <button
                key={index}
                onClick={() => sendMessage(action.message)}
                className="text-xs bg-white border border-gray-200 rounded-full px-2 md:px-3 py-1 hover:bg-yellow-50 hover:border-yellow-400 transition-all duration-200 whitespace-nowrap flex-shrink-0"
                disabled={isLoading}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 md:p-4 bg-white border-t border-gray-200 rounded-b-2xl">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={currentCourtSearch.selectedSport ? `Ask about ${currentCourtSearch.selectedSport} equipment...` : "Ask about sports equipment..."}
            className="flex-1 border border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-black text-white p-2 md:p-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 border-2 border-yellow-400"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

// Add custom animations to your global CSS or Tailwind config
const styles = `
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
`