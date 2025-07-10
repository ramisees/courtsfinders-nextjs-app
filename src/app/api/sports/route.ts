import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sports = [
      {
        id: "tennis",
        name: "Tennis",
        description: "Professional tennis courts with various surfaces",
        icon: "🎾",
        popularityScore: 8.5
      },
      {
        id: "basketball", 
        name: "Basketball",
        description: "Indoor and outdoor basketball courts",
        icon: "🏀",
        popularityScore: 9.2
      },
      {
        id: "volleyball",
        name: "Volleyball",
        description: "Beach and indoor volleyball courts",
        icon: "🏐",
        popularityScore: 7.8
      },
      {
        id: "badminton",
        name: "Badminton", 
        description: "Professional badminton courts",
        icon: "🏸",
        popularityScore: 6.5
      },
      {
        id: "squash",
        name: "Squash",
        description: "Indoor squash courts",
        icon: "🎯",
        popularityScore: 5.9
      },
      {
        id: "pickleball",
        name: "Pickleball",
        description: "Growing sport with dedicated courts",
        icon: "🏓",
        popularityScore: 7.2
      }
    ];

    return NextResponse.json(sports);
  } catch (error) {
    console.error('Error fetching sports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sports' }, 
      { status: 500 }
    );
  }
}
