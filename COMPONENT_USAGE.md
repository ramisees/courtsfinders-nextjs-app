# Component Usage Guide

## SearchResults Component

### Basic Usage

```tsx
import SearchResults from '@/components/SearchResults'

export default function SearchPage() {
  return (
    <div>
      <h1>Court Search</h1>
      <SearchResults 
        searchQuery="tennis"
        selectedSport="tennis"
        onBooking={(courtId) => alert(`Booking court ${courtId}`)}
      />
    </div>
  )
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchQuery` | `string` | `''` | Text search query |
| `selectedSport` | `string` | `'all'` | Sport filter (all, tennis, basketball, etc.) |
| `onBooking` | `(courtId: string \| number) => void` | `undefined` | Callback when user clicks Book Now |

### Features

- ✅ Real-time search with debouncing
- ✅ Loading states with skeleton UI
- ✅ Error handling with retry
- ✅ Empty states with helpful messages
- ✅ Responsive grid layout
- ✅ Image fallbacks
- ✅ Booking integration ready

---

## Navigation Component

### Basic Usage

```tsx
import Navigation, { FooterNavigation, Breadcrumb } from '@/components/Navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navigation />
      <main>{children}</main>
      <FooterNavigation />
    </div>
  )
}
```

### Navigation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showMobileMenu` | `boolean` | `false` | Control mobile menu visibility |
| `onMobileMenuToggle` | `() => void` | `undefined` | Callback for mobile menu toggle |

### Features

- ✅ Responsive design (desktop + mobile)
- ✅ Active link highlighting
- ✅ Next.js Link optimization
- ✅ Mobile hamburger menu
- ✅ Sticky header
- ✅ Categorized navigation
- ✅ Breadcrumb support

### Breadcrumb Usage

```tsx
import { Breadcrumb } from '@/components/Navigation'

export default function CourtDetailsPage() {
  const breadcrumbItems = [
    { href: '/', label: 'Home' },
    { href: '/courts/tennis', label: 'Tennis Courts' },
    { href: '/courts/tennis/downtown-tennis', label: 'Downtown Tennis Club' }
  ]

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      {/* Page content */}
    </div>
  )
}
```

---

## Integration Examples

### 1. Replace Homepage Navigation

Update `/src/app/page.tsx`:

```tsx
import Navigation, { FooterNavigation } from '@/components/Navigation'
import SearchResults from '@/components/SearchResults'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero section with search */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        {/* Your hero content */}
      </section>

      {/* Search results */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchResults />
        </div>
      </section>

      <FooterNavigation />
    </div>
  )
}
```

### 2. Search Page with Filters

Create `/src/app/search/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation, { FooterNavigation, Breadcrumb } from '@/components/Navigation'
import SearchResults from '@/components/SearchResults'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedSport, setSelectedSport] = useState(searchParams.get('sport') || 'all')

  const breadcrumbItems = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search Results' }
  ]

  const handleBooking = (courtId: string | number) => {
    // Integrate with your booking system
    window.location.href = `/booking/${courtId}`
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Search filters */}
        <div className="my-8 p-6 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search courts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Sports</option>
              <option value="tennis">Tennis</option>
              <option value="basketball">Basketball</option>
              <option value="pickleball">Pickleball</option>
            </select>
          </div>
        </div>

        <SearchResults
          searchQuery={searchQuery}
          selectedSport={selectedSport}
          onBooking={handleBooking}
        />
      </main>

      <FooterNavigation />
    </div>
  )
}
```

### 3. Court Category Pages

Update `/src/app/courts/tennis/page.tsx`:

```tsx
import Navigation, { FooterNavigation, Breadcrumb } from '@/components/Navigation'
import SearchResults from '@/components/SearchResults'

export default function TennisPage() {
  const breadcrumbItems = [
    { href: '/', label: 'Home' },
    { href: '/courts/tennis', label: 'Tennis Courts' }
  ]

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎾 Tennis Courts</h1>
          <p className="text-xl text-gray-600">Find the perfect tennis court for your game</p>
        </div>

        <SearchResults
          selectedSport="tennis"
          onBooking={(courtId) => {
            window.location.href = `/booking/${courtId}`
          }}
        />
      </main>

      <FooterNavigation />
    </div>
  )
}
```

---

## Complete Layout Integration

### Create Layout Component

Create `/src/components/Layout.tsx`:

```tsx
import Navigation, { FooterNavigation } from '@/components/Navigation'

interface LayoutProps {
  children: React.ReactNode
  showBreadcrumb?: boolean
  breadcrumbItems?: { href: string; label: string }[]
}

export default function Layout({ children, showBreadcrumb, breadcrumbItems }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {showBreadcrumb && breadcrumbItems && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}
        {children}
      </main>

      <FooterNavigation />
    </div>
  )
}
```

### Use Layout in Pages

```tsx
import Layout from '@/components/Layout'
import SearchResults from '@/components/SearchResults'

export default function HomePage() {
  return (
    <Layout>
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchResults />
        </div>
      </section>
    </Layout>
  )
}
```

---

## Styling Notes

### Required CSS Classes

Make sure your `tailwind.config.js` includes these custom colors:

```js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
        }
      }
    }
  }
}
```

### Alternative: Use with Existing Colors

Replace `primary-*` classes with your existing color scheme:
- `primary-600` → `blue-600`
- `primary-700` → `blue-700`
- `primary-50` → `blue-50`

---

## Testing the Components

1. **Run your Next.js app**: `npm run dev`
2. **Test SearchResults**: Visit any page with the component
3. **Test Navigation**: Click all navigation links
4. **Test Mobile**: Resize browser to mobile width
5. **Test Search**: Try different search queries and filters

Both components are now fully functional and ready to use! 🚀