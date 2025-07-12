import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const mode = searchParams.get('mode') || 'driving'
    const units = searchParams.get('units') || 'imperial'
    const avoid = searchParams.get('avoid')

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
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

    const url = new URL('https://maps.googleapis.com/maps/api/directions/json')
    url.searchParams.set('origin', origin)
    url.searchParams.set('destination', destination)
    url.searchParams.set('mode', mode)
    url.searchParams.set('units', units)
    if (avoid) {
      url.searchParams.set('avoid', avoid)
    }
    url.searchParams.set('key', apiKey)

    console.log('🗺️ Proxying Google Directions request')

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === 'OK') {
      console.log(`✅ Directions successful: ${data.routes.length} routes`)
      return NextResponse.json(data)
    } else {
      console.log(`⚠️ Google Directions API returned: ${data.status}`)
      return NextResponse.json(data, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Google Directions proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch directions data' },
      { status: 500 }
    )
  }
}