import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const latlng = searchParams.get('latlng')
    const address = searchParams.get('address')

    if (!latlng && !address) {
      return NextResponse.json(
        { error: 'Either latlng or address parameter is required' },
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

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    if (latlng) {
      url.searchParams.set('latlng', latlng)
    }
    if (address) {
      url.searchParams.set('address', address)
    }
    url.searchParams.set('key', apiKey)

    console.log('🌍 Proxying Google Geocoding request')

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === 'OK') {
      console.log(`✅ Geocoding successful: ${data.results.length} results`)
      return NextResponse.json(data)
    } else {
      console.log(`⚠️ Google Geocoding API returned: ${data.status}`)
      return NextResponse.json(data, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Google Geocoding proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch geocoding data' },
      { status: 500 }
    )
  }
}