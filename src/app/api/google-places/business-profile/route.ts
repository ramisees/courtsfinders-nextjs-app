import { NextRequest, NextResponse } from 'next/server'

/**
 * Enhanced Google Business Profile API integration
 * Takes advantage of the newly enabled Business Profile API for detailed business information
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const placeId = searchParams.get('placeId')
    
    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      )
    }

    // Enhanced fields available with Business Profile API
    const enhancedFields = [
      'place_id',
      'name',
      'formatted_address',
      'rating',
      'user_ratings_total',
      'reviews',
      'photos',
      'opening_hours',
      'current_opening_hours',
      'secondary_opening_hours',
      'formatted_phone_number',
      'international_phone_number',
      'website',
      'url',
      'geometry',
      'types',
      'business_status',
      'price_level',
      'wheelchair_accessible_entrance',
      'editorial_summary',
      'delivery',
      'dine_in',
      'takeout',
      'reservable',
      'serves_beer',
      'serves_wine',
      'serves_breakfast',
      'serves_lunch',
      'serves_dinner',
      'serves_brunch',
      'serves_vegetarian_food'
    ].join(',')

    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('fields', enhancedFields)
    url.searchParams.set('key', apiKey)

    console.log('🏢 Fetching enhanced business profile for:', placeId)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === 'OK' && data.result) {
      const businessInfo = data.result
      
      // Extract sports facility specific information
      const facilitiesInfo = {
        ...businessInfo,
        // Enhanced processing for sports facilities
        amenities: extractAmenities(businessInfo),
        operatingHours: formatOperatingHours(businessInfo.opening_hours),
        currentHours: formatOperatingHours(businessInfo.current_opening_hours),
        accessibility: {
          wheelchairAccessible: businessInfo.wheelchair_accessible_entrance || false
        },
        priceRange: interpretPriceLevel(businessInfo.price_level),
        businessType: determineFacilityType(businessInfo.types),
        facilitySummary: businessInfo.editorial_summary?.overview || null
      }
      
      console.log(`✅ Enhanced business profile retrieved for: ${businessInfo.name}`)
      return NextResponse.json({
        status: 'OK',
        result: facilitiesInfo
      })
    } else {
      console.log(`⚠️ Business Profile API returned: ${data.status}`)
      return NextResponse.json(data, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Business Profile API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business profile' },
      { status: 500 }
    )
  }
}

/**
 * Extract amenities based on business profile data
 */
function extractAmenities(businessData: any): string[] {
  const amenities: string[] = []
  
  // Based on services and features
  if (businessData.delivery) amenities.push('delivery')
  if (businessData.dine_in) amenities.push('dining')
  if (businessData.takeout) amenities.push('takeout')
  if (businessData.reservable) amenities.push('reservations')
  if (businessData.serves_beer || businessData.serves_wine) amenities.push('bar')
  if (businessData.serves_breakfast) amenities.push('breakfast')
  if (businessData.serves_lunch) amenities.push('lunch')
  if (businessData.serves_dinner) amenities.push('dinner')
  if (businessData.serves_vegetarian_food) amenities.push('vegetarian_options')
  if (businessData.wheelchair_accessible_entrance) amenities.push('wheelchair_accessible')
  
  // Based on place types
  if (businessData.types?.includes('parking')) amenities.push('parking')
  if (businessData.types?.includes('gym')) amenities.push('fitness_center')
  if (businessData.types?.includes('spa')) amenities.push('spa')
  if (businessData.types?.includes('swimming_pool')) amenities.push('swimming_pool')
  
  return amenities
}

/**
 * Format operating hours for better display
 */
function formatOperatingHours(hoursData: any): any {
  if (!hoursData) return null
  
  return {
    openNow: hoursData.open_now || false,
    periods: hoursData.periods || [],
    weekdayText: hoursData.weekday_text || [],
    specialHours: hoursData.special_days || []
  }
}

/**
 * Interpret Google's price level to a more readable format
 */
function interpretPriceLevel(priceLevel: number | undefined): string {
  if (priceLevel === undefined || priceLevel === null) return 'Unknown'
  
  switch (priceLevel) {
    case 0: return 'Free'
    case 1: return 'Inexpensive ($)'
    case 2: return 'Moderate ($$)'
    case 3: return 'Expensive ($$$)'
    case 4: return 'Very Expensive ($$$$)'
    default: return 'Unknown'
  }
}

/**
 * Determine the type of sports facility based on place types
 */
function determineFacilityType(types: string[]): string {
  if (!types) return 'general'
  
  if (types.includes('tennis_court')) return 'tennis'
  if (types.includes('basketball_court')) return 'basketball'
  if (types.includes('sports_complex')) return 'multi-sport'
  if (types.includes('recreation_center')) return 'recreation'
  if (types.includes('country_club')) return 'country_club'
  if (types.includes('gym')) return 'fitness'
  if (types.includes('park')) return 'park'
  
  return 'general'
}
