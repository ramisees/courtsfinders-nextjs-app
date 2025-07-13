'use client'

import { useState, useEffect } from 'react'
import { 
  getCurrentLocation, 
  UserLocation, 
  LocationError, 
  RADIUS_OPTIONS, 
  RadiusOption, 
  formatDistance,
  isGeolocationSupported 
} from '@/lib/geolocation'
import { searchAllCourtsNearMe } from '@/lib/api'
import { getSearchCapabilities } from '@/lib/court-search-service'
import { Court } from '@/types/court'

interface FindNearMeProps {
  onLocationSearch: (courts: Court[], location: UserLocation, radius: number) => void
  onError: (error: string) => void
  selectedSport?: string
  className?: string
}

export default function FindNearMe({ 
  onLocationSearch, 
  onError, 
  selectedSport = 'all',
  className = ''
}: FindNearMeProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRadius, setSelectedRadius] = useState<RadiusOption>(10)
  const [lastLocation, setLastLocation] = useState<UserLocation | null>(null)
  const [useRealPlaces, setUseRealPlaces] = useState(true)
  const [searchCapabilities, setSearchCapabilities] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  // Initialize client-side only values
  useEffect(() => {
    setIsClient(true)
    setSearchCapabilities(getSearchCapabilities())
  }, [])

  const handleFindNearMe = async () => {
    if (!isClient || !isGeolocationSupported()) {
      onError('Geolocation is not supported by your browser')
      return
    }

    setIsLoading(true)
    
    try {
      console.log('📍 Getting user location...')
      const location = await getCurrentLocation()
      console.log('✅ Location obtained:', location)
      
      setLastLocation(location)
      
      console.log(`🔍 Searching for ${selectedSport} courts within ${selectedRadius} miles...`)
      console.log(`📊 Using real places: ${useRealPlaces && searchCapabilities?.realPlaces?.available}`)
      
      const courts = await searchAllCourtsNearMe(
        location.latitude,
        location.longitude,
        selectedRadius,
        selectedSport,
        useRealPlaces && searchCapabilities?.realPlaces?.available
      )
      
      console.log(`✅ Found ${courts.length} courts near location`)
      onLocationSearch(courts, location, selectedRadius)
      
    } catch (error) {
      console.error('❌ Location search failed:', error)
      const locationError = error as LocationError
      onError(locationError.message || 'Unable to get your location. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRadiusChange = async (newRadius: RadiusOption) => {
    setSelectedRadius(newRadius)
    
    // If we have a previous location, automatically search with new radius
    if (lastLocation && !isLoading) {
      setIsLoading(true)
      try {
        const courts = await searchAllCourtsNearMe(
          lastLocation.latitude,
          lastLocation.longitude,
          newRadius,
          selectedSport,
          useRealPlaces && searchCapabilities?.realPlaces?.available
        )
        onLocationSearch(courts, lastLocation, newRadius)
      } catch (error) {
        console.error('❌ Radius change search failed:', error)
        onError('Failed to update search radius. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Show loading state during SSR
  if (!isClient || !searchCapabilities) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">📍</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Find Courts Near Me</h3>
            <p className="text-sm text-gray-600">Initializing location services...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-black text-lg">📍</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Find Courts Near Me</h3>
          <p className="text-sm text-gray-600">Discover courts in your area instantly</p>
        </div>
      </div>

      <div className="space-y-4">


        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Search Radius
          </label>
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRadiusChange(option.value)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors disabled:opacity-50 ${
                  selectedRadius === option.value
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Find Near Me Button */}
        <button
          onClick={handleFindNearMe}
          disabled={isLoading || !isClient || !isGeolocationSupported()}
          className="w-full bg-yellow-400 text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-300 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              {lastLocation ? 'Updating...' : 'Getting Location...'}
            </>
          ) : (
            <>
              <span>🎯</span>
              Use My Location
            </>
          )}
        </button>

        {/* Location Support Message */}
        {isClient && !isGeolocationSupported() && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <strong>Geolocation not supported:</strong> Your browser doesn&apos;t support location services. 
            Please search by city name instead.
          </div>
        )}



        {/* Tips */}
        {isClient && (
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400">💡</span>
              <span><strong>Tip:</strong> Allow location access when prompted for the best results</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">🔒</span>
              <span><strong>Privacy:</strong> Your location is only used for this search and not stored</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Additional utility component for displaying distance in search results
export function DistanceDisplay({ 
  distance, 
  className = '' 
}: { 
  distance?: number
  className?: string 
}) {
  if (distance === undefined) return null
  
  return (
    <span className={`inline-flex items-center gap-1 text-sm text-gray-600 ${className}`}>
      <span>📍</span>
      {formatDistance(distance)}
    </span>
  )
}