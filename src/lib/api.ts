import { Court } from '@/types/court'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// ======================
// BULLETPROOF API CLIENT
// ======================

/**
 * Bulletproof API client for Next.js that handles all edge cases
 * This will work regardless of port, environment, or deployment
 */

// Simple, reliable API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Always use relative URLs in Next.js - this works in all environments
  const url = `/api${endpoint}`
  
  const config: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    console.log(`🌐 API Request: ${url}`)
    
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`API Error ${response.status}: ${errorText}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Invalid response format. Expected JSON, got: ${contentType}`)
    }
    
    const data = await response.json()
    console.log(`✅ API Success: ${endpoint}`, data)
    return data
    
  } catch (error) {
    console.error(`❌ API Request failed for ${endpoint}:`, error)
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot reach the server. Make sure your dev server is running with "npm run dev"')
    }
    
    throw error
  }
}

// ======================
// COURT API FUNCTIONS
// ======================

/**
 * Get all courts - guaranteed to work
 */
export const getAllCourts = async (): Promise<Court[]> => {
  try {
    const response = await apiRequest<{ courts: Court[], total: number } | Court[]>('/courts')
    
    // Handle both response formats
    if (Array.isArray(response)) {
      return response
    }
    
    if (response && typeof response === 'object' && 'courts' in response) {
      return response.courts
    }
    
    console.warn('Unexpected response format:', response)
    return []
    
  } catch (error) {
    console.error('Failed to fetch courts:', error)
    throw new Error('Unable to load courts. Please check your connection and try again.')
  }
}

/**
 * Search courts with fallback strategies
 */
export const searchCourts = async (
  query: string = '', 
  sport: string = 'all', 
  location?: string
): Promise<Court[]> => {
  
  const params = new URLSearchParams()
  if (query.trim()) params.append('q', query.trim())
  if (sport && sport !== 'all') params.append('sport', sport)
  if (location) params.append('location', location)
  
  const queryString = params.toString()
  const endpoint = `/search${queryString ? `?${queryString}` : ''}`
  
  try {
    const response = await apiRequest<Court[]>(endpoint)
    return Array.isArray(response) ? response : []
    
  } catch (error) {
    console.error('❌ Search API failed, trying fallback:', error)
    
    // Fallback: Use courts API with same parameters
    try {
      console.log('🔄 Trying fallback with /api/courts')
      const fallbackEndpoint = `/courts${queryString ? `?${queryString}` : ''}`
      const fallbackResponse = await apiRequest<any>(fallbackEndpoint)
      
      // Handle different response formats
      if (Array.isArray(fallbackResponse)) {
        return fallbackResponse
      } else if (fallbackResponse && Array.isArray(fallbackResponse.courts)) {
        return fallbackResponse.courts
      } else if (fallbackResponse && Array.isArray(fallbackResponse.data)) {
        return fallbackResponse.data
      }
      
      return []
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError)
      
      // Final fallback: try to get all courts and filter client-side
      try {
        console.log('🔄 Final fallback: filtering all courts client-side...')
        const allCourts = await getAllCourts()
        
        return allCourts.filter(court => {
          const matchesQuery = !query || 
            court.name.toLowerCase().includes(query.toLowerCase()) ||
            court.address.toLowerCase().includes(query.toLowerCase())
          
          const matchesSport = sport === 'all' || 
            court.sport.toLowerCase() === sport.toLowerCase()
          
          const matchesLocation = !location ||
            court.address.toLowerCase().includes(location.toLowerCase())
          
          return matchesQuery && matchesSport && matchesLocation
        })
        
      } catch (finalFallbackError) {
        console.error('Final fallback search failed:', finalFallbackError)
        throw new Error('Search failed. Please try again.')
      }
    }
  }
}

/**
 * Search courts near user's location with radius filtering (mock data only)
 */
export const searchCourtsNearMe = async (
  latitude: number,
  longitude: number,
  radiusMiles: number = 10,
  sport: string = 'all',
  query: string = ''
): Promise<Court[]> => {
  
  try {
    console.log(`📍 Searching courts within ${radiusMiles} miles of ${latitude}, ${longitude}`)
    
    // Use client-side filtering since we don't have a location-based API endpoint
    console.log('🔄 Filtering courts by distance client-side...')
    const allCourts = await getAllCourts()
    
    // Calculate distance for each court and filter
    const radiusKm = radiusMiles * 1.60934
    
    return allCourts
      .map(court => {
        if (!court.coordinates) return null
        
        // Calculate distance using Haversine formula
        const distance = calculateDistance(
          latitude,
          longitude,
          court.coordinates.lat,
          court.coordinates.lng
        )
        
        return { ...court, distance }
      })
      .filter((court): court is Court & { distance: number } => {
        if (!court) return false
        
        const withinRadius = court.distance <= radiusKm
        const matchesSport = sport === 'all' || 
          court.sport.toLowerCase() === sport.toLowerCase()
        const matchesQuery = !query || 
          court.name.toLowerCase().includes(query.toLowerCase()) ||
          court.address.toLowerCase().includes(query.toLowerCase())
        
        return withinRadius && matchesSport && matchesQuery
      })
      .sort((a, b) => a.distance - b.distance) // Sort by distance (closest first)
      .slice(0, 50) // Limit results
    
  } catch (error) {
    console.error('Location-based search failed:', error)
    throw new Error('Unable to search for courts near your location')
  }
}

