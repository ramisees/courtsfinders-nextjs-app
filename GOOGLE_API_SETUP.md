# Google Places API Setup Guide

This guide will help you configure the Google Places API for the Courts Finder application.

## API Key Configuration ✅

The API key `AIzaSyDUsmAa5CVGF9iN_vwwVyUYluJ0-4Ht_dE` has been configured in:

- ✅ `.env.local` - Main environment configuration
- ✅ `.env.example` - Template for other developers

## Required Google Cloud APIs

To use all features of the Courts Finder app, ensure these APIs are enabled in your Google Cloud Console:

### 1. Places API (New)
- **Purpose**: Search for sports facilities, courts, and venues
- **Endpoint**: `places.googleapis.com`
- **Usage**: Finding real tennis courts, basketball courts, sports complexes

### 2. Geocoding API
- **Purpose**: Convert coordinates to addresses and vice versa
- **Endpoint**: `maps.googleapis.com/maps/api/geocode`
- **Usage**: Getting user's address from GPS coordinates

### 3. Directions API
- **Purpose**: Calculate routes and driving directions
- **Endpoint**: `maps.googleapis.com/maps/api/directions`
- **Usage**: Providing directions to courts

### 4. Maps JavaScript API
- **Purpose**: Display interactive maps (future feature)
- **Endpoint**: `maps.googleapis.com/maps/api/js`
- **Usage**: Map visualization and interactions

## API Endpoints Created

The app uses server-side proxy endpoints to avoid CORS issues:

### Court Search
- `GET /api/google-places/nearby`
- Parameters: `latitude`, `longitude`, `radius`, `type`, `keyword`

### Place Details
- `GET /api/google-places/details`
- Parameters: `placeId`, `fields`

### Geocoding
- `GET /api/google-places/geocode`
- Parameters: `latlng` or `address`

### Directions
- `GET /api/google-places/directions`
- Parameters: `origin`, `destination`, `mode`, `units`, `avoid`

## Testing the Configuration

### 1. Browser-based Testing
Visit: `http://localhost:3000/api-test`

This page will test:
- ✅ API key configuration
- ✅ Nearby search functionality
- ✅ Geocoding API
- ✅ Place details retrieval

### 2. Real-world Testing
Visit: `http://localhost:3000/test-google-places`

This page provides:
- Comprehensive API testing
- Real court search results
- Performance monitoring
- Error diagnostics

### 3. Main Application Testing
1. Go to: `http://localhost:3000`
2. Click "Find Courts Near Me"
3. Allow location access
4. Test different sports and radius options

## Expected Results

With the configured API key, you should see:

### ✅ Working Features:
1. **Location Detection**: Get accurate GPS coordinates
2. **Address Resolution**: Convert coordinates to readable addresses
3. **Real Court Search**: Find actual sports facilities near you
4. **Venue Details**: Get ratings, reviews, and contact information
5. **Directions**: Calculate routes to selected courts

### 📊 Data Sources:
- **Mock Data**: Always available for development/demo
- **Google Places**: Real-time data from Google's database
- **Combined Results**: Intelligent merging of both sources

## Troubleshooting

### Common Issues:

1. **"API key not configured"**
   - Check `.env.local` file exists
   - Verify `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` is set
   - Restart development server

2. **"Places API returned: REQUEST_DENIED"**
   - Enable Places API in Google Cloud Console
   - Check API key restrictions
   - Verify billing is enabled

3. **"No results found"**
   - Try different locations (London, New York, etc.)
   - Increase search radius
   - Check different sport types

4. **CORS errors**
   - Use the proxy endpoints (already configured)
   - Don't call Google APIs directly from browser

## API Quotas and Limits

Monitor your usage at:
- [Places API Quotas](https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas)
- [Geocoding API Quotas](https://console.cloud.google.com/apis/api/geocoding-backend.googleapis.com/quotas)
- [Directions API Quotas](https://console.cloud.google.com/apis/api/directions-backend.googleapis.com/quotas)

### Free Tier Limits:
- **Places API**: $200 free credit monthly
- **Geocoding**: 40,000 requests/month free
- **Directions**: 40,000 elements/month free

## Security Best Practices

1. **API Key Restrictions**: Set up application restrictions in Google Cloud Console
2. **Environment Variables**: Never commit API keys to version control
3. **Server-side Proxy**: Use provided endpoints to hide API key from client
4. **Rate Limiting**: Monitor usage to avoid exceeding quotas

## Next Steps

1. ✅ Test the `/api-test` page to verify configuration
2. ✅ Try the real court search functionality
3. ✅ Monitor API usage in Google Cloud Console
4. 🔄 Set up API key restrictions for production use
5. 🔄 Configure billing alerts to monitor costs

---

## Quick Test Commands

```bash
# Start the development server
npm run dev

# Test API configuration
curl "http://localhost:3000/api/google-places/nearby?latitude=51.5074&longitude=-0.1278&radius=5000&type=sports_complex"

# Test geocoding
curl "http://localhost:3000/api/google-places/geocode?latlng=51.5074,-0.1278"
```

**Status**: ✅ **CONFIGURED AND READY TO USE**

The Google Places API is now fully integrated and ready for testing with real court data!