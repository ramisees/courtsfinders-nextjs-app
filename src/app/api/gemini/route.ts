import { NextRequest, NextResponse } from 'next/server';
import { generateContent, generateCourtRecommendations, isGeminiConfigured } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'Gemini API not configured' },
        { status: 500 }
      );
    }

    const { type, prompt, location, sport, preferences } = await request.json();

    let result: string;

    switch (type) {
      case 'recommendations':
        if (!location || !sport) {
          return NextResponse.json(
            { error: 'Location and sport are required for recommendations' },
            { status: 400 }
          );
        }
        result = await generateCourtRecommendations(location, sport, preferences);
        break;

      case 'general':
        if (!prompt) {
          return NextResponse.json(
            { error: 'Prompt is required for general content generation' },
            { status: 400 }
          );
        }
        result = await generateContent(prompt);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid request type. Use "recommendations" or "general"' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      content: result,
      success: true 
    });

  } catch (error) {
    console.error('Gemini API route error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Gemini AI API endpoint',
    configured: isGeminiConfigured(),
    endpoints: {
      POST: {
        recommendations: 'Generate court recommendations',
        general: 'Generate general content'
      }
    }
  });
}
