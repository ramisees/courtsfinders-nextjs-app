# Court Placeholder Images

## Generated Placeholder Images

This directory contains auto-generated SVG placeholder images for different court types.

### Sports Available:
- **Tennis Court** (🎾) - `tennis`
- **Basketball Court** (🏀) - `basketball`
- **Volleyball Court** (🏐) - `volleyball`
- **Pickleball Court** (🏓) - `pickleball`
- **Badminton Court** (🏸) - `badminton`
- **Multi-Sport Facility** (⚽) - `multi-sport`
- **Sports Facility** (🏟️) - `generic`

### File Structure:
```
/images/courts/
├── placeholders/           # Main placeholder files
│   ├── tennis.svg
│   ├── basketball.svg
│   └── ...
├── tennis/                 # Tennis-specific variants
│   ├── tennis-placeholder.svg
│   ├── tennis-indoor-placeholder.svg
│   └── tennis-outdoor-placeholder.svg
└── [sport]/               # Other sport directories
    └── [variants]
```

### Usage in Components:
```javascript
// Use in fallback
const fallbackImage = '/images/courts/placeholders/tennis.svg'

// Use variants
const indoorImage = '/images/courts/tennis/tennis-indoor-placeholder.svg'
```

### Image Specifications:
- **Format**: SVG (scalable vector graphics)
- **Dimensions**: 300x200 pixels (aspect ratio 3:2)
- **Style**: Professional, sport-themed design
- **Colors**: Sport-specific color schemes
- **Features**: Court patterns, sport icons, clear labels

Generated on: 2025-07-11T15:03:47.003Z
