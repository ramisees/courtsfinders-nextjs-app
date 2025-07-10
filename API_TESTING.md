# API Connection Testing Guide

## 🔗 Testing Your Backend Connection

### 1. Update Environment Variables
Edit `.env.local` with your actual backend URL:

```bash
# For local development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# For deployed backend
NEXT_PUBLIC_API_URL=https://courtsfinders-app.vercel.app/api
```

### 2. Test API Endpoints

#### Test Courts Endpoint
Open browser console on your frontend and run:
```javascript
fetch('http://localhost:3000/api/courts')
  .then(res => res.json())
  .then(data => console.log('Courts:', data))
  .catch(err => console.error('Error:', err))
```

#### Test Search Endpoint
```javascript
fetch('http://localhost:3000/api/search?q=tennis')
  .then(res => res.json())
  .then(data => console.log('Search Results:', data))
  .catch(err => console.error('Error:', err))
```

### 3. Expected API Response Format

Your backend should return courts in this format:
```json
[
  {
    "id": "1",
    "name": "Downtown Tennis Center",
    "type": "Tennis",
    "location": "Downtown District",
    "rating": 4.8,
    "price": "$25/hour",
    "image": "https://example.com/image.jpg",
    "available": true,
    "amenities": ["Lighting", "Parking"],
    "description": "Professional tennis facility",
    "coordinates": { "lat": 40.7128, "lng": -74.0060 }
  }
]
```

### 4. Common Issues & Solutions

#### CORS Issues
If you get CORS errors, ensure your backend has:
```javascript
// In your Next.js API routes
export async function GET(request) {
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

#### Different Port Issues
- Frontend runs on port 3000 (this project)
- If your backend runs on a different port, update `NEXT_PUBLIC_API_URL`
- For example: `http://localhost:3001/api` or `http://localhost:8000/api`

#### Authentication Headers
If your backend requires auth, the frontend will automatically include:
```
Authorization: Bearer {token}
```

### 5. Quick Backend Verification

Check if your backend endpoints work by visiting:
- `http://localhost:3000/api/courts` (should return JSON array)
- `http://localhost:3000/api/search?q=tennis` (should return filtered results)

### 6. Frontend Integration Status

✅ **Completed:**
- API client with error handling
- Search functionality 
- Loading states
- Authentication headers
- Environment configuration

⏳ **Next Steps:**
1. Update `.env.local` with your backend URL
2. Test the connection
3. Verify data format matches
4. Add any missing endpoints
5. Test booking functionality

### 7. Debugging Tips

1. **Check Network Tab**: Open DevTools → Network tab to see API calls
2. **Console Logs**: Check browser console for error messages
3. **Backend Logs**: Check your backend terminal for incoming requests
4. **Response Format**: Ensure your backend returns the expected JSON structure

### 8. Ready to Connect!

Your frontend is now ready to connect to your existing backend. Just:
1. Update the API URL in `.env.local`
2. Start both servers
3. Test the connection
4. Enjoy your full-stack Courts Finder app! 🎾
