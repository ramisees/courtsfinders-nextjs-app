import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const radius = searchParams.get('radius') || '5000'
    const type = searchParams.get('type') || 'sports_complex'
    const keyword = searchParams.get('keyword') || ''

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
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

    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.searchParams.set('location', `${latitude},${longitude}`)
    url.searchParams.set('radius', radius)
    url.searchParams.set('type', type)
    if (keyword) {
      url.searchParams.set('keyword', keyword)
    }
    url.searchParams.set('key', apiKey)

    console.log('🔍 Proxying Google Places request:', url.toString().replace(apiKey, 'API_KEY_HIDDEN'))

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === 'OK') {
      console.log(`✅ Found ${data.results.length} places`)
      return NextResponse.json(data)
    } else {
      console.log(`⚠️ Google Places API returned: ${data.status}`)
      return NextResponse.json(data, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Google Places proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch places data' },
      { status: 500 }
    )
  }
}