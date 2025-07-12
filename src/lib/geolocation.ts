/**
 * Geolocation service for Courts Finder
 * Handles getting user location and distance calculations
 */

export interface UserLocation {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp?: number
  address?: string
  city?: string
  country?: string
}

export interface LocationError {
  code: number
  message: string
}

// Location caching for improved performance
const LOCATION_CACHE_KEY = 'courtfinder_location_cache'
const LOCATION_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get cached location if available and still valid
 */
const getCachedLocation = (): UserLocation | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY)
    if (!cached) return null
    
    const location = JSON.parse(cached) as UserLocation & { timestamp: number }
    const now = Date.now()
    
    // Check if cache is still valid
    if (location.timestamp && (now - location.timestamp) < LOCATION_CACHE_DURATION) {
      return location
    }
    
    // Remove expired cache
    localStorage.removeItem(LOCATION_CACHE_KEY)
    return null
  } catch (error) {
    console.warn('Failed to parse cached location:', error)
    localStorage.removeItem(LOCATION_CACHE_KEY)
    return null
  }
}

/**
 * Cache location for future use
 */
const cacheLocation = (location: UserLocation): void => {
  if (typeof window === 'undefined') return
  
  try {
    const locationWithTimestamp = {
      ...location,
      timestamp: Date.now()
    }
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationWithTimestamp))
  } catch (error) {
    console.warn('Failed to cache location:', error)
  }
}

/**
 * Get user's current location using the browser's geolocation API with caching
 */
export const getCurrentLocation = (useCache: boolean = true): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    // Check cache first
    if (useCache) {
      const cached = getCachedLocation()
      if (cached) {
        console.log('🔄 Using cached location')
        resolve(cached)
        return
      }
    }

    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      })
      return
    }

    console.log('📍 Getting fresh location...')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        }

        // Try to get address information via reverse geocoding
        try {
          const addressInfo = await reverseGeocode(location.latitude, location.longitude)
          location.address = addressInfo.address
          location.city = addressInfo.city
          location.country = addressInfo.country
        } catch (error) {
          console.warn('Reverse geocoding failed:', error)
        }

        // Cache the location
        if (useCache) {
          cacheLocation(location)
        }

        resolve(location)
      },
      (error) => {
        let message = 'Unable to retrieve location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location services and try again.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable'
            break
          case error.TIMEOUT:
            message = 'Location request timed out'
            break
        }

        reject({
          code: error.code,
          message
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 30000 // Shorter browser cache for fresh location
      }
    )
  })
}

/**
 * Reverse geocode coordinates to get address information
 */
interface AddressInfo {
  address: string
  city?: string
  country?: string
}

const reverseGeocode = async (lat: number, lng: number): Promise<AddressInfo> => {
  try {
    const url = new URL('/api/google-places/geocode', window.location.origin)
    url.searchParams.set('latlng', `${lat},${lng}`)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0]
      const addressComponents = result.address_components || []
      
      let city = ''
      let country = ''
      
      // Extract city and country from address components
      for (const component of addressComponents) {
        if (component.types.includes('locality')) {
          city = component.long_name
        }
        if (component.types.includes('country')) {
          country = component.long_name
        }
      }

      return {
        address: result.formatted_address,
        city: city || undefined,
        country: country || undefined
      }
    } else {
      throw new Error('No address found for coordinates')
    }
  } catch (error) {
    console.warn('Reverse geocoding failed:', error)
    throw error
  }
}

/**
 * Convert miles to kilometers for API compatibility
 */
export const milesToKilometers = (miles: number): number => {
  return miles * 1.60934
}

/**
 * Convert kilometers to miles for display
 */
export const kilometersToMiles = (kilometers: number): number => {
  return kilometers * 0.621371
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return distance
}

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number, unit: 'km' | 'miles' = 'miles'): string => {
  if (unit === 'miles') {
    const miles = kilometersToMiles(distanceKm)
    return miles < 1 
      ? `${Math.round(miles * 10) / 10} mi`
      : `${Math.round(miles)} mi`
  } else {
    return distanceKm < 1 
      ? `${Math.round(distanceKm * 1000)} m`
      : `${Math.round(distanceKm * 10) / 10} km`
  }
}

/**
 * Check if geolocation is supported
 */
export const isGeolocationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'geolocation' in navigator
}

/**
 * Get location with timeout and fallback
 */
export const getLocationWithFallback = async (timeoutMs: number = 10000): Promise<UserLocation> => {
  try {
    return await getCurrentLocation()
  } catch (error) {
    // If location fails, we could potentially fall back to IP-based location
    // For now, just re-throw the error
    throw error
  }
}

/**
 * Predefined radius options in miles
 */
export const RADIUS_OPTIONS = [
  { value: 1, label: '1 mile', icon: '📍' },
  { value: 3, label: '3 miles', icon: '🚶' },
  { value: 5, label: '5 miles', icon: '🚴' },
  { value: 10, label: '10 miles', icon: '🚗' },
  { value: 25, label: '25 miles', icon: '🛣️' },
  { value: 50, label: '50 miles', icon: '🌍' }
] as const

export type RadiusOption = typeof RADIUS_OPTIONS[number]['value']

/**
 * Advanced sorting options for court results
 */
export const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance (Nearest)', icon: '📍' },
  { value: 'rating', label: 'Rating (Highest)', icon: '⭐' },
  { value: 'price_low', label: 'Price (Low to High)', icon: '💰' },
  { value: 'price_high', label: 'Price (High to Low)', icon: '💎' },
  { value: 'availability', label: 'Availability', icon: '✅' },
  { value: 'name', label: 'Name (A-Z)', icon: '🔤' }
] as const

export type SortOption = typeof SORT_OPTIONS[number]['value']