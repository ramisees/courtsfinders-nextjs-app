import { Court } from '@/types/court'

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
    console.error('Search failed:', error)
    
    // Fallback: try to get all courts and filter client-side
    try {
      console.log('🔄 Fallback: filtering all courts client-side...')
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
      
    } catch (fallbackError) {
      console.error('Fallback search failed:', fallbackError)
      throw new Error('Search failed. Please try again.')
    }
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