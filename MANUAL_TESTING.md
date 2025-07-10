# 🧪 Manual API Testing Instructions

## Quick Browser Tests

### Step 1: Open Browser Console
1. Go to http://localhost:3000
2. Press F12 to open Developer Tools
3. Go to Console tab

### Step 2: Test Your Backend Connection

#### Test 1: Check if your backend is reachable
```javascript
fetch('http://localhost:3000/api/courts')
  .then(response => {
    console.log('Status:', response.status)
    return response.json()
  })
  .then(data => console.log('Courts:', data))
  .catch(error => console.error('Error:', error))
```

#### Test 2: Check search functionality
```javascript
fetch('http://localhost:3000/api/search?q=tennis')
  .then(response => response.json())
  .then(data => console.log('Search Results:', data))
  .catch(error => console.error('Search Error:', error))
```

#### Test 3: Alternative search endpoint
```javascript
fetch('http://localhost:3000/api/courts/search?q=tennis')
  .then(response => response.json())
  .then(data => console.log('Courts Search:', data))
  .catch(error => console.error('Courts Search Error:', error))
```

## Expected Results

### ✅ Success Indicators:
- Status: 200
- Response: Array of court objects
- Each court has: id, name, type, location, rating, price, image, available

### ❌ Common Issues:

#### 1. "Failed to fetch" or CORS Error
**Problem:** Backend not running or CORS not configured
**Solution:** 
- Check if your backend is running
- Add CORS headers to your backend API routes

#### 2. "404 Not Found"
**Problem:** API endpoint doesn't exist
**Solution:**
- Verify your backend has /api/courts endpoint
- Check if endpoint is /api/courts vs /courts

#### 3. "500 Internal Server Error"
**Problem:** Backend error (database, code issue)
**Solution:**
- Check your backend terminal for error logs
- Verify database connection in backend

## Testing Different Backend URLs

If your backend is running on a different port or URL, test with:

```javascript
// For different local port
fetch('http://localhost:3001/api/courts')

// For deployed backend
fetch('https://courtsfinders-app.vercel.app/api/courts')

// For custom domain
fetch('https://your-backend-domain.com/api/courts')
```

## Quick Backend Verification

### Option 1: Direct URL Test
Open these URLs in your browser:
- http://localhost:3000/api/courts (should show JSON)
- http://localhost:3000/api/search?q=test (should show filtered JSON)

### Option 2: cURL Test (in terminal)
```bash
curl http://localhost:3000/api/courts
curl "http://localhost:3000/api/search?q=tennis"
```

## Next Steps After Testing

1. **If tests pass:** Your frontend is successfully connected!
2. **If tests fail:** Update `.env.local` with correct backend URL
3. **Mixed results:** Some endpoints work, others need backend updates

## Automated Test Page

Visit http://localhost:3000/test for automated testing with a user-friendly interface!
