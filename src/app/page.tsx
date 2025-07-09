'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Court {
  id: string
  name: string
  type: string
  location: string
  rating: number
  price: string
  image: string
  available: boolean
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSport, setSelectedSport] = useState('all')

  // Sample data - replace with your backend API
  const courts: Court[] = [
    {
      id: '1',
      name: 'Downtown Tennis Center',
      type: 'Tennis',
      location: 'Downtown District',
      rating: 4.8,
      price: '$25/hour',
      image: '/api/placeholder/300/200',
      available: true
    },
    {
      id: '2',
      name: 'Riverside Basketball Court',
      type: 'Basketball',
      location: 'Riverside Park',
      rating: 4.6,
      price: '$15/hour',
      image: '/api/placeholder/300/200',
      available: true
    },
    {
      id: '3',
      name: 'Elite Sports Complex',
      type: 'Multi-sport',
      location: 'Sports District',
      rating: 4.9,
      price: '$35/hour',
      image: '/api/placeholder/300/200',
      available: false
    }
  ]

  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         court.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSport = selectedSport === 'all' || court.type.toLowerCase().includes(selectedSport.toLowerCase())
    return matchesSearch && matchesSport
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CF</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Courts Finder</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                Find Courts
              </Link>
              <Link href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                About
              </Link>
              <Link href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                Contact
              </Link>
            </nav>
            <div className="flex space-x-3">
              <button className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                Sign In
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Find Your Perfect Court
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Discover and book tennis courts, basketball courts, and sports facilities near you. 
            Play your game at the best venues in your area.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search by court name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Sports</option>
                  <option value="tennis">Tennis</option>
                  <option value="basketball">Basketball</option>
                  <option value="multi-sport">Multi-sport</option>
                </select>
              </div>
            </div>
            <button className="w-full md:w-auto mt-4 px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
              Search Courts
            </button>
          </div>
        </div>
      </section>

      {/* Featured Courts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Featured Courts</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore top-rated courts in your area. Find the perfect venue for your next game.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourts.map((court) => (
              <div key={court.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={court.image}
                    alt={court.name}
                    className="w-full h-48 object-cover"
                  />
                  {court.available ? (
                    <span className="absolute top-3 right-3 bg-secondary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Available
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Booked
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xl font-semibold text-gray-900">{court.name}</h4>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-gray-600 ml-1">{court.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{court.location}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                      {court.type}
                    </span>
                    <span className="text-xl font-bold text-primary-600">{court.price}</span>
                  </div>
                  <button 
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      court.available 
                        ? 'bg-primary-600 text-white hover:bg-primary-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!court.available}
                  >
                    {court.available ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCourts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No courts found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Courts Finder?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎾</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Wide Selection</h4>
              <p className="text-gray-600">Find tennis, basketball, and multi-sport courts in your area.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Instant Booking</h4>
              <p className="text-gray-600">Book your court instantly with real-time availability.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⭐</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Top Quality</h4>
              <p className="text-gray-600">All courts are verified and rated by our community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CF</span>
                </div>
                <span className="text-xl font-bold">Courts Finder</span>
              </div>
              <p className="text-gray-400">Find and book the perfect court for your game.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Courts</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Tennis Courts</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Basketball Courts</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Multi-sport Facilities</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Legal</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Courts Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
