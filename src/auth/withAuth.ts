import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../utils";

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
export type AuthenticatedHandler = (
  request: NextRequest,
  context: RouteContext,
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
    context: RouteContext
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
