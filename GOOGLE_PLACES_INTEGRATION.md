# 🌐 Google Places API Integration

## Overview

This implementation integrates Google Places API to search for real tennis courts, basketball courts, and sports facilities near the user's location, combining them with mock data for comprehensive results.

## 🔧 Setup Requirements

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API**
   - **Places API (New)**
   - **Maps JavaScript API** (optional, for future map integration)

### 2. API Key Configuration
1. Create an API key in Google Cloud Console
2. Add restrictions (recommended for production):
   - HTTP referrers for web apps
   - IP restrictions for server-side calls
3. Add the API key to your environment:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

### 3. API Quotas and Billing
- Google Places API requires billing to be enabled
- Free tier includes $200/month credit
- Typical costs: ~$0.032 per Nearby Search request

## 🏗️ Architecture

### Core Components

1. **Google Places Service** (`/src/lib/google-places.ts`)
   - Direct Google Places API integration
   - Place type mapping for sports facilities
   - Photo URL generation
   - Place details fetching

2. **Unified Search Service** (`/src/lib/court-search-service.ts`)
   - Combines mock data with real places
   - Duplicate detection and removal
   - Unified sorting and filtering

3. **Enhanced UI Components** (`/src/components/FindNearMe.tsx`)
   - Data source selection (mock + real)
   - API status indicators
   - Real-time search capabilities

## 📊 Supported Place Types

### Tennis Facilities
- `tennis_court` - Dedicated tennis courts
- `country_club` - Country clubs with tennis facilities
- `recreation_center` - Public recreation centers
- `sports_club` - Private sports clubs

### Basketball Facilities
- `basketball_court` - Dedicated basketball courts
- `recreation_center` - Public recreation centers
- `sports_club` - Sports clubs with basketball
- `gym` - Gyms with basketball courts

### Multi-Sport Facilities
- `sports_complex` - Large sports complexes
- `recreation_center` - Multi-purpose recreation centers
- `sports_club` - Private sports clubs
- `gym` - General fitness facilities
- `country_club` - Premium club facilities

## 🔍 Search Strategy

### 1. Comprehensive Place Search
```typescript
// Searches multiple place types for each sport
const placeTypes = SPORT_PLACE_TYPES[sport] || SPORT_PLACE_TYPES.all
for (const placeType of placeTypes) {
  // Search each type separately for maximum coverage
}
```

### 2. Keyword Filtering
```typescript
// Sport-specific keyword filtering
const keywords = {
  tennis: ['tennis', 'racquet', 'court'],
  basketball: ['basketball', 'court', 'hoop'],
  'multi-sport': ['sports', 'athletic', 'recreation']
}
```

### 3. Distance-Based Sorting
```typescript
// Automatic distance calculation and sorting
courts.sort((a, b) => a.distance - b.distance)
```

## 🔄 Data Flow

### 1. User Location Detection
```typescript
const location = await getCurrentLocation()
```

### 2. Unified Search Execution
```typescript
const result = await searchAllCourtsNearMe(
  latitude, longitude, radiusMiles, sport, {
    includeRealPlaces: true,
    includeMockData: true,
    sortBy: 'distance'
  }
)
```

### 3. Result Processing
- **Duplicate Removal**: Name and location-based deduplication
- **Distance Calculation**: Haversine formula for accurate distances
- **Data Enrichment**: Convert Places data to Court interface
- **Proximity Sorting**: Sort by distance from user

## 📋 API Response Processing

### Place Data Conversion
```typescript
const convertPlaceToCourt = (place: GooglePlace, userLat: number, userLng: number) => {
  // Convert Google Places response to Court interface
  return {
    id: place.place_id,
    name: place.name,
    sport: determineSport(place),
    address: place.vicinity,
    coordinates: place.geometry.location,
    rating: place.rating || 4.0,
    pricePerHour: estimatePrice(place),
    amenities: generateAmenities(place),
    // ... additional fields
  }
}
```

### Price Estimation
- **Country Clubs**: $65/hour (premium)
- **Recreation Centers**: $15/hour (affordable)
- **Sports Clubs**: $45/hour (mid-range)
- **Public Courts**: $25/hour (default)

