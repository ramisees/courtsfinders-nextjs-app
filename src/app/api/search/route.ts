import { NextRequest, NextResponse } from 'next/server'
import { northCarolinaCourts } from '@/data/nc-courts'

// Check if this might be a city search
const isCitySearch = (query: string): boolean => {
  if (!query.trim()) return false
  
  // Common city search patterns
  const cityPatterns = [
    /^[a-zA-Z\s]+,\s*[a-zA-Z]{2}$/,  // "City, State" format
    /^[a-zA-Z\s]+$/,                 // Simple city name
    /\b(city|cities|town|downtown|area|near|in)\b/i, // Contains location words
  ]
  
  // Known city names (expand this list as needed)
  const knownCities = [
    'london', 'paris', 'tokyo', 'new york', 'los angeles', 'chicago', 
    'houston', 'philadelphia', 'phoenix', 'san antonio', 'san diego',
    'dallas', 'san jose', 'austin', 'jacksonville', 'fort worth',
    'columbus', 'charlotte', 'san francisco', 'indianapolis', 'seattle',
    'denver', 'washington', 'boston', 'detroit', 'nashville', 'memphis',
    'portland', 'oklahoma city', 'las vegas', 'baltimore', 'louisville',
    'milwaukee', 'albuquerque', 'tucson', 'fresno', 'sacramento',
    'atlanta', 'miami', 'tampa', 'orlando', 'saint petersburg'
  ]
  
  const lowerQuery = query.toLowerCase().trim()
  
  return cityPatterns.some(pattern => pattern.test(query)) ||
         knownCities.some(city => lowerQuery.includes(city))
}

