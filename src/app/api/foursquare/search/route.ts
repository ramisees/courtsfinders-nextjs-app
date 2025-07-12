import { NextRequest, NextResponse } from 'next/server'

/**
 * Foursquare Places Search API Proxy
 * Searches for sports venues using text queries
 */

const FOURSQUARE_API_KEY = process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY

export async function GET(request: NextRequest) {
  console.log('🔍 Proxying Foursquare Places Search request')

  if (!FOURSQUARE_API_KEY) {
    console.error('❌ Foursquare API key not configured')
    return NextResponse.json(
      { error: 'Foursquare API not configured' },
      { status: 500 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const near = searchParams.get('near')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Build Foursquare Places Search URL
    const foursquareUrl = new URL('https://api.foursquare.com/v3/places/search')
    foursquareUrl.searchParams.set('query', query)
    foursquareUrl.searchParams.set('limit', '50')
    foursquareUrl.searchParams.set('fields', 'name,location,rating,price,photos,hours,website,tel,categories')
    
    if (near) {
      foursquareUrl.searchParams.set('near', near)
    }

    console.log(`🔍 Searching Foursquare for: "${query}"${near ? ` near ${near}` : ''}`)

    const response = await fetch(foursquareUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${FOURSQUARE_API_KEY}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('❌ Foursquare API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch from Foursquare API' },
        { status: response.status }
      )
    }

    const data = await response.json()

    console.log(`✅ Foursquare found ${data.results?.length || 0} places`)

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ Foursquare search proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
