import { Court } from '@/types/court'

// Sample data - replace with your actual API calls
export const sampleCourts: Court[] = [
  {
    id: '1',
    name: 'Downtown Tennis Center',
    type: 'Tennis',
    location: 'Downtown District',
    rating: 4.8,
    price: '$25/hour',
    image: '/api/placeholder/300/200',
    available: true,
    amenities: ['Lighting', 'Parking', 'Restrooms', 'Water Fountain'],
    description: 'Professional tennis facility with well-maintained courts',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: '2',
    name: 'Riverside Basketball Court',
    type: 'Basketball',
    location: 'Riverside Park',
    rating: 4.6,
    price: '$15/hour',
    image: '/api/placeholder/300/200',
    available: true,
    amenities: ['Outdoor', 'Free Parking', 'Scenic View'],
    description: 'Outdoor basketball court with beautiful river views',
    coordinates: { lat: 40.7589, lng: -73.9851 }
  },
  {
    id: '3',
    name: 'Elite Sports Complex',
    type: 'Multi-sport',
    location: 'Sports District',
    rating: 4.9,
    price: '$35/hour',
    image: '/api/placeholder/300/200',
    available: false,
    amenities: ['Indoor', 'Climate Control', 'Equipment Rental', 'Lockers'],
    description: 'Premium indoor facility for multiple sports',
    coordinates: { lat: 40.7505, lng: -73.9934 }
  },
  {
    id: '4',
    name: 'Community Recreation Center',
    type: 'Tennis',
    location: 'Westside',
    rating: 4.3,
    price: '$20/hour',
    image: '/api/placeholder/300/200',
    available: true,
    amenities: ['Affordable', 'Community Programs', 'Parking'],
    description: 'Community-focused tennis courts with affordable rates',
    coordinates: { lat: 40.7282, lng: -73.9942 }
  },
  {
    id: '5',
    name: 'Harbor View Courts',
    type: 'Basketball',
    location: 'Harbor District',
    rating: 4.7,
    price: '$18/hour',
    image: '/api/placeholder/300/200',
    available: true,
    amenities: ['Harbor View', 'Well-lit', 'Public Access'],
    description: 'Basketball courts with stunning harbor views',
    coordinates: { lat: 40.7074, lng: -74.0113 }
  },
  {
    id: '6',
    name: 'University Sports Center',
    type: 'Multi-sport',
    location: 'University District',
    rating: 4.5,
    price: '$30/hour',
    image: '/api/placeholder/300/200',
    available: true,
    amenities: ['Student Discounts', 'Modern Facilities', 'Equipment Included'],
    description: 'State-of-the-art university sports facility',
    coordinates: { lat: 40.7831, lng: -73.9712 }
  }
]

// API functions - replace with your actual backend calls
export const searchCourts = async (query: string, sport: string = 'all'): Promise<Court[]> => {
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = sampleCourts.filter(court => {
        const matchesQuery = court.name.toLowerCase().includes(query.toLowerCase()) ||
                           court.location.toLowerCase().includes(query.toLowerCase())
        const matchesSport = sport === 'all' || court.type.toLowerCase().includes(sport.toLowerCase())
        return matchesQuery && matchesSport
      })
      resolve(filtered)
    }, 500) // Simulate API delay
  })
}

export const getCourt = async (id: string): Promise<Court | null> => {
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const court = sampleCourts.find(c => c.id === id) || null
      resolve(court)
    }, 300)
  })
}

export const bookCourt = async (courtId: string, bookingDetails: any): Promise<boolean> => {
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Booking court:', courtId, bookingDetails)
      resolve(true)
    }, 1000)
  })
}
