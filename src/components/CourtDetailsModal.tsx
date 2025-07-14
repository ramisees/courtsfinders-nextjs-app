'use client'

import { Court } from '@/types/court'
import { UserLocation } from '@/lib/geolocation'
import { openDirections, getTravelModeIcon, estimateTravelTime } from '@/lib/directions'
import { formatDistance } from '@/lib/geolocation'
import CourtReviews, { InlineRating } from './CourtReviews'
import { useState } from 'react'
import { LegacyCourtImage } from './CourtImage'

interface CourtDetailsModalProps {
  court: Court
  userLocation?: UserLocation
  isOpen: boolean
  onClose: () => void
  distance?: number
}

export default function CourtDetailsModal({
  court,
  userLocation,
  isOpen,
  onClose,
  distance
}: CourtDetailsModalProps) {
  const [selectedTravelMode, setSelectedTravelMode] = useState<'driving' | 'walking' | 'bicycling' | 'transit'>('driving')
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'directions'>('details')

  if (!isOpen) return null

  const handleGetDirections = () => {
    if (!court.coordinates) return
    
    openDirections(
      court.coordinates,
      court.name,
      userLocation,
      selectedTravelMode
    )
  }

  const estimatedTravelTime = distance ? estimateTravelTime(distance, selectedTravelMode) : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          <LegacyCourtImage
            src={court.image}
            alt={court.name}
            sport={court.sport}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all"
          >
            <span className="text-gray-700 text-lg">✕</span>
          </button>
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3">
            <h2 className="text-xl font-bold text-gray-900">{court.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{court.address}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-yellow-400 text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-yellow-400 text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews {court.reviews && court.reviews.length > 0 && (
                <span className="ml-1 bg-gray-100 text-gray-600 rounded-full px-2 py-1 text-xs">
                  {court.reviews.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('directions')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'directions'
                  ? 'border-yellow-400 text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Directions
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-300px)] overflow-y-auto">
          {activeTab === 'details' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Court Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">🏅</span>
                      <div>
                        <span className="font-medium text-gray-900">Sport:</span>
                        <span className="ml-2 capitalize">{court.sport}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">⭐</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">Rating:</span>
                        <InlineRating 
                          rating={court.rating} 
                          userRatingsTotal={court.userRatingsTotal}
                          reviewsCount={court.reviews?.length}
                          size="sm"
                        />
                      </div>
                    </div>

                    {distance && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">📍</span>
                        <div>
                          <span className="font-medium text-gray-900">Distance:</span>
                          <span className="ml-2">{formatDistance(distance)}</span>
                        </div>
                      </div>
                    )}

                    {court.surface && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">🏟️</span>
                        <div>
                          <span className="font-medium text-gray-900">Surface:</span>
                          <span className="ml-2 capitalize">{court.surface}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{court.indoor ? '🏢' : '🌤️'}</span>
                      <div>
                        <span className="font-medium text-gray-900">Type:</span>
                        <span className="ml-2">{court.indoor ? 'Indoor' : 'Outdoor'}</span>
                      </div>
                    </div>

                  </div>

                  {/* Contact Information */}
                  {(court.phone || court.website) && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                      <div className="space-y-3">
                        {court.phone && (
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500">📞</span>
                            <a
                              href={`tel:${court.phone}`}
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              {court.phone}
                            </a>
                          </div>
                        )}
                        {court.website && (
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500">🌐</span>
                            <a
                              href={court.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Amenities and Description */}
                <div>
                  {court.amenities && court.amenities.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {court.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium"
                          >
                            {amenity.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {court.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{court.description}</p>
                    </div>
                  )}

                  {court.tags && court.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {court.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {tag.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="p-6">
              <CourtReviews court={court} />
            </div>
          )}

          {activeTab === 'directions' && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Get Directions</h3>
                
                {/* Travel Mode Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Travel Mode
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['driving', 'walking', 'bicycling', 'transit'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSelectedTravelMode(mode)}
                        className={`p-3 rounded-lg border transition-colors ${
                          selectedTravelMode === mode
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-2xl mb-1">{getTravelModeIcon(mode)}</div>
                        <div className="text-sm font-medium capitalize">{mode}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance and Time */}
                {distance && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">Distance</div>
                        <div className="text-lg font-semibold">{formatDistance(distance)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Est. Travel Time</div>
                        <div className="text-lg font-semibold">{estimatedTravelTime}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Get Directions Button */}
                <button
                  onClick={handleGetDirections}
                  disabled={!court.coordinates}
                  className="w-full bg-yellow-600 text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>🗺️</span>
                  Open in Maps
                </button>

                {/* Address */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Address</div>
                  <div className="font-medium">{court.address}</div>
                </div>

                {/* Note */}
                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    Directions will open in your device&apos;s default maps application.
                    Travel times are estimates and may vary based on traffic and conditions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}