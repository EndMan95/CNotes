import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedHandler } from './withAuth';

// Define the payload type that matches our JWT payload
interface UserPayload {
  userId: string;
  tenantId: string;
  role: string;
}

// Define the handler type with the extra payload argument
export type AdminHandler = (
  request: NextRequest,
  context: { params: Record<string, string | string[]> },
  payload: UserPayload
) => Promise<NextResponse> | NextResponse;

/**
 * Higher-order function that wraps an API handler with authentication and admin authorization
 * @param handler - The API handler function to wrap
 * @returns A new handler that validates JWT, checks for admin role, and passes user payload to the original handler
 */
export function withAdminAuth(handler: AdminHandler) {
  // First wrap with authentication
  return withAuth(async (request, context, payload) => {
    // Check if the user has admin role
    if (payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // If user is admin, call the original handler
    return await handler(request, context, payload);
  });
}