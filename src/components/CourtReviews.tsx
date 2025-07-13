'use client'

import { Court } from '@/types/court'
import { useState } from 'react'
import Image from 'next/image'

interface CourtReviewsProps {
  court: Court
  className?: string
}

interface ReviewItemProps {
  review: NonNullable<Court['reviews']>[0]
  isExpanded: boolean
  onToggleExpanded: () => void
}

function ReviewItem({ review, isExpanded, onToggleExpanded }: ReviewItemProps) {
  const maxTextLength = 150

  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          {review.profile_photo_url ? (
            <Image
              src={review.profile_photo_url}
              alt={review.author_name}
              className="w-10 h-10 rounded-full object-cover"
              width={40}
              height={40}
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {review.author_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-gray-900">{review.author_name}</h4>
              <p className="text-sm text-gray-500">{review.relative_time_description}</p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
              <span className="ml-1 text-sm text-gray-600">({review.rating})</span>
            </div>
          </div>

          {/* Review Text */}
          <div className="text-gray-700">
            {review.text.length > maxTextLength && !isExpanded ? (
              <>
                <p className="text-sm leading-relaxed">
                  {review.text.substring(0, maxTextLength)}...
                </p>
                <button
                  onClick={onToggleExpanded}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                >
                  Read more
                </button>
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed">{review.text}</p>
                {review.text.length > maxTextLength && (
                  <button
                    onClick={onToggleExpanded}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                  >
                    Read less
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CourtReviews({ court, className = '' }: CourtReviewsProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set())
  const [showAllReviews, setShowAllReviews] = useState(false)

  const toggleReviewExpanded = (index: number) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedReviews(newExpanded)
  }

  if (!court.reviews || court.reviews.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h3>
        <div className="text-center text-gray-500">
          <p>No reviews available for this court yet.</p>
          <p className="text-sm mt-2">
            Be the first to share your experience!
          </p>
        </div>
      </div>
    )
  }

  const displayedReviews = showAllReviews ? court.reviews : court.reviews.slice(0, 3)
  const hasMoreReviews = court.reviews.length > 3

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-lg">★</span>
              <span className="font-semibold text-gray-900">{court.rating}</span>
            </div>
            {court.userRatingsTotal && (
              <span className="text-sm text-gray-500">
                ({court.userRatingsTotal} review{court.userRatingsTotal !== 1 ? 's' : ''})
              </span>
            )}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold text-gray-900">{court.rating}</div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < Math.floor(court.rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Based on {court.userRatingsTotal || court.reviews.length} review{(court.userRatingsTotal || court.reviews.length) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Rating breakdown */}
          {court.reviews.length > 0 && (
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = court.reviews!.filter(r => r.rating === rating).length
                const percentage = (count / court.reviews!.length) * 100
                return (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-8 text-right">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-600">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {displayedReviews.map((review, index) => (
            <ReviewItem
              key={index}
              review={review}
              isExpanded={expandedReviews.has(index)}
              onToggleExpanded={() => toggleReviewExpanded(index)}
            />
          ))}
        </div>

        {/* Show More/Less Button */}
        {hasMoreReviews && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              {showAllReviews 
                ? `Show fewer reviews` 
                : `Show all ${court.reviews.length} reviews`
              }
            </button>
          </div>
        )}

        {/* Google Attribution */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Reviews powered by Google Places
          </p>
        </div>
      </div>
    </div>
  )
}

// Utility component for inline rating display
export function InlineRating({ 
  rating, 
  userRatingsTotal, 
  reviewsCount,
  size = 'sm',
  className = '' 
}: { 
  rating: number
  userRatingsTotal?: number
  reviewsCount?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const starSize = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }[size]

  const textSize = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }[size]

  // Use the most accurate count available
  // Priority: userRatingsTotal > reviewsCount > fallback to 1 if rating exists
  const displayCount = userRatingsTotal || reviewsCount || (rating > 0 ? 1 : 0)

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`${starSize} ${
              i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
      <span className={`font-medium text-gray-900 ${textSize}`}>
        {rating}
      </span>
      {displayCount > 0 && (
        <span className={`text-gray-500 ${textSize}`}>
          ({displayCount})
        </span>
      )}
    </div>
  )
}