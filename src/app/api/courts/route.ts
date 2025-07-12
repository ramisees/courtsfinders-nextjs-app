import { NextRequest, NextResponse } from 'next/server'
import { northCarolinaCourts } from '@/data/nc-courts'

export async function GET(request: NextRequest) {
  console.log('📍 GET /api/courts called')
  
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const location = searchParams.get('location')
    const available = searchParams.get('available')
    
    let filteredCourts = northCarolinaCourts
    
    // Apply filters
    if (sport && sport !== 'all') {
      filteredCourts = filteredCourts.filter(
        court => court.sport.toLowerCase() === sport.toLowerCase()
      )
    }
    
    if (location) {
      filteredCourts = filteredCourts.filter(
        court => court.address.toLowerCase().includes(location.toLowerCase())
      )
    }
    
    if (available === 'true') {
      filteredCourts = filteredCourts.filter(court => court.available)
    }
    
    console.log(`✅ Returning ${filteredCourts.length} courts`)
    
    const response = NextResponse.json({
      courts: filteredCourts,
      total: filteredCourts.length
    })
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return response
    
  } catch (error) {
    console.error('❌ Error in courts API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courts' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}
