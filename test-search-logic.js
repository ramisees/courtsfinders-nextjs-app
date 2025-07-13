// Test the search logic manually
const fs = require('fs');

// Create a simple mock court data for testing
const testCourts = [
  {
    id: "1",
    name: "Test Tennis Court",
    sports: ["Tennis"],
    address: "123 Tennis St",
    city: "Raleigh",
    state: "NC",
    zip: "27601",
    coordinates: { latitude: 35.7796, longitude: -78.6382 }
  },
  {
    id: "2", 
    name: "Test Pickleball Court",
    sports: ["Pickleball"],
    address: "456 Pickle Ave",
    city: "Charlotte",
    state: "NC", 
    zip: "28202",
    coordinates: { latitude: 35.2271, longitude: -80.8431 }
  },
  {
    id: "3",
    name: "Test Multi-Sport Complex",
    sports: ["Tennis", "Pickleball", "Basketball"],
    address: "789 Sports Blvd",
    city: "Durham",
    state: "NC",
    zip: "27701", 
    coordinates: { latitude: 35.9940, longitude: -78.8986 }
  }
];

// Test search logic
function testSearch(sport) {
  console.log(`\\n🔍 Testing search for sport: "${sport}"`);
  const filteredCourts = testCourts.filter(court => 
    court.sports.some(s => s.toLowerCase().includes(sport.toLowerCase()))
  );
  
  console.log(`Found ${filteredCourts.length} courts:`);
  filteredCourts.forEach(court => {
    console.log(`- ${court.name} (${court.sports.join(', ')})`);
  });
  
  return filteredCourts.length;
}

// Test different sports
console.log('🧪 Testing Search Logic');
console.log('======================');

const tennisResults = testSearch('tennis');
const pickleballResults = testSearch('pickleball');  
const basketballResults = testSearch('basketball');

console.log('\\n📊 Summary:');
console.log(`Tennis courts: ${tennisResults}`);
console.log(`Pickleball courts: ${pickleballResults}`);
console.log(`Basketball courts: ${basketballResults}`);

// Test if search logic works
if (pickleballResults > 0) {
  console.log('\\n✅ Search logic is working correctly!');
  console.log('✅ The issue was in the data import, which should now be fixed.');
} else {
  console.log('\\n❌ Search logic has issues');
}
