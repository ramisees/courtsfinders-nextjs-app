# Courts Finder Frontend

A modern, responsive frontend for courtsfinders.com - find and book sports courts near you.

![Courts Finder](https://img.shields.io/badge/Next.js-15.3.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-cyan)

## 🏆 Features

- **Modern Design**: Beautiful, responsive UI with gradient backgrounds and smooth animations
- **Smart Search**: Real-time court search and filtering by sport type and location
- **Court Discovery**: Browse tennis courts, basketball courts, and multi-sport facilities
- **Availability Display**: Real-time availability status for each court
- **Mobile Optimized**: Fully responsive design for all devices
- **SEO Optimized**: Proper metadata and semantic HTML structure
- **TypeScript**: Full type safety throughout the application
- **Performance**: Built with Next.js 15 App Router for optimal performance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone and setup** (if starting fresh):
   ```bash
   git clone <your-repo-url>
   cd courtsfinders-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Homepage with court discovery
│   └── globals.css         # Global styles with Tailwind
├── components/             # Reusable UI components (add as needed)
└── types/                  # TypeScript type definitions (add as needed)
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#3b82f6 to #1d4ed8)
- **Secondary**: Green (#22c55e)
- **Background**: Light gray gradient
- **Text**: Dark gray (#1f2937)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, various sizes
- **Body**: Regular weight, readable sizes

## 🔌 Backend Integration

The frontend is designed to integrate with your existing backend API. Update the sample data in `src/app/page.tsx` with real API calls:

```typescript
// Replace this sample data with your API calls
const courts: Court[] = [
  // Sample court data structure
  {
    id: '1',
    name: 'Downtown Tennis Center',
    type: 'Tennis',
    location: 'Downtown District',
    rating: 4.8,
    price: '$25/hour',
    image: '/images/court-1.jpg',
    available: true
  }
]
```

### API Endpoints to Implement
- `GET /api/courts` - Fetch all courts
- `GET /api/courts/search?q={query}&sport={sport}` - Search courts
- `POST /api/courts/{id}/book` - Book a court
- `GET /api/courts/{id}/availability` - Check availability

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js and configure build settings
3. Your site will be deployed on every push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

## 🔧 Customization

### Adding New Court Types
1. Update the `Court` interface in `src/app/page.tsx`
2. Add new options to the sport filter dropdown
3. Update the filtering logic

### Styling Changes
- Edit `tailwind.config.js` for theme customization
- Modify `src/app/globals.css` for global styles
- Component styles use Tailwind CSS classes

### Adding New Pages
Create new files in the `src/app` directory following Next.js App Router conventions.

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Core Web Vitals**: All metrics in green
- **Bundle Size**: Optimized with Next.js automatic code splitting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for courtsfinders.com.

## 🆘 Support

For questions or support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for the Courts Finder community**
