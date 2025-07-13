import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About <span className="text-primary-400">Courts Finder</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your ultimate destination for discovering and finding premium sports courts worldwide
          </p>
        </div>
      </section>

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
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Mission</h2>
            <p className="text-lg text-gray-300 mb-12 text-center leading-relaxed">
              Courts Finder was created to solve a simple problem: finding quality sports facilities shouldn&apos;t be difficult. 
              Whether you&apos;re looking for a tennis court for your weekend game, a basketball court for pickup games, 
              or a multi-sport facility for your team, we make it easy to discover and find the perfect venue.
            </p>

            <h2 className="text-3xl font-bold text-white mb-8 text-center">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <h3 className="text-xl font-semibold mb-4 text-primary-400">🎾 Tennis Courts</h3>
                <p className="text-gray-300">
                  Find tennis courts with various surfaces, lighting options, and amenities. 
                  From public courts to private clubs.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <h3 className="text-xl font-semibold mb-4 text-primary-400">🏀 Basketball Courts</h3>
                <p className="text-gray-300">
                  Discover indoor and outdoor basketball courts, from casual pickup games 
                  to competitive league play.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <h3 className="text-xl font-semibold mb-4 text-primary-400">🏓 Multi-Sport Facilities</h3>
                <p className="text-gray-300">
                  Access comprehensive sports complexes offering multiple sports, 
                  equipment rental, and professional coaching.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <h3 className="text-xl font-semibold mb-4 text-primary-400">⚡ Quick Access</h3>
                <p className="text-gray-300">
                  Find courts instantly with real-time availability, 
                  detailed information, and easy contact options.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Story</h2>
            <p className="text-lg text-gray-300 mb-8 text-center leading-relaxed">
              Founded in 2024, Courts Finder started as a simple idea: sports should be accessible to everyone. 
              Our team of sports enthusiasts and technology experts came together to create a platform that 
              connects players with the best sports facilities in their area.
            </p>

            <p className="text-lg text-gray-300 mb-8 text-center leading-relaxed">
              Today, we&apos;re proud to serve thousands of players across the country, helping them find and play at 
              the perfect courts for their games. From casual players to serious athletes, Courts Finder is 
              your gateway to better sports experiences.
            </p>

            <div className="bg-primary-500/20 backdrop-blur-md p-8 rounded-xl border border-primary-400/30 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Find Your Perfect Court?</h3>
              <p className="text-lg text-gray-300 mb-6">
                Join thousands of players who trust Courts Finder for their sports facility needs.
              </p>
              <Link 
                href="/"
                className="inline-block px-8 py-3 bg-primary-500 text-dark-900 rounded-lg hover:bg-primary-400 transition-colors font-semibold"
              >
                Start Searching Courts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Image
                src="/images/logo.png"
                alt="Courts Finder"
                width={200}
                height={150}
                className="h-16 w-auto mb-4"
              />
              <p className="text-gray-400 max-w-md">
                Find and play at the perfect sports court for your next game. 
                From tennis to basketball, we connect you with premium venues worldwide.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-primary-400 transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-primary-400 transition-colors">Contact</a></li>
                <li><a href="/support" className="hover:text-primary-400 transition-colors">Support</a></li>
                <li><a href="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Sports</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/courts/tennis" className="hover:text-primary-400 transition-colors">Tennis Courts</a></li>
                <li><a href="/courts/basketball" className="hover:text-primary-400 transition-colors">Basketball Courts</a></li>
                <li><a href="/courts/multi-sport" className="hover:text-primary-400 transition-colors">Multi-Sport Courts</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Courts Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}