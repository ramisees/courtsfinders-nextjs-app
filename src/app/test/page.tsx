'use client'

import { useState } from 'react'
import { getAllCourts, searchCourts } from '@/lib/api'

export default function APITestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runTests = async () => {
    setLoading(true)
    setTestResults([])
    
    addResult('🧪 Starting API Connection Tests...')
    
    // Test 1: Get All Courts
    try {
      addResult('1️⃣ Testing getAllCourts()...')
      const courts = await getAllCourts()
      addResult(`✅ Success! Found ${courts.length} courts`)
      addResult(`📋 Sample court: ${courts[0]?.name || 'No courts found'}`)
    } catch (error) {
      addResult(`❌ getAllCourts failed: ${error}`)
    }
    
    // Test 2: Search Courts
    try {
      addResult('2️⃣ Testing searchCourts()...')
      const searchResults = await searchCourts('tennis', 'all')
      addResult(`✅ Search Success! Found ${searchResults.length} results for "tennis"`)
    } catch (error) {
      addResult(`❌ searchCourts failed: ${error}`)
    }
    
    // Test 3: Empty Search
    try {
      addResult('3️⃣ Testing empty search...')
      const emptySearch = await searchCourts('', 'all')
      addResult(`✅ Empty search Success! Found ${emptySearch.length} courts`)
    } catch (error) {
      addResult(`❌ Empty search failed: ${error}`)
    }
    
    // Test 4: Sport Filter
    try {
      addResult('4️⃣ Testing sport filter...')
      const basketballCourts = await searchCourts('', 'basketball')
      addResult(`✅ Basketball filter Success! Found ${basketballCourts.length} basketball courts`)
    } catch (error) {
      addResult(`❌ Sport filter failed: ${error}`)
    }
    
    addResult('🏁 All tests completed!')
    setLoading(false)
  }

  const testMultipleURLs = async () => {
    addResult('� Testing multiple backend URLs...')
    
    const urlsToTest = [
      'http://localhost:3000/api',
      'http://localhost:3001/api', 
      'https://courtsfinders-app.vercel.app/api',
      'https://courtsfinders.vercel.app/api'
    ]
    
    for (const baseUrl of urlsToTest) {
      try {
        addResult(`📡 Testing: ${baseUrl}/courts`)
        const response = await fetch(`${baseUrl}/courts`)
        
        if (response.ok) {
          const data = await response.json()
          addResult(`✅ SUCCESS at ${baseUrl}! Found ${data.length || 'unknown'} courts`)
          addResult(`🎯 Update .env.local with: NEXT_PUBLIC_API_URL=${baseUrl}`)
          break
        } else {
          addResult(`❌ ${baseUrl} returned ${response.status}`)
        }
      } catch (error) {
        addResult(`❌ ${baseUrl} failed: ${error instanceof Error ? error.message : 'Network error'}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🧪 API Connection Test</h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Environment Info:</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p><strong>Current API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api (default)'}</p>
              <p><strong>Node ENV:</strong> {process.env.NODE_ENV || 'development'}</p>
              <p><strong>Expected Endpoints:</strong></p>
              <ul className="ml-4 mt-2 text-sm">
                <li>• GET /api/courts</li>
                <li>• GET /api/search</li>
                <li>• GET /api/courts/search</li>
              </ul>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400">
            <h3 className="font-semibold text-blue-800">🔧 Quick Fix Options:</h3>
            <div className="mt-2 text-blue-700 text-sm">
              <p><strong>If you're getting 404 errors:</strong></p>
              <ol className="ml-4 mt-2 space-y-1">
                <li>1. Update <code>.env.local</code> with your deployed backend URL</li>
                <li>2. Or start your existing backend on a different port</li>
                <li>3. Or create API routes in this project's <code>src/app/api/</code> folder</li>
              </ol>
            </div>
          </div>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={runTests}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Running Tests...' : 'Run API Tests'}
            </button>
            
            <button
              onClick={testMultipleURLs}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Find My Backend
            </button>
            
            <button
              onClick={() => setTestResults([])}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Results
            </button>
          </div>
          
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-gray-500">Click "Run API Tests" to start testing your backend connection...</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <h3 className="font-semibold text-yellow-800">Troubleshooting Tips:</h3>
            <ul className="mt-2 text-yellow-700 text-sm space-y-1">
              <li>• Make sure your backend is running on the correct port</li>
              <li>• Check that your .env.local file has the correct NEXT_PUBLIC_API_URL</li>
              <li>• Verify your backend endpoints match: /api/courts, /api/search</li>
              <li>• Check browser Network tab for failed requests</li>
              <li>• Ensure CORS is configured properly in your backend</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <a 
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Main Site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
