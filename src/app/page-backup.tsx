'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import SearchResults from '@/components/SearchResults';
import FindNearMe from '@/components/FindNearMe';
import Image from 'next/image';
import { searchCourts } from '@/lib/api';
import { Court } from '@/types/court';
import { UserLocation } from '@/lib/geolocation';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLocationSearch, setIsLocationSearch] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [searchRadius, setSearchRadius] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    setIsLocationSearch(false);
  };

  const handleLocationSearch = (courts: Court[], location: UserLocation, radius: number) => {
    setUserLocation(location);
    setSearchRadius(radius);
    setIsLocationSearch(true);
    setHasSearched(true);
    setSearchQuery(''); // Clear text search when using location
  };

  const handleLocationError = (errorMessage: string) => {
    console.error('Location search error:', errorMessage);
  };

  const sports = ['all', 'tennis', 'basketball', 'volleyball', 'pickleball', 'badminton'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Mountain Silhouette */}
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-0 right-0 h-2/3">
            <svg viewBox="0 0 1200 600" className="w-full h-full" preserveAspectRatio="xMidYEnd slice">
              <path 
                d="M0,600 L0,400 L200,200 L400,300 L600,150 L800,250 L1000,100 L1200,200 L1200,600 Z" 
                fill="rgba(0,0,0,0.3)"
              />
              <path 
                d="M0,600 L0,450 L150,300 L350,350 L550,200 L750,300 L950,150 L1200,250 L1200,600 Z" 
                fill="rgba(0,0,0,0.2)"
              />
            </svg>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/images/logo.png"
                alt="Courts Finder"
                width={300}
                height={225}
                className="h-32 w-auto"
              />
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Find Your Perfect
              <span className="block text-primary-400 mt-2">Sports Court</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover and book premium sports courts worldwide. From tennis to basketball, 
              find the perfect venue for your next game.
            </p>

            {/* Search Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Location</label>
                  <input
                    type="text"
                    placeholder="Enter city, address, or zip"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Sport</label>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  >
                    {sports.map(sport => (
                      <option key={sport} value={sport} className="bg-dark-800 text-white">
                        {sport === 'all' ? 'All Sports' : sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Action</label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSearch}
                      disabled={!searchQuery.trim()}
                      className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                    >
                      Search Courts
                    </button>
                    <FindNearMe 
                      onLocationSearch={handleLocationSearch}
                      onError={handleLocationError}
                      selectedSport={selectedSport}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Sport Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                {['tennis', 'basketball', 'volleyball', 'pickleball'].map(sport => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      selectedSport === sport
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/20 text-gray-300 hover:bg-white/30'
                    }`}
                  >
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Find Nearby Courts</h3>
                <p className="text-gray-400">Discover courts in your area with real-time availability and directions</p>
              </div>

              <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Easy Booking</h3>
                <p className="text-gray-400">Book your court time instantly with our streamlined reservation system</p>
              </div>

              <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Premium Quality</h3>
                <p className="text-gray-400">Access verified, high-quality courts with detailed reviews and ratings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center text-gray-400">
            <span className="text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      {hasSearched && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Search Results</h2>
            <SearchResults 
              searchQuery={isLocationSearch ? '' : searchQuery} 
              selectedSport={selectedSport} 
            />
          </div>
        </section>
      )}

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
  );
}
