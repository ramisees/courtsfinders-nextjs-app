// API types for court data
export interface Court {
  id: string | number
  name: string
  sport: string
  address: string
  rating: number
  pricePerHour: number
  image: string
  available: boolean
  amenities?: string[]
  description?: string
  coordinates?: {
    lat: number
    lng: number
  }
  surface?: string
  indoor?: boolean
  phone?: string
  website?: string | null
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
