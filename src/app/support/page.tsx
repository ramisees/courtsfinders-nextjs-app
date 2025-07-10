import Link from 'next/link'

export default function SupportPage() {
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
          <h1 className="text-5xl font-bold mb-6">Support Center</h1>
          <p className="text-xl text-primary-100">
            Find answers to common questions and get help with your account.
          </p>
        </div>
      </section>

      {/* Support Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link href="/contact" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
              <p className="text-gray-600">Get personalized help from our team</p>
            </Link>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">User Guide</h3>
              <p className="text-gray-600">Learn how to use Courts Finder effectively</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="text-lg font-semibold mb-2">Report Issue</h3>
              <p className="text-gray-600">Let us know about technical problems</p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I book a court?</h3>
                <p className="text-gray-600">
                  Simply search for courts in your area, select your preferred court, choose an available time slot, 
                  and complete the booking process. You'll receive a confirmation email with all the details.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel or modify my booking?</h3>
                <p className="text-gray-600">
                  Yes, you can cancel or modify your booking up to 24 hours before your scheduled time. 
                  Go to your account dashboard to manage your bookings.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">
                  We accept all major credit cards (Visa, MasterCard, American Express), PayPal, 
                  and digital wallets like Apple Pay and Google Pay.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I add my court to the platform?</h3>
                <p className="text-gray-600">
                  Court owners can list their facilities by contacting our partnership team. 
                  We'll help you set up your listing and manage bookings through our platform.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a mobile app?</h3>
                <p className="text-gray-600">
                  Our website is fully mobile-optimized and works great on all devices. 
                  A dedicated mobile app is coming soon!
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What if the court is not available when I arrive?</h3>
                <p className="text-gray-600">
                  If you encounter any issues with your booking, contact our support team immediately. 
                  We'll help resolve the situation and may offer a refund or alternative booking.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I create an account?</h3>
                <p className="text-gray-600">
                  Click the "Sign Up" button in the top navigation. You can sign up with your email address 
                  or use social login options like Google or Facebook.
                </p>
              </div>
            </div>
          </div>

          {/* Still Need Help */}
          <div className="mt-12 bg-primary-50 p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h3>
            <p className="text-lg text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/contact"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                Contact Support
              </Link>
              <Link 
                href="mailto:support@courtsfinder.com"
                className="px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
              >
                Email Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}