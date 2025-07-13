import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Terms of <span className="text-primary-400">Service</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Terms and conditions for using Courts Finder
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
            <div className="prose prose-lg max-w-none text-gray-300">
              <p className="text-sm text-gray-400 mb-8">Last updated: January 2025</p>

              <h2 className="text-white font-bold text-xl mb-4">Agreement to Terms</h2>
              <p className="mb-6">
                By accessing and using Courts Finder, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">Use License</h2>
              <p className="mb-4">Permission is granted to temporarily use Courts Finder for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to decompile or reverse engineer any software on Courts Finder</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>

              <h2 className="text-white font-bold text-xl mb-4">User Accounts</h2>
              <h3 className="text-primary-400 font-semibold text-lg mb-3">Account Creation</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You must be at least 18 years old to create an account</li>
              </ul>

              <h3 className="text-primary-400 font-semibold text-lg mb-3">Account Responsibilities</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must not share your account with others</li>
                <li>You must keep your contact information up to date</li>
              </ul>

              <h2 className="text-white font-bold text-xl mb-4">Booking and Payments</h2>
              <h3 className="text-primary-400 font-semibold text-lg mb-3">Reservations</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>All bookings are subject to availability and confirmation</li>
                <li>Court owners have the right to accept or decline booking requests</li>
                <li>You must arrive on time for your booking</li>
                <li>Late arrivals may result in shortened playing time or cancellation</li>
              </ul>

              <h3 className="text-primary-400 font-semibold text-lg mb-3">Payment Terms</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Payment is required at the time of booking</li>
                <li>All prices are displayed in USD unless otherwise specified</li>
                <li>We use third-party payment processors for secure transactions</li>
                <li>Additional fees may apply (processing, taxes, etc.)</li>
              </ul>

              <h3 className="text-primary-400 font-semibold text-lg mb-3">Cancellation Policy</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>You may cancel bookings up to 24 hours before the scheduled time</li>
                <li>Cancellations made within 24 hours may incur fees</li>
                <li>No-shows will be charged the full booking amount</li>
                <li>Refunds are processed according to our refund policy</li>
              </ul>

              <h2 className="text-white font-bold text-xl mb-4">User Conduct</h2>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Transmit viruses or malicious code</li>
                <li>Harass, abuse, or harm other users or court owners</li>
                <li>Interfere with the security features of the platform</li>
                <li>Use automated scripts or bots</li>
                <li>Post false or misleading information</li>
              </ul>

              <h2 className="text-white font-bold text-xl mb-4">Court Owner Responsibilities</h2>
              <p className="mb-4">Court owners who list facilities on our platform agree to:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Provide accurate information about their facilities</li>
                <li>Maintain their courts in safe, playable condition</li>
                <li>Honor confirmed bookings</li>
                <li>Provide reasonable customer service to users</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>

              <h2 className="text-white font-bold text-xl mb-4">Intellectual Property</h2>
              <p className="mb-6">
                All content on Courts Finder, including logos, text, graphics, and software, is the property of Courts Finder 
                or our licensors and is protected by copyright and other intellectual property laws.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">Disclaimers</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Courts Finder is provided &quot;as is&quot; without warranties of any kind</li>
                <li>We do not guarantee the availability or condition of any court</li>
                <li>We are not responsible for disputes between users and court owners</li>
                <li>Use of sports facilities is at your own risk</li>
              </ul>

              <h2 className="text-white font-bold text-xl mb-4">Limitation of Liability</h2>
              <p className="mb-6">
                Courts Finder shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">Indemnification</h2>
              <p className="mb-6">
                You agree to defend, indemnify, and hold harmless Courts Finder from and against any loss, damage, liability, 
                claim, or demand arising out of your use of the service.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">Termination</h2>
              <p className="mb-6">
                We may terminate or suspend your account and access to the service immediately, without prior notice or liability, 
                for any reason whatsoever, including breach of these terms.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">Changes to Terms</h2>
              <p className="mb-6">
                We reserve the right to modify these terms at any time. We will notify users of any significant changes. 
                Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">Governing Law</h2>
              <p className="mb-6">
                These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
                Courts Finder operates, without regard to its conflict of law provisions.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Email: legal@courtsfinder.com</li>
                <li>Phone: (555) 123-COURT</li>
                <li>Mail: 123 Sports Avenue, Athletic City, AC 12345</li>
              </ul>

              <div className="mt-8 p-6 bg-primary-500/20 backdrop-blur-md rounded-lg border border-primary-400/30">
                <h3 className="text-lg font-semibold text-white mb-4">Related Documents</h3>
                <div className="flex flex-wrap gap-4">
                  <Link href="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/contact" className="text-primary-400 hover:text-primary-300 transition-colors">
                    Contact Us
                  </Link>
                  <Link href="/support" className="text-primary-400 hover:text-primary-300 transition-colors">
                    Support Center
                  </Link>
                </div>
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
