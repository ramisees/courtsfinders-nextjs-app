#!/bin/bash

# Courts Finder Deployment Script
# This script helps deploy the Courts Finder app to Vercel with your custom domain

echo "🏟️ Courts Finder - Vercel Deployment Script"
echo "==========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Project directory confirmed"

# Check for environment file
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating template..."
    cat > .env.local << EOL
# Google Places API Key (required)
GOOGLE_PLACES_API_KEY=your_google_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=https://courtsfinders.com
NODE_ENV=production

# Optional: Analytics
ANALYZE=false
EOL
    echo "📝 Created .env.local template. Please add your API keys before deploying."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run build test
echo "🔨 Testing build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "Next steps:"
echo "1. Configure your domain in Vercel dashboard"
echo "2. Set up DNS records (see deploy.md for details)"
echo "3. Add environment variables in Vercel dashboard"
echo "4. Test your site at https://courtsfinders.com"
echo ""
echo "📚 See deploy.md for detailed configuration instructions"
