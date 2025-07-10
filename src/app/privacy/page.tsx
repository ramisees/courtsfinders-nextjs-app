import Link from 'next/link'

export default function PrivacyPage() {
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
          <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-primary-100">
            How we protect and use your information
          </p>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-500 mb-8">Last updated: January 2025</p>

              <h2>Introduction</h2>
              <p>
                Courts Finder (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our platform.
              </p>

              <h2>Information We Collect</h2>
              <h3>Personal Information</h3>
              <ul>
                <li>Name and contact information (email, phone number)</li>
                <li>Account credentials (username, password)</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Booking history and preferences</li>
              </ul>

              <h3>Usage Information</h3>
              <ul>
                <li>How you interact with our platform</li>
                <li>Search queries and booking patterns</li>
                <li>Device information and IP address</li>
                <li>Location data (with your permission)</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>Provide and improve our services</li>
                <li>Process bookings and payments</li>
                <li>Send important notifications about your bookings</li>
                <li>Customize your experience on our platform</li>
                <li>Analyze usage patterns to improve our services</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2>Information Sharing</h2>
              <p>We do not sell your personal information. We may share your information with:</p>
              <ul>
                <li><strong>Court owners:</strong> Necessary booking details to facilitate your reservation</li>
                <li><strong>Service providers:</strong> Third-party services that help us operate our platform</li>
                <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
              </ul>

              <h2>Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. This includes:
              </p>
              <ul>
                <li>Encryption of sensitive data</li>
                <li>Secure payment processing</li>
                <li>Regular security audits</li>
                <li>Limited access to personal information</li>
              </ul>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and personal data</li>
                <li>Object to certain uses of your information</li>
                <li>Export your data in a portable format</li>
              </ul>

              <h2>Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. 
                You can control cookie settings through your browser preferences.
              </p>

              <h2>Children's Privacy</h2>
              <p>
                Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. 
                If you believe we have collected such information, please contact us immediately.
              </p>

              <h2>Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any significant changes by posting 
                the new policy on our platform and updating the &quot;last updated&quot; date.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have questions about this privacy policy or our data practices, please contact us:
              </p>
              <ul>
                <li>Email: privacy@courtsfinder.com</li>
                <li>Phone: (555) 123-COURT</li>
                <li>Mail: 123 Sports Avenue, Athletic City, AC 12345</li>
              </ul>

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <div className="flex flex-wrap gap-4">
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700 transition-colors">
                    Terms of Service
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