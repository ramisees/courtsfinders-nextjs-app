console.log("Testing distance calculation and filtering...")

// Test data
const testLocation = { lat: 35.7344, lng: -81.3412 } // Hickory, NC
const radiusMiles = 5

// Simulate court data
const testCourts = [
  { id: 1, name: "Nearby Court", coordinates: { lat: 35.7400, lng: -81.3500 } },
  { id: 2, name: "Far Court", coordinates: { lat: 35.8000, lng: -81.5000 } }
]

// Distance calculation function (same as in api.ts)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Test calculations
const radiusKm = radiusMiles * 1.60934
console.log(`Radius: ${radiusMiles} miles = ${radiusKm} km`)

testCourts.forEach(court => {
  const distance = calculateDistance(
    testLocation.lat, testLocation.lng,
    court.coordinates.lat, court.coordinates.lng
  )
  const distanceMiles = distance / 1.60934
  const withinRadius = distance <= radiusKm
  
  console.log(`${court.name}:`)
  console.log(`  Distance: ${distance.toFixed(2)} km (${distanceMiles.toFixed(2)} miles)`)
  console.log(`  Within ${radiusMiles} mile radius: ${withinRadius}`)
})
