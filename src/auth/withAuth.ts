import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../utils';

// Define the payload type that matches our JWT payload
interface UserPayload {
  userId: string;
  tenantId: string;
  role: string;
}

// Define the handler type with the extra payload argument
export type AuthenticatedHandler = (
  request: NextRequest,
  context: { params: Record<string, string | string[]> },
  payload: UserPayload
) => Promise<NextResponse> | NextResponse;

/**
 * Higher-order function that wraps an API handler with authentication
 * @param handler - The API handler function to wrap
 * @returns A new handler that validates JWT and passes user payload to the original handler
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async function (
    request: NextRequest,
    context: { params: Record<string, string | string[]> }
  ): Promise<NextResponse> {
    try {
      // Extract the Bearer token from the Authorization header
      const authHeader = request.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized: Missing or invalid Authorization header' },
          { status: 401 }
        );
      }
      
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Verify the token
      const payload = verifyToken(token);
      
      if (!payload) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or expired token' },
          { status: 401 }
        );
      }
      
      // Call the original handler with the payload
      return await handler(request, context, payload);
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Unauthorized: Authentication failed' },
        { status: 401 }
      );
    }
  };
}