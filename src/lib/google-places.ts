/**
 * Google Places API integration for Courts Finder
 * Searches for real tennis courts, basketball courts, and sports facilities
 */

import { Court } from '@/types/court'
import { calculateDistance, formatDistance } from '@/lib/geolocation'

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

// Place types for different sports facilities
export const SPORT_PLACE_TYPES = {
  tennis: [
    'tennis_court',
    'country_club',
    'recreation_center',
    'sports_club'
  ],
  basketball: [
    'basketball_court',
    'recreation_center',
    'sports_club',
    'gym',
    'park'
  ],
  pickleball: [
    'tennis_court',
    'sports_complex',
    'recreation_center',
    'sports_club',
    'park'
  ],
  'multi-sport': [
    'sports_complex',
    'recreation_center',
    'sports_club',
    'gym',
    'country_club'
  ],
  all: [
    'tennis_court',
    'basketball_court',
    'sports_complex',
    'recreation_center',
    'sports_club',
    'gym',
    'country_club',
    'park'
  ]
} as const

// Keywords to enhance searches
export const SPORT_KEYWORDS = {
  tennis: ['tennis', 'racquet', 'court'],
  basketball: ['basketball', 'court', 'hoop'],
  pickleball: ['pickleball', 'paddle', 'court'],
  'multi-sport': ['sports', 'athletic', 'recreation'],
  all: ['tennis', 'basketball', 'pickleball', 'sports', 'court', 'recreation']
} as const

export interface GooglePlace {
  place_id: string
  name: string
  vicinity: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  rating?: number
  price_level?: number
  opening_hours?: {
    open_now: boolean
  }
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  types: string[]
  business_status?: string
}

export interface PlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  formatted_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  price_level?: number
  opening_hours?: {
    open_now: boolean
    weekday_text: string[]
  }
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  reviews?: Array<{
    author_name: string
    author_url?: string
    language: string
    profile_photo_url?: string
    rating: number
    relative_time_description: string
    text: string
    time: number
  }>
  types: string[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  business_status?: string
}

/**
 * Search for places using Google Places API Nearby Search
 */
export const searchNearbyPlaces = async (
  latitude: number,
  longitude: number,
  radiusMeters: number = 16093, // 10 miles in meters
  sport: keyof typeof SPORT_PLACE_TYPES = 'all'
): Promise<GooglePlace[]> => {
  const placeTypes = SPORT_PLACE_TYPES[sport] || SPORT_PLACE_TYPES.all
  const keywords = SPORT_KEYWORDS[sport] || SPORT_KEYWORDS.all
  
  try {
    const allPlaces: GooglePlace[] = []

    // Search for each place type to get comprehensive results
    for (const placeType of placeTypes) {
      const url = new URL('/api/google-places/nearby', window.location.origin)
      url.searchParams.set('latitude', latitude.toString())
      url.searchParams.set('longitude', longitude.toString())
      url.searchParams.set('radius', radiusMeters.toString())
      url.searchParams.set('type', placeType)
      url.searchParams.set('keyword', keywords.join(' '))

      console.log(`🔍 Searching for ${placeType} near ${latitude}, ${longitude}`)
      
      const response = await fetch(url.toString())
      
      if (!response.ok) {
        console.error(`Failed to fetch places for type ${placeType}:`, response.statusText)
        continue
      }

      const data = await response.json()
      
      if (data.status === 'OK' && data.results) {
        allPlaces.push(...data.results)
      } else if (data.status === 'ZERO_RESULTS') {
        console.log(`No results found for place type: ${placeType}`)
      } else {
        console.warn(`Places API warning for ${placeType}:`, data.status, data.error_message)
      }
    }

    // Remove duplicates based on place_id
    const uniquePlaces = allPlaces.filter((place, index, self) => 
      index === self.findIndex(p => p.place_id === place.place_id)
    )

    // Filter by keywords if sport-specific search
    let filteredPlaces = uniquePlaces
    if (sport !== 'all') {
      filteredPlaces = uniquePlaces.filter(place => {
        const searchText = `${place.name} ${place.vicinity}`.toLowerCase()
        return keywords.some(keyword => searchText.includes(keyword.toLowerCase()))
      })
    }

    console.log(`✅ Found ${filteredPlaces.length} unique places for ${sport}`)
    return filteredPlaces

  } catch (error) {
    console.error('Error searching nearby places:', error)
    throw new Error('Failed to search for nearby places. Please try again.')
  }
}

