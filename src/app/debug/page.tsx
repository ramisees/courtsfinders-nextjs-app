'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [callCount, setCallCount] = useState(0)

  useEffect(() => {
    console.log('🔍 Debug useEffect triggered, call count:', callCount + 1)
    setCallCount(prev => prev + 1)
    
    // Prevent multiple calls
    if (loading) {
      console.log('⚠️ Already loading, skipping...')
      return
    }

    loadCourts()
  }, []) // Empty dependency array

  const loadCourts = async () => {
    console.log('🔄 Starting loadCourts...')
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/courts')
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('📊 Raw response:', data)
      
      // Handle both formats
      const courtsArray = data.courts || data
      console.log('✅ Courts array:', courtsArray)
      
      setCourts(courtsArray)
    } catch (err) {
      console.error('❌ Error in loadCourts:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
      console.log('🏁 loadCourts finished')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">API Call Status</h2>
          <div className="space-y-2">
            <p><strong>Call Count:</strong> {callCount}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
            <p><strong>Courts Count:</strong> {courts.length}</p>
          </div>
        </div>

        <button 
          onClick={loadCourts} 
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          {loading ? 'Loading...' : 'Manual Load Courts'}
        </button>

        <button 
          onClick={() => {
            setCourts([])
            setError(null)
            setCallCount(0)
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Reset
        </button>

        {courts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Courts Data:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(courts, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
