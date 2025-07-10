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
    
    if (!width || !height) {
      return NextResponse.json(
        { error: 'Invalid dimensions format. Use format: 300x200' },
        { status: 400 }
      );
    }
    
    // Return a placeholder image URL
    const placeholderUrl = `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=Court+Image`;
    
    return NextResponse.json({
      url: placeholderUrl,
      width,
      height,
      alt: 'Court placeholder image'
    });
    
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return NextResponse.json(
      { error: 'Failed to generate placeholder image' },
      { status: 500 }
    );
  }
}