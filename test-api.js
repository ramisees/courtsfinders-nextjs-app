// API Connection Test Script
// Run this in browser console or as a Node.js script

const API_BASE_URL = 'http://localhost:3000/api'

async function testAPIConnection() {
  console.log('🧪 Testing API Connection...')
  console.log('Base URL:', API_BASE_URL)
  
  // Test 1: Check if API is reachable
  try {
    console.log('\n1️⃣ Testing /api/courts endpoint...')
    const response = await fetch(`${API_BASE_URL}/courts`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Courts API Response:', data)
      console.log(`✅ Found ${data.length} courts`)
    } else {
      console.log('❌ Courts API failed:', response.status, response.statusText)
    }
  } catch (error) {
    console.log('❌ Courts API error:', error.message)
  }
  
  // Test 2: Check search endpoint
  try {
    console.log('\n2️⃣ Testing /api/search endpoint...')
    const response = await fetch(`${API_BASE_URL}/search?q=tennis`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Search API Response:', data)
    } else {
      console.log('❌ Search API failed:', response.status, response.statusText)
    }
  } catch (error) {
    console.log('❌ Search API error:', error.message)
  }
  
  // Test 3: Try alternative search endpoint
  try {
    console.log('\n3️⃣ Testing /api/courts/search endpoint...')
    const response = await fetch(`${API_BASE_URL}/courts/search?q=tennis`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Courts Search API Response:', data)
    } else {
      console.log('❌ Courts Search API failed:', response.status, response.statusText)
    }
  } catch (error) {
    console.log('❌ Courts Search API error:', error.message)
  }
}

// For browser console
if (typeof window !== 'undefined') {
  window.testAPI = testAPIConnection
  console.log('Run testAPI() in console to test the connection')
}

// For Node.js
if (typeof module !== 'undefined') {
  module.exports = testAPIConnection
}

export default testAPIConnection
