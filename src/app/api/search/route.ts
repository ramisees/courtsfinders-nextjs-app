import { NextRequest, NextResponse } from 'next/server'

// Import court data from the main courts route to ensure consistency
// This will be dynamically imported to avoid duplication issues

// Import Google Places functionality
import { searchCourtsWorldwide, isGooglePlacesConfigured, getEnhancedBusinessProfile } from '@/lib/google-places'

// Import Foursquare functionality
import { searchFoursquareCourtsWorldwide, isFoursquareConfigured } from '@/lib/foursquare'

// ======================
// SEARCH UTILITIES
// ======================

// Fuzzy string matching using Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// Calculate similarity score (0-1, where 1 is exact match)
function similarityScore(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

// Enhanced location matching for NC cities and regions
function getLocationVariants(location: string): string[] {
  const lower = location.toLowerCase().trim()
  const variants = [lower]
  
  // NC City mappings and common variations
  const cityMappings: { [key: string]: string[] } = {
    'raleigh': ['raleigh', 'ral', 'wake county', 'research triangle', 'triangle', 'rtp'],
    'durham': ['durham', 'dur', 'bull city', 'research triangle', 'triangle', 'rtp'],
    'charlotte': ['charlotte', 'char', 'queen city', 'clt', 'mecklenburg'],
    'greensboro': ['greensboro', 'gsbo', 'gso', 'triad', 'gate city', 'guilford'],
    'winston-salem': ['winston-salem', 'winston salem', 'ws', 'triad', 'twin city'],
    'asheville': ['asheville', 'avl', 'ashe', 'mountain', 'blue ridge', 'western nc'],
    'hickory': ['hickory', 'hky', 'foothills', 'catawba county'],
    'high point': ['high point', 'highpoint', 'hp', 'furniture city', 'triad'],
    'wilmington': ['wilmington', 'wilm', 'port city', 'cape fear', 'coastal'],
    'fayetteville': ['fayetteville', 'faye', 'fay', 'cumberland county'],
    'gastonia': ['gastonia', 'gas', 'gaston county'],
    'concord': ['concord', 'cabarrus county', 'charlotte metro'],
    'cary': ['cary', 'wake county', 'triangle'],
    'apex': ['apex', 'wake county', 'triangle'],
    'chapel hill': ['chapel hill', 'chape hill', 'unc', 'orange county', 'triangle'],
    'nc': ['north carolina', 'n.c.', 'tar heel state'],
    'north carolina': ['nc', 'n.c.', 'tar heel state']
  }
  
  // Find matching variations
  for (const [city, variations] of Object.entries(cityMappings)) {
    if (variations.some(variant => lower.includes(variant) || variant.includes(lower))) {
      variants.push(...variations)
      variants.push(city)
    }
  }
  
  // Add partial matches for compound words
  if (lower.includes('-')) {
    variants.push(...lower.split('-'))
  }
  if (lower.includes(' ')) {
    variants.push(...lower.split(' '))
  }
  
  return [...new Set(variants)] // Remove duplicates
}

// Check if a query is likely for North Carolina
function isNorthCarolinaQuery(query: string): boolean {
  const lower = query.toLowerCase().trim()
  const ncIndicators = [
    'nc', 'north carolina', 'n.c.', 'raleigh', 'charlotte', 'durham', 'greensboro', 
    'winston-salem', 'asheville', 'hickory', 'high point', 'wilmington', 'fayetteville',
    'gastonia', 'concord', 'cary', 'apex', 'chapel hill', 'triangle', 'triad',
    'wake county', 'mecklenburg', 'guilford', 'catawba', 'gaston', 'cabarrus'
  ]
  
  return ncIndicators.some(indicator => 
    lower.includes(indicator) || indicator.includes(lower)
  )
}

// Enhanced search scoring
interface SearchMatch {
  court: any
  score: number
  matchType: 'exact' | 'partial' | 'fuzzy' | 'location'
  matchedFields: string[]
}

function scoreCourtMatch(court: any, query: string, sport?: string): SearchMatch {
  const q = query.toLowerCase().trim()
  let totalScore = 0
  const matchedFields: string[] = []
  let matchType: 'exact' | 'partial' | 'fuzzy' | 'location' = 'fuzzy'
  
  if (!q) {
    return { court, score: sport && sport !== 'all' ? 0.5 : 1, matchType: 'exact', matchedFields: [] }
  }
  
  // Name matching (highest weight)
  const nameScore = scoreFuzzyMatch(court.name, q)
  if (nameScore > 0.3) {
    totalScore += nameScore * 3
    matchedFields.push('name')
    if (nameScore > 0.9) matchType = 'exact'
    else if (nameScore > 0.6) matchType = 'partial'
  }
  
  // Address and location matching
  const locationVariants = getLocationVariants(q)
  let locationScore = 0
  
  for (const variant of locationVariants) {
    const addressScore = scoreFuzzyMatch(court.address, variant)
    if (addressScore > locationScore) {
      locationScore = addressScore
    }
  }
  
  if (locationScore > 0.3) {
    totalScore += locationScore * 2
    matchedFields.push('location')
    if (matchType === 'fuzzy') matchType = 'location'
  }
  
  // Description matching (if available)
  if (court.description) {
    const descScore = scoreFuzzyMatch(court.description, q)
    if (descScore > 0.3) {
      totalScore += descScore * 1
      matchedFields.push('description')
    }
  }
  
  // Sport matching
  const sportScore = scoreFuzzyMatch(court.sport, q)
  if (sportScore > 0.5) {
    totalScore += sportScore * 1.5
    matchedFields.push('sport')
  }
  
  // Amenities matching
  if (court.amenities) {
    const amenitiesText = Array.isArray(court.amenities) 
      ? court.amenities.join(' ') 
      : court.amenities.toString()
    const amenitiesScore = scoreFuzzyMatch(amenitiesText, q)
    if (amenitiesScore > 0.3) {
      totalScore += amenitiesScore * 0.5
      matchedFields.push('amenities')
    }
  }
  
  return {
    court,
    score: Math.min(totalScore, 5), // Cap at 5 for normalization
    matchType,
    matchedFields
  }
}

function scoreFuzzyMatch(text: string, query: string): number {
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()
  
  // Exact match
  if (textLower === queryLower) return 1.0
  
  // Contains match
  if (textLower.includes(queryLower)) return 0.8
  
  // Word boundary match
  const words = textLower.split(/\s+/)
  for (const word of words) {
    if (word === queryLower) return 0.9
    if (word.includes(queryLower)) return 0.7
  }
  
  // Fuzzy similarity
  const similarity = similarityScore(textLower, queryLower)
  return similarity > 0.6 ? similarity * 0.6 : 0
}

// Get courts data (shared with /api/courts)
async function getCourtsData() {
  // Since we can't easily import from the other route file,
  // we'll inline the data here but keep it synchronized
  const courts = [
    // ======================
    // RALEIGH AREA COURTS
    // ======================
    
    // Tennis Courts - Raleigh
    {
      id: 1,
      name: "Millbrook Exchange Tennis Center",
      sport: "tennis",
      address: "1905 Spring Forest Rd, Raleigh, NC 27615",
      coordinates: { lat: 35.8321, lng: -78.6569 },
      rating: 4.7,
      pricePerHour: 35,
      amenities: ["indoor_courts", "pro_shop", "lessons", "parking", "restrooms", "air_conditioning"],
      surface: "hard",
      indoor: true,
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop",
      phone: "(919) 876-2870",
      website: "https://millbrookexchange.com",
      description: "Premier indoor tennis facility with 12 courts, professional instruction, and tournament hosting."
    },
    {
      id: 2,
      name: "Raleigh Racquet Club",
      sport: "tennis",
      address: "6420 Falls of Neuse Rd, Raleigh, NC 27615",
      coordinates: { lat: 35.8654, lng: -78.6234 },
      rating: 4.8,
      pricePerHour: 45,
      amenities: ["outdoor_courts", "indoor_courts", "pro_shop", "lessons", "swimming_pool", "restaurant"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop",
      phone: "(919) 847-7440",
      website: "https://raleighracquetclub.com",
      description: "Exclusive tennis club with both indoor and outdoor courts, swimming, and dining facilities."
    },
    {
      id: 3,
      name: "Optimist Park Tennis Courts",
      sport: "tennis",
      address: "5900 Whittier Dr, Raleigh, NC 27606",
      coordinates: { lat: 35.7456, lng: -78.7123 },
      rating: 4.3,
      pricePerHour: 15,
      amenities: ["outdoor_courts", "lighting", "parking", "restrooms"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(919) 996-6151",
      website: null,
      description: "Public tennis courts with excellent lighting for evening play and well-maintained surfaces."
    },

    // Basketball Courts - Raleigh
    {
      id: 4,
      name: "Millbrook Community Center",
      sport: "basketball",
      address: "1905 Spring Forest Rd, Raleigh, NC 27615",
      coordinates: { lat: 35.8321, lng: -78.6569 },
      rating: 4.5,
      pricePerHour: 20,
      amenities: ["indoor_courts", "air_conditioning", "parking", "restrooms", "lockers"],
      surface: "hardwood",
      indoor: true,
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop",
      phone: "(919) 996-4386",
      website: "https://raleighnc.gov/parks",
      description: "Modern community center with regulation basketball courts and fitness facilities."
    },
    {
      id: 5,
      name: "NC State Reynolds Coliseum",
      sport: "basketball",
      address: "2411 Dunn Ave, Raleigh, NC 27607",
      coordinates: { lat: 35.7823, lng: -78.6826 },
      rating: 4.9,
      pricePerHour: 50,
      amenities: ["professional_court", "seating", "parking", "restrooms", "pro_facilities"],
      surface: "hardwood",
      indoor: true,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      phone: "(919) 515-2106",
      website: "https://gopack.com",
      description: "Historic collegiate basketball venue, home to NC State Wolfpack. Limited public access."
    },
    {
      id: 6,
      name: "John Chavis Memorial Park Basketball",
      sport: "basketball",
      address: "505 Martin Luther King Jr Blvd, Raleigh, NC 27601",
      coordinates: { lat: 35.7734, lng: -78.6298 },
      rating: 4.2,
      pricePerHour: 10,
      amenities: ["outdoor_courts", "lighting", "parking", "restrooms", "playground"],
      surface: "asphalt",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(919) 996-6151",
      website: null,
      description: "Historic park with outdoor basketball courts and community recreation facilities."
    },

    // Recreation Centers - Raleigh
    {
      id: 7,
      name: "Buffaloe Road Aquatic Center",
      sport: "multi-sport",
      address: "6310 Buffaloe Rd, Raleigh, NC 27616",
      coordinates: { lat: 35.8756, lng: -78.5432 },
      rating: 4.6,
      pricePerHour: 25,
      amenities: ["indoor_courts", "swimming_pool", "fitness_center", "parking", "lockers"],
      surface: "multi-surface",
      indoor: true,
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=300&h=200&fit=crop",
      phone: "(919) 996-4070",
      website: "https://raleighnc.gov/parks",
      description: "State-of-the-art aquatic and recreation center with courts for basketball, volleyball, and more."
    },

    // ======================
    // DURHAM AREA COURTS
    // ======================

    // Tennis Courts - Durham
    {
      id: 8,
      name: "Duke University Tennis Center",
      sport: "tennis",
      address: "2B Towerview Rd, Durham, NC 27708",
      coordinates: { lat: 36.0012, lng: -78.9434 },
      rating: 4.9,
      pricePerHour: 40,
      amenities: ["indoor_courts", "outdoor_courts", "pro_shop", "lessons", "parking"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop",
      phone: "(919) 684-2120",
      website: "https://goduke.com",
      description: "NCAA Division I tennis facility with world-class courts and professional instruction."
    },
    {
      id: 9,
      name: "Forest Hills Park Tennis Courts",
      sport: "tennis",
      address: "1639 University Dr, Durham, NC 27707",
      coordinates: { lat: 35.9876, lng: -78.9234 },
      rating: 4.4,
      pricePerHour: 18,
      amenities: ["outdoor_courts", "lighting", "parking", "restrooms"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(919) 560-4355",
      website: "https://durhamnc.gov/parks",
      description: "Well-maintained public tennis courts in beautiful Forest Hills neighborhood."
    },
    {
      id: 10,
      name: "Lakewood Tennis Club",
      sport: "tennis",
      address: "2800 Pickett Rd, Durham, NC 27705",
      coordinates: { lat: 35.9654, lng: -78.8901 },
      rating: 4.7,
      pricePerHour: 35,
      amenities: ["outdoor_courts", "pro_shop", "lessons", "swimming_pool", "restaurant"],
      surface: "clay",
      indoor: false,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      phone: "(919) 403-7529",
      website: "https://lakewoodtennisclub.com",
      description: "Premier clay court tennis club with swimming and dining amenities."
    },

    // Basketball Courts - Durham
    {
      id: 11,
      name: "Cameron Indoor Stadium",
      sport: "basketball",
      address: "103 Whitford Dr, Durham, NC 27708",
      coordinates: { lat: 36.0014, lng: -78.9382 },
      rating: 5.0,
      pricePerHour: 100,
      amenities: ["professional_court", "historic_venue", "seating", "parking"],
      surface: "hardwood",
      indoor: true,
      image: "https://images.unsplash.com/photo-1566577134770-3d85bb3a4e7d?w=300&h=200&fit=crop",
      phone: "(919) 684-2120",
      website: "https://goduke.com",
      description: "Legendary Duke basketball arena, one of the most famous venues in college sports."
    },
    {
      id: 12,
      name: "Durham Central Park Basketball",
      sport: "basketball",
      address: "501 Foster St, Durham, NC 27701",
      coordinates: { lat: 35.9940, lng: -78.8986 },
      rating: 4.3,
      pricePerHour: 12,
      amenities: ["outdoor_courts", "lighting", "parking", "restrooms", "playground"],
      surface: "asphalt",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(919) 560-4355",
      website: "https://durhamnc.gov/parks",
      description: "Popular downtown basketball courts with great lighting and community atmosphere."
    },

    // Recreation Centers - Durham
    {
      id: 13,
      name: "Northgate Recreation Center",
      sport: "multi-sport",
      address: "3902 Carrington Dr, Durham, NC 27705",
      coordinates: { lat: 35.9823, lng: -78.8654 },
      rating: 4.5,
      pricePerHour: 22,
      amenities: ["indoor_courts", "fitness_center", "swimming_pool", "parking", "lockers"],
      surface: "multi-surface",
      indoor: true,
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=300&h=200&fit=crop",
      phone: "(919) 560-4264",
      website: "https://durhamnc.gov/parks",
      description: "Comprehensive recreation center with basketball, volleyball, and fitness facilities."
    },

    // ======================
    // CHARLOTTE AREA COURTS
    // ======================

    // Tennis Courts - Charlotte
    {
      id: 14,
      name: "Olde Providence Racquet Club",
      sport: "tennis",
      address: "5814 Bellow Ct, Charlotte, NC 28226",
      coordinates: { lat: 35.1456, lng: -80.8234 },
      rating: 4.8,
      pricePerHour: 50,
      amenities: ["indoor_courts", "outdoor_courts", "pro_shop", "lessons", "swimming_pool"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop",
      phone: "(704) 543-5248",
      website: "https://oprclub.com",
      description: "Prestigious tennis club with 12 courts and comprehensive amenities."
    },
    {
      id: 15,
      name: "Hornets Nest Park Tennis",
      sport: "tennis",
      address: "6301 Beatties Ford Rd, Charlotte, NC 28216",
      coordinates: { lat: 35.3012, lng: -80.8876 },
      rating: 4.4,
      pricePerHour: 20,
      amenities: ["outdoor_courts", "lighting", "parking", "restrooms"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(704) 336-3854",
      website: "https://charlottenc.gov/parks",
      description: "Popular public tennis courts with excellent facilities and lighting."
    },
    {
      id: 16,
      name: "Charlotte Tennis Club",
      sport: "tennis",
      address: "161 Grandin Rd, Charlotte, NC 28208",
      coordinates: { lat: 35.2187, lng: -80.8765 },
      rating: 4.6,
      pricePerHour: 45,
      amenities: ["outdoor_courts", "indoor_courts", "pro_shop", "lessons", "restaurant"],
      surface: "clay",
      indoor: false,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      phone: "(704) 334-1531",
      website: "https://charlottetennisclub.com",
      description: "Historic tennis club featuring both clay and hard courts with professional instruction."
    },

    // Basketball Courts - Charlotte
    {
      id: 17,
      name: "Spectrum Center",
      sport: "basketball",
      address: "333 E Trade St, Charlotte, NC 28202",
      coordinates: { lat: 35.2251, lng: -80.8394 },
      rating: 4.9,
      pricePerHour: 150,
      amenities: ["professional_court", "NBA_venue", "seating", "parking", "concessions"],
      surface: "hardwood",
      indoor: true,
      image: "https://images.unsplash.com/photo-1566577134770-3d85bb3a4e7d?w=300&h=200&fit=crop",
      phone: "(704) 688-8600",
      website: "https://spectrumcentercharlotte.com",
      description: "Home of the Charlotte Hornets NBA team. Premier professional basketball venue."
    },
    {
      id: 18,
      name: "Freedom Park Basketball Courts",
      sport: "basketball",
      address: "1908 East Blvd, Charlotte, NC 28203",
      coordinates: { lat: 35.2034, lng: -80.8234 },
      rating: 4.5,
      pricePerHour: 15,
      amenities: ["outdoor_courts", "lighting", "parking", "restrooms", "playground"],
      surface: "asphalt",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(704) 336-3854",
      website: "https://charlottenc.gov/parks",
      description: "Popular park basketball courts in the heart of Charlotte with great community atmosphere."
    },
    {
      id: 19,
      name: "UNCC Halton Arena",
      sport: "basketball",
      address: "9201 University City Blvd, Charlotte, NC 28223",
      coordinates: { lat: 35.3078, lng: -80.7342 },
      rating: 4.7,
      pricePerHour: 60,
      amenities: ["collegiate_court", "seating", "parking", "restrooms", "modern_facilities"],
      surface: "hardwood",
      indoor: true,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      phone: "(704) 687-4949",
      website: "https://charlotte49ers.com",
      description: "University of North Carolina at Charlotte basketball arena with modern facilities."
    },

    // Recreation Centers - Charlotte
    {
      id: 20,
      name: "Levine JCC Sports Complex",
      sport: "multi-sport",
      address: "5007 Providence Rd, Charlotte, NC 28226",
      coordinates: { lat: 35.1634, lng: -80.8123 },
      rating: 4.8,
      pricePerHour: 30,
      amenities: ["indoor_courts", "fitness_center", "swimming_pool", "parking", "lockers", "classes"],
      surface: "multi-surface",
      indoor: true,
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=300&h=200&fit=crop",
      phone: "(704) 366-5007",
      website: "https://levinejcc.org",
      description: "Premier Jewish Community Center with extensive sports facilities and programs."
    },

    // ======================
    // GREENSBORO AREA COURTS
    // ======================

    // Tennis Courts - Greensboro
    {
      id: 21,
      name: "Greensboro Tennis Center",
      sport: "tennis",
      address: "3102 Northline Ave, Greensboro, NC 27408",
      coordinates: { lat: 36.1085, lng: -79.8234 },
      rating: 4.6,
      pricePerHour: 25,
      amenities: ["outdoor_courts", "indoor_courts", "pro_shop", "lessons", "parking"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop",
      phone: "(336) 373-2540",
      website: "https://greensboro-nc.gov/tennis",
      description: "Municipal tennis center with 20 courts and professional instruction programs."
    },
    {
      id: 22,
      name: "UNCG Tennis Complex",
      sport: "tennis",
      address: "1000 Spring Garden St, Greensboro, NC 27412",
      coordinates: { lat: 36.0687, lng: -79.8095 },
      rating: 4.5,
      pricePerHour: 20,
      amenities: ["outdoor_courts", "collegiate_facility", "parking", "restrooms"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(336) 334-3259",
      website: "https://uncgspartans.com",
      description: "University of North Carolina at Greensboro tennis facility with quality courts."
    },

    // Basketball Courts - Greensboro
    {
      id: 23,
      name: "Greensboro Coliseum",
      sport: "basketball",
      address: "1921 W Gate City Blvd, Greensboro, NC 27403",
      coordinates: { lat: 36.0623, lng: -79.8567 },
      rating: 4.8,
      pricePerHour: 80,
      amenities: ["professional_venue", "seating", "parking", "concessions", "events"],
      surface: "hardwood",
      indoor: true,
      image: "https://images.unsplash.com/photo-1566577134770-3d85bb3a4e7d?w=300&h=200&fit=crop",
      phone: "(336) 373-7474",
      website: "https://greensborocoliseum.com",
      description: "Multi-purpose arena hosting ACC basketball tournaments and professional events."
    },
    {
      id: 24,
      name: "Hester Park Basketball Courts",
      sport: "basketball",
      address: "602 Yanceyville St, Greensboro, NC 27405",
      coordinates: { lat: 36.0734, lng: -79.7845 },
      rating: 4.2,
      pricePerHour: 12,
      amenities: ["outdoor_courts", "lighting", "parking", "restrooms"],
      surface: "asphalt",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(336) 373-2937",
      website: "https://greensboro-nc.gov/parks",
      description: "Community basketball courts with good lighting and well-maintained surfaces."
    },

    // Recreation Centers - Greensboro
    {
      id: 25,
      name: "Windsor Recreation Center",
      sport: "multi-sport",
      address: "1601 Walker Ave, Greensboro, NC 27403",
      coordinates: { lat: 36.0456, lng: -79.8234 },
      rating: 4.4,
      pricePerHour: 18,
      amenities: ["indoor_courts", "fitness_center", "parking", "lockers", "programs"],
      surface: "multi-surface",
      indoor: true,
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=300&h=200&fit=crop",
      phone: "(336) 373-2183",
      website: "https://greensboro-nc.gov/parks",
      description: "Modern recreation center with basketball courts and fitness facilities."
    },

    // ======================
    // WINSTON-SALEM AREA COURTS
    // ======================

    // Tennis Courts - Winston-Salem
    {
      id: 26,
      name: "Tanglewood Park Tennis Center",
      sport: "tennis",
      address: "4061 Clemmons Rd, Clemmons, NC 27012",
      coordinates: { lat: 36.0234, lng: -80.3567 },
      rating: 4.7,
      pricePerHour: 28,
      amenities: ["outdoor_courts", "pro_shop", "lessons", "parking", "restaurant"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop",
      phone: "(336) 778-6370",
      website: "https://tanglewoodpark.org",
      description: "Beautiful tennis facility within Tanglewood Park featuring 12 courts and instruction."
    },
    {
      id: 27,
      name: "Wake Forest Tennis Complex",
      sport: "tennis",
      address: "1834 Wake Forest Rd, Winston-Salem, NC 27109",
      coordinates: { lat: 36.1345, lng: -80.2789 },
      rating: 4.8,
      pricePerHour: 35,
      amenities: ["outdoor_courts", "indoor_courts", "collegiate_facility", "parking"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(336) 758-5640",
      website: "https://godeacs.com",
      description: "Wake Forest University tennis facility with top-quality courts and amenities."
    },

    // Basketball Courts - Winston-Salem
    {
      id: 28,
      name: "Lawrence Joel Veterans Memorial Coliseum",
      sport: "basketball",
      address: "2825 University Pkwy, Winston-Salem, NC 27105",
      coordinates: { lat: 36.1234, lng: -80.2891 },
      rating: 4.6,
      pricePerHour: 70,
      amenities: ["collegiate_venue", "seating", "parking", "concessions"],
      surface: "hardwood",
      indoor: true,
      image: "https://images.unsplash.com/photo-1566577134770-3d85bb3a4e7d?w=300&h=200&fit=crop",
      phone: "(336) 758-3322",
      website: "https://godeacs.com",
      description: "Wake Forest University basketball arena, home of the Demon Deacons."
    },
    {
      id: 29,
      name: "Bolton Recreation Center",
      sport: "basketball",
      address: "2037 Indiana Ave, Winston-Salem, NC 27105",
      coordinates: { lat: 36.0987, lng: -80.2654 },
      rating: 4.3,
      pricePerHour: 15,
      amenities: ["indoor_courts", "air_conditioning", "parking", "restrooms"],
      surface: "hardwood",
      indoor: true,
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop",
      phone: "(336) 727-2020",
      website: "https://cityofws.org/parks",
      description: "Community recreation center with indoor basketball courts and programs."
    },

    // ======================
    // ASHEVILLE AREA COURTS
    // ======================

    // Tennis Courts - Asheville
    {
      id: 30,
      name: "Asheville Racquet Club",
      sport: "tennis",
      address: "114 Lakeshore Dr, Asheville, NC 28804",
      coordinates: { lat: 35.5234, lng: -82.5567 },
      rating: 4.9,
      pricePerHour: 40,
      amenities: ["outdoor_courts", "indoor_courts", "pro_shop", "lessons", "swimming_pool"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop",
      phone: "(828) 274-3361",
      website: "https://ashevilleracquetclub.com",
      description: "Premier mountain tennis club with stunning views and comprehensive facilities."
    },
    {
      id: 31,
      name: "Montford Park Tennis Courts",
      sport: "tennis",
      address: "31 Pearson Dr, Asheville, NC 28801",
      coordinates: { lat: 35.6012, lng: -82.5789 },
      rating: 4.4,
      pricePerHour: 15,
      amenities: ["outdoor_courts", "lighting", "parking", "restrooms"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(828) 259-5800",
      website: "https://ashevillenc.gov/parks",
      description: "Public tennis courts in historic Montford neighborhood with mountain views."
    },

    // Basketball Courts - Asheville
    {
      id: 32,
      name: "UNCA Justice Center",
      sport: "basketball",
      address: "1 University Heights, Asheville, NC 28804",
      coordinates: { lat: 35.6123, lng: -82.5234 },
      rating: 4.5,
      pricePerHour: 30,
      amenities: ["collegiate_venue", "seating", "parking", "modern_facilities"],
      surface: "hardwood",
      indoor: true,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      phone: "(828) 251-6929",
      website: "https://uncabulldogs.com",
      description: "University of North Carolina Asheville basketball arena with modern amenities."
    },
    {
      id: 33,
      name: "Weaver Park Basketball Courts",
      sport: "basketball",
      address: "160 Weaver Blvd, Asheville, NC 28804",
      coordinates: { lat: 35.5789, lng: -82.5123 },
      rating: 4.1,
      pricePerHour: 10,
      amenities: ["outdoor_courts", "lighting", "parking", "playground"],
      surface: "asphalt",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(828) 259-5800",
      website: "https://ashevillenc.gov/parks",
      description: "Community basketball courts with mountain backdrop and family-friendly atmosphere."
    },

    // Recreation Centers - Asheville
    {
      id: 34,
      name: "YMCA of Western North Carolina",
      sport: "multi-sport",
      address: "30 Woodfin St, Asheville, NC 28801",
      coordinates: { lat: 35.5987, lng: -82.5654 },
      rating: 4.6,
      pricePerHour: 25,
      amenities: ["indoor_courts", "swimming_pool", "fitness_center", "parking", "classes"],
      surface: "multi-surface",
      indoor: true,
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=300&h=200&fit=crop",
      phone: "(828) 254-1500",
      website: "https://ymcawnc.org",
      description: "Comprehensive YMCA facility with basketball, volleyball, and aquatic programs."
    },

    // ======================
    // SMALLER NC CITIES
    // ======================

    // High Point
    {
      id: 35,
      name: "High Point Tennis Center",
      sport: "tennis",
      address: "1010 Blair Park Dr, High Point, NC 27262",
      coordinates: { lat: 35.9876, lng: -80.0234 },
      rating: 4.3,
      pricePerHour: 22,
      amenities: ["outdoor_courts", "lighting", "pro_shop", "lessons", "parking"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&h=200&fit=crop",
      phone: "(336) 883-3224",
      website: "https://highpointnc.gov/parks",
      description: "Municipal tennis facility serving the High Point furniture capital region."
    },

    // Wilmington
    {
      id: 36,
      name: "Wilmington Tennis Association",
      sport: "tennis",
      address: "3520 Randall Pkwy, Wilmington, NC 28403",
      coordinates: { lat: 34.2345, lng: -77.8567 },
      rating: 4.5,
      pricePerHour: 30,
      amenities: ["outdoor_courts", "indoor_courts", "pro_shop", "lessons", "parking"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(910) 791-0271",
      website: "https://wilmingtontennis.org",
      description: "Coastal tennis facility with year-round playing opportunities and ocean breeze."
    },

    // Hickory (keeping some original data)
    {
      id: 37,
      name: "Hickory Sports Complex",
      sport: "multi-sport",
      address: "789 Sports Dr, Hickory, NC 28601",
      coordinates: { lat: 35.7267, lng: -81.3221 },
      rating: 4.8,
      pricePerHour: 35,
      amenities: ["indoor_courts", "climate_control", "equipment_rental", "lockers"],
      surface: "synthetic",
      indoor: true,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      phone: "(828) 555-0901",
      website: "https://hickorysports.com",
      description: "Modern sports complex in the foothills with multiple courts and amenities."
    },

    // Fayetteville
    {
      id: 38,
      name: "Cape Fear Valley Health System Sportsplex",
      sport: "multi-sport",
      address: "4825 Lake Valley Dr, Fayetteville, NC 28304",
      coordinates: { lat: 35.0234, lng: -78.9567 },
      rating: 4.4,
      pricePerHour: 28,
      amenities: ["indoor_courts", "fitness_center", "swimming_pool", "parking", "classes"],
      surface: "multi-surface",
      indoor: true,
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=300&h=200&fit=crop",
      phone: "(910) 615-4100",
      website: "https://capefearvalley.com/sportsplex",
      description: "Medical system-affiliated sports complex with comprehensive facilities."
    },

    // Gastonia
    {
      id: 39,
      name: "Gastonia Tennis Center",
      sport: "tennis",
      address: "1303 Lowell Bethesda Rd, Gastonia, NC 28056",
      coordinates: { lat: 35.2456, lng: -81.1234 },
      rating: 4.2,
      pricePerHour: 20,
      amenities: ["outdoor_courts", "lighting", "parking", "restrooms"],
      surface: "hard",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(704) 866-6826",
      website: "https://cityofgastonia.com/parks",
      description: "Public tennis facility serving the greater Charlotte metro area."
    },

    // Concord
    {
      id: 40,
      name: "Frank Liske Park Basketball Courts",
      sport: "basketball",
      address: "4201 Liske Park Dr, Concord, NC 28025",
      coordinates: { lat: 35.3789, lng: -80.6234 },
      rating: 4.3,
      pricePerHour: 12,
      amenities: ["outdoor_courts", "lighting", "parking", "playground", "lake_views"],
      surface: "asphalt",
      indoor: false,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      phone: "(704) 920-2104",
      website: "https://concordnc.gov/parks",
      description: "Scenic basketball courts in beautiful lakeside park setting."
    }
  ]
  
  return courts
}

// Helper function to remove duplicate courts based on name and address similarity
function removeDuplicateCourts(courts: any[]): any[] {
  const seen = new Map()
  
  return courts.filter(court => {
    const key = `${court.name?.toLowerCase()?.trim()}-${court.address?.toLowerCase()?.trim()}`
    if (seen.has(key)) {
      return false
    }
    seen.set(key, true)
    return true
  })
}

/**
 * Enhance courts with detailed business profile information
 * Takes advantage of the Google Business Profile API
 */
async function enhanceCourtWithBusinessProfile(court: any): Promise<any> {
  // Only enhance Google Places results that have a place_id
  if (!court.place_id || court.source !== 'Google Places' && !court.source?.includes('Google')) {
    return court
  }

  try {
    console.log(`🏢 Enhancing business profile for: ${court.name}`)
    const enhancedProfile = await getEnhancedBusinessProfile(court.place_id)
    
    if (enhancedProfile) {
      return {
        ...court,
        // Add enhanced business information
        businessProfile: {
          operatingHours: enhancedProfile.operatingHours,
          currentHours: enhancedProfile.currentHours,
          amenities: [...(court.amenities || []), ...(enhancedProfile.amenities || [])],
          accessibility: enhancedProfile.accessibility,
          priceRange: enhancedProfile.priceRange,
          businessType: enhancedProfile.businessType,
          facilitySummary: enhancedProfile.facilitySummary,
          wheelchairAccessible: enhancedProfile.accessibility?.wheelchairAccessible,
          internationalPhone: enhancedProfile.international_phone_number,
          website: enhancedProfile.website || court.website,
          googleUrl: enhancedProfile.url
        },
        // Update existing fields with enhanced data
        phone: enhancedProfile.formatted_phone_number || court.phone,
        description: enhancedProfile.facilitySummary || court.description,
        pricePerHour: court.pricePerHour || (enhancedProfile.priceRange === 'Free' ? 0 : court.pricePerHour)
      }
    }
  } catch (error) {
    console.warn(`Failed to enhance business profile for ${court.name}:`, error)
  }
  
  return court
}

/**
 * Enhance multiple courts with business profile information
 */
async function enhanceCourtsWithBusinessProfiles(courts: any[]): Promise<any[]> {
  console.log(`🏢 Enhancing ${courts.length} courts with business profile data...`)
  
  // Enhance up to 10 courts to avoid rate limiting
  const courtsToEnhance = courts.slice(0, 10)
  const remainingCourts = courts.slice(10)
  
  const enhancedCourts = await Promise.all(
    courtsToEnhance.map(court => enhanceCourtWithBusinessProfile(court))
  )
  
  return [...enhancedCourts, ...remainingCourts]
}

/**
 * GET /api/search
 * Enhanced search with fuzzy matching and location variants
 */
export async function GET(request: NextRequest) {
  console.log('📍 GET /api/search called')
  
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || searchParams.get('q') || ''
    const sport = searchParams.get('sport') || 'all'
    const location = searchParams.get('location') || ''
    
    console.log(`🔍 Enhanced search: query="${query}", sport="${sport}", location="${location}"`)
    console.log(`📝 Search params received:`, Object.fromEntries(searchParams.entries()))
    
    // Check if this might be an international/non-NC search
    const isInternationalQuery = query.trim() && !isNorthCarolinaQuery(query)
    
    // Get local courts data
    const courts = await getCourtsData()
    let searchMatches: SearchMatch[] = []
    let googlePlacesCourts: any[] = []
    
    // For international queries, search both Google Places and Foursquare
    let foursquareCourts: any[] = []
    
    if (isInternationalQuery) {
      console.log(`🌍 Attempting international search for "${query}"`)
      
      // Try Google Places first
      if (isGooglePlacesConfigured()) {
        try {
          googlePlacesCourts = await searchCourtsWorldwide(query, sport)
          console.log(`🌍 Google Places found ${googlePlacesCourts.length} international courts`)
        } catch (error) {
          console.warn('⚠️ Google Places search failed:', error)
        }
      }
      
      // Try Foursquare for additional results
      try {
        foursquareCourts = await searchFoursquareCourtsWorldwide(query, sport as 'all' | 'tennis' | 'pickleball' | 'basketball' | 'multi-sport' | undefined)
        console.log(`🏢 Foursquare found ${foursquareCourts.length} sports venues`)
      } catch (error) {
        console.warn('⚠️ Foursquare search failed:', error)
      }
      
      // If both APIs failed, provide comprehensive mock results to demonstrate dual API functionality
      if (googlePlacesCourts.length === 0 && foursquareCourts.length === 0) {
        console.log('🧪 Creating comprehensive mock results to demonstrate dual API integration')
        
        if (query.toLowerCase().includes('new york')) {
          console.log('🧪 Creating mock New York results (simulating both APIs)')
          // Simulate Google Places results
          googlePlacesCourts = [
            {
              id: 'ny-google-1',
              name: 'Central Park Tennis Center',
              sport: sport === 'all' ? 'tennis' : sport,
              address: 'Central Park, New York, NY 10024',
              coordinates: { lat: 40.7829, lng: -73.9654 },
              rating: 4.2,
              pricePerHour: 45,
              source: 'Google Places (Mock)'
            },
            {
              id: 'ny-google-2', 
              name: 'Battery Park Tennis Courts',
              sport: sport === 'all' ? 'tennis' : sport,
              address: 'Battery Park, New York, NY 10004',
              coordinates: { lat: 40.7033, lng: -74.0170 },
              rating: 4.0,
              pricePerHour: 40,
              source: 'Google Places (Mock)'
            }
          ]
          
          // Simulate Foursquare results
          foursquareCourts = [
            {
              id: 'ny-foursquare-1',
              name: 'Brooklyn Bridge Sports Complex',
              sport: sport === 'all' ? 'multi-sport' : sport,
              address: 'Brooklyn Bridge Park, Brooklyn, NY 11201',
              coordinates: { lat: 40.7061, lng: -73.9969 },
              rating: 4.1,
              pricePerHour: 35,
              source: 'Foursquare (Mock)'
            },
            {
              id: 'ny-foursquare-2',
              name: 'Manhattan Tennis Club',
              sport: sport === 'all' ? 'tennis' : sport,
              address: 'Upper East Side, New York, NY 10021',
              coordinates: { lat: 40.7736, lng: -73.9566 },
              rating: 4.4,
              pricePerHour: 55,
              source: 'Foursquare (Mock)'
            }
          ]
          
        } else if (query.toLowerCase().includes('london')) {
          console.log('🧪 Creating mock London results (simulating both APIs)')
          // Simulate Google Places results
          googlePlacesCourts = [
            {
              id: 'london-google-1',
              name: 'Hyde Park Tennis Courts',
              sport: sport === 'all' ? 'tennis' : sport,
              address: 'Hyde Park, London W2, UK',
              coordinates: { lat: 51.5074, lng: -0.1278 },
              rating: 4.3,
              pricePerHour: 40,
              source: 'Google Places (Mock)'
            }
          ]
          
          // Simulate Foursquare results  
          foursquareCourts = [
            {
              id: 'london-foursquare-1',
              name: 'Regent\'s Park Sports Centre',
              sport: sport === 'all' ? 'multi-sport' : sport,
              address: 'Regent\'s Park, London NW1, UK',
              coordinates: { lat: 51.5255, lng: -0.1540 },
              rating: 4.2,
              pricePerHour: 35,
              source: 'Foursquare (Mock)'
            },
            {
              id: 'london-foursquare-2',
              name: 'Wimbledon Tennis Courts',
              sport: sport === 'all' ? 'tennis' : sport,
              address: 'Wimbledon, London SW19, UK',
              coordinates: { lat: 51.4362, lng: -0.2063 },
              rating: 4.8,
              pricePerHour: 75,
              source: 'Foursquare (Mock)'
            }
          ]
          
        } else if (query.toLowerCase().includes('paris')) {
          console.log('🧪 Creating mock Paris results (simulating both APIs)')
          // Simulate Google Places results
          googlePlacesCourts = [
            {
              id: 'paris-google-1',
              name: 'Roland Garros Tennis Complex',
              sport: sport === 'all' ? 'tennis' : sport,
              address: 'Bois de Boulogne, Paris 75016, France',
              coordinates: { lat: 48.8467, lng: 2.2529 },
              rating: 4.7,
              pricePerHour: 60,
              source: 'Google Places (Mock)'
            }
          ]
          
          // Simulate Foursquare results
          foursquareCourts = [
            {
              id: 'paris-foursquare-1',
              name: 'Luxembourg Gardens Courts',
              sport: sport === 'all' ? 'tennis' : sport,
              address: 'Luxembourg Gardens, Paris 75006, France',
              coordinates: { lat: 48.8462, lng: 2.3372 },
              rating: 4.1,
              pricePerHour: 45,
              source: 'Foursquare (Mock)'
            }
          ]
          
        } else if (query.toLowerCase().includes('tokyo')) {
          console.log('🧪 Creating mock Tokyo results (simulating both APIs)')
          // Simulate Google Places results
          googlePlacesCourts = [
            {
              id: 'tokyo-google-1',
              name: 'Tokyo Metropolitan Gymnasium',
              sport: sport === 'all' ? 'multi-sport' : sport,
              address: 'Shibuya, Tokyo 150-0041, Japan',
              coordinates: { lat: 35.6762, lng: 139.7118 },
              rating: 4.4,
              pricePerHour: 50,
              source: 'Google Places (Mock)'
            }
          ]
          
          // Simulate Foursquare results
          foursquareCourts = [
            {
              id: 'tokyo-foursquare-1',
              name: 'Ariake Tennis Park',
              sport: sport === 'all' ? 'tennis' : sport,
              address: 'Ariake, Tokyo 135-0063, Japan',
              coordinates: { lat: 35.6336, lng: 139.7956 },
              rating: 4.5,
              pricePerHour: 55,
              source: 'Foursquare (Mock)'
            }
          ]
        } else if (query.toLowerCase().includes('colorado') || query.toLowerCase().includes('denver') || query.toLowerCase().includes('boulder') || query.toLowerCase().includes('aspen')) {
          console.log('🧪 Creating mock Colorado results (simulating both APIs)')
          // Simulate Google Places results
          googlePlacesCourts = [
            {
              id: 'colorado-google-1',
              name: 'Denver Tennis Club',
              sport: sport === 'all' ? 'tennis' : sport,
              address: '1325 S Colorado Blvd, Denver, CO 80222',
              coordinates: { lat: 39.6992, lng: -104.9403 },
              rating: 4.6,
              pricePerHour: 40,
              source: 'Google Places (Mock)'
            },
            {
              id: 'colorado-google-2',
              name: 'Cherry Hills Country Club Tennis',
              sport: sport === 'all' ? 'tennis' : sport,
              address: '4125 S University Blvd, Cherry Hills Village, CO 80113',
              coordinates: { lat: 39.6389, lng: -104.9567 },
              rating: 4.8,
              pricePerHour: 65,
              source: 'Google Places (Mock)'
            }
          ]
          
          // Simulate Foursquare results
          foursquareCourts = [
            {
              id: 'colorado-foursquare-1',
              name: 'Boulder Country Club Tennis',
              sport: sport === 'all' ? 'tennis' : sport,
              address: '7350 Clubhouse Rd, Boulder, CO 80301',
              coordinates: { lat: 40.0150, lng: -105.2705 },
              rating: 4.7,
              pricePerHour: 50,
              source: 'Foursquare (Mock)'
            },
            {
              id: 'colorado-foursquare-2',
              name: 'Colorado Springs Tennis Center',
              sport: sport === 'all' ? 'tennis' : sport,
              address: '1411 Broadmoor Golf Club Dr, Colorado Springs, CO 80906',
              coordinates: { lat: 38.7946, lng: -104.8597 },
              rating: 4.5,
              pricePerHour: 35,
              source: 'Foursquare (Mock)'
            },
            {
              id: 'colorado-foursquare-3',
              name: 'Vail Mountain Tennis Club',
              sport: sport === 'all' ? 'tennis' : sport,
              address: '1778 Vail Valley Dr, Vail, CO 81657',
              coordinates: { lat: 39.6433, lng: -106.3781 },
              rating: 4.9,
              pricePerHour: 75,
              source: 'Foursquare (Mock)'
            }
          ]
          
        } else if (query.toLowerCase().includes('california') || query.toLowerCase().includes('los angeles') || query.toLowerCase().includes('san francisco') || query.toLowerCase().includes('la ') || query.toLowerCase().includes('sf ')) {
          console.log('🧪 Creating mock California results (simulating both APIs)')
          googlePlacesCourts = [
            {
              id: 'california-google-1',
              name: 'Beverly Hills Tennis Club',
              sport: sport === 'all' ? 'tennis' : sport,
              address: '325 S Lasky Dr, Beverly Hills, CA 90212',
              coordinates: { lat: 34.0622, lng: -118.3957 },
              rating: 4.8,
              pricePerHour: 85,
              source: 'Google Places (Mock)'
            }
          ]
          
          foursquareCourts = [
            {
              id: 'california-foursquare-1',
              name: 'Golden Gate Park Tennis Courts',
              sport: sport === 'all' ? 'tennis' : sport,
              address: 'Golden Gate Park, San Francisco, CA 94117',
              coordinates: { lat: 37.7694, lng: -122.4862 },
              rating: 4.4,
              pricePerHour: 45,
              source: 'Foursquare (Mock)'
            },
            {
              id: 'california-foursquare-2',
              name: 'Malibu Tennis Club',
              sport: sport === 'all' ? 'tennis' : sport,
              address: '23000 Pacific Coast Hwy, Malibu, CA 90265',
              coordinates: { lat: 34.0259, lng: -118.7798 },
              rating: 4.7,
              pricePerHour: 65,
              source: 'Foursquare (Mock)'
            }
          ]
          
        } else if (query.toLowerCase().includes('texas') || query.toLowerCase().includes('dallas') || query.toLowerCase().includes('houston') || query.toLowerCase().includes('austin')) {
          console.log('🧪 Creating mock Texas results (simulating both APIs)')
          googlePlacesCourts = [
            {
              id: 'texas-google-1',
              name: 'Austin Country Club Tennis',
              sport: sport === 'all' ? 'tennis' : sport,
              address: '4408 Long Champ Dr, Austin, TX 78746',
              coordinates: { lat: 30.2672, lng: -97.7431 },
              rating: 4.7,
              pricePerHour: 50,
              source: 'Google Places (Mock)'
            }
          ]
          
          foursquareCourts = [
            {
              id: 'texas-foursquare-1',
              name: 'Dallas Tennis Club',
              sport: sport === 'all' ? 'tennis' : sport,
              address: '2200 Turtle Creek Blvd, Dallas, TX 75219',
              coordinates: { lat: 32.7767, lng: -96.7970 },
              rating: 4.6,
              pricePerHour: 55,
              source: 'Foursquare (Mock)'
            },
            {
              id: 'texas-foursquare-2',
              name: 'River Oaks Country Club Houston',
              sport: sport === 'all' ? 'tennis' : sport,
              address: '1600 River Oaks Blvd, Houston, TX 77019',
              coordinates: { lat: 29.7604, lng: -95.3698 },
              rating: 4.8,
              pricePerHour: 60,
              source: 'Foursquare (Mock)'
            }
          ]
        }
      }
    }
    
    // If we have a query, use fuzzy search on local data (but skip if we have international mock results)
    if (query.trim() && !(isInternationalQuery && (googlePlacesCourts.length > 0 || foursquareCourts.length > 0))) {
      console.log(`🔍 Starting local fuzzy search for "${query}"`)
      // Score all local courts against the query
      searchMatches = courts.map(court => scoreCourtMatch(court, query, sport))
      
      // Filter out very low scores but be more permissive for better results
      searchMatches = searchMatches.filter(match => match.score > 0.15)
      
      // Sort by score (highest first)
      searchMatches.sort((a, b) => b.score - a.score)
      
      console.log(`🔍 Local fuzzy search found ${searchMatches.length} matches for "${query}"`)
      // Log top matches for debugging
      searchMatches.slice(0, 3).forEach(match => {
        console.log(`  - ${match.court.name} (${match.score.toFixed(2)}) [${match.matchType}] - ${match.matchedFields.join(', ')}`)
      })
    } else if (isInternationalQuery && (googlePlacesCourts.length > 0 || foursquareCourts.length > 0)) {
      console.log(`🌍 Skipping local search for international query with mock results`)
    } else if (!query.trim()) {
      // No query - return all local courts as perfect matches
      searchMatches = courts.map(court => ({
        court,
        score: 1,
        matchType: 'exact' as const,
        matchedFields: []
      }))
    }
    
    // Filter by sport if specified
    if (sport && sport !== 'all') {
      searchMatches = searchMatches.filter(match => 
        match.court.sport.toLowerCase() === sport.toLowerCase()
      )
      console.log(`🔍 Filtered by sport "${sport}": ${searchMatches.length} courts`)
      
      // Also filter Google Places results by sport
      if (googlePlacesCourts.length > 0) {
        googlePlacesCourts = googlePlacesCourts.filter(court => 
          court.sport && court.sport.toLowerCase() === sport.toLowerCase()
        )
        console.log(`🌍 Filtered Google Places by sport "${sport}": ${googlePlacesCourts.length} courts`)
      }
    }
    
    // Filter by location if specified
    if (location.trim()) {
      const locationVariants = getLocationVariants(location)
      searchMatches = searchMatches.filter(match => {
        const address = match.court.address.toLowerCase()
        return locationVariants.some(variant => 
          address.includes(variant.toLowerCase())
        )
      })
      console.log(`🔍 Filtered by location "${location}": ${searchMatches.length} courts`)
    }
    
    // Extract just the courts from the local matches
    let allCourts = searchMatches.map(match => match.court)
    
    // Add Google Places results if we have them
    // Combine international results from both APIs
    const internationalCourts = [...googlePlacesCourts, ...foursquareCourts]
    
    if (internationalCourts.length > 0) {
      // If we have international results and few/no local results, prioritize international
      if (isInternationalQuery && allCourts.length === 0) {
        console.log(`🌍 Using international results as primary (${internationalCourts.length} courts: ${googlePlacesCourts.length} Google + ${foursquareCourts.length} Foursquare)`)
        allCourts = internationalCourts
      } else {
        // Combine results, with local results first
        console.log(`🔄 Combining ${allCourts.length} local + ${internationalCourts.length} international courts (${googlePlacesCourts.length} Google + ${foursquareCourts.length} Foursquare)`)
        allCourts = [...allCourts, ...internationalCourts]
      }
    }
    
    // Remove duplicates based on name and address similarity
    let uniqueCourts = removeDuplicateCourts(allCourts)
    
    // Enhance courts with detailed business profile information (Google Business Profile API)
    if (isGooglePlacesConfigured()) {
      try {
        uniqueCourts = await enhanceCourtsWithBusinessProfiles(uniqueCourts)
        console.log(`🏢 Enhanced ${uniqueCourts.length} courts with business profile data`)
      } catch (error) {
        console.warn('Failed to enhance courts with business profiles:', error)
      }
    }
    
    console.log(`✅ Enhanced search complete: returning ${uniqueCourts.length} courts (${allCourts.length - uniqueCourts.length} duplicates removed)`)
    
    // Create response with proper headers
    const response = NextResponse.json(uniqueCourts)
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Cache-Control', 'no-cache')
    
    return response
    
  } catch (error) {
    console.error('❌ Error in GET /api/search:', error)
    
    const errorResponse = NextResponse.json(
      { 
        error: 'Failed to search courts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    
    // Add CORS headers to error response
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    
    return errorResponse
  }
}

/**
 * OPTIONS /api/search
 * Handle preflight requests for CORS
 */
export async function OPTIONS() {
  console.log('📍 OPTIONS /api/search called (CORS preflight)')
  
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}