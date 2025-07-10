import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Mock authentication - replace with real auth logic
    if (email === "demo@courtsfinders.com" && password === "demo123") {
      const user = {
        id: "1",
        email: "demo@courtsfinders.com",
        name: "Demo User",
        role: "user"
      };

      const token = "mock-jwt-token-12345"; // Replace with real JWT

      return NextResponse.json({
        success: true,
        user,
        token,
        message: "Login successful"
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/auth/login - Return login form info
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/auth/login",
    method: "POST",
    description: "User authentication endpoint",
    requiredFields: ["email", "password"],
    demoCredentials: {
      email: "demo@courtsfinders.com",
      password: "demo123"
    }
  });
}
