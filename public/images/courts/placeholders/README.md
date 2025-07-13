# Court Placeholder Images

This directory contains SVG placeholder images for different types of sports courts used when actual court images are not available or fail to load.

## Available Placeholders

- **tennis.svg** - Tennis court with racket and ball
- **basketball.svg** - Basketball court with hoop and ball
- **volleyball.svg** - Volleyball court with net and ball
- **pickleball.svg** - Pickleball court with paddle and ball
- **badminton.svg** - Badminton court with racket and shuttlecock
- **multi-sport.svg** - Multi-purpose court with various sports elements
- **generic.svg** - Generic sports court for unknown sport types

## Usage

These images are automatically used by the `CourtImage` component when:
1. No image URL is provided for a court
2. The provided image URL fails to load
3. As fallback images in the image error handling system

## Technical Details

- **Format**: SVG (Scalable Vector Graphics)
- **Dimensions**: 300x200 pixels
- **Colors**: Sport-specific color schemes for easy identification
- **File Size**: Optimized for fast loading

## Image Hierarchy

The image loading follows this fallback hierarchy:
1. Original court image (if provided)
2. Sport-specific placeholder (e.g., tennis.svg for tennis courts)
3. External fallback images (Unsplash)
4. Generic placeholder services
5. Generic sports court placeholder

These placeholders ensure users always see a relevant image even when external sources are unavailable.