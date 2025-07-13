import {
  LOCAL_PLACEHOLDER_IMAGES,
  EXTERNAL_FALLBACK_IMAGES,
  PLACEHOLDER_SERVICES,
  getExternalFallbackImage,
  getSportFallbackImage,
  createImageErrorHandler,
  getSafeImageUrl,
  preloadImages,
  preloadFallbackImages,
  getSportIcon,
  SPORT_ICONS
} from '../image-utils'

// Mock console methods
const originalConsoleWarn = console.warn
const originalConsoleError = console.error
const originalConsoleLog = console.log

beforeAll(() => {
  console.warn = jest.fn()
  console.error = jest.fn()
  console.log = jest.fn()
})

afterAll(() => {
  console.warn = originalConsoleWarn
  console.error = originalConsoleError
  console.log = originalConsoleLog
})

// Mock Image constructor
global.Image = class {
  src: string = ''
  constructor() {
    // Mock implementation
  }
} as any

describe('Image Utils', () => {
  describe('getExternalFallbackImage', () => {
    it('returns correct fallback image for known sports', () => {
      expect(getExternalFallbackImage('tennis')).toBe(EXTERNAL_FALLBACK_IMAGES.tennis)
      expect(getExternalFallbackImage('basketball')).toBe(EXTERNAL_FALLBACK_IMAGES.basketball)
      expect(getExternalFallbackImage('volleyball')).toBe(EXTERNAL_FALLBACK_IMAGES.volleyball)
    })

    it('returns default fallback for unknown sports', () => {
      expect(getExternalFallbackImage('cricket')).toBe(EXTERNAL_FALLBACK_IMAGES.default)
      expect(getExternalFallbackImage('unknown')).toBe(EXTERNAL_FALLBACK_IMAGES.default)
    })

    it('handles case insensitive sport names', () => {
      expect(getExternalFallbackImage('TENNIS')).toBe(EXTERNAL_FALLBACK_IMAGES.tennis)
      expect(getExternalFallbackImage('Basketball')).toBe(EXTERNAL_FALLBACK_IMAGES.basketball)
    })

    it('handles sport names with whitespace', () => {
      expect(getExternalFallbackImage('  tennis  ')).toBe(EXTERNAL_FALLBACK_IMAGES.tennis)
      expect(getExternalFallbackImage('multi-sport ')).toBe(EXTERNAL_FALLBACK_IMAGES['multi-sport'])
    })
  })

  describe('getSportFallbackImage', () => {
    it('returns correct local placeholder for known sports', () => {
      expect(getSportFallbackImage('tennis')).toBe(LOCAL_PLACEHOLDER_IMAGES.tennis)
      expect(getSportFallbackImage('basketball')).toBe(LOCAL_PLACEHOLDER_IMAGES.basketball)
    })

    it('returns default placeholder for unknown sports', () => {
      expect(getSportFallbackImage('unknown')).toBe(LOCAL_PLACEHOLDER_IMAGES.default)
    })
  })

  describe('createImageErrorHandler', () => {
    let mockImg: HTMLImageElement

    beforeEach(() => {
      mockImg = {
        src: 'original-image.jpg',
        onerror: null
      } as HTMLImageElement
    })

    it('sets local fallback on first error', () => {
      const handler = createImageErrorHandler('tennis')
      const event = { target: mockImg } as any

      handler(event)

      expect(mockImg.src).toBe(LOCAL_PLACEHOLDER_IMAGES.tennis)
      expect(console.warn).toHaveBeenCalledWith('Image failed to load: original-image.jpg')
    })

    it('sets external fallback on second error', () => {
      const handler = createImageErrorHandler('basketball', 1)
      const event = { target: mockImg } as any

      handler(event)

      expect(mockImg.src).toBe(EXTERNAL_FALLBACK_IMAGES.basketball)
    })

    it('cycles through placeholder services', () => {
      const handler = createImageErrorHandler('tennis', 2)
      const event = { target: mockImg } as any

      handler(event)

      expect(mockImg.src).toBe(PLACEHOLDER_SERVICES[0])
    })

    it('clears onerror handler after all fallbacks fail', () => {
      const fallbackCount = 2 + PLACEHOLDER_SERVICES.length
      const handler = createImageErrorHandler('tennis', fallbackCount)
      const event = { target: mockImg } as any

      handler(event)

      expect(mockImg.onerror).toBe(null)
      expect(console.error).toHaveBeenCalledWith('All image fallbacks failed for:', 'original-image.jpg')
    })

    it('handles missing sport parameter', () => {
      // Start from fallback index 2 to test placeholder services directly
      const handler = createImageErrorHandler(undefined, 2)
      const event = { target: mockImg } as any

      handler(event)

      // Should use placeholder services when no sport is provided
      expect(mockImg.src).toBe(PLACEHOLDER_SERVICES[0])
    })
  })

  describe('getSafeImageUrl', () => {
    it('returns original URL when provided', () => {
      const url = 'https://example.com/image.jpg'
      expect(getSafeImageUrl(url)).toBe(url)
    })

    it('returns sport fallback when URL is missing and sport is provided', () => {
      expect(getSafeImageUrl(undefined, 'tennis')).toBe(LOCAL_PLACEHOLDER_IMAGES.tennis)
      expect(getSafeImageUrl('', 'basketball')).toBe(LOCAL_PLACEHOLDER_IMAGES.basketball)
    })

    it('returns default fallback when both URL and sport are missing', () => {
      expect(getSafeImageUrl()).toBe(LOCAL_PLACEHOLDER_IMAGES.default)
      expect(getSafeImageUrl('')).toBe(LOCAL_PLACEHOLDER_IMAGES.default)
    })
  })

  describe('preloadImages', () => {
    it('creates Image objects for each URL', () => {
      const urls = ['url1.jpg', 'url2.jpg', 'url3.jpg']
      const imageInstances: any[] = []

      // Mock Image constructor to track instances
      global.Image = jest.fn().mockImplementation(() => {
        const img = { src: '' }
        imageInstances.push(img)
        return img
      }) as any

      preloadImages(urls)

      expect(imageInstances).toHaveLength(3)
      expect(imageInstances[0].src).toBe('url1.jpg')
      expect(imageInstances[1].src).toBe('url2.jpg')
      expect(imageInstances[2].src).toBe('url3.jpg')
    })
  })

  describe('preloadFallbackImages', () => {
    it('preloads all unique fallback images', () => {
      const imageInstances: any[] = []

      global.Image = jest.fn().mockImplementation(() => {
        const img = { src: '' }
        imageInstances.push(img)
        return img
      }) as any

      preloadFallbackImages()

      // Check that images were created
      expect(imageInstances.length).toBeGreaterThan(0)

      // Check console log
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Preloaded')
      )

      // Verify unique URLs
      const srcs = imageInstances.map(img => img.src)
      const uniqueSrcs = [...new Set(srcs)]
      expect(srcs.length).toBe(uniqueSrcs.length)
    })
  })

  describe('getSportIcon', () => {
    it('returns correct emoji for known sports', () => {
      expect(getSportIcon('tennis')).toBe('🎾')
      expect(getSportIcon('basketball')).toBe('🏀')
      expect(getSportIcon('volleyball')).toBe('🏐')
      expect(getSportIcon('pickleball')).toBe('🏓')
      expect(getSportIcon('badminton')).toBe('🏸')
      expect(getSportIcon('multi-sport')).toBe('⚽')
    })

    it('returns default emoji for unknown sports', () => {
      expect(getSportIcon('cricket')).toBe('🏟️')
      expect(getSportIcon('unknown')).toBe('🏟️')
    })

    it('handles case insensitive sport names', () => {
      expect(getSportIcon('TENNIS')).toBe('🎾')
      expect(getSportIcon('Basketball')).toBe('🏀')
    })

    it('handles sport names with whitespace', () => {
      expect(getSportIcon('  tennis  ')).toBe('🎾')
      expect(getSportIcon(' multi-sport')).toBe('⚽')
    })
  })

  describe('Constants', () => {
    it('has all required sport types in LOCAL_PLACEHOLDER_IMAGES', () => {
      const requiredSports = ['tennis', 'basketball', 'volleyball', 'multi-sport', 'default']
      requiredSports.forEach(sport => {
        expect(LOCAL_PLACEHOLDER_IMAGES).toHaveProperty(sport)
        expect(LOCAL_PLACEHOLDER_IMAGES[sport as keyof typeof LOCAL_PLACEHOLDER_IMAGES]).toContain('.svg')
      })
    })

    it('has all required sport types in EXTERNAL_FALLBACK_IMAGES', () => {
      const requiredSports = ['tennis', 'basketball', 'volleyball', 'multi-sport', 'default']
      requiredSports.forEach(sport => {
        expect(EXTERNAL_FALLBACK_IMAGES).toHaveProperty(sport)
        expect(EXTERNAL_FALLBACK_IMAGES[sport as keyof typeof EXTERNAL_FALLBACK_IMAGES]).toContain('unsplash.com')
      })
    })

    it('has valid placeholder service URLs', () => {
      expect(PLACEHOLDER_SERVICES.length).toBeGreaterThan(0)
      PLACEHOLDER_SERVICES.forEach(url => {
        expect(url).toMatch(/^https:\/\//)
        expect(url).toMatch(/placeholder|placehold|picsum/)
      })
    })

    it('has matching sports between icons and images', () => {
      const iconSports = Object.keys(SPORT_ICONS)
      const imageSports = Object.keys(LOCAL_PLACEHOLDER_IMAGES)
      
      // All icon sports should have corresponding images
      iconSports.forEach(sport => {
        expect(imageSports).toContain(sport)
      })
    })
  })
})