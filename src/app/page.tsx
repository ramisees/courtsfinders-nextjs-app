'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SearchResults from '@/components/SearchResults';
import FindNearMe from '@/components/FindNearMe';
import AIRecommendations from '@/components/AIRecommendations';
import dynamic from 'next/dynamic';
import { Court } from '@/types/court';
import { UserLocation } from '@/lib/geolocation';

// Dynamic import for ProductChatbot to avoid SSR issues
const ProductChatbot = dynamic(() => import('@/components/ProductChatbot'), { 
  ssr: false,
  loading: () => <div></div>
});

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLocationSearch, setIsLocationSearch] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [searchRadius, setSearchRadius] = useState<number | null>(null);
  const [locationSearchCourts, setLocationSearchCourts] = useState<Court[] | undefined>(undefined);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    setIsLocationSearch(false);
    setLocationSearchCourts(undefined); // Clear location search results
  };

  const handleLocationSearch = (courts: Court[], location: UserLocation, radius: number) => {
    setLocationSearchCourts(courts); // Store the filtered courts
    setUserLocation(location);
    setSearchRadius(radius);
    setIsLocationSearch(true);
    setHasSearched(true);
    setSearchQuery(''); // Clear text search when using location
  };

  const handleLocationError = (errorMessage: string) => {
    console.error('Location search error:', errorMessage);
    alert(errorMessage);
  };

  const handleRecommendationClick = (location: string, sport: string) => {
    setSearchQuery(location);
    setSelectedSport(sport);
    setHasSearched(true);
    setIsLocationSearch(false);
    setLocationSearchCourts(undefined);
  };

  const handleAISearchCourts = (query: string, sport: string) => {
    setSearchQuery(query);
    setSelectedSport(sport);
    setHasSearched(true);
    setIsLocationSearch(false);
    setLocationSearchCourts(undefined);
    
    // Scroll to search results
    setTimeout(() => {
      const resultsSection = document.getElementById('search-results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 md:py-4">
            <div className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="Courts Finder"
                width={300}
                height={240}
                className="h-24 md:h-48 w-auto"
                style={{ height: 'auto', width: 'auto' }}
              />
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-white hover:text-yellow-400 transition-colors font-medium">
                Home
              </Link>
              <Link href="/courts" className="text-white hover:text-yellow-400 transition-colors font-medium">
                Find Courts
              </Link>
              <Link href="/about" className="text-white hover:text-yellow-400 transition-colors font-medium">
                How It Works
              </Link>
              <Link href="/login" className="text-white hover:text-yellow-400 transition-colors font-medium">
                Sign In
              </Link>
            </nav>
            <div className="md:hidden">
              <button className="text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-black text-white py-8 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            Find Your Perfect Court
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 max-w-3xl mx-auto px-2">
            Find tennis, basketball, pickleball, volleyball, racquetball, and multi-sport facilities with AI-powered recommendations
          </p>
          
          {/* Search Box */}
          <div id="search" className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-lg max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:gap-4 mb-4">
              <input
                type="text"
                placeholder="Enter city, zip code, or address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 md:px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm md:text-base"
                required
              />
              <select 
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="px-3 md:px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm md:text-base"
              >
                <option value="">All Sports</option>
                <option value="tennis">Tennis</option>
                <option value="basketball">Basketball</option>
                <option value="pickleball">Pickleball</option>
                <option value="volleyball">Volleyball</option>
                <option value="racquetball">Racquetball</option>
                <option value="multi">Multi-Sport</option>
              </select>
              <button
                type="submit"
                className="px-6 md:px-8 py-3 bg-yellow-400 text-black rounded hover:bg-yellow-300 transition-colors font-bold text-sm md:text-base whitespace-nowrap"
              >
                Find Courts
              </button>
            </form>
            
            {/* Find Near Me Section */}
            <div className="border-t border-white/20 pt-3 md:pt-4">
              <FindNearMe
                onLocationSearch={handleLocationSearch}
                onError={handleLocationError}
                selectedSport={selectedSport}
                className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4"
              />
            </div>

            {/* AI Recommendations Section */}
            <AIRecommendations
              searchQuery={searchQuery}
              selectedSport={selectedSport}
              onRecommendationClick={handleRecommendationClick}
              onSearchCourts={handleAISearchCourts}
            />
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      {hasSearched && (
        <section id="search-results" className="py-6 md:py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            {isLocationSearch && userLocation ? (
              <div className="mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Courts near your location
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Found within {searchRadius} miles of your current location
                </p>
              </div>
            ) : (
              <div className="mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Search Results for &quot;{searchQuery}&quot;
                </h2>
                {selectedSport && (
                  <p className="text-sm md:text-base text-gray-600">
                    Filtered by: {selectedSport}
                  </p>
                )}
              </div>
            )}
            
            <SearchResults 
              searchQuery={isLocationSearch ? '' : searchQuery}
              selectedSport={selectedSport}
              preFilteredCourts={isLocationSearch ? locationSearchCourts : undefined}
              userLocation={userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : null}
              searchRadius={searchRadius}
            />
          </div>
        </section>
      )}

      {/* Sports Categories */}
      <section className={`py-10 md:py-20 ${hasSearched ? 'bg-white' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            Explore Sports Facilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white rounded-lg p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-yellow-400 text-4xl md:text-6xl mb-4 md:mb-6">
                🎾
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Tennis Courts</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                Find tennis courts with various surfaces, lighting options, and amenities.
              </p>
              <Link href="/courts/tennis" className="inline-block bg-yellow-400 text-black px-4 md:px-6 py-2 md:py-3 rounded hover:bg-yellow-300 transition-colors font-bold text-sm md:text-base">
                Explore
              </Link>
            </div>
            
            <div className="bg-white rounded-lg p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-yellow-400 text-4xl md:text-6xl mb-4 md:mb-6">
                🏀
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Basketball Courts</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                Discover indoor and outdoor basketball courts for casual or competitive play.
              </p>
              <Link href="/courts/basketball" className="inline-block bg-yellow-400 text-black px-4 md:px-6 py-2 md:py-3 rounded hover:bg-yellow-300 transition-colors font-bold text-sm md:text-base">
                Explore
              </Link>
            </div>
            
            <div className="bg-white rounded-lg p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-yellow-400 text-4xl md:text-6xl mb-4 md:mb-6">
                🏃
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Multi-Sport Facilities</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                Access comprehensive sports complexes with equipment rental and coaching.
              </p>
              <Link href="/courts/multi-sport" className="inline-block bg-yellow-400 text-black px-4 md:px-6 py-2 md:py-3 rounded hover:bg-yellow-300 transition-colors font-bold text-sm md:text-base">
                Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-10 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            How Courts Finder Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="bg-yellow-400 text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg md:text-2xl font-bold mx-auto mb-4 md:mb-6">
                1
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-4">Search</h3>
              <p className="text-sm md:text-base text-gray-600">Enter your location to find courts near you</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-400 text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg md:text-2xl font-bold mx-auto mb-4 md:mb-6">
                2
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-4">Compare</h3>
              <p className="text-sm md:text-base text-gray-600">Browse facilities, check availability and prices</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-400 text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg md:text-2xl font-bold mx-auto mb-4 md:mb-6">
                3
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-4">Book</h3>
              <p className="text-sm md:text-base text-gray-600">Find and secure your court time</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-400 text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg md:text-2xl font-bold mx-auto mb-4 md:mb-6">
                4
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-4">Play</h3>
              <p className="text-sm md:text-base text-gray-600">Enjoy your game at your chosen facility</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-10 md:py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-8 md:mb-12">What Our Users Say</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8">
            <p className="text-lg md:text-xl italic mb-4 md:mb-6">
              &quot;Courts Finder made it so easy to find a tennis court for my weekend games. No more calling around to check availability!&quot;
            </p>
            <div>
              <p className="font-bold">Sarah J.</p>
              <p className="text-yellow-400">Tennis Player</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
            <div>
              <Image
                src="/images/logo.png"
                alt="Courts Finder"
                width={300}
                height={240}
                className="h-24 md:h-48 w-auto mb-3 md:mb-4"
                style={{ height: 'auto', width: 'auto' }}
              />
              <p className="text-gray-400 text-sm md:text-base">Making sports accessible to everyone since 2024.</p>
            </div>
            
            <div>
              <h4 className="text-yellow-400 font-bold mb-3 md:mb-4 text-base md:text-lg">Quick Links</h4>
              <ul className="space-y-2 text-sm md:text-base">
                <li><Link href="/" className="text-gray-300 hover:text-yellow-400 transition-colors">Home</Link></li>
                <li><Link href="/courts" className="text-gray-300 hover:text-yellow-400 transition-colors">Find Courts</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-yellow-400 transition-colors">How It Works</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-yellow-400 transition-colors">About Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-yellow-400 font-bold mb-3 md:mb-4 text-base md:text-lg">Contact Us</h4>
              <p className="text-gray-300 mb-2 text-sm md:text-base">Email: info@courtsfinder.com</p>
              <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">Phone: (555) 123-4567</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-yellow-400 text-lg md:text-xl">📘</a>
                <a href="#" className="text-gray-300 hover:text-yellow-400 text-lg md:text-xl">🐦</a>
                <a href="#" className="text-gray-300 hover:text-yellow-400 text-lg md:text-xl">📷</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 md:pt-8 text-center">
            <p className="text-gray-400 text-sm md:text-base">&copy; 2024 Courts Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ProductChatbot - Sports Gear Assistant */}
      <ProductChatbot 
        currentCourtSearch={{
          searchQuery,
          selectedSport,
          location: userLocation,
          searchResults: locationSearchCourts
        }}
      />
    </div>
  );
}