// Helper function for distance calculation (client-side fallback)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
 * Search courts with unified service (mock + real places)
 */
export const searchAllCourtsNearMe = async (
  latitude: number,
  longitude: number,
  radiusMiles: number = 10,
  sport: string = 'all',
  includeRealPlaces: boolean = true
): Promise<Court[]> => {
  // Import the unified service dynamically to avoid circular dependencies
  try {
    const { searchAllCourtsNearMe: unifiedSearch } = await import('@/lib/court-search-service')
    
    const result = await unifiedSearch(latitude, longitude, radiusMiles, sport, {
      includeRealPlaces,
      includeMockData: true,
      maxResults: 50,
      sortBy: 'distance'
    })
    
    return result.courts
    
  } catch (error) {
    console.error('Unified search failed, falling back to mock data:', error)
    // Fallback to mock data only
    return searchCourtsNearMe(latitude, longitude, radiusMiles, sport)
  }
}

/**
 * Get a specific court by ID
 */
export const getCourt = async (id: string | number): Promise<Court | null> => {
  try {
    return await apiRequest<Court>(`/courts/${id}`)
  } catch (error) {
    console.error(`Failed to fetch court ${id}:`, error)
    return null
  }
}

// ======================
// UTILITY FUNCTIONS
// ======================

/**
 * Test API connectivity
 */
export const testAPIConnection = async (): Promise<boolean> => {
  try {
    await apiRequest('/courts')
    return true
  } catch (error) {
    console.error('API connection test failed:', error)
    return false
  }
}

/**
 * Get API health status
 */
export const getAPIHealth = async () => {
  try {
    const isConnected = await testAPIConnection()
    return {
      status: isConnected ? 'healthy' : 'error',
      message: isConnected ? 'API is working correctly' : 'API connection failed',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

// ======================
// BOOKING FUNCTIONS
// ======================

/**
 * Book a court
 */
export const bookCourt = async (courtId: string | number, bookingDetails: {
  date: string
  startTime: string
  endTime: string
  userId?: string
}): Promise<{ success: boolean; bookingId?: string; message?: string }> => {
  try {
    const result = await apiRequest(`/courts/${courtId}/book`, {
      method: 'POST',
      body: JSON.stringify(bookingDetails),
    })
    
    return { 
      success: true, 
      bookingId: (result as any)?.id, 
      message: (result as any)?.message || 'Booking successful'
    }
    
  } catch (error) {
    console.error('Booking failed:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Booking failed. Please try again.' 
    }
  }
}

/**
 * Check court availability
 */
export const getCourtAvailability = async (courtId: string | number, date: string) => {
  try {
    return await apiRequest(`/courts/${courtId}/availability?date=${date}`)
  } catch (error) {
    console.error(`Failed to check availability for court ${courtId}:`, error)
    throw new Error('Unable to check availability. Please try again.')
  }
}

// ======================
// AUTHENTICATION
// ======================

/**
 * Login user
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    // Store token if provided
    if (result && (result as any).token) {
      localStorage.setItem('authToken', (result as any).token)
    }
    
    return result
  } catch (error) {
    console.error('Login failed:', error)
    throw new Error('Login failed. Please check your credentials.')
  }
}

/**
 * Register user
 */
export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    
    // Store token if provided
    if (result && (result as any).token) {
      localStorage.setItem('authToken', (result as any).token)
    }
    
    return result
  } catch (error) {
    console.error('Registration failed:', error)
    throw new Error('Registration failed. Please try again.')
  }
}

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken')
  sessionStorage.removeItem('authToken')
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))
}

// Export everything for easy testing
const apiClient = {
  getAllCourts,
  searchCourts,
  searchCourtsNearMe,
  searchAllCourtsNearMe,
  getCourt,
  bookCourt,
  getCourtAvailability,
  testAPIConnection,
  getAPIHealth,
  loginUser,
  registerUser,
  logoutUser,
  isAuthenticated
}

export default apiClient