/**
 * Foursquare Places API integration for Courts Finder
 * Provi    const url = `${FOURSQUARE_BASE_URL}/nearby?${params.toString()}`
    console.log(`🔍 Foursquare nearby search: ${url}`)

    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${FOURSQUARE_API_KEY}`,
          'Accept': 'application/json'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error('❌ Foursquare API error:', response.status, response.statusText)
        return []
      }

      const data = await response.json()
      console.log(`✅ Foursquare nearby search found ${data.results?.length || 0} places`)

      return data.results || []
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.warn('⏰ Foursquare nearby search timed out after 8 seconds')
      } else {
        console.error('❌ Foursquare nearby search error:', fetchError)
      }
      return []
    }s venue data from Foursquare
 */

import { Court } from '@/types/court'
import { calculateDistance } from '@/lib/geolocation'

// Foursquare API configuration  
const FOURSQUARE_API_KEY = process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY
const FOURSQUARE_BASE_URL = 'https://api.foursquare.com/v3/places'

// Foursquare category IDs for sports venues
export const FOURSQUARE_SPORT_CATEGORIES = {
  tennis: ['4bf58dd8d48988d1e5931735'], // Tennis Court
  basketball: ['4bf58dd8d48988d1e8931735'], // Basketball Court
  pickleball: ['4bf58dd8d48988d1e5931735'], // Use tennis court category
  'multi-sport': ['4bf58dd8d48988d1e5931735', '4bf58dd8d48988d1e8931735'], // Multiple categories
  all: [
    '4bf58dd8d48988d1e5931735', // Tennis Court
    '4bf58dd8d48988d1e8931735', // Basketball Court
    '4bf58dd8d48988d1e7931735', // Gym / Fitness Center
    '4bf58dd8d48988d1e9931735', // Recreation Center
    '4bf58dd8d48988d1ed931735'  // Sports Club
  ]
}

// Sport keywords for Foursquare text search
export const FOURSQUARE_SPORT_KEYWORDS = {
  tennis: ['tennis', 'tennis court', 'racquet'],
  basketball: ['basketball', 'basketball court', 'hoop'],
  pickleball: ['pickleball', 'paddle tennis', 'racquet'],
  'multi-sport': ['sports', 'recreation', 'athletic'],
  all: ['tennis', 'basketball', 'pickleball', 'sports', 'recreation', 'court']
}

/**
 * Check if Foursquare API is configured
 */
export const isFoursquareConfigured = (): boolean => {
  return !!FOURSQUARE_API_KEY
}

/**
 * Search for sports venues near a location using Foursquare
 */
export const searchFoursquareNearby = async (
  latitude: number,
  longitude: number,
  radiusMeters: number = 16093, // 10 miles
  sport: keyof typeof FOURSQUARE_SPORT_CATEGORIES = 'all'
): Promise<any[]> => {
  if (!isFoursquareConfigured()) {
    console.warn('⚠️ Foursquare API not configured')
    return []
  }

  try {
    const categories = FOURSQUARE_SPORT_CATEGORIES[sport] || FOURSQUARE_SPORT_CATEGORIES.all
    const categoryQuery = categories.join(',')

    const params = new URLSearchParams({
      ll: `${latitude},${longitude}`,
      radius: radiusMeters.toString(),
      categories: categoryQuery,
      limit: '50',
      fields: 'name,location,rating,price,photos,hours,website,tel,categories'
    })

    const url = `${FOURSQUARE_BASE_URL}/nearby?${params.toString()}`
    console.log(`🔍 Foursquare nearby search: ${url}`)

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${FOURSQUARE_API_KEY}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('❌ Foursquare API error:', response.status, response.statusText)
      return []
    }

    const data = await response.json()
    console.log(`✅ Foursquare found ${data.results?.length || 0} places`)

    return data.results || []
  } catch (error) {
    console.error('❌ Foursquare search error:', error)
    return []
  }
}

/**
 * Search for sports venues by text query using Foursquare
 */
