/**
 * Google Gemini API integration for Courts Finder
 * Provides AI-powered features and content generation
 */

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

/**
 * Configuration for Gemini API requests
 */
interface GeminiConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

/**
 * Default configuration for Gemini requests
 */
const defaultConfig: GeminiConfig = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 1024,
};

/**
 * Generate content using Google Gemini API
 */
export async function generateContent(
  prompt: string,
  config: GeminiConfig = defaultConfig
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Google Gemini API key not configured');
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: config.temperature,
          topP: config.topP,
          topK: config.topK,
          maxOutputTokens: config.maxOutputTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Invalid response format from Gemini API');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

/**
 * Generate court recommendations using AI
 */
export async function generateCourtRecommendations(
  location: string,
  sport: string,
  preferences?: string
): Promise<string> {
  const prompt = `
    As a sports facility expert, provide personalized recommendations for ${sport} courts in ${location}.
    ${preferences ? `User preferences: ${preferences}` : ''}
    
    Please provide:
    1. Top 3 recommended areas/districts to look for courts
    2. Key features to look for in a quality ${sport} facility
    3. Typical pricing expectations
    4. Best times to play for availability and rates
    
    Keep the response concise and helpful for someone looking to book court time.
  `;

  return generateContent(prompt);
}

/**
 * Generate facility descriptions using AI
 */
export async function generateFacilityDescription(
  facilityName: string,
  sport: string,
  features: string[]
): Promise<string> {
  const prompt = `
    Write an engaging description for "${facilityName}", a ${sport} facility.
    Features include: ${features.join(', ')}.
    
    Create a 2-3 sentence description that highlights the key benefits and atmosphere.
    Keep it professional but welcoming.
  `;

  return generateContent(prompt, { maxOutputTokens: 200 });
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}

/**
 * Get API configuration info for debugging
 */
export function getGeminiInfo() {
  return {
    configured: isGeminiConfigured(),
    apiKeyPrefix: GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 8)}...` : 'Not set',
    environment: typeof window !== 'undefined' ? 'client' : 'server',
  };
}
