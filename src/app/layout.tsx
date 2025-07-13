import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientWrapper from '@/components/ClientWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Courts Finder - Find Tennis & Basketball Courts Near You',
  description: 'Discover and access tennis courts, basketball courts, and other sports facilities in your area. Find the perfect court for your game.',
  keywords: 'tennis courts, basketball courts, sports facilities, court booking, sports venues',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClientWrapper>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {children}
          </div>
        </ClientWrapper>
      </body>
    </html>
  )
}
