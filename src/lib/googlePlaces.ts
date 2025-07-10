// Google Places API integration for location-based court search
interface GooglePlacesResult {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  rating?: number
  types: string[]
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  price_level?: number
  business_status?: string
  opening_hours?: {
    open_now: boolean
  }
}

interface GooglePlacesResponse {
  results: GooglePlacesResult[]
  status: string
  next_page_token?: string
}

export class GooglePlacesService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  // Search for sports facilities near a location
  async searchSportsFacilities(
    location: string,
    radius: number = 10000, // 10km default
    types: string[] = ['gym', 'park', 'stadium', 'establishment']
  ): Promise<GooglePlacesResult[]> {
    try {
      // First geocode the location
      const geocodeResponse = await this.geocodeLocation(location)
      if (!geocodeResponse.results.length) {
        throw new Error('Location not found')
      }

      const { lat, lng } = geocodeResponse.results[0].geometry.location
      
      // Then search for sports facilities
      const keywords = ['tennis court', 'basketball court', 'sports center', 'gym', 'recreation center']
      const allResults: GooglePlacesResult[] = []

      for (const keyword of keywords) {
        const results = await this.nearbySearch(lat, lng, radius, keyword)
        allResults.push(...results)
      }

      // Remove duplicates and filter relevant results
      const uniqueResults = this.removeDuplicates(allResults)
      return this.filterSportsVenues(uniqueResults)
    } catch (error) {
      console.error('Google Places search failed:', error)
      throw error
    }
  }

  // Geocode a location string to coordinates
  private async geocodeLocation(location: string): Promise<any> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${this.apiKey}`
    const response = await fetch(url)
    return await response.json()
  }

  // Search for places nearby
  private async nearbySearch(
    lat: number,
    lng: number,
    radius: number,
    keyword: string
  ): Promise<GooglePlacesResult[]> {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${this.apiKey}`
    
    const response = await fetch(url)
    const data: GooglePlacesResponse = await response.json()
    
    if (data.status !== 'OK') {
      console.warn(`Google Places API returned status: ${data.status}`)
      return []
    }
    
    return data.results
  }

  // Remove duplicate places
  private removeDuplicates(places: GooglePlacesResult[]): GooglePlacesResult[] {
    const seen = new Set()
    return places.filter(place => {
      const key = `${place.name}-${place.formatted_address}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  // Filter to keep only sports-related venues
  private filterSportsVenues(places: GooglePlacesResult[]): GooglePlacesResult[] {
    const sportsKeywords = [
      'tennis', 'basketball', 'court', 'sports', 'gym', 'fitness', 
      'recreation', 'athletic', 'club', 'center', 'facility'
    ]
    
    return places.filter(place => {
      const name = place.name?.toLowerCase() || ''
      const address = place.formatted_address?.toLowerCase() || ''
      const text = `${name} ${address}`
      
      return sportsKeywords.some(keyword => text.includes(keyword))
    })
  }

  // Get photo URL for a place
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`
  }

  // Convert Google Places result to our Court interface
  convertToCourtFormat(place: GooglePlacesResult, sport: string = 'multi-sport'): any {
    const photoUrl = place.photos?.[0] 
      ? this.getPhotoUrl(place.photos[0].photo_reference)
      : this.getDefaultImageForSport(sport)

    return {
      id: place.place_id,
      name: place.name || 'Unknown Venue',
      sport: this.determineSportFromPlace(place),
      address: place.formatted_address || 'Address not available',
      coordinates: {
        lat: place.geometry?.location?.lat || 0,
        lng: place.geometry?.location?.lng || 0
      },
      rating: place.rating || 4.0,
      pricePerHour: this.estimatePrice(place),
      image: photoUrl,
      available: place.business_status === 'OPERATIONAL',
      amenities: this.inferAmenities(place),
      phone: null,
      website: null,
      surface: 'unknown',
      indoor: this.isIndoorFacility(place)
    }
  }

  // Determine sport type from place data
  private determineSportFromPlace(place: GooglePlacesResult): string {
    const name = place.name?.toLowerCase() || ''
    
    if (name.includes('tennis')) return 'tennis'
    if (name.includes('basketball')) return 'basketball'
    if (name.includes('pickle')) return 'pickleball'
    if (name.includes('gym') || name.includes('fitness')) return 'multi-sport'
    
    return 'multi-sport'
  }

  // Estimate price based on place data
  private estimatePrice(place: GooglePlacesResult): number {
    const priceLevel = place.price_level || 2
    const basePrice = 20
    return basePrice + (priceLevel * 10)
  }

  // Infer amenities from place data
  private inferAmenities(place: GooglePlacesResult): string[] {
    const amenities: string[] = ['parking']
    
    if (place.types.includes('gym')) {
      amenities.push('locker_rooms', 'equipment_rental')
    }
    
    if (place.rating && place.rating > 4.0) {
      amenities.push('professional_staff')
    }
    
    return amenities
  }

  // Check if facility is likely indoor
  private isIndoorFacility(place: GooglePlacesResult): boolean {
    const name = place.name?.toLowerCase() || ''
    const types = place.types?.join(' ').toLowerCase() || ''
    
    return name.includes('indoor') || 
           types.includes('gym') || 
           types.includes('health') ||
           name.includes('center') ||
           name.includes('club')
  }

  // Get default image for sport type
  private getDefaultImageForSport(sport: string): string {
    const images = {
      tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop',
      basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop',
      pickleball: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&h=200&fit=crop',
      'multi-sport': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop'
    }
    
    return images[sport as keyof typeof images] || images['multi-sport']
  }
}