/**
 * Get detailed information about a specific place
 */
export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  try {
    const url = new URL('/api/google-places/details', window.location.origin)
    url.searchParams.set('placeId', placeId)

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.status === 'OK' && data.result) {
      return data.result
    } else {
      console.warn('Place details API warning:', data.status, data.error_message)
      return null
    }

  } catch (error) {
    console.error('Error fetching place details:', error)
    return null
  }
}

/**
 * Get photo URL from photo reference
 */
export const getPlacePhotoUrl = (
  photoReference: string, 
  maxWidth: number = 400,
  maxHeight: number = 300
): string => {
  if (!GOOGLE_PLACES_API_KEY) {
    return 'https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image'
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/photo')
  url.searchParams.set('photo_reference', photoReference)
  url.searchParams.set('maxwidth', maxWidth.toString())
  url.searchParams.set('maxheight', maxHeight.toString())
  url.searchParams.set('key', GOOGLE_PLACES_API_KEY)
  
  return url.toString()
}

/**
 * Convert Google Place to Court interface
 */
export const convertPlaceToCourt = (
  place: GooglePlace,
  userLat: number,
  userLng: number,
  details?: PlaceDetails
): Court => {
  const distance = calculateDistance(
    userLat,
    userLng,
    place.geometry.location.lat,
    place.geometry.location.lng
  )

  // Determine sport type based on place types and name
  let sport = 'multi-sport'
  const placeTypes = place.types.join(' ').toLowerCase()
  const placeName = place.name.toLowerCase()
  
  if (placeTypes.includes('tennis') || placeName.includes('tennis') || placeName.includes('racquet')) {
    sport = 'tennis'
  } else if (placeTypes.includes('basketball') || placeName.includes('basketball')) {
    sport = 'basketball'
  }

  // Estimate price based on place type and rating
  let estimatedPrice = 25 // Default price
  if (place.price_level !== undefined) {
    estimatedPrice = [15, 25, 45, 65, 85][place.price_level] || 25
  } else if (placeTypes.includes('country_club')) {
    estimatedPrice = 65
  } else if (placeTypes.includes('recreation_center')) {
    estimatedPrice = 15
  }

  // Generate amenities based on place types
  const amenities: string[] = ['parking', 'restrooms']
  if (placeTypes.includes('gym') || placeTypes.includes('sports_club')) {
    amenities.push('fitness_center', 'locker_rooms')
  }
  if (placeTypes.includes('country_club')) {
    amenities.push('pro_shop', 'dining', 'lessons')
  }
  if (placeTypes.includes('recreation_center')) {
    amenities.push('community_programs', 'affordable')
  }

  // Get photo URL
  let imageUrl = 'https://placehold.co/400x300/e5e7eb/6b7280?text=Sports+Facility'
  if (place.photos && place.photos.length > 0) {
    imageUrl = getPlacePhotoUrl(place.photos[0].photo_reference)
  }

  const court: Court = {
    id: place.place_id,
    name: place.name,
    sport,
    address: details?.formatted_address || place.vicinity,
    coordinates: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng
    },
    rating: place.rating || 4.0,
    userRatingsTotal: details?.user_ratings_total || (details?.reviews?.length) || (place.rating ? 1 : 0),
    reviews: details?.reviews || [],
    pricePerHour: estimatedPrice,
    amenities,
    surface: sport === 'tennis' ? 'hard' : 'mixed',
    indoor: placeTypes.includes('gym') || placeTypes.includes('indoor'),
    available: place.opening_hours?.open_now !== false, // Assume available if unknown
    image: imageUrl,
    phone: details?.formatted_phone_number || undefined,
    website: details?.website || undefined,
    description: `${sport} facility found via Google Places`,
    capacity: sport === 'tennis' ? 4 : 10,
    tags: ['google_places', 'real_location']
  }

  // Add distance to the court object for sorting
  ;(court as any).distance = distance

  return court
}

