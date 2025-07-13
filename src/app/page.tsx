'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { searchCourts, getAllCourts, searchAllCourtsNearMe } from '@/lib/api'
import { Court } from '@/types/court'
import { UserLocation } from '@/lib/geolocation'
import FindNearMe, { DistanceDisplay } from '@/components/FindNearMe'
import CourtDetailsModal from '@/components/CourtDetailsModal'
import { InlineRating } from '@/components/CourtReviews'
import CourtImage from '@/components/CourtImage'
import { preloadFallbackImages } from '@/lib/image-utils'
import NoSSR from '@/components/NoSSR'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSport, setSelectedSport] = useState('all')
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isLocationSearch, setIsLocationSearch] = useState(false)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [searchRadius, setSearchRadius] = useState<number | null>(null)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Load courts on component mount - disabled for new layout
  useEffect(() => {
    // Don't auto-load courts anymore - users should search first
    console.log('🔄 Page loaded - waiting for user search')
    setHasLoaded(true) // Mark as loaded to prevent auto-loading
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Preload fallback images on app start
  useEffect(() => {
    preloadFallbackImages()
  }, [])

  const loadCourts = async () => {
    // Prevent multiple simultaneous calls
    if (loading || hasLoaded) {
      console.log('⚠️ Load already in progress or completed, skipping...')
      return
    }
    
    setLoading(true)
    setError(null)
    setIsLocationSearch(false)
    try {
      console.log('🔄 Loading all courts via search endpoint...')
      // Use search endpoint with no query to get all courts (more consistent)
      const courtsData = await searchCourts('', 'all')
      console.log('✅ Courts loaded via search:', courtsData.length)
      
      // Debug: Check if we have NC courts
      const ncCourts = courtsData.filter(court => 
        court.address.toLowerCase().includes('nc') || 
        court.address.toLowerCase().includes('north carolina')
      )
      console.log(`📍 NC courts in initial load: ${ncCourts.length}/${courtsData.length}`)
      
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
    setIsLocationSearch(false) // Clear location search state
    
    // Show immediate feedback to user
    setCourts([]) // Clear previous results
    
    try {
      const results = await searchCourts(query, sport)
      console.log(`✅ Search completed: found ${results.length} courts`)
      setCourts(results)
      
      // Debug logging to see if we're getting NC courts
      const ncCourts = results.filter(court => 
        court.address.toLowerCase().includes('nc') || 
        court.address.toLowerCase().includes('north carolina')
      )
      console.log(`📍 NC courts found: ${ncCourts.length}/${results.length}`)
      
    } catch (err) {
      console.error('❌ Search error:', err)
      setError('Search failed. Please try again.')
      setCourts([]) // Clear courts on error
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
    
    // Set new timeout for debounced search - reduced for faster response
    const newTimeout = setTimeout(() => {
      if (value.trim() || selectedSport !== 'all') {
        performSearch(value, selectedSport)
      } else {
        // Show all courts when no search criteria
        performSearch('', 'all')
      }
    }, 300) // Reduced from 500ms to 300ms
    
    setSearchTimeout(newTimeout)
  }

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport)
    
    // Immediately search when sport changes
    if (sport !== 'all' || searchQuery.trim()) {
      performSearch(searchQuery, sport)
    } else {
      performSearch('', 'all')
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSelectedSport('all')
    setIsLocationSearch(false)
    setUserLocation(null)
    setSearchRadius(null)
    // Reset to show all courts
    performSearch('', 'all')
  }

  // Handle location-based search results
  const handleLocationSearch = (courts: Court[], location: UserLocation, radius: number) => {
    console.log(`📍 Location search completed: ${courts.length} courts found`)
    setCourts(courts)
    setUserLocation(location)
    setSearchRadius(radius)
    setIsLocationSearch(true)
    setSearchQuery('') // Clear text search when using location
    setError(null)
  }

  // Handle location search errors
  const handleLocationError = (errorMessage: string) => {
    console.error('❌ Location search error:', errorMessage)
    setError(errorMessage)
    setIsLocationSearch(false)
    setUserLocation(null)
    setSearchRadius(null)
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
    performSearch('', 'all')
  }

  const handleCourtDetails = (court: Court) => {
    setSelectedCourt(court)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedCourt(null)
    setIsModalOpen(false)
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
            Discover tennis courts, basketball courts, and sports facilities near you. 
            Play your game at the best venues in your area.
          </p>
        </div>
      </section>

      {/* Find Near Me Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Courts Near You</h3>
            <p className="text-gray-600">Use your location to find the closest courts</p>
          </div>
          <FindNearMe
            onLocationSearch={handleLocationSearch}
            onError={handleLocationError}
            selectedSport={selectedSport}
            className="max-w-2xl mx-auto"
          />
        </div>
      </section>

      {/* Main Search Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Or Search by Location</h3>
            <p className="text-gray-600">Search for courts in any city worldwide</p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Try 'London', 'New York', 'tennis courts near me', or your city..."
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
              >
                Clear
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              💡 <strong>Tip:</strong> Search for cities like &quot;London&quot;, &quot;Paris&quot;, or &quot;New York&quot; to find sports facilities worldwide!
            </p>
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      {(courts.length > 0 || loading || error) && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {isLocationSearch ? 'Courts Near You' : 
                 (searchQuery || selectedSport !== 'all') ? 'Search Results' : 'Featured Courts'}
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {isLocationSearch 
                  ? `Found ${courts.length} court${courts.length !== 1 ? 's' : ''} within ${searchRadius} miles of your location ${selectedSport !== 'all' ? `for ${selectedSport}` : ''}`
                  : (searchQuery || selectedSport !== 'all') 
                    ? `Found ${courts.length} court${courts.length !== 1 ? 's' : ''} ${searchQuery ? `for "${searchQuery}"` : ''} ${selectedSport !== 'all' ? `in ${selectedSport}` : ''}`
                    : 'Explore top-rated courts in your area. Find the perfect venue for your next game.'
                }
              </p>
              {isLocationSearch && userLocation && (
                <div className="mt-3 text-sm text-blue-600 bg-blue-50 inline-block px-4 py-2 rounded-lg">
                  📍 Showing results near {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </div>
              )}
              {/* Debug Info - Remove in production */}
              <NoSSR>
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-400 mt-2">
                    Debug: Query=&quot;{searchQuery}&quot;, Sport=&quot;{selectedSport}&quot;, Loading={loading.toString()}, Courts={courts.length}
                  </div>
                )}
              </NoSSR>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full">
                  {/* Loading message */}
                  <div className="text-center py-8 mb-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                    <div className="text-lg font-medium text-gray-700 mb-2">
                      Searching for courts...
                    </div>
                    <div className="text-sm text-gray-500">
                      {(searchQuery || selectedSport !== 'all') 
                        ? `Looking for ${searchQuery ? `"${searchQuery}"` : ''} ${selectedSport !== 'all' ? `${selectedSport} courts` : 'courts'} worldwide`
                        : 'This may take a moment as we search multiple sources'
                      }
                    </div>
                  </div>
                  {/* Loading skeleton grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                        <div className="w-full h-48 bg-gray-300"></div>
                        <div className="p-6">
                          <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                          <div className="h-8 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                // Error state
                <div className="col-span-full text-center py-12">
                  <div className="text-red-500 text-lg mb-4">{error}</div>
                  <button 
                    onClick={() => performSearch(searchQuery, selectedSport)}
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
                    {isLocationSearch
                      ? `No courts found within ${searchRadius} miles of your location. Try increasing the search radius or checking nearby areas.`
                      : (searchQuery || selectedSport !== 'all') 
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
                      onClick={() => performSearch('', 'all')}
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
                      <CourtImage
                        src={court.image}
                        alt={court.name}
                        sport={court.sport}
                        className="w-full h-48"
                        showLoading={true}
                        showSportIcon={true}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-xl font-semibold text-gray-900">{court.name}</h4>
                        <InlineRating 
                          rating={court.rating} 
                          userRatingsTotal={court.userRatingsTotal}
                          reviewsCount={court.reviews?.length}
                          size="sm"
                        />
                      </div>
                      <p className="text-gray-600 mb-2">{court.address}</p>
                      {isLocationSearch && (court as any).distance !== undefined && (
                        <div className="mb-2">
                          <DistanceDisplay distance={(court as any).distance} className="text-blue-600" />
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-4">
                        <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                          {court.sport}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <button 
                          onClick={() => handleCourtDetails(court)}
                          className="w-full py-2 border border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Default Features Section (shown when no search results) */}
      {!loading && !error && courts.length === 0 && (
        <>
          {/* Stats Section */}
          <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h3 className="text-sm font-semibold text-primary-600 mb-2">🏆 #1 Sports Court Directory</h3>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Court</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Discover amazing tennis, pickleball, basketball, volleyball, and handball courts. Connect with your local sports community and play your favorite game.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">10,000+</div>
                  <div className="text-sm text-gray-600">Courts Listed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Cities</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">1M+</div>
                  <div className="text-sm text-gray-600">Games</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-8">
                <button className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  <span className="mr-2">🔍</span>
                  Enhanced Search
                </button>
                <button className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  <span className="mr-2">📍</span>
                  Browse Courts
                </button>
              </div>
            </div>
          </section>

          {/* Find Courts by Sport Section */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Find Courts by Sport</h3>
                <p className="text-gray-600">Explore specialized courts for your favorite sport</p>
              </div>

              {/* Sports Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Tennis */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-blue-200 transition-colors cursor-pointer"
                       onClick={() => handleSportChange('tennis')}>
                    <span className="text-4xl">🎾</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-blue-600">Tennis</h4>
                  <p className="text-gray-600 mb-4">Clay, hard, and grass courts</p>
                  <button 
                    onClick={() => handleSportChange('tennis')}
                    className="text-blue-600 hover:text-blue-800 underline">
                    Find Tennis Courts →
                  </button>
                </div>

                {/* Pickleball */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-green-200 transition-colors cursor-pointer"
                       onClick={() => handleSportChange('pickleball')}>
                    <span className="text-4xl">🏓</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-green-600">Pickleball</h4>
                  <p className="text-gray-600 mb-4">Fastest growing sport</p>
                  <button 
                    onClick={() => handleSportChange('pickleball')}
                    className="text-green-600 hover:text-green-800 underline">
                    Find Pickleball Courts →
                  </button>
                </div>

                {/* Basketball */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-orange-200 transition-colors cursor-pointer"
                       onClick={() => handleSportChange('basketball')}>
                    <span className="text-4xl">🏀</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-orange-600">Basketball</h4>
                  <p className="text-gray-600 mb-4">Indoor and outdoor courts</p>
                  <button 
                    onClick={() => handleSportChange('basketball')}
                    className="text-orange-600 hover:text-orange-800 underline">
                    Find Basketball Courts →
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

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

      {/* Court Details Modal */}
      {selectedCourt && (            <CourtDetailsModal
              court={selectedCourt}
              userLocation={userLocation || undefined}
              isOpen={isModalOpen}
              onClose={closeModal}
              distance={isLocationSearch ? (selectedCourt as any).distance : undefined}
            />
      )}
    </div>
  )
}
