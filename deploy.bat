@echo off
REM Courts Finder Deployment Script for Windows
REM This script helps deploy the Courts Finder app to Vercel with your custom domain

echo 🏟️ Courts Finder - Vercel Deployment Script
echo ===========================================

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if we're in the right directory
if not exist package.json (
    echo ❌ package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo ✅ Project directory confirmed

REM Check for environment file
if not exist .env.local (
    echo ⚠️  .env.local not found. Creating template...
    (
        echo # Google Places API Key ^(required^)
        echo GOOGLE_PLACES_API_KEY=your_google_api_key_here
        echo.
        echo # App Configuration
        echo NEXT_PUBLIC_APP_URL=https://courtsfinders.com
        echo NODE_ENV=production
        echo.
        echo # Optional: Analytics
        echo ANALYZE=false
    ) > .env.local
    echo 📝 Created .env.local template. Please add your API keys before deploying.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Run build test
echo 🔨 Testing build...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix errors before deploying.
    pause
    exit /b 1
)

echo ✅ Build successful

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo 🎉 Deployment completed!
echo.
echo Next steps:
echo 1. Configure your domain in Vercel dashboard
echo 2. Set up DNS records ^(see deploy.md for details^)
echo 3. Add environment variables in Vercel dashboard
echo 4. Test your site at https://courtsfinders.com
echo.
echo 📚 See deploy.md for detailed configuration instructions
pause
