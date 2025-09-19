import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword } from '@/utils/password';
import { generateToken } from '@/utils/token';

interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * User login endpoint
 * @param request - The incoming request with email and password in the body
 * @returns A JSON response with a JWT token if credentials are valid, 401 otherwise
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: LoginRequestBody = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate a JWT token
    const token = generateToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    // Return the token in the response
    return NextResponse.json(
      { 
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}