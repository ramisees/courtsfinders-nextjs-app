import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Privacy <span className="text-primary-400">Policy</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            How we protect and use your information
          </p>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
            <div className="prose prose-lg max-w-none text-gray-300">
              <p className="text-sm text-gray-400 mb-8">Last updated: January 2025</p>

              <h2 className="text-white font-bold text-xl mb-4">Introduction</h2>
              <p className="mb-6">
                Courts Finder (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our services.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">Information We Collect</h2>
              <h3 className="text-primary-400 font-semibold text-lg mb-3">Personal Information</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Name and contact information (email, phone number)</li>
                <li>Account credentials and profile information</li>
                <li>Payment information (processed securely by third-party payment processors)</li>
                <li>Location data (when you search for courts or use location-based features)</li>
                <li>Communication preferences and marketing choices</li>
              </ul>

              <h3 className="text-primary-400 font-semibold text-lg mb-3">Usage Information</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Court searches and access history</li>
                <li>Website interaction data and preferences</li>
                <li>Device information and browser details</li>
                <li>IP address and approximate location</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h2 className="text-white font-bold text-xl mb-4">How We Use Your Information</h2>
              <p className="mb-4">We use your personal information to:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Provide and improve our court access services</li>
                <li>Process reservations and facilitate payments</li>
                <li>Send reservation confirmations and important updates</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Personalize your experience and recommend relevant courts</li>
                <li>Comply with legal obligations and prevent fraud</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>

              <h2 className="text-white font-bold text-xl mb-4">Information Sharing</h2>
              <p className="mb-4">We may share your information with:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong className="text-white">Court Owners:</strong> Basic reservation details for confirmed access</li>
                <li><strong className="text-white">Payment Processors:</strong> Secure payment processing (we don&apos;t store full payment details)</li>
                <li><strong className="text-white">Service Providers:</strong> Third-party services that help us operate our platform</li>
                <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="mb-6">We never sell your personal information to third parties for marketing purposes.</p>

              <h2 className="text-white font-bold text-xl mb-4">Data Security</h2>
              <p className="mb-4">We implement appropriate security measures to protect your personal information:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>SSL encryption for data transmission</li>
                <li>Secure data storage and access controls</li>
                <li>Regular security audits and updates</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>

              <h2 className="text-white font-bold text-xl mb-4">Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Access and review your personal information</li>
                <li>Correct or update inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Restrict or object to certain data processing</li>
                <li>Data portability (receive your data in a structured format)</li>
              </ul>

              <h2 className="text-white font-bold text-xl mb-4">Cookies and Tracking</h2>
              <p className="mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Remember your preferences and login status</li>
                <li>Analyze website usage and improve our services</li>
                <li>Provide personalized content and recommendations</li>
                <li>Measure the effectiveness of our marketing campaigns</li>
              </ul>
              <p className="mb-6">You can control cookie settings through your browser preferences.</p>

              <h2 className="text-white font-bold text-xl mb-4">Data Retention</h2>
              <p className="mb-6">
                We retain your personal information only as long as necessary to provide our services, comply with legal obligations, 
                and resolve disputes. Account information is typically retained until you delete your account, after which we may 
                keep some information for legal compliance purposes.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">Third-Party Links</h2>
              <p className="mb-6">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content 
                of these external sites. We encourage you to review their privacy policies before providing any personal information.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">Children&apos;s Privacy</h2>
              <p className="mb-6">
                Our services are not intended for children under 18 years of age. We do not knowingly collect personal information 
                from children under 18. If we become aware that we have collected such information, we will take steps to delete it.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">Changes to This Policy</h2>
              <p className="mb-6">
                We may update this privacy policy from time to time. We will notify you of any significant changes by posting 
                the new policy on our website and updating the &quot;Last updated&quot; date. Your continued use of our services 
                after changes constitutes acceptance of the updated policy.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">International Data Transfers</h2>
              <p className="mb-6">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers 
                are conducted in accordance with applicable data protection laws and with appropriate safeguards in place.
              </p>

              <h2 className="text-white font-bold text-xl mb-4">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Email: privacy@courtsfinder.com</li>
                <li>Phone: (555) 123-COURT</li>
                <li>Mail: Privacy Officer, 123 Sports Avenue, Athletic City, AC 12345</li>
              </ul>

              <div className="mt-8 p-6 bg-primary-500/20 backdrop-blur-md rounded-lg border border-primary-400/30">
                <h3 className="text-lg font-semibold text-white mb-4">Related Documents</h3>
                <div className="flex flex-wrap gap-4">
                  <Link href="/terms" className="text-primary-400 hover:text-primary-300 transition-colors">
                    Terms of Service
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