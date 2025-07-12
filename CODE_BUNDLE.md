# Courts Finder - Complete Code Bundle for Error Review

## Project Overview
Next.js 15 Courts Finder application with TypeScript and Tailwind CSS.

## 🔍 PLEASE CHECK THESE FILES FOR ERRORS:

### 1. Main Homepage Component
```typescript
// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { searchCourts, getAllCourts } from '@/lib/api'
import { Court } from '@/types/court'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSport, setSelectedSport] = useState('all')
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!hasLoaded && !loading) {
      loadCourts()
    }
  }, [])

  const loadCourts = async () => {
    if (loading || hasLoaded) return
    setLoading(true)
    setError(null)
    try {
      const courtsData = await getAllCourts()
      setCourts(courtsData)
      setHasLoaded(true)
    } catch (err) {
      setError('Failed to load courts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const results = await searchCourts(searchQuery, selectedSport)
      setCourts(results)
    } catch (err) {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async (courtId: string) => {
    alert(`Booking functionality for court ${courtId}`)
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Courts Finder</h1>
            <div className="flex space-x-3">
              <button className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg">
                Sign In
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">Find Your Perfect Court</h2>
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search by court name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border rounded-lg"
                />
              </div>
              <div>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border rounded-lg"
                >
                  <option value="all">All Sports</option>
                  <option value="tennis">Tennis</option>
                  <option value="basketball">Basketball</option>
                  <option value="pickleball">Pickleball</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="w-full md:w-auto mt-4 px-8 py-3 bg-primary-600 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Courts'}
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && courts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Loading courts...</p>
              </div>
            ) : (
              courts.map((court) => (
                <div key={court.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={court.image}
                      alt={court.name}
                      className="w-full h-48 object-cover"
                    />
                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold ${
                      court.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {court.available ? 'Available' : 'Booked'}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-semibold text-gray-900">{court.name}</h4>
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-gray-600 ml-1">{court.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{court.address}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                        {court.sport}
                      </span>
                      <span className="text-xl font-bold text-primary-600">
                        ${court.pricePerHour}/hour
                      </span>
                    </div>
                    <button 
                      onClick={() => handleBooking(court.id.toString())}
                      className={`w-full py-3 rounded-lg font-semibold ${
                        court.available 
                          ? 'bg-primary-600 text-white hover:bg-primary-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!court.available}
                    >
                      {court.available ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
```

### 2. Court Type Definitions
```typescript
// src/types/court.ts
export interface Court {
  id: string | number
  name: string
  type?: string // Legacy field
  sport?: string // New field
  location?: string // Legacy field
  address?: string // New field
  rating: number
  price?: string // Legacy field
  pricePerHour?: number // New field
  image: string
  available?: boolean
  amenities?: string[]
  description?: string
  coordinates?: {
    lat: number
    lng: number
  }
  surface?: string
  indoor?: boolean
  phone?: string
  website?: string | null
}

export interface SearchFilters {
  query: string
  sport: string
  location?: string
  priceRange?: [number, number]
  availability?: boolean
}

export interface BookingRequest {
  courtId: string
  date: string
  startTime: string
  endTime: string
  userId: string
}
```

### 3. API Client Functions
```typescript
// src/lib/api.ts
import { Court } from '@/types/court'

const getAPIBaseURL = () => {
  const urls = [
    process.env.NEXT_PUBLIC_API_URL,
    'https://courtsfinders-app.vercel.app/api',
    'http://localhost:3001/api',
    'http://localhost:3000/api'
  ].filter(Boolean)
  
  return urls[0] || 'http://localhost:3000/api'
}

const API_BASE_URL = getAPIBaseURL()

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      }
    }
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options })
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      let errorMessage = `API Error ${response.status}: ${response.statusText}`
      
      if (contentType && contentType.includes('text/html')) {
        errorMessage = `Endpoint not found: ${endpoint}`
      } else {
        try {
          const errorData = await response.text()
          errorMessage = `API Error ${response.status}: ${errorData || response.statusText}`
        } catch {
          // If we can't read the error, use the status text
        }
      }
      
      throw new Error(errorMessage)
    }
    
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      return data
    } else {
      return {} as T
    }
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error)
    throw error
  }
}

export const getAllCourts = async (): Promise<Court[]> => {
  try {
    const response = await apiRequest<{ courts: Court[], total: number } | Court[]>('/courts')
    
    if (response && typeof response === 'object' && 'courts' in response) {
      return response.courts
    }
    
    if (Array.isArray(response)) {
      return response
    }
    
    return []
  } catch (error) {
    console.error('Failed to fetch all courts:', error)
    throw new Error('Unable to load courts. Please check your connection and try again.')
  }
}

export const searchCourts = async (
  query: string = '', 
  sport: string = 'all', 
  location?: string
): Promise<Court[]> => {
  const params = new URLSearchParams()
  
  if (query.trim()) params.append('q', query.trim())
  if (sport && sport !== 'all') params.append('sport', sport)
  if (location) params.append('location', location)
  
  const queryString = params.toString()
  
  try {
    const endpoint = `/search${queryString ? `?${queryString}` : ''}`
    const response = await apiRequest<{ courts: Court[], total: number } | Court[]>(endpoint)
    
    if (response && typeof response === 'object' && 'courts' in response) {
      return response.courts
    }
    
    if (Array.isArray(response)) {
      return response
    }
    
    return []
  } catch (error) {
    console.log('Search endpoint failed:', error)
    throw new Error('Search failed. Please try again.')
  }
}
```

### 4. Courts API Route
```typescript
// src/app/api/courts/route.ts
import { NextRequest, NextResponse } from 'next/server';

