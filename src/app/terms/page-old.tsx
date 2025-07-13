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

              <h2>Agreement to Terms</h2>
              <p>
                By accessing and using Courts Finder, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>

              <h2>Description of Service</h2>
              <p>
                Courts Finder is a platform that connects users with sports facilities for booking and reservation purposes. 
                We provide a marketplace where court owners can list their facilities and users can discover and book them.
              </p>

              <h2>User Accounts</h2>
              <h3>Account Creation</h3>
              <ul>
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You must be at least 18 years old to create an account</li>
              </ul>

              <h3>Account Responsibilities</h3>
              <ul>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must not share your account with others</li>
                <li>You must keep your contact information up to date</li>
              </ul>

              <h2>Booking and Payments</h2>
              <h3>Reservations</h3>
              <ul>
                <li>All bookings are subject to availability and confirmation</li>
                <li>Court owners have the right to accept or decline booking requests</li>
                <li>You must arrive on time for your booking</li>
                <li>Late arrivals may result in shortened playing time or cancellation</li>
              </ul>

              <h3>Payment Terms</h3>
              <ul>
                <li>Payment is required at the time of booking</li>
                <li>All prices are displayed in USD unless otherwise specified</li>
                <li>We use third-party payment processors for secure transactions</li>
                <li>Additional fees may apply (processing, taxes, etc.)</li>
              </ul>

              <h3>Cancellation Policy</h3>
              <ul>
                <li>You may cancel bookings up to 24 hours before the scheduled time</li>
                <li>Cancellations made within 24 hours may incur fees</li>
                <li>No-shows will be charged the full booking amount</li>
                <li>Refunds are processed according to our refund policy</li>
              </ul>

              <h2>User Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Transmit viruses or malicious code</li>
                <li>Harass, abuse, or harm other users or court owners</li>
                <li>Interfere with the security features of the platform</li>
                <li>Use automated scripts or bots</li>
                <li>Post false or misleading information</li>
              </ul>

              <h2>Court Owner Responsibilities</h2>
              <p>Court owners who list facilities on our platform agree to:</p>
              <ul>
                <li>Provide accurate information about their facilities</li>
                <li>Maintain their courts in safe, playable condition</li>
                <li>Honor confirmed bookings</li>
                <li>Provide reasonable customer service to users</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>

              <h2>Intellectual Property</h2>
              <p>
                All content on Courts Finder, including logos, text, graphics, and software, is the property of Courts Finder 
                or our licensors and is protected by copyright and other intellectual property laws.
              </p>

              <h2>Disclaimers</h2>
              <ul>
                <li>Courts Finder is provided &quot;as is&quot; without warranties of any kind</li>
                <li>We do not guarantee the availability or condition of any court</li>
                <li>We are not responsible for disputes between users and court owners</li>
                <li>Use of sports facilities is at your own risk</li>
              </ul>

              <h2>Limitation of Liability</h2>
              <p>
                Courts Finder shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>

              <h2>Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless Courts Finder from and against any loss, damage, liability, 
                claim, or demand arising out of your use of the service.
              </p>

              <h2>Termination</h2>
              <p>
                We may terminate or suspend your account and access to the service immediately, without prior notice or liability, 
                for any reason whatsoever, including breach of these terms.
              </p>

              <h2>Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any significant changes. 
                Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>

              <h2>Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
                Courts Finder operates, without regard to its conflict of law provisions.
              </p>

              <h2>Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul>
                <li>Email: legal@courtsfinder.com</li>
                <li>Phone: (555) 123-COURT</li>
                <li>Mail: 123 Sports Avenue, Athletic City, AC 12345</li>
              </ul>

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Related Documents</h3>
                <div className="flex flex-wrap gap-4">
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/contact" className="text-primary-600 hover:text-primary-700 transition-colors">
                    Contact Us
                  </Link>
                  <Link href="/support" className="text-primary-600 hover:text-primary-700 transition-colors">
                    Support Center
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}