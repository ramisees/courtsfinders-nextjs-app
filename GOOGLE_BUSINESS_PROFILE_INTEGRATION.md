# Enhanced Google Business Profile Integration

## Overview

With the Google Business Profile API now enabled in your Google Cloud project, Courts Finder can access significantly more detailed business information about sports facilities. This enhancement provides richer data about courts, including operating hours, amenities, accessibility information, and more.

## New Features Enabled

### 1. Enhanced Business Profile Endpoint
- **Endpoint**: `/api/google-places/business-profile`
- **Purpose**: Fetches detailed business information using the Business Profile API
- **Enhanced Fields**: Operating hours, amenities, accessibility, price levels, and more

### 2. Detailed Business Information

#### Operating Hours
- Current operating hours
- Regular weekly hours
- Special hours (holidays, events)
- Real-time open/closed status

#### Enhanced Amenities Detection
- Wheelchair accessibility
- Parking availability
- Dining options
- Reservations availability
- Additional services

#### Business Classification
- Facility type (tennis, basketball, multi-sport, etc.)
- Price range interpretation
- Business status validation

### 3. Search Enhancement Integration

The main search API (`/api/search`) now automatically enhances Google Places results with detailed business profile information for up to 10 courts per search to avoid rate limiting.

## API Usage

### Business Profile Endpoint

```javascript
// Get enhanced business profile for a specific place
const response = await fetch('/api/google-places/business-profile?placeId=PLACE_ID')
const data = await response.json()

console.log(data.result.businessProfile)
// {
//   operatingHours: { openNow: true, periods: [...], weekdayText: [...] },
//   amenities: ['wheelchair_accessible', 'parking', 'reservations'],
//   accessibility: { wheelchairAccessible: true },
//   priceRange: 'Moderate ($$)',
//   businessType: 'tennis',
//   facilitySummary: 'Premier tennis facility with...'
// }
```

### Enhanced Search Results

Search results now include additional business profile data:

```javascript
// Search for courts with enhanced business data
const response = await fetch('/api/search?query=tennis courts&location=Denver')
const courts = await response.json()

courts.forEach(court => {
  if (court.businessProfile) {
    console.log('Operating Hours:', court.businessProfile.operatingHours)
    console.log('Amenities:', court.businessProfile.amenities)
    console.log('Accessibility:', court.businessProfile.accessibility)
    console.log('Price Range:', court.businessProfile.priceRange)
  }
})
```

## Enhanced Data Fields

### Business Profile Object
```typescript
businessProfile: {
  operatingHours: {
    openNow: boolean
    periods: Array<{day: number, open: {day: number, time: string}, close: {day: number, time: string}}>
    weekdayText: string[]
    specialHours: any[]
  }
  currentHours: object // Current operating hours
  amenities: string[] // Enhanced amenity detection
  accessibility: {
    wheelchairAccessible: boolean
  }
  priceRange: string // 'Free' | 'Inexpensive ($)' | 'Moderate ($$)' | etc.
  businessType: string // 'tennis' | 'basketball' | 'multi-sport' | etc.
  facilitySummary: string // AI-generated business description
  wheelchairAccessible: boolean
  internationalPhone: string
  website: string
  googleUrl: string // Direct Google Maps URL
}
```

## Rate Limiting & Optimization

- Business profile enhancement is limited to the first 10 search results to prevent rate limiting
- Enhanced data is cached within the search session
- Fallback handling ensures search works even if business profile enhancement fails

## Benefits

1. **Richer User Experience**: Users get detailed facility information including hours, amenities, and accessibility
2. **Better Decision Making**: Enhanced data helps users choose the right facility for their needs  
3. **Real-time Information**: Current operating hours and business status
4. **Accessibility Support**: Wheelchair accessibility and other accessibility features
5. **Comprehensive Amenity Lists**: Automatically detected amenities based on business profile data

## Implementation Notes

- The enhancement is applied automatically during search operations
- Only Google Places results with valid `place_id` values are enhanced
- Graceful fallback ensures search functionality remains intact if enhancement fails
- Enhanced fields are added to existing court objects without replacing original data

## Future Enhancements

With the Business Profile API enabled, future enhancements could include:
- Real-time availability checking
- Direct booking integration
- User review aggregation
- Photo gallery enhancement
- Event and class schedule integration
