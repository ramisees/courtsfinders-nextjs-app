import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CourtImage, { LegacyCourtImage } from '../CourtImage'
import { getSafeImageUrl, getSportIcon } from '@/lib/image-utils'

// Mock the image-utils module
jest.mock('@/lib/image-utils', () => ({
  createImageErrorHandler: jest.fn(() => jest.fn()),
  getSafeImageUrl: jest.fn(),
  getSportIcon: jest.fn()
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, onLoad, onError, className, priority, unoptimized, ...props }: any) => {
    // Filter out boolean attributes to avoid React warnings
    const filteredProps = Object.keys(props).reduce((acc, key) => {
      if (typeof props[key] !== 'boolean') {
        acc[key] = props[key]
      }
      return acc
    }, {} as any)

    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        className={className}
        data-testid="mock-image"
        data-priority={priority}
        data-unoptimized={unoptimized}
        {...filteredProps}
      />
    )
  }
}))

describe('CourtImage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSafeImageUrl as jest.Mock).mockImplementation((src, sport) => src || `/placeholder/${sport}.jpg`)
    ;(getSportIcon as jest.Mock).mockImplementation((sport) => {
      const icons: Record<string, string> = {
        tennis: '🎾',
        basketball: '🏀',
        soccer: '⚽'
      }
      return icons[sport] || '🏟️'
    })
  })

  it('renders with loading state initially', () => {
    render(<CourtImage alt="Test Court" sport="tennis" />)
    
    const loadingElement = screen.getByText('🎾')
    expect(loadingElement).toBeInTheDocument()
    expect(loadingElement.parentElement).toHaveClass('animate-pulse')
  })

  it('shows loading icon when showSportIcon is false', () => {
    render(<CourtImage alt="Test Court" sport="tennis" showSportIcon={false} />)
    
    expect(screen.getByText('⏳')).toBeInTheDocument()
  })

  it('renders image with proper attributes', () => {
    render(
      <CourtImage 
        src="https://example.com/court.jpg" 
        alt="Tennis Court" 
        sport="tennis"
        width={400}
        height={300}
      />
    )
    
    const image = screen.getByTestId('mock-image')
    expect(image).toHaveAttribute('src', 'https://example.com/court.jpg')
    expect(image).toHaveAttribute('alt', 'Tennis Court')
    expect(image).toHaveAttribute('width', '400')
    expect(image).toHaveAttribute('height', '300')
  })

  it('handles successful image load', async () => {
    render(<CourtImage alt="Test Court" sport="basketball" />)
    
    const image = screen.getByTestId('mock-image')
    fireEvent.load(image)
    
    await waitFor(() => {
      expect(image).toHaveClass('opacity-100')
    })
    
    // Loading state should be gone
    expect(screen.queryByText('⏳')).not.toBeInTheDocument()
  })

  it('handles image load error', async () => {
    render(<CourtImage alt="Test Court" sport="soccer" />)
    
    const image = screen.getByTestId('mock-image')
    fireEvent.error(image)
    
    await waitFor(() => {
      expect(screen.getByText('Soccer Court')).toBeInTheDocument()
      expect(screen.getByText('Image unavailable')).toBeInTheDocument()
      // Use getAllByText since there might be multiple instances
      expect(screen.getAllByText('⚽').length).toBeGreaterThan(0)
    })
  })

  it('shows sport icon overlay when loaded successfully', async () => {
    render(<CourtImage alt="Test Court" sport="tennis" />)
    
    const image = screen.getByTestId('mock-image')
    fireEvent.load(image)
    
    await waitFor(() => {
      const overlayElement = document.querySelector('.bg-white.bg-opacity-80')
      expect(overlayElement).toBeInTheDocument()
      expect(overlayElement).toHaveTextContent('🎾')
    })
  })

  it('uses fallback URL when no src provided', () => {
    render(<CourtImage alt="Test Court" sport="basketball" />)
    
    expect(getSafeImageUrl).toHaveBeenCalledWith(undefined, 'basketball')
    const image = screen.getByTestId('mock-image')
    expect(image).toHaveAttribute('src', '/placeholder/basketball.jpg')
  })

  it('applies custom className', () => {
    const { container } = render(
      <CourtImage 
        alt="Test Court" 
        sport="tennis" 
        className="custom-class rounded-lg"
      />
    )
    
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('custom-class', 'rounded-lg')
  })

  it('sets priority flag correctly', () => {
    render(<CourtImage alt="Test Court" sport="tennis" priority={true} />)
    
    const image = screen.getByTestId('mock-image')
    expect(image).toHaveAttribute('data-priority', 'true')
  })
})

describe('LegacyCourtImage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSafeImageUrl as jest.Mock).mockImplementation((src, sport) => src || `/placeholder/${sport}.jpg`)
  })

  it('renders with default dimensions', () => {
    render(<LegacyCourtImage alt="Legacy Court" sport="tennis" />)
    
    const image = screen.getByTestId('mock-image')
    expect(image).toHaveAttribute('width', '400')
    expect(image).toHaveAttribute('height', '300')
  })

  it('uses custom dimensions when provided', () => {
    render(
      <LegacyCourtImage 
        alt="Legacy Court" 
        sport="basketball"
        width={600}
        height={400}
      />
    )
    
    const image = screen.getByTestId('mock-image')
    expect(image).toHaveAttribute('width', '600')
    expect(image).toHaveAttribute('height', '400')
  })

  it('applies custom className', () => {
    render(
      <LegacyCourtImage 
        alt="Legacy Court" 
        sport="tennis"
        className="legacy-image-class"
      />
    )
    
    const image = screen.getByTestId('mock-image')
    expect(image).toHaveClass('legacy-image-class')
  })

  it('calls getSafeImageUrl with correct parameters', () => {
    const testSrc = 'https://example.com/legacy-court.jpg'
    render(
      <LegacyCourtImage 
        src={testSrc}
        alt="Legacy Court" 
        sport="soccer"
      />
    )
    
    expect(getSafeImageUrl).toHaveBeenCalledWith(testSrc, 'soccer')
  })
})