### Amenity Generation
- **Gyms/Sports Clubs**: fitness_center, locker_rooms
- **Country Clubs**: pro_shop, dining, lessons
- **Recreation Centers**: community_programs, affordable

## 🧪 Testing Infrastructure

### Test Page (`/test-google-places`)
Comprehensive testing interface with:
- API configuration status
- Real vs unified search comparison
- Live location testing
- Error handling validation
- Search capability preview

### Key Test Scenarios
1. **API Configuration**: Verify Google Places API setup
2. **Location Search**: Test real-time place discovery
3. **Sport Filtering**: Validate sport-specific results
4. **Distance Accuracy**: Confirm proximity calculations
5. **Fallback Handling**: Test behavior without API key

## 🔐 Security Considerations

### API Key Protection
- Use `NEXT_PUBLIC_` prefix for client-side access
- Implement domain restrictions in production
- Monitor API usage and quotas

### Rate Limiting
- Google Places API has usage limits
- Implement caching for repeated searches
- Use request batching for efficiency

### Error Handling
```typescript
try {
  const places = await searchNearbyPlaces(lat, lng, radius, sport)
} catch (error) {
  // Fallback to mock data
  return searchMockCourts(lat, lng, radius, sport)
}
```

## 📈 Performance Optimization

### 1. Parallel Requests
- Search multiple place types simultaneously
- Combine results efficiently

### 2. Caching Strategy
- Cache place details for 1 hour
- Store user location for session

### 3. Result Limiting
- Default 50 results maximum
- Distance-based filtering first

## 🚀 Production Deployment

### Environment Variables
```bash
# Required
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_production_api_key

# Optional monitoring
GOOGLE_PLACES_API_USAGE_TRACKING=enabled
```

### API Key Restrictions
1. **HTTP Referrers**: Add your domain(s)
2. **API Restrictions**: Limit to Places API only
3. **Usage Quotas**: Set reasonable limits

### Monitoring
- Track API usage in Google Cloud Console
- Monitor search success rates
- Set up billing alerts

## 🎯 Usage Examples

### Basic Location Search
```typescript
import { searchAllCourtsNearMe } from '@/lib/api'

const courts = await searchAllCourtsNearMe(
  35.7796, -78.6382, // Raleigh, NC
  10, // 10 miles
  'tennis', // Sport type
  true // Include real places
)
```

### Search Capabilities Check
```typescript
import { getSearchCapabilities } from '@/lib/court-search-service'

const capabilities = getSearchCapabilities()
console.log('Real places available:', capabilities.realPlaces.available)
```

### Fallback to Mock Data
```typescript
import { searchCourtsWithFallback } from '@/lib/court-search-service'

// Automatically uses best available data source
const result = await searchCourtsWithFallback(lat, lng, radius, sport)
```

## 🔍 Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Add `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` to `.env.local`
   - Restart development server

2. **"No results found"**
   - Check API key permissions
   - Verify Places API is enabled
   - Test with broader search radius

3. **"Billing not enabled"**
   - Enable billing in Google Cloud Console
   - Add payment method

4. **Rate limit exceeded**
   - Monitor usage in Google Cloud Console
   - Implement result caching
   - Reduce search frequency

### Debug Mode
Enable debug logging:
```typescript
// Check API status
console.log(getAPIUsageInfo())

// Preview search parameters
console.log(previewSearch(lat, lng, radius, sport, options))
```

## 🎉 Benefits

### For Users
- **Real-time data**: Live information from Google Places
- **Comprehensive results**: Mock + real data combined
- **Accurate locations**: Verified business information
- **Rich details**: Photos, ratings, contact information

### For Developers
- **Fallback strategy**: Graceful degradation without API
- **Type safety**: Full TypeScript integration
- **Extensible**: Easy to add new place types
- **Testable**: Comprehensive testing infrastructure

This integration transforms Courts Finder from a mock data demo into a production-ready application with real-world sports facility discovery capabilities.