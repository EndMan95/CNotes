import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthenticatedHandler } from "./withAuth";

// Define the payload type that matches our JWT payload
interface UserPayload {
  userId: string;
  tenantId: string;
  role: string;
}

// The AdminHandler is now also generic
export type AdminHandler<T> = AuthenticatedHandler<T>;

/**
 * Higher-order function that wraps an API handler with authentication and admin authorization
 * @param handler - The API handler function to wrap
 * @returns A new handler that validates JWT, checks for admin role, and passes user payload to the original handler
 */
export function withAdminAuth<T>(handler: AdminHandler<T>) {
  return withAuth<T>(async (request, context, payload) => {
    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    return await handler(request, context, payload);
  });
}