export async function GET(request: NextRequest) {
  console.log('🔍 GET /api/search called')
  console.log('📋 Request URL:', request.url)
  console.log('📋 Request method:', request.method)
  
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || searchParams.get('q') || ''
    const sport = searchParams.get('sport') || 'all'
    const location = searchParams.get('location') || ''
    
    console.log(`🔍 Search: query="${query}", sport="${sport}", location="${location}"`)
    
    // Check if this is a city search that should use Google Places
    if (isCitySearch(query)) {
      console.log('🌍 Detected city search, trying Google Places API...')
      
      try {
        // Try Google Places text search for worldwide results
        const placesUrl = new URL('/api/google-places/textsearch', request.url.split('/api/search')[0])
        
        // Build search query for courts in the specified city
        let searchQuery = query
        if (sport && sport !== 'all') {
          searchQuery += ` ${sport} courts sports facilities`
        } else {
          searchQuery += ' tennis basketball courts sports facilities recreation'
        }
        
        placesUrl.searchParams.set('query', searchQuery)
        
        console.log(`🔍 Google Places search: "${searchQuery}"`)
        
        const placesResponse = await fetch(placesUrl.toString())
        
        if (placesResponse.ok) {
          const placesData = await placesResponse.json()
          
          if (Array.isArray(placesData) && placesData.length > 0) {
            console.log(`✅ Found ${placesData.length} places via Google Places`)
            
            // Fetch detailed information for each place to get reviews
            const courtsWithDetails = await Promise.all(
              placesData.slice(0, 10).map(async (place: any) => { // Limit to first 10 for performance
                try {
                  // Fetch detailed place information including reviews
                  const detailsUrl = new URL('/api/google-places/details', request.url.split('/api/search')[0])
                  detailsUrl.searchParams.set('placeId', place.place_id)
                  detailsUrl.searchParams.set('fields', 'place_id,name,formatted_address,rating,user_ratings_total,reviews,photos,opening_hours,formatted_phone_number,website,geometry,types,business_status,price_level')
                  
                  const detailsResponse = await fetch(detailsUrl.toString())
                  let placeDetails = null
                  
                  if (detailsResponse.ok) {
                    const detailsData = await detailsResponse.json()
                    if (detailsData.status === 'OK' && detailsData.result) {
                      placeDetails = detailsData.result
                    }
                  }
                  
                  // Use detailed information when available, fall back to basic data
                  const finalPlace = placeDetails || place
                  
                  return {
                    id: finalPlace.place_id || `place_${Math.random()}`,
                    name: finalPlace.name,
                    sport: sport !== 'all' ? sport : 'multi-sport',
                    address: finalPlace.formatted_address || finalPlace.vicinity || 'Address not available',
                    coordinates: {
                      lat: finalPlace.geometry?.location?.lat || 0,
                      lng: finalPlace.geometry?.location?.lng || 0
                    },
                    rating: finalPlace.rating || 4.0,
                    userRatingsTotal: finalPlace.user_ratings_total || (finalPlace.reviews?.length) || 1,
                    reviews: finalPlace.reviews || [],
                    pricePerHour: 30, // Default price
                    amenities: ['parking', 'restrooms'],
                    surface: 'mixed',
                    indoor: false,
                    available: finalPlace.opening_hours?.open_now !== false,
                    image: finalPlace.photos && finalPlace.photos.length > 0 
                      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${finalPlace.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
                      : 'https://placehold.co/400x300/e5e7eb/6b7280?text=Sports+Facility',
                    phone: finalPlace.formatted_phone_number,
                    website: finalPlace.website,
                    description: `Sports facility in ${query}`,
                    capacity: 10,
                    tags: ['google_places', 'worldwide']
                  }
                } catch (error) {
                  console.warn(`Failed to fetch details for place ${place.name}:`, error)
                  // Return basic place info if details fetch fails
                  return {
                    id: place.place_id || `place_${Math.random()}`,
                    name: place.name,
                    sport: sport !== 'all' ? sport : 'multi-sport',
                    address: place.formatted_address || place.vicinity || 'Address not available',
                    coordinates: {
                      lat: place.geometry?.location?.lat || 0,
                      lng: place.geometry?.location?.lng || 0
                    },
                    rating: place.rating || 4.0,
                    userRatingsTotal: place.user_ratings_total || 1,
                    reviews: [],
                    pricePerHour: 30,
                    amenities: ['parking', 'restrooms'],
                    surface: 'mixed',
                    indoor: false,
                    available: true,
                    image: 'https://placehold.co/400x300/e5e7eb/6b7280?text=Sports+Facility',
                    description: `Sports facility in ${query}`,
                    capacity: 10,
                    tags: ['google_places', 'worldwide']
                  }
                }
              })
            )
            
            console.log(`✅ Enhanced ${courtsWithDetails.length} courts with detailed information`)
            
            const response = NextResponse.json(courtsWithDetails)
            response.headers.set('Access-Control-Allow-Origin', '*')
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            return response
          }
        }
        
        console.log('⚠️ Google Places search failed or returned no results, falling back to NC data')
      } catch (placesError) {
        console.error('❌ Google Places search error:', placesError)
        console.log('🔄 Falling back to NC data search')
      }
    }
    
    // Original NC courts search (fallback or non-city searches)
    let filteredCourts = northCarolinaCourts
    
    // Filter by sport
    if (sport && sport !== 'all') {
      filteredCourts = filteredCourts.filter(
        court => court.sport.toLowerCase() === sport.toLowerCase()
      )
    }
    
    // Filter by location
    if (location.trim()) {
      filteredCourts = filteredCourts.filter(
        court => court.address.toLowerCase().includes(location.toLowerCase())
      )
    }
    
    // Filter by query (search court names and descriptions)
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filteredCourts = filteredCourts.filter(court => 
        court.name.toLowerCase().includes(searchTerm) ||
        court.address.toLowerCase().includes(searchTerm) ||
        (court.description && court.description.toLowerCase().includes(searchTerm))
      )
    }
    
    console.log(`✅ Returning ${filteredCourts.length} courts`)
    
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

export async function OPTIONS() {
  console.log('🔧 OPTIONS /api/search called (CORS preflight)')
  
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}