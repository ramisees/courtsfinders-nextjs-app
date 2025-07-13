import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Support <span className="text-primary-400">Center</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions and get help with your account.
          </p>
        </div>
      </section>

      {/* Support Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link href="/contact" className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-all group">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">Contact Support</h3>
              <p className="text-gray-300">Get personalized help from our team</p>
            </Link>
            
            <Link href="/login" className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-all group">
              <div className="text-3xl mb-4">�</div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">Account Help</h3>
              <p className="text-gray-300">Login issues, password reset, and account settings</p>
            </Link>
            
            <Link href="#booking" className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-all group">
              <div className="text-3xl mb-4">🏟️</div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">Booking Help</h3>
              <p className="text-gray-300">Court reservations, cancellations, and modifications</p>
            </Link>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20 mb-12">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="border-b border-white/20 pb-6">
                <h3 className="text-lg font-semibold text-white mb-2">How do I find a court?</h3>
                <p className="text-gray-300">
                  Search for courts in your area, select your preferred time slot, and contact the facility directly to arrange your play time. 
                  You&apos;ll receive all the contact information you need.
                </p>
              </div>
              
              <div className="border-b border-white/20 pb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Can I cancel or reschedule my court time?</h3>
                <p className="text-gray-300">
                  Cancellation and rescheduling policies vary by facility. Contact the court directly using the information provided 
                  to discuss their specific policies and make any changes to your reservation.
                </p>
              </div>
              
              <div className="border-b border-white/20 pb-6">
                <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-300">
                  We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. 
                  Payment is processed securely through our encrypted payment system.
                </p>
              </div>
              
              <div className="border-b border-white/20 pb-6">
                <h3 className="text-lg font-semibold text-white mb-2">How do I list my court on the platform?</h3>
                <p className="text-gray-300">
                  Court owners can list their facilities by contacting our team. We&apos;ll guide you through 
                  the process and help set up your court profile with photos, pricing, and availability.
                </p>
              </div>
              
              <div className="border-b border-white/20 pb-6">
                <h3 className="text-lg font-semibold text-white mb-2">What if I have issues accessing a court?</h3>
                <p className="text-gray-300">
                  Contact our support team immediately at support@courtsfinder.com or call (555) 123-COURT. 
                  We&apos;re available 24/7 to help resolve any issues.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Are there any membership benefits?</h3>
                <p className="text-gray-300">
                  Premium members enjoy discounted rates, priority access, no service fees, and exclusive 
                  access to select premium courts. Upgrade your account to unlock these benefits.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Still Need Help?</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-primary-400">📧</span>
                  <div>
                    <p className="text-white font-medium">Email Support</p>
                    <p className="text-gray-300 text-sm">support@courtsfinder.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-primary-400">📞</span>
                  <div>
                    <p className="text-white font-medium">Phone Support</p>
                    <p className="text-gray-300 text-sm">(555) 123-COURT</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-primary-400">💬</span>
                  <div>
                    <p className="text-white font-medium">Live Chat</p>
                    <p className="text-gray-300 text-sm">Available 9AM-9PM EST</p>
                  </div>
                </div>
              </div>
              
              <Link 
                href="/contact" 
                className="mt-6 w-full inline-block px-6 py-3 bg-primary-500 text-dark-900 rounded-lg hover:bg-primary-400 transition-colors font-semibold text-center"
              >
                Contact Support
              </Link>
            </div>

            <div className="bg-primary-500/20 backdrop-blur-md p-8 rounded-xl border border-primary-400/30">
              <h3 className="text-xl font-bold text-white mb-6">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-primary-400 hover:text-primary-300 transition-colors flex items-center">
                    <span className="mr-2">📖</span>
                    About Courts Finder
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-primary-400 hover:text-primary-300 transition-colors flex items-center">
                    <span className="mr-2">📄</span>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors flex items-center">
                    <span className="mr-2">🔒</span>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/court-owners" className="text-primary-400 hover:text-primary-300 transition-colors flex items-center">
                    <span className="mr-2">🏢</span>
                    List Your Court
                  </Link>
                </li>
              </ul>
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
                Find and access the perfect sports court for your next game. 
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