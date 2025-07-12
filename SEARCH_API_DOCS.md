# Enhanced Search API Documentation

## Overview

The Courts Finder Enhanced Search API provides powerful search capabilities with fuzzy matching, location-based search, advanced filtering, and intelligent ranking. The API supports multiple search criteria simultaneously and returns relevance-scored results.

## Endpoints

### 1. Enhanced Search (v2)

**`GET /api/search/v2`**

The main search endpoint with advanced features.

#### Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Text query (name, address, description) | `?q=tennis` |
| `sport` | string | Sport filter | `?sport=tennis` |
| `lat` | number | Latitude for location search | `?lat=40.7614` |
| `lng` | number | Longitude for location search | `?lng=-73.9656` |
| `radius` | number | Search radius in km | `?radius=10` |
| `minPrice` | number | Minimum price per hour | `?minPrice=0` |
| `maxPrice` | number | Maximum price per hour | `?maxPrice=50` |
| `amenities` | string | Comma-separated amenities | `?amenities=parking,restrooms` |
| `surfaces` | string | Comma-separated surface types | `?surfaces=clay,hard` |
| `indoor` | boolean | Indoor courts only | `?indoor=true` |
| `available` | boolean | Available courts only | `?available=true` |
| `minRating` | number | Minimum rating | `?minRating=4.0` |
| `sortBy` | string | Sort order | `?sortBy=distance` |
| `limit` | number | Results per page (default: 50) | `?limit=20` |
| `offset` | number | Pagination offset | `?offset=0` |

#### Sort Options

- `relevance` - Best match (default)
- `distance` - Nearest first (requires location)
- `price` - Lowest price first
- `rating` - Highest rating first
- `name` - Alphabetical

#### Example Requests

```bash
# Basic text search
GET /api/search/v2?q=tennis

# Location-based search in Manhattan
GET /api/search/v2?lat=40.7614&lng=-73.9656&radius=5

# Advanced filtering
GET /api/search/v2?sport=tennis&minPrice=0&maxPrice=50&amenities=parking,lighting&indoor=false&sortBy=rating

# Combined search
GET /api/search/v2?q=downtown&sport=basketball&lat=35.7344&lng=-81.3412&radius=10&available=true
```

#### Response Format

```json
{
  "results": [
    {
      "id": 1,
      "name": "Downtown Tennis Center",
      "sport": "tennis",
      "address": "123 Main St, Hickory, NC 28601",
      "rating": 4.5,
      "pricePerHour": 25,
      "available": true,
      "amenities": ["parking", "restrooms", "lighting"],
      "surface": "hard",
      "indoor": false,
      "coordinates": {
        "lat": 35.7344,
        "lng": -81.3412
      },
      "_score": 85.5,
      "_distance": 2.3,
      "_matchedFields": ["name", "address", "nearby"]
    }
  ],
  "total": 42,
  "params": {
    "query": "tennis",
    "sport": "tennis",
    "sortBy": "relevance"
  },
  "filters": {
    "sports": ["tennis", "basketball", "pickleball"],
    "amenities": ["parking", "restrooms", "lighting"],
    "priceRange": { "min": 0, "max": 150 }
  }
}
```

### 2. Search Suggestions

**`GET /api/search/suggestions`**

Get autocomplete suggestions for search queries.

#### Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `q` | string | Partial query | Required |
| `limit` | number | Max suggestions | 8 |
| `type` | string | Suggestion type | `all` |

#### Suggestion Types

- `all` - All types of suggestions
- `names` - Court names only
- `locations` - Cities and addresses
- `sports` - Sports types
- `amenities` - Available amenities

#### Example

```bash
GET /api/search/suggestions?q=ten&limit=5&type=all
```

```json
{
  "suggestions": [
    "tennis",
    "Downtown Tennis Center",
    "Manhattan Tennis Club",
    "Wimbledon Park Tennis Courts",
    "Beverly Hills Tennis Academy"
  ],
  "query": "ten",
  "type": "all"
}
```

### 3. Filter Options

**`GET /api/search/filters`**

Get available filter options for building search interfaces.

#### Response

