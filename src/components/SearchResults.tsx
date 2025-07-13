'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Court } from '@/types/court'
import CourtImage from './CourtImage'
import NoSSR from './NoSSR'

interface SearchResultsProps {
  searchQuery?: string
  selectedSport?: string
}

export default function SearchResults({ 
  searchQuery = '', 
  selectedSport = 'all'
}: SearchResultsProps) {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch search results
  useEffect(() => {
    fetchResults()
  }, [searchQuery, selectedSport]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchResults = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Build search URL
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.append('q', searchQuery.trim())
      if (selectedSport && selectedSport !== 'all') params.append('sport', selectedSport)
      
      const url = `/api/search${params.toString() ? `?${params.toString()}` : ''}`
      console.log('🔍 Fetching search results:', url)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Search results received:', data.length)
      setCourts(Array.isArray(data) ? data : [])
      
    } catch (err) {
      console.error('❌ Search error:', err)
      setError('Failed to load search results. Please try again.')
      setCourts([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedSport])

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button 
          onClick={fetchResults}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // No results state
  if (courts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏸</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No courts found</h3>
        <p className="text-gray-500 mb-6">
          {searchQuery || selectedSport !== 'all' 
            ? `No courts match your search criteria. Try adjusting your filters.`
            : 'No courts available at the moment.'
          }
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    )
  }

  // Results display
  return (
    <div>
      {/* Results Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {searchQuery || selectedSport !== 'all' ? 'Search Results' : 'Available Courts'}
        </h2>
        <p className="text-gray-600">
          {searchQuery || selectedSport !== 'all' 
            ? `Found ${courts.length} court${courts.length !== 1 ? 's' : ''} ${searchQuery ? `for "${searchQuery}"` : ''} ${selectedSport !== 'all' ? `in ${selectedSport}` : ''}`
            : `Showing ${courts.length} available courts`
          }
        </p>
        
        {/* Debug info in development */}
        <NoSSR>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 mt-2">
              Debug: Query=&quot;{searchQuery}&quot;, Sport=&quot;{selectedSport}&quot;, Results={courts.length}
            </div>
          )}
        </NoSSR>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map((court) => (
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
                <h3 className="text-xl font-semibold text-gray-900">{court.name}</h3>
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
              </div>
              
              {/* Amenities */}
              {court.amenities && court.amenities.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {court.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                    {court.amenities.length > 3 && (
                      <span className="text-xs text-gray-500">+{court.amenities.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}