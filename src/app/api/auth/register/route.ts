import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Mock registration - replace with real database logic
    const user = {
      id: Date.now().toString(),
      email,
      name,
      role: "user",
      createdAt: new Date().toISOString()
    };

    const token = "mock-jwt-token-" + Date.now(); // Replace with real JWT

    return NextResponse.json({
      success: true,
      user,
      token,
      message: "Registration successful"
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/auth/register - Return registration form info
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/auth/register",
    method: "POST",
    description: "User registration endpoint",
    requiredFields: ["name", "email", "password"],
    validation: {
      email: "Must be valid email format",
      password: "Minimum 6 characters",
      name: "Required field"
    }
  });
}
