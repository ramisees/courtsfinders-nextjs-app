import Link from 'next/link'

export default function BasketballCourtsPage() {
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
              <Link href="/about" className="text-gray-600 hover:text-primary-600 transition-colors">
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
          <h1 className="text-5xl font-bold mb-6">🏀 Basketball Courts</h1>
          <p className="text-xl text-primary-100">
            Find basketball courts for pickup games and tournaments
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-lg text-gray-600">
              Discover basketball courts for every style of play, from casual pickup games to competitive leagues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Outdoor Courts</h3>
              <p className="text-gray-600 mb-4">
                Street-style courts perfect for pickup games and casual play.
              </p>
              <Link href="/?sport=basketball" className="text-primary-600 hover:text-primary-700 font-semibold">
                Find Outdoor Courts →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Indoor Gyms</h3>
              <p className="text-gray-600 mb-4">
                Professional indoor facilities with climate control and amenities.
              </p>
              <Link href="/?sport=basketball" className="text-primary-600 hover:text-primary-700 font-semibold">
                Find Indoor Courts →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">League Courts</h3>
              <p className="text-gray-600 mb-4">
                Regulation courts suitable for competitive play and tournaments.
              </p>
              <Link href="/?sport=basketball" className="text-primary-600 hover:text-primary-700 font-semibold">
                Find League Courts →
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/?sport=basketball"
              className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Browse All Basketball Courts
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}