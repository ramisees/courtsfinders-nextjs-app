/**
 * Utility to check API configuration status
 */

export interface APIConfigStatus {
  googlePlaces: {
    configured: boolean
    hasClientKey: boolean
    hasServerKey: boolean
    keyPreview?: string
    message: string
  }
  environment: {
    isClient: boolean
    isServer: boolean
    nodeEnv: string
  }
}

/**
 * Check Google Places API configuration
 */
export function checkGooglePlacesConfig(): APIConfigStatus['googlePlaces'] {
  const isClient = typeof window !== 'undefined'
  const clientKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  const serverKey = process.env.GOOGLE_PLACES_API_KEY
  
  const hasClientKey = !!clientKey
  const hasServerKey = !!serverKey
  const configured = hasClientKey || hasServerKey
  
  let message = 'Google Places API: '
  let keyPreview: string | undefined
  
  if (configured) {
    const key = clientKey || serverKey
    keyPreview = key ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}` : undefined
    
    if (hasClientKey && hasServerKey) {
      message += '✅ Fully configured (client + server)'
    } else if (hasClientKey) {
      message += '✅ Client-side configured'
    } else {
      message += '⚠️ Server-side only'
    }
  } else {
    message += '❌ Not configured'
  }
  
  return {
    configured,
    hasClientKey,
    hasServerKey,
    keyPreview,
    message
  }
}

/**
 * Get complete API configuration status
 */
export function getAPIConfigStatus(): APIConfigStatus {
  const isClient = typeof window !== 'undefined'
  
  return {
    googlePlaces: checkGooglePlacesConfig(),
    environment: {
      isClient,
      isServer: !isClient,
      nodeEnv: process.env.NODE_ENV || 'development'
    }
  }
}

/**
 * Log API configuration status to console
 */
export function logAPIConfigStatus(): void {
  const status = getAPIConfigStatus()
  
  console.group('🔧 API Configuration Status')
  console.log('Environment:', status.environment)
  console.log('Google Places:', status.googlePlaces.message)
  if (status.googlePlaces.keyPreview) {
    console.log('Key Preview:', status.googlePlaces.keyPreview)
  }
  console.groupEnd()
}