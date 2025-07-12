import { Court, SearchFilters, SearchResult, FilterOptions } from '@/types/court'

export class SearchEngine {
  private courts: Court[]

  constructor(courts: Court[]) {
    this.courts = courts
  }

  search(filters: SearchFilters): SearchResult[] {
    let results = this.courts.map(court => ({
      court,
      score: 0,
      matchedFields: [] as string[]
    }))

    // Apply text search
    if (filters.query) {
      results = this.applyTextSearch(results, filters.query)
    }

    // Apply filters
    if (filters.sport && filters.sport !== 'all') {
      results = results.filter(r => r.court.sport.toLowerCase() === filters.sport!.toLowerCase())
    }

    if (filters.available !== undefined) {
      results = results.filter(r => r.court.available === filters.available)
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score)

    return results.slice(0, filters.limit || 50)
  }

  private applyTextSearch(results: SearchResult[], query: string): SearchResult[] {
    const searchTerms = query.toLowerCase().split(' ')
    
    return results.map(result => {
      let score = 0
      const matchedFields: string[] = []

      searchTerms.forEach(term => {
        // Check name
        if (result.court.name.toLowerCase().includes(term)) {
          score += 50
          matchedFields.push('name')
        }

        // Check address
        if (result.court.address.toLowerCase().includes(term)) {
          score += 30
          matchedFields.push('address')
        }

        // Check sport
        if (result.court.sport.toLowerCase().includes(term)) {
          score += 40
          matchedFields.push('sport')
        }

        // Check amenities
        if (result.court.amenities?.some(a => a.toLowerCase().includes(term))) {
          score += 20
          matchedFields.push('amenities')
        }
      })

      return {
        ...result,
        score,
        matchedFields: [...new Set(matchedFields)]
      }
    }).filter(r => r.score > 0)
  }

  getSuggestions(query: string, limit: number = 5): string[] {
    const lowerQuery = query.toLowerCase()
    const suggestions = new Set<string>()

    this.courts.forEach(court => {
      // Name suggestions
      if (court.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add(court.name)
      }

      // Location suggestions
      const addressParts = court.address.split(',')
      addressParts.forEach(part => {
        const trimmed = part.trim()
        if (trimmed.toLowerCase().includes(lowerQuery)) {
          suggestions.add(trimmed)
        }
      })

      // Sport suggestions
      if (court.sport.toLowerCase().includes(lowerQuery)) {
        suggestions.add(court.sport)
      }
    })

    return Array.from(suggestions).slice(0, limit)
  }

  getFilterOptions(): FilterOptions {
    const sports = [...new Set(this.courts.map(c => c.sport))]
    const amenities = [...new Set(this.courts.flatMap(c => c.amenities || []))]
    const surfaces = [...new Set(this.courts.map(c => c.surface).filter(Boolean))]
    
    const prices = this.courts.map(c => c.pricePerHour).filter(Boolean)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    return {
      sports,
      amenities,
      surfaces,
      priceRange: { min: minPrice, max: maxPrice },
      locations: [],
      priceRanges: [
        { label: 'Under $25', min: 0, max: 25 },
        { label: '$25-$50', min: 25, max: 50 },
        { label: 'Over $50', min: 50, max: 1000 }
      ],
      ratingRanges: [
        { label: '4+ stars', min: 4.0 },
        { label: '4.5+ stars', min: 4.5 }
      ],
      popularAmenities: [],
      locationClusters: [],
      sortOptions: [
        { value: 'relevance', label: 'Best Match' },
        { value: 'price', label: 'Price: Low to High' },
        { value: 'rating', label: 'Rating: High to Low' }
      ],
      quickFilters: [
        { label: 'Available Now', filter: { available: true } },
        { label: 'Indoor Only', filter: { indoor: true } }
      ]
    }
  }
}