import { NextRequest, NextResponse } from 'next/server'
import { GooglePlacesService } from '@/lib/googlePlaces'

// Same court data as /api/courts for consistency
const courts = [
  {
    id: 1,
    name: "Downtown Tennis Center",
    sport: "tennis",
    address: "123 Main St, Hickory, NC 28601",
    coordinates: { lat: 35.7344, lng: -81.3412 },
    rating: 4.5,
    pricePerHour: 25,
    amenities: ["parking", "restrooms", "lighting", "pro_shop"],
    surface: "hard",
    indoor: false,
    available: true,
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop",
    phone: "(828) 555-0123",
    website: "https://downtowntennis.com"
  },
  {
    id: 2,
    name: "Community Basketball Court",
    sport: "basketball",
    address: "456 Oak Avenue, Hickory, NC 28601",
    coordinates: { lat: 35.7267, lng: -81.3284 },
    rating: 4.2,
    pricePerHour: 15,
    amenities: ["parking", "outdoor", "free"],
    surface: "asphalt",
    indoor: false,
    available: true,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop",
    phone: "(828) 555-0456",
    website: null
  },
  {
    id: 3,
    name: "Elite Pickleball Club",
    sport: "pickleball",
    address: "789 Pine Street, Hickory, NC 28601",
    coordinates: { lat: 35.7289, lng: -81.3156 },
    rating: 4.8,
    pricePerHour: 20,
    amenities: ["parking", "restrooms", "pro_shop", "lessons"],
    surface: "composite",
    indoor: true,
    available: false,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&h=200&fit=crop",
    phone: "(828) 555-0789",
    website: "https://elitepickleball.com"
  },
  {
    id: 4,
    name: "Hickory Sports Complex",
    sport: "multi-sport",
    address: "789 Sports Dr, Hickory, NC",
    coordinates: { lat: 35.7267, lng: -81.3221 },
    rating: 4.8,
    pricePerHour: 35,
    amenities: ["Indoor", "Climate Control", "Equipment Rental", "Lockers"],
    surface: "synthetic",
    indoor: true,
    available: true,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    phone: "(828) 555-0901",
    website: "https://hickorysports.com"
  },
  {
    id: 5,
    name: "Lenoir-Rhyne Tennis Courts",
    sport: "tennis",
    address: "625 7th Ave NE, Hickory, NC",
    coordinates: { lat: 35.7356, lng: -81.3289 },
    rating: 4.6,
    pricePerHour: 20,
    amenities: ["University Access", "Well-maintained", "Parking"],
    surface: "hard",
    indoor: false,
    available: true,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop",
    phone: "(828) 555-0234",
    website: "https://lr.edu/tennis"
  },
  {
    id: 6,
    name: "Riverwalk Basketball Courts",
    sport: "basketball",
    address: "1009 1st Ave SW, Hickory, NC",
    coordinates: { lat: 35.7289, lng: -81.3467 },
    rating: 4.3,
    pricePerHour: 12,
    amenities: ["Scenic Location", "Free Parking", "Well-lit"],
    surface: "concrete",
    indoor: false,
    available: true,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
    phone: "(828) 555-0345",
    website: null
  }
]

/**
 * GET /api/search
 * Search courts by query, sport, and location
 */
export async function GET(request: NextRequest) {
  console.log('📍 GET /api/search called')
  
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const sport = searchParams.get('sport') || 'all'
    const location = searchParams.get('location') || ''
    
    console.log(`🔍 Search params: query="${query}", sport="${sport}", location="${location}"`)
    
    // Check if we have Google Places API key
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY
    
    // If we have a location query and Google API key, use Google Places
    if (query && googleApiKey && isLocationQuery(query)) {
      console.log('🌍 Using Google Places API for location search:', query)
      
      try {
        const placesService = new GooglePlacesService(googleApiKey)
        const googleResults = await placesService.searchSportsFacilities(query)
        
        // Convert Google Places results to our Court format
        let googleCourts = googleResults.map(place => 
          placesService.convertToCourtFormat(place, sport)
        )
        
        // Filter by sport if specified
        if (sport && sport !== 'all') {
          googleCourts = googleCourts.filter(court => 
            court.sport.toLowerCase() === sport.toLowerCase()
          )
        }
        
        console.log(`✅ Found ${googleCourts.length} courts via Google Places`)
        
        const response = NextResponse.json(googleCourts)
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.set('Cache-Control', 'no-cache')
        
        return response
        
      } catch (googleError) {
        console.error('❌ Google Places API error:', googleError)
        // Fall back to static data on Google API failure
      }
    }
    
    // Use static data (original behavior)
    console.log('🏠 Using static court data')
    let filteredCourts = [...courts] // Create a copy
    
    // Filter by search query (name or address)
    if (query.trim()) {
      filteredCourts = filteredCourts.filter(court => 
        court.name.toLowerCase().includes(query.toLowerCase()) ||
        court.address.toLowerCase().includes(query.toLowerCase())
      )
      console.log(`🔍 Filtered by query: "${query}", found ${filteredCourts.length} courts`)
    }
    
    // Filter by sport
    if (sport && sport !== 'all') {
      filteredCourts = filteredCourts.filter(court => 
        court.sport.toLowerCase() === sport.toLowerCase()
      )
      console.log(`🔍 Filtered by sport: "${sport}", found ${filteredCourts.length} courts`)
    }
    
    // Filter by location
    if (location.trim()) {
      filteredCourts = filteredCourts.filter(court => 
        court.address.toLowerCase().includes(location.toLowerCase())
      )
      console.log(`🔍 Filtered by location: "${location}", found ${filteredCourts.length} courts`)
    }
    
    console.log(`✅ Search complete: returning ${filteredCourts.length} courts`)
    
    // Create response with proper headers
    const response = NextResponse.json(filteredCourts)
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Cache-Control', 'no-cache')
    
    return response
    
  } catch (error) {
    console.error('❌ Error in GET /api/search:', error)
    
    const errorResponse = NextResponse.json(
      { 
        error: 'Failed to search courts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    
    // Add CORS headers to error response
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    
    return errorResponse
  }
}

// Helper function to determine if query is a location search
function isLocationQuery(query: string): boolean {
  const locationKeywords = [
    'london', 'paris', 'tokyo', 'new york', 'los angeles', 'chicago',
    'miami', 'seattle', 'boston', 'atlanta', 'dallas', 'houston',
    'city', 'downtown', 'near me', 'in ', 'at ', 'around '
  ]
  
  const lowercaseQuery = query.toLowerCase()
  
  // Check for city names, state abbreviations, country names
  return locationKeywords.some(keyword => 
    lowercaseQuery.includes(keyword)
  ) || 
  // Check for ZIP codes (5 digits)
  /\b\d{5}\b/.test(query) ||
  // Check for addresses (contains street indicators)
  /\b(street|st|avenue|ave|road|rd|blvd|boulevard|lane|ln|drive|dr)\b/i.test(query)
}

/**
 * OPTIONS /api/search
 * Handle preflight requests for CORS
 */
export async function OPTIONS() {
  console.log('📍 OPTIONS /api/search called (CORS preflight)')
  
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}