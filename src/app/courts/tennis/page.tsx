import Link from 'next/link'

export default function TennisCourtsPage() {
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
          <h1 className="text-5xl font-bold mb-6">🎾 Tennis Courts</h1>
          <p className="text-xl text-primary-100">
            Find the perfect tennis court for your game
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-lg text-gray-600">
              Discover tennis courts with various surfaces, lighting, and amenities to match your playing style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Hard Courts</h3>
              <p className="text-gray-600 mb-4">
                Durable and consistent playing surface, perfect for all skill levels.
              </p>
              <Link href="/?sport=tennis" className="text-primary-600 hover:text-primary-700 font-semibold">
                Find Hard Courts →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Clay Courts</h3>
              <p className="text-gray-600 mb-4">
                Traditional European-style courts for a classic tennis experience.
              </p>
              <Link href="/?sport=tennis" className="text-primary-600 hover:text-primary-700 font-semibold">
                Find Clay Courts →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Indoor Courts</h3>
              <p className="text-gray-600 mb-4">
                Climate-controlled facilities available year-round.
              </p>
              <Link href="/?sport=tennis" className="text-primary-600 hover:text-primary-700 font-semibold">
                Find Indoor Courts →
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/?sport=tennis"
              className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Browse All Tennis Courts
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}