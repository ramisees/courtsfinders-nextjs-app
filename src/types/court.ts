// API types for court data
export interface Court {
  id: string | number
  name: string
  sport: string
  address: string
  rating: number
  pricePerHour: number
  userRatingsTotal?: number
  reviews?: Array<{
    author_name: string
    author_url?: string
    language: string
    profile_photo_url?: string
    rating: number
    relative_time_description: string
    text: string
    time: number
  }>
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
  phone?: string | null
  website?: string | null
  
  // Additional search-related fields
  capacity?: number
  openingHours?: {
    [day: string]: { open: string; close: string } | null
  }
  bookingUrl?: string
  tags?: string[]
  popularity?: number
  lastUpdated?: string
}

// Enhanced search filters interface
export interface SearchFilters {
  query?: string
  sport?: string
  location?: {
    lat: number
    lng: number
    radius?: number
  }
  priceRange?: {
    min?: number
    max?: number
  }
  amenities?: string[]
  surface?: string[]
  indoor?: boolean
  available?: boolean
  rating?: {
    min?: number
  }
  sortBy?: 'relevance' | 'price' | 'rating' | 'distance' | 'name'
  limit?: number
  offset?: number
}

// Search result with metadata
export interface SearchResult {
  court: Court
  score: number
  distance?: number
  matchedFields: string[]
  relevanceFactors?: {
    textMatch: number
    locationMatch: number
    ratingBonus: number
    availabilityBonus: number
    priceScore: number
  }
}

// Advanced search parameters
export interface AdvancedSearchParams extends SearchFilters {
  fuzzyMatch?: boolean
  exactMatch?: boolean
  includeUnavailable?: boolean
  businessHours?: boolean
  openNow?: boolean
}

// Filter options for UI
export interface FilterOptions {
  sports: string[]
  amenities: string[]
  surfaces: string[]
  priceRange: {
    min: number
    max: number
  }
  locations: string[]
  priceRanges: Array<{
    label: string
    min: number
    max: number
  }>
  ratingRanges: Array<{
    label: string
    min: number
  }>
  popularAmenities: Array<{
    name: string
    count: number
  }>
  locationClusters: Array<{
    name: string
    count: number
  }>
  sortOptions: Array<{
    value: string
    label: string
  }>
  quickFilters: Array<{
    label: string
    filter: Partial<SearchFilters>
  }>
}

export interface BookingRequest {
  courtId: string
  date: string
  startTime: string
  endTime: string
  userId: string
  duration?: number
  notes?: string
}

// Geolocation types
export interface GeoLocation {
  lat: number
  lng: number
  accuracy?: number
  timestamp?: number
}

// Search analytics
export interface SearchAnalytics {
  query: string
  timestamp: number
  resultsCount: number
  filters: SearchFilters
  clickthrough?: boolean
  selectedCourtId?: string | number
}
