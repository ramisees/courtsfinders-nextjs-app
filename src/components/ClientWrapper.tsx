'use client'

import { useEffect } from 'react'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress hydration warnings for Grammarly and other browser extensions
    const originalError = console.error
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (
          args[0].includes('data-new-gr-c-s-check-loaded') ||
          args[0].includes('data-gr-ext-installed') ||
          args[0].includes('Hydration failed because the initial UI does not match') ||
          args[0].includes('There was an error while hydrating')
        )
      ) {
        // Suppress Grammarly and other extension-related hydration warnings
        return
      }
      
      // Safely call original error function
      if (typeof originalError === 'function') {
        try {
          originalError.apply(console, args)
        } catch (e) {
          // Fallback if apply fails
          originalError(...args)
        }
      }
    }

    // Clean up
    return () => {
      console.error = originalError
    }
  }, [])

  return <>{children}</>
}
