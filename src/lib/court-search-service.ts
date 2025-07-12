/**
 * Unified Court Search Service
 * Combines mock data with real Google Places API data
 */

import { Court } from '@/types/court'
import { searchCourtsNearMe as searchMockCourts } from '@/lib/api'
import { 
  searchRealCourtsNearMe, 
  isGooglePlacesConfigured,
  getAPIUsageInfo 
} from '@/lib/google-places'
import { calculateDistance } from '@/lib/geolocation'

export interface SearchOptions {
  includeRealPlaces: boolean
  includeMockData: boolean
  maxResults?: number
  sortBy?: 'distance' | 'rating' | 'price'
}

export interface SearchResult {
  courts: Court[]
  source: {
    mockData: boolean
    realPlaces: boolean
    totalMock: number
    totalReal: number
  }
  searchMeta: {
    location: { lat: number; lng: number }
    radius: number
    sport: string
    resultsCount: number
    searchTime: number
  }
}

/**
 * Unified search function that combines mock and real data
 */
export const searchAllCourtsNearMe = async (
  latitude: number,
  longitude: number,
  radiusMiles: number = 10,
  sport: string = 'all',
  options: SearchOptions = {
    includeRealPlaces: true,
    includeMockData: true,
    maxResults: 50,
    sortBy: 'distance'
  }
): Promise<SearchResult> => {
  const startTime = Date.now()
  
  console.log(`🔍 Starting unified search for ${sport} courts within ${radiusMiles} miles`)
  console.log('Search options:', options)
  console.log('Google Places API status:', getAPIUsageInfo())

  const allCourts: Court[] = []
  let mockDataCount = 0
  let realPlacesCount = 0
  const errors: string[] = []

  // Search mock data
  if (options.includeMockData) {
    try {
      console.log('📋 Searching mock court data...')
      const mockCourts = await searchMockCourts(latitude, longitude, radiusMiles, sport)
      
      // Add source metadata to courts
      const taggedMockCourts = mockCourts.map(court => ({
        ...court,
        tags: [...(court.tags || []), 'mock_data']
      }))
      
      allCourts.push(...taggedMockCourts)
      mockDataCount = mockCourts.length
      console.log(`✅ Found ${mockDataCount} mock courts`)
    } catch (error) {
      console.error('❌ Mock data search failed:', error)
      errors.push(`Mock data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Search real places via Google Places API
  if (options.includeRealPlaces && isGooglePlacesConfigured()) {
    try {
      console.log('🌐 Searching Google Places API...')
      const realCourts = await searchRealCourtsNearMe(latitude, longitude, radiusMiles, sport as any)
      
      // Add source metadata to courts
      const taggedRealCourts = realCourts.map(court => ({
        ...court,
        tags: [...(court.tags || []), 'real_place']
      }))
      
      allCourts.push(...taggedRealCourts)
      realPlacesCount = realCourts.length
      console.log(`✅ Found ${realPlacesCount} real places`)
    } catch (error) {
      console.error('❌ Google Places search failed:', error)
      errors.push(`Google Places: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } else if (options.includeRealPlaces && !isGooglePlacesConfigured()) {
    console.warn('⚠️ Google Places API not configured, skipping real places search')
    errors.push('Google Places: API key not configured')
  }

  // Remove duplicates (in case mock data overlaps with real data)
  const uniqueCourts = removeDuplicateCourts(allCourts)

  // Sort results
  let sortedCourts = uniqueCourts
  if (options.sortBy === 'distance') {
    sortedCourts = uniqueCourts.sort((a, b) => {
      const distanceA = (a as any).distance || calculateDistance(latitude, longitude, a.coordinates?.lat || 0, a.coordinates?.lng || 0)
      const distanceB = (b as any).distance || calculateDistance(latitude, longitude, b.coordinates?.lat || 0, b.coordinates?.lng || 0)
      return distanceA - distanceB
    })
  } else if (options.sortBy === 'rating') {
    sortedCourts = uniqueCourts.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  } else if (options.sortBy === 'price') {
    sortedCourts = uniqueCourts.sort((a, b) => (a.pricePerHour || 0) - (b.pricePerHour || 0))
  }

  // Limit results
  if (options.maxResults && sortedCourts.length > options.maxResults) {
    sortedCourts = sortedCourts.slice(0, options.maxResults)
  }

  const searchTime = Date.now() - startTime

  const result: SearchResult = {
    courts: sortedCourts,
    source: {
      mockData: options.includeMockData,
      realPlaces: options.includeRealPlaces && isGooglePlacesConfigured(),
      totalMock: mockDataCount,
      totalReal: realPlacesCount
    },
    searchMeta: {
      location: { lat: latitude, lng: longitude },
      radius: radiusMiles,
      sport,
      resultsCount: sortedCourts.length,
      searchTime
    }
  }

  console.log(`✅ Unified search complete: ${result.courts.length} total courts (${mockDataCount} mock + ${realPlacesCount} real) in ${searchTime}ms`)
  
  if (errors.length > 0) {
    console.warn('⚠️ Search completed with errors:', errors)
  }

  return result
}

/**
 * Remove duplicate courts based on similarity
 */
function removeDuplicateCourts(courts: Court[]): Court[] {
  const uniqueCourts: Court[] = []
  
  for (const court of courts) {
    const isDuplicate = uniqueCourts.some(existing => {
      // Check for exact name match
      if (court.name.toLowerCase() === existing.name.toLowerCase()) {
        return true
      }
      
      // Check for similar addresses (if coordinates are available)
      if (court.coordinates && existing.coordinates) {
        const distance = calculateDistance(
          court.coordinates.lat,
          court.coordinates.lng,
          existing.coordinates.lat,
          existing.coordinates.lng
        )
        // Consider locations within 100m as potential duplicates
        if (distance < 0.1 && 
            court.name.toLowerCase().includes(existing.name.toLowerCase()) ||
            existing.name.toLowerCase().includes(court.name.toLowerCase())) {
          return true
        }
      }
      
      return false
    })
    
    if (!isDuplicate) {
      uniqueCourts.push(court)
    } else {
      console.log(`🔄 Filtered duplicate: ${court.name}`)
    }
  }
  
  return uniqueCourts
}

/**
 * Search with automatic fallback strategy
 */
export const searchCourtsWithFallback = async (
  latitude: number,
  longitude: number,
  radiusMiles: number = 10,
  sport: string = 'all'
): Promise<SearchResult> => {
  // Try real places first if configured
  if (isGooglePlacesConfigured()) {
    try {
      const result = await searchAllCourtsNearMe(latitude, longitude, radiusMiles, sport, {
        includeRealPlaces: true,
        includeMockData: true,
        sortBy: 'distance'
      })
      
      // If we got good results, return them
      if (result.courts.length > 0) {
        return result
      }
    } catch (error) {
      console.warn('Real places search failed, falling back to mock data only:', error)
    }
  }

  // Fallback to mock data only
  console.log('🔄 Using mock data fallback')
  return searchAllCourtsNearMe(latitude, longitude, radiusMiles, sport, {
    includeRealPlaces: false,
    includeMockData: true,
    sortBy: 'distance'
  })
}

/**
 * Get search capabilities and configuration status
 */
export const getSearchCapabilities = () => {
  const googlePlacesInfo = getAPIUsageInfo()
  
  return {
    mockData: {
      available: true,
      description: 'High-quality mock court data covering North Carolina and major cities'
    },
    realPlaces: {
      available: googlePlacesInfo.configured,
      description: googlePlacesInfo.configured 
        ? 'Live data from Google Places API'
        : 'Google Places API key not configured',
      apiKeyStatus: googlePlacesInfo.hasApiKey ? 'configured' : 'missing'
    },
    hybrid: {
      available: true,
      description: 'Combines mock data with real places for comprehensive results'
    },
    features: {
      distanceCalculation: true,
      proximitysorting: true,
      realTimeData: googlePlacesInfo.configured,
      multiSportSupport: true,
      radiusFiltering: true
    }
  }
}

/**
 * Preview search without executing (for testing)
 */
export const previewSearch = (
  latitude: number,
  longitude: number,
  radiusMiles: number = 10,
  sport: string = 'all',
  options: SearchOptions
) => {
  const capabilities = getSearchCapabilities()
  
  return {
    searchParams: {
      location: { lat: latitude, lng: longitude },
      radius: radiusMiles,
      sport,
      options
    },
    capabilities,
    estimatedSources: {
      mockData: options.includeMockData,
      realPlaces: options.includeRealPlaces && capabilities.realPlaces.available
    },
    recommendations: {
      useRealPlaces: capabilities.realPlaces.available,
      useMockData: true,
      hybridSearch: capabilities.realPlaces.available
    }
  }
}