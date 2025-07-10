import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: courtId } = await params;
    const body = await request.json();
    const { date, startTime, endTime, userId } = body;

    // Validate required fields
    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // Simulate booking logic
    const booking = {
      id: `booking_${Date.now()}`,
      courtId,
      userId: userId || 'guest_user',
      date,
      startTime,
      endTime,
      status: 'confirmed',
      totalPrice: calculatePrice(courtId, startTime, endTime),
      createdAt: new Date().toISOString()
    };

    console.log('Booking created:', booking);

    return NextResponse.json({
      success: true,
      booking,
      message: 'Court booked successfully!'
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to book court' },
      { status: 500 }
    );
  }
}

function calculatePrice(courtId: string, startTime: string, endTime: string): number {
  // Simple price calculation based on court type and duration
  const priceMap: { [key: string]: number } = {
    '1': 25, // Downtown Tennis Center
    '2': 15, // Community Basketball Court
    '3': 35, // Hickory Sports Complex
    '4': 20, // Lenoir-Rhyne Tennis Courts
    '5': 12, // Riverwalk Basketball Courts
    '6': 28  // Northeast Recreation Center
  };

  const hourlyRate = priceMap[courtId] || 20;
  
  // Calculate duration (simplified - assumes same day)
  const start = new Date(`2023-01-01T${startTime}`);
  const end = new Date(`2023-01-01T${endTime}`);
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  
  return Math.round(hourlyRate * durationHours);
}
