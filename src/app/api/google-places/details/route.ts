import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const placeId = searchParams.get('placeId')
    const fields = searchParams.get('fields') || 'place_id,name,formatted_address,rating,user_ratings_total,reviews,photos,opening_hours,formatted_phone_number,website,geometry,types,business_status,price_level,wheelchair_accessible_entrance,delivery,dine_in,takeout,serves_beer,serves_wine,serves_breakfast,serves_lunch,serves_dinner,serves_brunch,reservable,current_opening_hours,secondary_opening_hours,editorial_summary,serves_vegetarian_food'

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

    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('fields', fields)
    url.searchParams.set('key', apiKey)

    console.log('📍 Proxying Google Place Details request for:', placeId)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === 'OK') {
      console.log(`✅ Got place details for: ${data.result?.name || 'Unknown'}`)
      return NextResponse.json(data)
    } else {
      console.log(`⚠️ Google Place Details API returned: ${data.status}`)
      return NextResponse.json(data, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Google Place Details proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    )
  }
}