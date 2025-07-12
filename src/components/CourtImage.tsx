'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  createImageErrorHandler, 
  getSafeImageUrl, 
  getSportIcon 
} from '@/lib/image-utils'

interface CourtImageProps {
  src?: string
  alt: string
  sport: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  showLoading?: boolean
  showSportIcon?: boolean
}

export default function CourtImage({
  src,
  alt,
  sport,
  width = 300,
  height = 200,
  className = "",
  priority = false,
  showLoading = true,
  showSportIcon = true
}: CourtImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  const safeImageUrl = getSafeImageUrl(src, sport)
  const sportIcon = getSportIcon(sport)

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false)
    setHasError(true)
    
    // Use our enhanced error handler
    createImageErrorHandler(sport)(event)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading state */}
      {isLoading && showLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-2xl">
            {showSportIcon ? sportIcon : '⏳'}
          </div>
        </div>
      )}
      
      {/* Sport icon overlay for context */}
      {showSportIcon && !isLoading && (
        <div className="absolute top-2 left-2 bg-white bg-opacity-80 rounded-full w-8 h-8 flex items-center justify-center text-sm z-10">
          {sportIcon}
        </div>
      )}
      
      {/* Error state with sport context */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500">
          <div className="text-3xl mb-2">{sportIcon}</div>
          <div className="text-sm font-medium">{sport.charAt(0).toUpperCase() + sport.slice(1)} Court</div>
          <div className="text-xs opacity-75">Image unavailable</div>
        </div>
      )}
      
      {/* Main image */}
      <Image
        src={safeImageUrl}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized // Allow external URLs
      />
    </div>
  )
}

// Legacy support component for existing img tags
interface LegacyCourtImageProps {
  src?: string
  alt: string
  sport: string
  className?: string
  width?: number
  height?: number
}

export function LegacyCourtImage({ 
  src, 
  alt, 
  sport, 
  className = "",
  width,
  height 
}: LegacyCourtImageProps) {
  const safeImageUrl = getSafeImageUrl(src, sport)
  
  return (
    <Image
      src={safeImageUrl}
      alt={alt}
      className={className}
      width={width || 400}
      height={height || 300}
      onError={createImageErrorHandler(sport)}
      priority={false}
    />
  )
}