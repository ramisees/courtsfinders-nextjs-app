'use client';

import { useState } from 'react';
import { Court } from '@/types/court';
import CourtImage from './CourtImage';
import CourtDetailsModal from './CourtDetailsModal';

interface AIRecommendationsProps {
  searchQuery: string;
  selectedSport: string;
  onRecommendationClick: (location: string, sport: string) => void;
  onSearchCourts: (query: string, sport: string) => void; // New prop for triggering court search
}

export default function AIRecommendations({ 
  searchQuery, 
  selectedSport, 
  onRecommendationClick,
  onSearchCourts
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string>('');
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [extractedLocations, setExtractedLocations] = useState<string[]>([]);
  const [searchingCourts, setSearchingCourts] = useState(false);
  const [showingCourts, setShowingCourts] = useState(false);
  
  // Modal state for court details
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle court click
  const handleCourtClick = (court: Court) => {
    setSelectedCourt(court);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourt(null);
  };

  const generateRecommendations = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a location first');
      return;
    }

    const sportToUse = selectedSport || 'general sports';
    setLoading(true);
    setError(null);
    setShowRecommendations(true);
    setShowingCourts(false);

    try {
      // First, get AI recommendations to extract good search locations
      const aiResponse = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'recommendations',
          location: searchQuery,
          sport: sportToUse,
          preferences: 'family-friendly, good facilities, reasonable pricing'
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const aiData = await aiResponse.json();
      setRecommendations(aiData.content);
      
      // Extract locations from the AI response
      const locations = extractLocationsFromRecommendations(aiData.content);
      setExtractedLocations(locations);

      // Now automatically search for courts in the main location
      await searchCourtsInLocation(searchQuery, sportToUse);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Function to search for actual courts in a location
  const searchCourtsInLocation = async (location: string, sport: string) => {
    try {
      setSearchingCourts(true);
      
      // Build search URL like the main search does
      const params = new URLSearchParams();
      if (location.trim()) params.append('q', location.trim());
      if (sport && sport !== 'all' && sport !== 'general sports') params.append('sport', sport);
      
      const url = `/api/search${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('🤖 AI searching for courts:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const courtsData = await response.json();
      console.log('✅ AI found courts:', courtsData.length);
      setCourts(Array.isArray(courtsData) ? courtsData : []);
      setShowingCourts(true);
      
    } catch (err) {
      console.error('❌ AI court search error:', err);
      setError('Failed to find courts. Please try the main search.');
    } finally {
      setSearchingCourts(false);
    }
  };

  // Function to extract location names from AI recommendations
  const extractLocationsFromRecommendations = (text: string): string[] => {
    const locations: string[] = [];
    const lines = text.split('\n');
    
    // Look for numbered lists that typically contain area names
    lines.forEach(line => {
      // Pattern 1: "1. **South Charlotte:**" or "1. South Charlotte:"
      if (line.match(/^\d+\.\s*\*\*(.+?)\*\*:?/)) {
        const match = line.match(/^\d+\.\s*\*\*(.+?)\*\*:?/);
        if (match && match[1]) {
          locations.push(match[1].trim());
        }
      }
      // Pattern 2: "1. South Charlotte:" (without bold)
      else if (line.match(/^\d+\.\s*([^:]+):/)) {
        const match = line.match(/^\d+\.\s*([^:]+):/);
        if (match && match[1] && !match[1].includes('Top') && !match[1].includes('Key')) {
          locations.push(match[1].trim());
        }
      }
      // Pattern 3: Look for area/district mentions
      else if (line.match(/\*\*(.+?)\*\*.*(?:area|district|neighborhood|community)/i)) {
        const match = line.match(/\*\*(.+?)\*\*/);
        if (match && match[1]) {
          locations.push(match[1].trim());
        }
      }
    });
    
    // Clean up locations and remove duplicates
    const cleanedLocations = locations
      .filter(loc => loc.length > 3 && loc.length < 50) // Reasonable length
      .filter(loc => !loc.match(/^(Top|Key|Best|Typical|Note)/i)) // Remove instruction text
      .map(loc => loc.replace(/[:\-]/g, '').trim()) // Clean punctuation
      .filter((loc, index, arr) => arr.indexOf(loc) === index); // Remove duplicates
    
    return cleanedLocations.slice(0, 3); // Limit to top 3 locations
  };

  // Function to search for courts in a specific area
  const searchCourtsInArea = async (location: string) => {
    const fullQuery = location ? `${location}, ${searchQuery}` : searchQuery;
    const sportToUse = selectedSport || 'courts';
    
    await searchCourtsInLocation(fullQuery, sportToUse);
  };

  const formatRecommendations = (text: string) => {
    // Split by lines and format as HTML
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        // Bold headers
        return (
          <h4 key={index} className="font-bold text-gray-900 mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </h4>
        );
      } else if (line.startsWith('* ')) {
        // Bullet points
        return (
          <li key={index} className="ml-4 text-gray-700 mb-1">
            {line.substring(2)}
          </li>
        );
      } else if (line.match(/^\d+\./)) {
        // Numbered lists
        return (
          <li key={index} className="ml-4 text-gray-700 mb-2 font-medium">
            {line}
          </li>
        );
      } else if (line.startsWith('#')) {
        // Headers
        return (
          <h3 key={index} className="font-bold text-xl text-gray-900 mt-6 mb-3">
            {line.replace(/^#+\s*/, '')}
          </h3>
        );
      } else {
        // Regular paragraphs
        return (
          <p key={index} className="text-gray-700 mb-3">
            {line}
          </p>
        );
      }
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="text-yellow-400 text-2xl mr-3">🤖</div>
          <h3 className="text-xl font-bold text-white">AI Court Recommendations</h3>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={loading || !searchQuery.trim()}
          className="px-6 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              Generating...
            </div>
          ) : (
            'Get AI Recommendations'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {showRecommendations && (
        <div className="bg-white rounded-lg p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <span className="ml-3 text-gray-600">Finding the best courts with AI recommendations...</span>
            </div>
          ) : showingCourts && courts.length > 0 ? (
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  🤖 AI-Recommended Courts in {searchQuery}
                </h4>
                <p className="text-sm text-gray-600">
                  Found {courts.length} courts based on AI analysis {selectedSport && `for ${selectedSport}`}
                </p>
              </div>
              
              {/* Court Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
                {courts.map((court, index) => (
                  <div
                    key={court.id || index}
                    onClick={() => handleCourtClick(court)}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-200"
                  >
                    <div className="relative h-48">
                      <CourtImage
                        src={court.image}
                        alt={court.name}
                        sport={court.sport}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Rating badge */}
                      {court.rating && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                          <span className="text-yellow-400 text-sm">⭐</span>
                          <span className="text-sm font-medium text-gray-900">{court.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {court.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {court.address}
                      </p>
                      
                      {/* Sport tag */}
                      {court.sport && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                            {court.sport}
                          </span>
                          {court.tags && court.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                            <span 
                              key={tagIndex}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Amenities */}
                      {court.amenities && court.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {court.amenities.slice(0, 2).map((amenity, amenityIndex) => (
                            <span 
                              key={amenityIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <button className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Additional search options */}
              {extractedLocations.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">🔍 Search in Other Recommended Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedLocations.map((location, index) => (
                      <button
                        key={index}
                        onClick={() => searchCourtsInArea(location)}
                        disabled={searchingCourts}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {searchingCourts ? '⏳' : '📍'} {location}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : courts.length === 0 && showingCourts ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏸</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courts found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search location or sport type.
              </p>
              {extractedLocations.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-3">Try searching in these AI-recommended areas:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {extractedLocations.map((location, index) => (
                      <button
                        key={index}
                        onClick={() => searchCourtsInArea(location)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Search {location}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Court Details Modal */}
      {selectedCourt && (
        <CourtDetailsModal
          court={selectedCourt}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userLocation={undefined}
        />
      )}

      {!showRecommendations && (
        <div className="text-white/80 text-sm">
          {!searchQuery.trim() ? (
            <p>
              <span className="text-yellow-400">💡</span> Enter a location above, then click "Get AI Recommendations" for personalized court suggestions powered by Google Gemini AI.
            </p>
          ) : !selectedSport ? (
            <p>
              <span className="text-green-400">✓</span> Location set! You can get AI recommendations now, or select a specific sport for more targeted suggestions.
            </p>
          ) : (
            <p>
              <span className="text-green-400">✓</span> Ready! Location and sport selected. Click "Get AI Recommendations" for personalized suggestions.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
