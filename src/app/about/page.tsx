import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CF</span>
              </div>
              <Link href="/" className="text-2xl font-bold text-gray-900">Courts Finder</Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                Find Courts
              </Link>
              <Link href="/about" className="text-primary-600 font-semibold">
                About
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-primary-600 transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">About Courts Finder</h1>
          <p className="text-xl text-primary-100">
            Making sports facilities accessible to everyone, everywhere.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              Courts Finder was created to solve a simple problem: finding quality sports facilities shouldn't be difficult. 
              Whether you're looking for a tennis court for your weekend game, a basketball court for pickup games, 
              or a multi-sport facility for your team, we make it easy to discover and book the perfect venue.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-8">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-primary-600">🎾 Tennis Courts</h3>
                <p className="text-gray-600">
                  Find tennis courts with various surfaces, lighting options, and amenities. 
                  From public courts to private clubs.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-primary-600">🏀 Basketball Courts</h3>
                <p className="text-gray-600">
                  Discover indoor and outdoor basketball courts, from casual pickup games 
                  to competitive league play.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-primary-600">🏓 Multi-Sport Facilities</h3>
                <p className="text-gray-600">
                  Access comprehensive sports complexes offering multiple sports, 
                  equipment rental, and professional coaching.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-primary-600">⚡ Instant Booking</h3>
                <p className="text-gray-600">
                  Book courts instantly with real-time availability, 
                  secure payments, and booking confirmations.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Story</h2>
            <p className="text-lg text-gray-600 mb-8">
              Founded in 2024, Courts Finder started as a simple idea: sports should be accessible to everyone. 
              Our team of sports enthusiasts and technology experts came together to create a platform that 
              connects players with the best sports facilities in their area.
            </p>

            <p className="text-lg text-gray-600 mb-8">
              Today, we're proud to serve thousands of players across the country, helping them find and book 
              the perfect courts for their games. From casual players to serious athletes, Courts Finder is 
              your gateway to better sports experiences.
            </p>

            <div className="bg-primary-50 p-8 rounded-lg text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Find Your Perfect Court?</h3>
              <p className="text-lg text-gray-600 mb-6">
                Join thousands of players who trust Courts Finder for their sports facility needs.
              </p>
              <Link 
                href="/"
                className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                Start Searching Courts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}