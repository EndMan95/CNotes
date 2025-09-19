import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "./withAuth";

// Define the payload type that matches our JWT payload
interface UserPayload {
  userId: string;
  tenantId: string;
  role: string;
}

// Define a more specific context type for dynamic routes
interface RouteContext {
  params: { [key: string]: string | string[] | undefined };
}

// Define the handler type with the updated context
export type AdminHandler = (
  request: NextRequest,
  context: RouteContext,
  payload: UserPayload
) => Promise<NextResponse> | NextResponse;

/**
 * Higher-order function that wraps an API handler with authentication and admin authorization
 * @param handler - The API handler function to wrap
 * @returns A new handler that validates JWT, checks for admin role, and passes user payload to the original handler
 */
export function withAdminAuth(handler: AdminHandler) {
  return withAuth(async (request, context, payload) => {
    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    return await handler(request, context, payload);
  });
}
