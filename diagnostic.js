// Quick diagnostic script to test API endpoints
// Run this in browser console

console.log('🔍 Running API Diagnostics...')

async function runDiagnostics() {
  const tests = [
    { name: 'Courts API', url: 'http://localhost:3000/api/courts' },
    { name: 'Search API', url: 'http://localhost:3000/api/search?sport=tennis' },
    { name: 'Frontend Page', url: 'http://localhost:3000' }
  ]
  
  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`)
      const response = await fetch(test.url)
      console.log(`Status: ${response.status}`)
      
      if (response.ok && test.url.includes('api')) {
        const data = await response.json()
        console.log(`✅ Success: ${Array.isArray(data) ? data.length + ' items' : 'Response received'}`)
      } else if (response.ok) {
        console.log('✅ Page loads successfully')
      } else {
        console.log(`❌ Failed: ${response.statusText}`)
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
    }
  }
}

runDiagnostics()
