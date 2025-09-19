import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../utils";

// Define the payload type that matches our JWT payload
interface UserPayload {
  userId: string;
  tenantId: string;
  role: string;
}

// The handler type is now generic. `<T>` will represent the specific context for each route.
export type AuthenticatedHandler<T> = (
  request: NextRequest,
  context: T,
  payload: UserPayload
) => Promise<NextResponse> | NextResponse;

/**
 * Higher-order function that wraps an API handler with authentication
 * @param handler - The API handler function to wrap
 * @returns A new handler that validates JWT and passes user payload to the original handler
 */
export function withAuth<T>(handler: AuthenticatedHandler<T>) {
  // This wrapper function is also generic, accepting the specific context type `T`.
  return async function (
    request: NextRequest,
    context: T
  ): Promise<NextResponse> {
    try {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Unauthorized: Missing or invalid Authorization header" },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid or expired token" },
          { status: 401 }
        );
      }

      // We pass the fully-typed context through to the original handler
      return await handler(request, context, payload as UserPayload);
    } catch (error) {
      console.error("Authentication error:", error);
      return NextResponse.json(
        { error: "Unauthorized: Authentication failed" },
        { status: 401 }
      );
    }
  };
}