export const searchFoursquareByText = async (
  query: string,
  sport: keyof typeof FOURSQUARE_SPORT_CATEGORIES = 'all',
  location?: string
): Promise<any[]> => {
  if (!isFoursquareConfigured()) {
    console.warn('⚠️ Foursquare API not configured')
    return []
  }

  try {
    const sportKeywords = FOURSQUARE_SPORT_KEYWORDS[sport] || FOURSQUARE_SPORT_KEYWORDS.all
    const searchQuery = `${query} ${sportKeywords.join(' ')}`

    const params = new URLSearchParams({
      query: searchQuery,
      limit: '50',
      fields: 'name,location,rating,price,photos,hours,website,tel,categories'
    })

    if (location) {
      params.append('near', location)
    }

    const url = `${FOURSQUARE_BASE_URL}/search?${params.toString()}`
    console.log(`🔍 Foursquare text search: ${searchQuery}`)

    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${FOURSQUARE_API_KEY}`,
          'Accept': 'application/json'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error('❌ Foursquare text search error:', response.status, response.statusText)
        return []
      }

      const data = await response.json()
      console.log(`✅ Foursquare text search found ${data.results?.length || 0} places`)

      return data.results || []
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.warn('⏰ Foursquare text search timed out after 8 seconds')
      } else {
        console.error('❌ Foursquare text search error:', fetchError)
      }
      return []
    }
  } catch (error) {
    console.error('❌ Foursquare text search error:', error)
    return []
  }
}

/**
 * Convert Foursquare place to Court format
 */
export const convertFoursquareToCoourt = (
  place: any,
  userLat?: number,
  userLng?: number
): Court => {
  // Determine sport type from categories
  let sport = 'multi-sport'
  if (place.categories && place.categories.length > 0) {
    const category = place.categories[0]
    if (category.name.toLowerCase().includes('tennis')) {
      sport = 'tennis'
    } else if (category.name.toLowerCase().includes('basketball')) {
      sport = 'basketball'
    }
  }

  // Calculate distance if user location provided
  let distance: number | undefined
  if (userLat && userLng && place.location?.latitude && place.location?.longitude) {
    distance = calculateDistance(
      userLat,
      userLng,
      place.location.latitude,
      place.location.longitude
    )
  }

  // Build address
  const location = place.location || {}
  const address = [
    location.address,
    location.locality,
    location.region,
    location.postcode,
    location.country
  ].filter(Boolean).join(', ')

  return {
    id: `foursquare-${place.fsq_id}`,
    name: place.name || 'Sports Venue',
    sport: sport,
    address: address || 'Address not available',
    coordinates: place.location?.latitude && place.location?.longitude ? {
      lat: place.location.latitude,
      lng: place.location.longitude
    } : { lat: 0, lng: 0 },
    rating: place.rating ? place.rating / 2 : 4.0, // Foursquare uses 0-10, we use 0-5
    pricePerHour: place.price ? place.price * 10 : 30, // Estimate from price tier
    amenities: [],
    surface: 'unknown',
    indoor: undefined,
    available: true,
    image: place.photos && place.photos.length > 0 
      ? `${place.photos[0].prefix}300x200${place.photos[0].suffix}`
      : '/images/courts/generic/placeholder-court.jpg',
    phone: place.tel,
    website: place.website,
    description: `Sports venue found via Foursquare${place.categories ? ` - ${place.categories[0].name}` : ''}`,
    source: 'Foursquare'
  } as Court
}

/**
 * Search courts worldwide using Foursquare
 */
export const searchFoursquareCourtsWorldwide = async (
  query: string,
  sport: keyof typeof FOURSQUARE_SPORT_CATEGORIES = 'all'
): Promise<Court[]> => {
  if (!isFoursquareConfigured()) {
    console.warn('⚠️ Foursquare API not configured')
    return []
  }

  try {
    console.log(`🌍 Foursquare worldwide search: "${query}" for ${sport}`)
    
    const places = await searchFoursquareByText(query, sport)
    
    if (places.length === 0) {
      console.log('📍 No Foursquare results, trying location-based search...')
      return []
    }

    // Convert places to courts
    const courts: Court[] = []
    for (const place of places) {
      try {
        const court = convertFoursquareToCoourt(place)
        if (court) courts.push(court)
      } catch (error) {
        console.warn('⚠️ Error converting Foursquare place to court:', error)
      }
    }

    console.log(`✅ Foursquare worldwide search found ${courts.length} courts`)
    return courts

  } catch (error) {
    console.error('❌ Foursquare worldwide search failed:', error)
    return []
  }
}

/**
 * Get Foursquare API status and configuration
 */
export const getFoursquareStatus = () => {
  return {
    configured: isFoursquareConfigured(),
    apiKey: FOURSQUARE_API_KEY ? `${FOURSQUARE_API_KEY.substring(0, 8)}...` : 'Not set',
    supportedSports: Object.keys(FOURSQUARE_SPORT_CATEGORIES),
    categoriesCount: FOURSQUARE_SPORT_CATEGORIES.all.length
  }
}
