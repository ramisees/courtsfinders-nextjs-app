/**
 * Driving directions service for Courts Finder
 * Integrates with Google Maps for navigation
 */

import { UserLocation } from '@/lib/geolocation'

export interface DirectionsOptions {
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit'
  avoidTolls?: boolean
  avoidHighways?: boolean
  units?: 'metric' | 'imperial'
}

export interface DirectionsStep {
  instruction: string
  distance: string
  duration: string
  maneuver?: string
}

export interface DirectionsRoute {
  distance: string
  duration: string
  steps: DirectionsStep[]
  startAddress: string
  endAddress: string
  overview_polyline?: string
}

export interface DirectionsResult {
  routes: DirectionsRoute[]
  status: string
}

/**
 * Get driving directions between two points using Google Directions API
 */
export const getDirections = async (
  origin: UserLocation,
  destination: { lat: number; lng: number },
  options: DirectionsOptions = {}
): Promise<DirectionsResult> => {
  try {
    const url = new URL('/api/google-places/directions', window.location.origin)
    url.searchParams.set('origin', `${origin.latitude},${origin.longitude}`)
    url.searchParams.set('destination', `${destination.lat},${destination.lng}`)
    url.searchParams.set('mode', options.mode || 'driving')
    url.searchParams.set('units', options.units || 'imperial')

    const avoidParams: string[] = []
    if (options.avoidTolls) avoidParams.push('tolls')
    if (options.avoidHighways) avoidParams.push('highways')
    if (avoidParams.length > 0) {
      url.searchParams.set('avoid', avoidParams.join('|'))
    }

    console.log(`🗺️ Getting directions from ${origin.latitude},${origin.longitude} to ${destination.lat},${destination.lng}`)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === 'OK' && data.routes && data.routes.length > 0) {
      const processedRoutes: DirectionsRoute[] = data.routes.map((route: any) => ({
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        startAddress: route.legs[0].start_address,
        endAddress: route.legs[0].end_address,
        overview_polyline: route.overview_polyline?.points,
        steps: route.legs[0].steps.map((step: any) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Strip HTML
          distance: step.distance.text,
          duration: step.duration.text,
          maneuver: step.maneuver
        }))
      }))

      return {
        routes: processedRoutes,
        status: data.status
      }
    } else {
      throw new Error(data.error_message || `Directions API error: ${data.status}`)
    }
  } catch (error) {
    console.error('Directions API error:', error)
    throw new Error('Failed to get directions. Please try again.')
  }
}

/**
 * Generate Google Maps URL for navigation
 */
export const getGoogleMapsUrl = (
  destination: { lat: number; lng: number },
  origin?: UserLocation,
  mode: DirectionsOptions['mode'] = 'driving'
): string => {
  const baseUrl = 'https://www.google.com/maps/dir/'
  
  if (origin) {
    return `${baseUrl}${origin.latitude},${origin.longitude}/${destination.lat},${destination.lng}/@${destination.lat},${destination.lng},15z/data=!3m1!4b1!4m2!4m1!3e${getModeCode(mode)}`
  } else {
    return `${baseUrl}/${destination.lat},${destination.lng}/@${destination.lat},${destination.lng},15z`
  }
}

/**
 * Get Google Maps mode code for URL
 */
const getModeCode = (mode: DirectionsOptions['mode']): string => {
  switch (mode) {
    case 'driving': return '0'
    case 'walking': return '2'
    case 'bicycling': return '1'
    case 'transit': return '3'
    default: return '0'
  }
}

/**
 * Generate Apple Maps URL for iOS users
 */
export const getAppleMapsUrl = (
  destination: { lat: number; lng: number },
  destinationName?: string
): string => {
  const daddr = `${destination.lat},${destination.lng}`
  const query = destinationName ? `&q=${encodeURIComponent(destinationName)}` : ''
  return `maps://maps.apple.com/?daddr=${daddr}${query}&dirflg=d`
}

/**
 * Open directions in the user's preferred maps app
 */
export const openDirections = (
  destination: { lat: number; lng: number },
  destinationName?: string,
  origin?: UserLocation,
  mode: DirectionsOptions['mode'] = 'driving'
): void => {
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (isIOS && isMobile) {
    // Try Apple Maps first on iOS
    const appleMapsUrl = getAppleMapsUrl(destination, destinationName)
    window.open(appleMapsUrl, '_blank')
  } else {
    // Use Google Maps for all other platforms
    const googleMapsUrl = getGoogleMapsUrl(destination, origin, mode)
    window.open(googleMapsUrl, '_blank')
  }
}

/**
 * Estimate travel time without full directions API call
 */
export const estimateTravelTime = (
  distanceKm: number,
  mode: DirectionsOptions['mode'] = 'driving'
): string => {
  let speedKmh: number
  
  switch (mode) {
    case 'walking':
      speedKmh = 5 // 5 km/h walking speed
      break
    case 'bicycling':
      speedKmh = 20 // 20 km/h cycling speed
      break
    case 'driving':
      speedKmh = 50 // 50 km/h average city driving
      break
    case 'transit':
      speedKmh = 30 // 30 km/h average public transit
      break
    default:
      speedKmh = 50
  }
  
  const hours = distanceKm / speedKmh
  const minutes = Math.round(hours * 60)
  
  if (minutes < 60) {
    return `${minutes} min`
  } else {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
}

/**
 * Get travel mode icon
 */
export const getTravelModeIcon = (mode: DirectionsOptions['mode']): string => {
  switch (mode) {
    case 'driving': return '🚗'
    case 'walking': return '🚶'
    case 'bicycling': return '🚴'
    case 'transit': return '🚌'
    default: return '🚗'
  }
}

/**
 * Check if directions are supported
 */
export const isDirectionsSupported = (): boolean => {
  return typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
}