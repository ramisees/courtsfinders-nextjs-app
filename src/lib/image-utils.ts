/**
 * Image utilities for court images with proper error handling
 */

// Local placeholder images (always available, no external dependencies)
export const LOCAL_PLACEHOLDER_IMAGES = {
  tennis: "/images/courts/placeholders/tennis.svg",
  basketball: "/images/courts/placeholders/basketball.svg", 
  volleyball: "/images/courts/placeholders/volleyball.svg",
  pickleball: "/images/courts/placeholders/pickleball.svg",
  badminton: "/images/courts/placeholders/badminton.svg",
  'multi-sport': "/images/courts/placeholders/multi-sport.svg",
  default: "/images/courts/placeholders/generic.svg"
}

// External fallback images (using working Unsplash URLs as secondary fallback)
export const EXTERNAL_FALLBACK_IMAGES = {
  tennis: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop",
  basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop", 
  volleyball: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=300&h=200&fit=crop",
  pickleball: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&h=200&fit=crop",
  badminton: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
  'multi-sport': "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
  default: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop"
}

// Primary fallback images (local first, external as backup)
export const FALLBACK_IMAGES = LOCAL_PLACEHOLDER_IMAGES

// Generic placeholder service as final fallback
export const GENERIC_PLACEHOLDER = "https://via.placeholder.com/300x200/e5e7eb/6b7280?text=Court+Image"

// Alternative placeholder services in case one fails
export const PLACEHOLDER_SERVICES = [
  "https://via.placeholder.com/300x200/e5e7eb/6b7280?text=Court+Image",
  "https://placehold.co/300x200/e5e7eb/6b7280?text=Court+Image",
  "https://picsum.photos/300/200?random=1", // Generic photo
]

/**
 * Get external fallback image URL based on sport type
 */
export function getExternalFallbackImage(sport: string): string {
  const normalizedSport = sport.toLowerCase().trim()
  return EXTERNAL_FALLBACK_IMAGES[normalizedSport as keyof typeof EXTERNAL_FALLBACK_IMAGES] || EXTERNAL_FALLBACK_IMAGES.default
}

/**
 * Get fallback image URL based on sport type
 */
export function getSportFallbackImage(sport: string): string {
  const normalizedSport = sport.toLowerCase().trim()
  return FALLBACK_IMAGES[normalizedSport as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.default
}

/**
 * Enhanced image error handler with multiple fallback levels
 */
export function createImageErrorHandler(sport?: string, fallbackIndex: number = 0) {
  return (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.target as HTMLImageElement
    const currentSrc = img.src
    
    console.warn(`Image failed to load: ${currentSrc}`)
    
    // Level 1: Try local sport-specific placeholder (always reliable)
    if (fallbackIndex === 0 && sport) {
      const localFallback = getSportFallbackImage(sport)
      if (currentSrc !== localFallback) {
        img.src = localFallback
        img.onerror = () => createImageErrorHandler(sport, 1)({ target: img } as any)
        return
      }
    }
    
    // Level 2: Try external sport-specific fallback (Unsplash)
    if (fallbackIndex === 1 && sport) {
      const externalFallback = getExternalFallbackImage(sport)
      if (currentSrc !== externalFallback) {
        img.src = externalFallback
        img.onerror = () => createImageErrorHandler(sport, 2)({ target: img } as any)
        return
      }
    }
    
    // Level 3: Try generic placeholder services
    if (fallbackIndex >= 2 && fallbackIndex < (2 + PLACEHOLDER_SERVICES.length)) {
      const serviceIndex = fallbackIndex - 2
      const placeholderUrl = PLACEHOLDER_SERVICES[serviceIndex]
      if (currentSrc !== placeholderUrl) {
        img.src = placeholderUrl
        img.onerror = () => createImageErrorHandler(sport, fallbackIndex + 1)({ target: img } as any)
        return
      }
    }
    
    // Final fallback: Clear onerror to prevent infinite loops
    img.onerror = null
    console.error('All image fallbacks failed for:', currentSrc)
  }
}

/**
 * Get a safe image URL with fallback
 */
export function getSafeImageUrl(originalUrl?: string, sport?: string): string {
  if (!originalUrl) {
    return sport ? getSportFallbackImage(sport) : FALLBACK_IMAGES.default
  }
  return originalUrl
}

/**
 * Preload critical images to cache them
 */
export function preloadImages(urls: string[]) {
  urls.forEach(url => {
    const img = new Image()
    img.src = url
  })
}

/**
 * Preload all fallback images on app start
 */
export function preloadFallbackImages() {
  const fallbackUrls = [
    ...Object.values(LOCAL_PLACEHOLDER_IMAGES),
    ...Object.values(EXTERNAL_FALLBACK_IMAGES),
    ...PLACEHOLDER_SERVICES
  ]
  
  // Remove duplicates
  const uniqueUrls = [...new Set(fallbackUrls)]
  
  preloadImages(uniqueUrls)
  console.log(`Preloaded ${uniqueUrls.length} fallback images (${Object.keys(LOCAL_PLACEHOLDER_IMAGES).length} local, ${Object.keys(EXTERNAL_FALLBACK_IMAGES).length} external, ${PLACEHOLDER_SERVICES.length} generic)`)
}

/**
 * Sport icon as CSS background fallback (emoji-based)
 */
export const SPORT_ICONS = {
  tennis: "🎾",
  basketball: "🏀",
  volleyball: "🏐", 
  pickleball: "🏓",
  badminton: "🏸",
  'multi-sport': "⚽",
  default: "🏟️"
}

export function getSportIcon(sport: string): string {
  const normalizedSport = sport.toLowerCase().trim()
  return SPORT_ICONS[normalizedSport as keyof typeof SPORT_ICONS] || SPORT_ICONS.default
}