/**
 * Search for real courts near user location using Google Places API
 */
export const searchRealCourtsNearMe = async (
  latitude: number,
  longitude: number,
  radiusMiles: number = 10,
  sport: keyof typeof SPORT_PLACE_TYPES = 'all'
): Promise<Court[]> => {
  try {
    const radiusMeters = radiusMiles * 1609.34 // Convert miles to meters
    
    console.log(`📍 Searching for real ${sport} facilities within ${radiusMiles} miles`)
    
    const places = await searchNearbyPlaces(latitude, longitude, radiusMeters, sport)
    
    if (places.length === 0) {
      console.log('No places found, returning empty array')
      return []
    }

    // Convert places to courts and calculate distances
    const courts: Court[] = []
    
    for (const place of places) {
      try {
        // Optionally get detailed information for better data
        const details = await getPlaceDetails(place.place_id)
        const court = convertPlaceToCourt(place, latitude, longitude, details || undefined)
        courts.push(court)
      } catch (error) {
        console.warn(`Failed to process place ${place.name}:`, error)
        // Add basic court info even if details fail
        const court = convertPlaceToCourt(place, latitude, longitude)
        courts.push(court)
      }
    }

    // Sort by distance
    courts.sort((a, b) => ((a as any).distance || 0) - ((b as any).distance || 0))
    
    console.log(`✅ Converted ${courts.length} places to courts`)
    return courts

  } catch (error) {
    console.error('Error searching real courts:', error)
    throw new Error('Failed to search for real courts near your location. Please try again.')
  }
}

/**
 * Check if Google Places API is configured
 */
export const isGooglePlacesConfigured = (): boolean => {
  return !!GOOGLE_PLACES_API_KEY
}

/**
 * Get quota and usage information (for development)
 */
export const getAPIUsageInfo = () => {
  return {
    configured: isGooglePlacesConfigured(),
    environment: typeof window !== 'undefined' ? process.env.NODE_ENV : 'server',
    hasApiKey: !!GOOGLE_PLACES_API_KEY,
    apiKeyPrefix: GOOGLE_PLACES_API_KEY ? `${GOOGLE_PLACES_API_KEY.substring(0, 8)}...` : 'Not set'
  }
}

/**
 * Search places by text query (for city/location searches)
 */
export const searchPlacesByText = async (
  query: string,
  sport: string = 'all'
): Promise<Court[]> => {
  if (!isGooglePlacesConfigured()) {
    console.warn('⚠️ Google Places API not configured')
    return []
  }

  try {
    // Use text search API for general location searches
    const searchQuery = `${query} ${SPORT_KEYWORDS[sport as keyof typeof SPORT_KEYWORDS]?.join(' ')} courts`
    
    // Build the URL properly for server-side requests
    const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000'
    const url = `${baseUrl}/api/google-places/textsearch?query=${encodeURIComponent(searchQuery)}`
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    let places: any[] = []
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        console.error('❌ Text search API error:', response.status)
        return []
      }

      const responseData = await response.json()
      if (!Array.isArray(responseData)) {
        console.error('❌ Invalid text search response format')
        return []
      }

      places = responseData
      console.log(`✅ Text search found ${places.length} places for "${query}"`)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.warn('⏰ Google Places API request timed out after 10 seconds')
      } else {
        console.error('❌ Google Places API fetch error:', fetchError)
      }
      return []
    }
    
    // Convert places to courts
    const courts: Court[] = []
    for (const place of places) {
      try {
        // Use a default location (center of search area) if no user location
        const court = convertPlaceToCourt(place, 0, 0)
        if (court) courts.push(court)
      } catch (error) {
        console.warn('⚠️ Error converting place to court:', error)
      }
    }

    return courts
  } catch (error) {
    console.error('❌ Text search error:', error)
    return []
  }
}

