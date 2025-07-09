// API types for court data
export interface Court {
  id: string
  name: string
  type: string
  location: string
  rating: number
  price: string
  image: string
  available: boolean
  amenities?: string[]
  description?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface SearchFilters {
  query: string
  sport: string
  location?: string
  priceRange?: [number, number]
  availability?: boolean
}

export interface BookingRequest {
  courtId: string
  date: string
  startTime: string
  endTime: string
  userId: string
}