```json
{
  "sports": ["tennis", "basketball", "pickleball", "multi-sport"],
  "amenities": ["parking", "restrooms", "lighting", "pro_shop"],
  "surfaces": ["hard", "clay", "grass", "concrete"],
  "priceRange": {
    "min": 0,
    "max": 150
  },
  "locations": ["Hickory", "New York", "London", "Paris"],
  "priceRanges": [
    { "label": "Free", "min": 0, "max": 0 },
    { "label": "Under $25", "min": 0, "max": 25 },
    { "label": "$25 - $50", "min": 25, "max": 50 },
    { "label": "$50 - $100", "min": 50, "max": 100 },
    { "label": "Over $100", "min": 100, "max": 1000 }
  ],
  "ratingRanges": [
    { "label": "4+ stars", "min": 4.0 },
    { "label": "4.5+ stars", "min": 4.5 },
    { "label": "4.8+ stars", "min": 4.8 }
  ],
  "popularAmenities": [
    { "name": "parking", "count": 15 },
    { "name": "restrooms", "count": 12 },
    { "name": "lighting", "count": 10 }
  ],
  "locationClusters": [
    { "name": "New York", "count": 3 },
    { "name": "Hickory", "count": 3 },
    { "name": "London", "count": 2 }
  ],
  "sortOptions": [
    { "value": "relevance", "label": "Best Match" },
    { "value": "distance", "label": "Distance" },
    { "value": "price", "label": "Price: Low to High" },
    { "value": "rating", "label": "Rating: High to Low" },
    { "value": "name", "label": "Name: A to Z" }
  ],
  "quickFilters": [
    { "label": "Available Now", "filter": { "available": true } },
    { "label": "Free Courts", "filter": { "priceRange": { "max": 0 } } },
    { "label": "Indoor Only", "filter": { "indoor": true } },
    { "label": "Top Rated", "filter": { "rating": { "min": 4.5 } } }
  ]
}
```

## Search Features

### 1. Fuzzy Matching

The search engine uses Levenshtein distance to find courts even with typos or partial matches:

- **"tenni"** → matches "tennis"
- **"bascketball"** → matches "basketball"
- **"manhatten"** → matches "Manhattan"

### 2. Location-Based Search

#### Distance Calculation
Uses the Haversine formula for accurate distance calculation between coordinates.

#### Location Detection
Automatically detects location queries:
- City names: "New York", "London", "Paris"
- Addresses: "123 Main Street"
- ZIP codes: "28601"
- Relative terms: "near me", "downtown"

### 3. Intelligent Scoring

Results are ranked using a composite score based on:

- **Text Match (up to 50 points)**
  - Exact name match: 50 points
  - Fuzzy name match: 30 points
  - Address match: 30 points
  - Amenity match: 10 points
  - Description match: 15 points

- **Location Match (up to 30 points)**
  - Distance-based scoring
  - Nearby bonus (≤5km): Extra points

- **Quality Factors**
  - Rating bonus: up to 25 points
  - Availability bonus: 10 points
  - Price score: up to 10 points (lower = better)

### 4. Multi-Criteria Filtering

Supports simultaneous filtering by:
- Sport type
- Location and radius
- Price range
- Amenities (AND logic)
- Surface types (OR logic)
- Indoor/outdoor preference
- Availability status
- Minimum rating

## Error Handling

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": "Failed to search courts",
  "message": "Invalid latitude value"
}
```

## Performance

### Caching

- Filter options: 1 hour cache
- Suggestions: 5 minutes cache
- Search results: No cache (real-time data)

### Rate Limiting

- Standard endpoints: 100 requests/minute
- Search endpoints: 200 requests/minute

## Examples

### Example 1: Find Tennis Courts in Manhattan

```bash
GET /api/search/v2?q=tennis&lat=40.7614&lng=-73.9656&radius=5&sortBy=rating
```

### Example 2: Free Basketball Courts

```bash
GET /api/search/v2?sport=basketball&maxPrice=0&available=true&sortBy=distance
```

### Example 3: Indoor Courts with Parking

```bash
GET /api/search/v2?indoor=true&amenities=parking&minRating=4.0
```

### Example 4: Fuzzy Search for Courts

```bash
GET /api/search/v2?q=manhatten%20tenni&limit=10
```

## Migration from v1

### Changes from Original API

1. **New endpoint**: `/api/search/v2` (v1 still available)
2. **Enhanced parameters**: More filter options
3. **Improved response**: Includes scoring and metadata
4. **Better location search**: Coordinate-based with radius
5. **Fuzzy matching**: Handles typos and partial matches

### Backward Compatibility

The original `/api/search` endpoint remains functional with basic filtering support.

## TypeScript Interfaces

```typescript
// Enhanced search parameters
interface SearchParams {
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
interface SearchResult {
  court: Court
  score: number
  distance?: number
  matchedFields: string[]
}
```

## Usage in Frontend

### React Hook Example

```typescript
import { useState, useEffect } from 'react'

interface UseSearchProps {
  query?: string
  filters?: SearchParams
}

export function useSearch({ query, filters }: UseSearchProps) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!query && !filters) return

    const searchCourts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        if (filters?.sport) params.set('sport', filters.sport)
        if (filters?.location) {
          params.set('lat', filters.location.lat.toString())
          params.set('lng', filters.location.lng.toString())
        }
        // Add other filters...

        const response = await fetch(`/api/search/v2?${params}`)
        const data = await response.json()
        setResults(data.results)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchCourts, 300)
    return () => clearTimeout(debounceTimer)
  }, [query, filters])

  return { results, loading, error }
}
```

This enhanced search API provides a powerful, flexible foundation for building sophisticated court finder applications with excellent user experience.