/**
 * Search places for a specific sport
 */
export const searchPlacesForSport = async (
  sport: string,
  location?: { lat: number; lng: number },
  radius: number = 10000
): Promise<Court[]> => {
  if (!isGooglePlacesConfigured()) {
    console.warn('⚠️ Google Places API not configured')
    return []
  }

  if (!location) {
    // Default to a central location if none provided
    location = { lat: 35.7796, lng: -78.6382 } // Raleigh, NC
  }

  try {
    const placeTypes = SPORT_PLACE_TYPES[sport as keyof typeof SPORT_PLACE_TYPES] || SPORT_PLACE_TYPES.all
    const allCourts: Court[] = []

    // Search for each place type
    for (const placeType of placeTypes) {
      try {
        const places = await searchNearbyPlaces(location.lat, location.lng, radius)
        
        // Convert places to courts
        for (const place of places) {
          try {
            const court = convertPlaceToCourt(place, location.lat, location.lng)
            if (court) allCourts.push(court)
          } catch (error) {
            console.warn('⚠️ Error converting place to court:', error)
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error searching for ${placeType}:`, error)
      }
    }

    // Remove duplicates based on place_id
    const uniqueCourts = allCourts.filter((court, index, self) => 
      index === self.findIndex(c => c.id === court.id)
    )

    console.log(`✅ Sport search found ${uniqueCourts.length} courts for ${sport}`)
    return uniqueCourts

  } catch (error) {
    console.error('❌ Sport search error:', error)
    return []
  }
}

/**
 * Enhanced search that combines text search with nearby search
 */
export const searchCourtsWorldwide = async (
  query: string,
  sport: string = 'all',
  location?: { lat: number; lng: number }
): Promise<Court[]> => {
  if (!isGooglePlacesConfigured()) {
    console.warn('⚠️ Google Places API not configured')
    return []
  }

  try {
    const results: Court[] = []
    
    // If we have a location query but no coordinates, try text search
    if (query && !location) {
      const textResults = await searchPlacesByText(query, sport)
      results.push(...textResults)
    }
    
    // If we have coordinates, also do nearby search
    if (location) {
      const nearbyResults = await searchPlacesForSport(sport, location)
      results.push(...nearbyResults)
    }

    // Remove duplicates
    const uniqueResults = results.filter((court, index, self) => 
      index === self.findIndex(c => c.id === court.id)
    )

    console.log(`✅ Worldwide search found ${uniqueResults.length} courts`)
    return uniqueResults

  } catch (error) {
    console.error('❌ Worldwide search error:', error)
    return []
  }
}

/**
 * Get enhanced business profile information using the Business Profile API
 * Takes advantage of the newly enabled Google Business Profile API
 */
export const getEnhancedBusinessProfile = async (placeId: string): Promise<any> => {
  try {
    const url = new URL('/api/google-places/business-profile', window.location.origin)
    url.searchParams.set('placeId', placeId)

    console.log('🏢 Fetching enhanced business profile for:', placeId)
    
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Failed to fetch business profile: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.status === 'OK') {
      console.log(`✅ Enhanced business profile retrieved for: ${data.result?.name}`)
      return data.result
    } else {
      console.warn('Business Profile API returned:', data.status, data.error_message)
      return null
    }

  } catch (error) {
    console.error('Error fetching enhanced business profile:', error)
    return null
  }
}