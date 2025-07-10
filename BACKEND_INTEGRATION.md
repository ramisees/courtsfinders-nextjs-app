# Backend Integration Requirements for Courts Finder

## Current Frontend Features
- Court search and filtering
- Sport type selection (Tennis, Basketball, Multi-sport)
- Court cards with ratings, pricing, and availability
- Responsive design with Tailwind CSS
- Sample data in `src/lib/api.ts`

## Required Backend Integration

### 1. API Endpoints Needed
```
GET /api/courts
- Returns array of all courts
- Response: Court[]

GET /api/courts/search?q={query}&sport={sport}&location={location}
- Search courts by query, sport type, and location
- Response: Court[]

GET /api/courts/{id}
- Get single court details
- Response: Court

POST /api/courts/{id}/book
- Book a court for specific time slot
- Body: { date, startTime, endTime, userId }
- Response: BookingConfirmation

GET /api/courts/{id}/availability?date={date}
- Check court availability for specific date
- Response: TimeSlot[]

POST /api/auth/login
- User authentication
- Body: { email, password }
- Response: { token, user }

POST /api/auth/register
- User registration
- Body: { email, password, name }
- Response: { token, user }

GET /api/user/bookings
- Get user's bookings
- Headers: Authorization: Bearer {token}
- Response: Booking[]
```

### 2. Data Models

#### Court Interface (already defined in src/types/court.ts)
```typescript
interface Court {
  id: string
  name: string
  type: string // 'Tennis' | 'Basketball' | 'Multi-sport'
  location: string
  rating: number
  price: string
  image: string
  available: boolean
  amenities?: string[]
  description?: string
  coordinates?: { lat: number; lng: number }
}
```

#### Additional Models Needed
```typescript
interface User {
  id: string
  email: string
  name: string
  phone?: string
}

interface Booking {
  id: string
  courtId: string
  userId: string
  date: string
  startTime: string
  endTime: string
  status: 'confirmed' | 'pending' | 'cancelled'
  totalPrice: number
  createdAt: string
}

interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
  price: number
}
```

### 3. Frontend Files to Update

#### Replace sample data in `src/lib/api.ts`
- Remove `sampleCourts` array
- Implement real API calls using fetch/axios
- Add error handling and loading states
- Add authentication headers where needed

#### Update `src/app/page.tsx`
- Connect search functionality to real API
- Add loading states during API calls
- Add error handling for failed requests
- Implement real booking flow

#### Create new pages/components
- Login/Register pages
- User dashboard
- Booking confirmation page
- Court detail pages

### 4. Environment Variables Needed
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
```

### 5. Additional Dependencies to Install
```bash
npm install prisma @prisma/client
npm install next-auth
npm install bcryptjs jsonwebtoken
npm install axios
npm install @tanstack/react-query
```

## Integration Steps
1. Set up database schema
2. Create API routes in app/api/
3. Replace sample data with real API calls
4. Add authentication system
5. Implement booking functionality
6. Add error handling and loading states
7. Test all functionality
8. Deploy with environment variables