const courts = [
  {
    id: 1,
    name: "Downtown Tennis Center",
    sport: "tennis",
    address: "123 Main St, Hickory, NC 28601",
    coordinates: { lat: 35.7344, lng: -81.3412 },
    rating: 4.5,
    pricePerHour: 25,
    amenities: ["parking", "restrooms", "lighting", "pro_shop"],
    surface: "hard",
    indoor: false,
    available: true,
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop",
    phone: "(828) 555-0123",
    website: "https://downtowntennis.com"
  },
  {
    id: 2,
    name: "Community Basketball Court",
    sport: "basketball",
    address: "456 Oak Avenue, Hickory, NC 28601",
    coordinates: { lat: 35.7267, lng: -81.3284 },
    rating: 4.2,
    pricePerHour: 15,
    amenities: ["parking", "outdoor", "free"],
    surface: "asphalt",
    indoor: false,
    available: true,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop",
    phone: "(828) 555-0456",
    website: null
  },
  {
    id: 3,
    name: "Elite Pickleball Club",
    sport: "pickleball",
    address: "789 Pine Street, Hickory, NC 28601",
    coordinates: { lat: 35.7289, lng: -81.3156 },
    rating: 4.8,
    pricePerHour: 20,
    amenities: ["parking", "restrooms", "pro_shop", "lessons"],
    surface: "composite",
    indoor: true,
    available: false,
    image: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=300&h=200&fit=crop",
    phone: "(828) 555-0789",
    website: "https://elitepickleball.com"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const location = searchParams.get('location');
    
    let filteredCourts = courts;
    
    if (sport) {
      filteredCourts = filteredCourts.filter(
        court => court.sport.toLowerCase() === sport.toLowerCase()
      );
    }
    
    if (location) {
      filteredCourts = filteredCourts.filter(
        court => court.address.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    return NextResponse.json({
      courts: filteredCourts,
      total: filteredCourts.length
    });
    
  } catch (error) {
    console.error('Error fetching courts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courts' },
      { status: 500 }
    );
  }
}
```

### 5. Search API Route
```typescript
// src/app/api/search/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const sport = searchParams.get('sport') || 'all';
    const location = searchParams.get('location') || '';

    const courts = [
      {
        id: 1,
        name: "Downtown Tennis Center",
        sport: "tennis",
        address: "123 Main St, Hickory, NC 28601",
        coordinates: { lat: 35.7344, lng: -81.3412 },
        rating: 4.5,
        pricePerHour: 25,
        amenities: ["parking", "restrooms", "lighting", "pro_shop"],
        surface: "hard",
        indoor: false,
        available: true,
        image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop",
        phone: "(828) 555-0123",
        website: "https://downtowntennis.com"
      },
      {
        id: 2,
        name: "Community Basketball Court",
        sport: "basketball",
        address: "456 Oak Avenue, Hickory, NC 28601",
        coordinates: { lat: 35.7267, lng: -81.3284 },
        rating: 4.2,
        pricePerHour: 15,
        amenities: ["parking", "outdoor", "free"],
        surface: "asphalt",
        indoor: false,
        available: true,
        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop",
        phone: "(828) 555-0456",
        website: null
      },
      {
        id: 3,
        name: "Elite Pickleball Club",
        sport: "pickleball",
        address: "789 Pine Street, Hickory, NC 28601",
        coordinates: { lat: 35.7289, lng: -81.3156 },
        rating: 4.8,
        pricePerHour: 20,
        amenities: ["parking", "restrooms", "pro_shop", "lessons"],
        surface: "composite",
        indoor: true,
        available: false,
        image: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=300&h=200&fit=crop",
        phone: "(828) 555-0789",
        website: "https://elitepickleball.com"
      }
    ];

    let filteredCourts = courts;

    if (query) {
      filteredCourts = filteredCourts.filter(court => 
        court.name.toLowerCase().includes(query.toLowerCase()) ||
        court.address.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (sport && sport !== 'all') {
      filteredCourts = filteredCourts.filter(court => 
        court.sport.toLowerCase() === sport.toLowerCase()
      );
    }

    if (location) {
      filteredCourts = filteredCourts.filter(court => 
        court.address.toLowerCase().includes(location.toLowerCase())
      );
    }

    return NextResponse.json(filteredCourts);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search courts' },
      { status: 500 }
    );
  }
}
```

### 6. Configuration Files
```json
// package.json
{
  "name": "courtsfinders-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "next": "15.3.5"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "eslint": "^8",
    "eslint-config-next": "15.3.5",
    "autoprefixer": "^10.4.14"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🚨 SPECIFIC AREAS TO CHECK:

1. **React Hooks Usage** - Are useEffect dependencies correct?
2. **TypeScript Types** - Are there any type mismatches?
3. **API Error Handling** - Are errors properly caught and handled?
4. **Async/Await Usage** - Are promises handled correctly?
5. **State Management** - Are state updates safe and correct?
6. **Next.js API Routes** - Are the route handlers properly implemented?
7. **Tailwind CSS Classes** - Are the primary-* classes properly defined?
8. **Data Flow** - Does data flow correctly from API to UI?

## 🎯 QUESTIONS TO ANSWER:

1. Are there any TypeScript errors or type safety issues?
2. Are there potential runtime errors or null reference issues?
3. Are the React hooks used correctly without causing infinite loops?
4. Are the API routes properly structured for Next.js 15?
5. Are there any potential performance issues?
6. Are error states handled gracefully?
7. Is the data structure consistent across all components?

## ✅ CURRENT STATUS:
- All tests are passing
- Application runs without errors
- APIs return correct data
- UI displays courts properly

Please review for any potential issues, improvements, or best practices violations!
