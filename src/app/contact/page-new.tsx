import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Contact <span className="text-primary-400">Us</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Get in touch with our team. We&apos;re here to help!
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  >
                    <option value="" className="bg-dark-800 text-white">Select a subject</option>
                    <option value="general" className="bg-dark-800 text-white">General Inquiry</option>
                    <option value="booking" className="bg-dark-800 text-white">Booking Support</option>
                    <option value="court-owner" className="bg-dark-800 text-white">List My Court</option>
                    <option value="technical" className="bg-dark-800 text-white">Technical Issue</option>
                    <option value="partnership" className="bg-dark-800 text-white">Partnership</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary-500 text-dark-900 rounded-lg hover:bg-primary-400 transition-colors font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">Get in Touch</h2>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary-400 text-xl">📧</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Email</h3>
                    <p className="text-gray-300">support@courtsfinder.com</p>
                    <p className="text-sm text-gray-400">We respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary-400 text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Phone</h3>
                    <p className="text-gray-300">(555) 123-COURT</p>
                    <p className="text-sm text-gray-400">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary-400 text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Office</h3>
                    <p className="text-gray-300">123 Sports Avenue<br />Athletic City, AC 12345</p>
                    <p className="text-sm text-gray-400">By appointment only</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary-400 text-xl">💬</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Live Chat</h3>
                    <p className="text-gray-300">Available on our website</p>
                    <p className="text-sm text-gray-400">Mon-Fri 9AM-9PM EST</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-primary-500/20 backdrop-blur-md rounded-xl border border-primary-400/30">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/support" className="text-primary-400 hover:text-primary-300 transition-colors">
                      Support Center & FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/court-owners" className="text-primary-400 hover:text-primary-300 transition-colors">
                      List Your Court
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-primary-400 hover:text-primary-300 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
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
                Find and book the perfect sports court for your next game. 
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
