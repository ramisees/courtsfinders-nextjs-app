# 🎾 Courts Finder - Setup Guide for Google Places API

## 🌍 Adding Location-Based Search with Google Places API

Your Courts Finder app now supports searching for sports facilities worldwide using Google Places API! Here's how to set it up:

### 1. Get a Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API**
   - **Geocoding API**
   - **Places API (New)** (recommended)

4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### 2. Configure Environment Variables

#### For Local Development:
Create a `.env.local` file in your project root:
```bash
GOOGLE_PLACES_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

#### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `GOOGLE_PLACES_API_KEY` = your_actual_api_key_here

### 3. How It Works

- **Without API Key**: Shows static courts in Hickory, NC
- **With API Key**: 
  - Searches for cities worldwide (London, Paris, Tokyo, etc.)
  - Finds tennis courts, basketball courts, gyms, and sports centers
  - Uses real photos and ratings from Google Places

### 4. Test Your Setup

1. Start your development server: `npm run dev`
2. Search for:
   - "London" → Should find courts in London, UK
   - "New York" → Should find courts in New York, USA
   - "tennis courts Paris" → Should find tennis courts in Paris

### 5. Search Features

Your app now supports:
- **City searches**: "London", "Tokyo", "Los Angeles"
- **Specific queries**: "tennis courts near me", "basketball courts downtown"
- **Sport filtering**: Combine with sport dropdown for targeted results
- **Real data**: Photos, ratings, and addresses from Google Places

### 6. Fallback Behavior

- If Google Places API fails → Falls back to static data
- If no API key → Uses static data only
- Graceful error handling with user-friendly messages

### 7. Cost Considerations

Google Places API has usage limits:
- **Free tier**: $200 credit monthly (≈ 17,000 searches)
- **Cost**: ~$0.012 per search request
- Monitor usage in Google Cloud Console

### 8. Security Notes

- API key is server-side only (safe for production)
- No client-side exposure of credentials
- Vercel environment variables are secure

## 🚀 Deployment

Your app is ready for deployment! The Google Places integration will work automatically once you add the API key to your Vercel environment variables.

## 📱 User Experience

- **Fast searches**: Debounced search input (500ms delay)
- **Smart detection**: Automatically detects location vs. venue searches
- **Worldwide coverage**: Search any city globally
- **Fallback data**: Always shows some results

## 🔧 Troubleshooting

1. **No results for cities**: Check if GOOGLE_PLACES_API_KEY is set
2. **API errors**: Verify API key has Places API enabled
3. **Local testing**: Use `.env.local` for development
4. **Vercel deployment**: Add environment variables in dashboard

---

Happy court hunting! 🎾🏀🏸
