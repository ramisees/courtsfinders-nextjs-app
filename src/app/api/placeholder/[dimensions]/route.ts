import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ dimensions: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { dimensions } = await params;
    const [width, height] = dimensions.split('x').map(Number);
    
    if (!width || !height || width > 1000 || height > 1000) {
      return new NextResponse('Invalid dimensions', { status: 400 })
    }

    // Create a simple SVG placeholder image
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect x="20%" y="20%" width="60%" height="60%" fill="#e5e7eb" rx="8"/>
        <g transform="translate(${width/2}, ${height/2})">
          <svg x="-16" y="-16" width="32" height="32" fill="#9ca3af" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </g>
        <text x="50%" y="75%" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="12">
          Product Image
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
    
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return new NextResponse('Error generating placeholder', { status: 500 })
  }
}