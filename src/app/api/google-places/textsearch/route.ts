import { NextRequest, NextResponse } from 'next/server'

/**
 * Google Places Text Search API Proxy
 * Searches for places using text queries
 */

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

export async function GET(request: NextRequest) {
  console.log('🔍 Proxying Google Places Text Search request')

  if (!GOOGLE_PLACES_API_KEY) {
    console.error('❌ Google Places API key not configured')
    return NextResponse.json(
      { error: 'Google Places API not configured' },
      { status: 500 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Build Google Places Text Search URL
    const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    placesUrl.searchParams.set('query', query)
    placesUrl.searchParams.set('key', GOOGLE_PLACES_API_KEY)

    console.log(`🔍 Searching places for text: "${query}"`)

    const response = await fetch(placesUrl.toString())
    
    if (!response.ok) {
      console.error('❌ Google Places API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch from Google Places API' },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('❌ Google Places API error status:', data.status, data.error_message)
      return NextResponse.json(
        { error: data.error_message || `Google Places API error: ${data.status}` },
        { status: 500 }
      )
    }

    const places = data.results || []
    console.log(`✅ Found ${places.length} places`)

    return NextResponse.json(places)

  } catch (error) {
    console.error('❌ Text search proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
