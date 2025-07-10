'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { searchCourts, getAllCourts } from '@/lib/api'
import { Court } from '@/types/court'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSport, setSelectedSport] = useState('all')
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Load courts on component mount
  useEffect(() => {
    // Only load once and prevent multiple calls
    if (!hasLoaded && !loading) {
      console.log('🔄 Initial load triggered')
      loadCourts()
    }
  }, [hasLoaded, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCourts = async () => {
    // Prevent multiple simultaneous calls
    if (loading || hasLoaded) {
      console.log('⚠️ Load already in progress or completed, skipping...')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      console.log('🔄 Loading courts...')
      const courtsData = await getAllCourts()
      console.log('✅ Courts loaded:', courtsData.length)
      setCourts(courtsData)
      setHasLoaded(true)
    } catch (err) {
      console.error('❌ Error loading courts:', err)
      setError('Failed to load courts. Please try again.')
      // Don't retry automatically to prevent loops
    } finally {
      setLoading(false)
    }
  }

  const performSearch = useCallback(async (query: string, sport: string) => {
    console.log(`🔍 Starting search: query="${query}", sport="${sport}"`)
    setLoading(true)
    setError(null)
    try {
      const results = await searchCourts(query, sport)
      console.log(`✅ Search completed: found ${results.length} courts`)
      setCourts(results)
    } catch (err) {
      console.error('❌ Search error:', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = async () => {
    performSearch(searchQuery, selectedSport)
  }

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value)
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      if (value.trim() || selectedSport !== 'all') {
        performSearch(value, selectedSport)
      } else {
        loadCourts()
      }
    }, 500)
    
    setSearchTimeout(newTimeout)
  }

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport)
    
    // Immediately search when sport changes
    if (sport !== 'all' || searchQuery.trim()) {
      performSearch(searchQuery, sport)
    } else {
      loadCourts()
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSelectedSport('all')
    loadCourts()
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  const handleManualRetry = () => {
    setHasLoaded(false)
    setError(null)
    loadCourts()
  }

  const handleBooking = async (courtId: string | number) => {
    // This would typically open a booking modal or redirect to booking page
    alert(`Booking functionality for court ${String(courtId)} - integrate with your existing booking flow`)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CF</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Courts Finder</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                Find Courts
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-primary-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-primary-600 transition-colors">
                Contact
              </Link>
            </nav>
            <div className="flex space-x-3">
              <button className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                Sign In
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Find Your Perfect Court
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Discover and book tennis courts, basketball courts, and sports facilities near you. 
            Play your game at the best venues in your area.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search by court name or location..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={selectedSport}
                  onChange={(e) => handleSportChange(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Sports</option>
                  <option value="tennis">Tennis</option>
                  <option value="basketball">Basketball</option>
                  <option value="pickleball">Pickleball</option>
                  <option value="multi-sport">Multi-sport</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <button 
                onClick={handleSearch}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search Courts'}
              </button>
              <button 
                onClick={clearSearch}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                disabled={loading}
              >
                Clear & Show All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {searchQuery || selectedSport !== 'all' ? 'Search Results' : 'Featured Courts'}
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {searchQuery || selectedSport !== 'all' 
                ? `Found ${courts.length} court${courts.length !== 1 ? 's' : ''} ${searchQuery ? `for "${searchQuery}"` : ''} ${selectedSport !== 'all' ? `in ${selectedSport}` : ''}`
                : 'Explore top-rated courts in your area. Find the perfect venue for your next game.'
              }
            </p>
            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 mt-2">
                Debug: Query=&quot;{searchQuery}&quot;, Sport=&quot;{selectedSport}&quot;, Loading={loading.toString()}, Courts={courts.length}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              // Error state
              <div className="col-span-full text-center py-12">
                <div className="text-red-500 text-lg mb-4">{error}</div>
                <button 
                  onClick={loadCourts}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : courts.length === 0 ? (
              // No results state
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🏸</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courts found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || selectedSport !== 'all' 
                    ? `No courts match your search criteria. Try adjusting your filters.`
                    : 'No courts available at the moment.'
                  }
                </p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={clearSearch}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Clear Search
                  </button>
                  <button 
                    onClick={loadCourts}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Reload Courts
                  </button>
                </div>
              </div>
            ) : (
              // Courts grid
              courts.map((court) => (
                <div key={court.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <Image
                      src={court.image || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop'}
                      alt={court.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop'
                      }}
                    />
                    {court.available ? (
                      <span className="absolute top-3 right-3 bg-secondary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Available
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Booked
                      </span>
                    )}
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
                      <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                        {court.sport}
                      </span>
                      <span className="text-xl font-bold text-primary-600">
                        ${court.pricePerHour}/hour
                      </span>
                    </div>
                    <button 
                      onClick={() => handleBooking(court.id)}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
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

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Courts Finder?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎾</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Wide Selection</h4>
              <p className="text-gray-600">Find tennis, basketball, and multi-sport courts in your area.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Instant Booking</h4>
              <p className="text-gray-600">Book your court instantly with real-time availability.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⭐</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Top Quality</h4>
              <p className="text-gray-600">All courts are verified and rated by our community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CF</span>
                </div>
                <span className="text-xl font-bold">Courts Finder</span>
              </div>
              <p className="text-gray-400">Find and book the perfect court for your game.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Courts</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/courts/tennis" className="hover:text-white transition-colors">Tennis Courts</Link></li>
                <li><Link href="/courts/basketball" className="hover:text-white transition-colors">Basketball Courts</Link></li>
                <li><Link href="/courts/multi-sport" className="hover:text-white transition-colors">Multi-sport Facilities</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Legal</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Courts Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
