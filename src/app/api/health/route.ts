import { NextRequest, NextResponse } from 'next/server';

/**
 * Health check endpoint
 * @param request - The incoming request
 * @returns A JSON response with status "ok"
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}