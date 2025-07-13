# Vercel Deployment Guide for courtsfinders.com

## 1. Prerequisites
- Vercel CLI installed: `npm i -g vercel`
- GitHub repository connected to Vercel
- Domain ready for configuration

## 2. Environment Variables Setup

Add these environment variables in Vercel dashboard:

### Required Variables:
```bash
GOOGLE_PLACES_API_KEY=your_google_api_key_here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://courtsfinders.com
```

### Optional Variables:
```bash
ANALYZE=false
```

## 3. Domain Configuration

### Step 1: Add Domain in Vercel
1. Go to your project in Vercel dashboard
2. Navigate to Settings → Domains
3. Add your domain: `courtsfinders.com`
4. Add www subdomain: `www.courtsfinders.com`

### Step 2: DNS Configuration
Configure your DNS with these records:

#### For courtsfinders.com:
```
Type: A
Name: @
Value: 76.76.19.61
```

#### For www.courtsfinders.com:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Alternative (if using Vercel nameservers):
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

## 4. Deploy Commands

### Initial Deploy:
```bash
vercel --prod
```

### Subsequent Deploys:
```bash
git push origin main
# Auto-deploys via GitHub integration
```

### Manual Deploy:
```bash
npm run build
vercel --prod --prebuilt
```

## 5. Verification Steps

1. **Check deployment status**: Visit https://courtsfinders.com
2. **Test API endpoints**: Visit https://courtsfinders.com/api/courts
3. **Verify redirects**: Ensure www redirects to non-www
4. **Test mobile**: Check responsive design on mobile devices
5. **Performance**: Run Lighthouse audit

## 6. SSL Certificate
- Vercel automatically provides SSL certificates
- Certificates are automatically renewed
- HTTPS is enforced by default

## 7. Custom Domain Features Enabled
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ DDoS protection
- ✅ Image optimization
- ✅ Edge functions
- ✅ Analytics

## 8. Troubleshooting

### Common Issues:

#### Domain not propagating:
```bash
# Check DNS propagation
nslookup courtsfinders.com
dig courtsfinders.com
```

#### Build failures:
```bash
# Check build logs in Vercel dashboard
# Verify environment variables
# Check Next.js compatibility
```

#### API issues:
```bash
# Verify API routes in /api folder
# Check environment variables
# Test API endpoints directly
```

## 9. Performance Optimizations Applied

- **Image optimization**: WebP/AVIF formats, CDN delivery
- **Code splitting**: Automatic route-based splitting
- **Minification**: JavaScript/CSS minification enabled
- **Compression**: Gzip/Brotli compression
- **Caching**: Static assets cached for 1 year
- **Edge functions**: API routes run at edge locations

## 10. Monitoring

Set up monitoring for:
- **Uptime**: Use Vercel Analytics or external monitoring
- **Performance**: Core Web Vitals tracking
- **Errors**: Error tracking and logging
- **API usage**: Google Places API quota monitoring

---

## Quick Deploy Checklist

- [ ] Environment variables configured
- [ ] Domain added to Vercel project
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] Site accessible at courtsfinders.com
- [ ] API endpoints working
- [ ] Mobile responsive
- [ ] Performance optimized
