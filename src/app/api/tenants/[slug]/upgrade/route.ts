import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdminAuth, type AdminHandler } from '@/auth';

interface UserPayload {
  userId: string;
  tenantId: string;
  role: string;
}

/**
 * Update tenant plan to PRO
 * @param request - The incoming request
 * @param context - The route context containing URL parameters
 * @param payload - The authenticated user payload
 * @returns A JSON response with the updated tenant data
 */
const handler: AdminHandler = async (request, context, payload) => {
  try {
    // Extract slug from URL parameters
    const { slug } = context.params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Tenant slug is required' },
        { status: 400 }
      );
    }
    
    // Find the tenant by slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: slug as string },
    });
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    // Verify the authenticated admin belongs to the same tenant
    if (tenant.id !== payload.tenantId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update tenants in your own organization' },
        { status: 403 }
      );
    }
    
    // Update the tenant's plan to 'PRO'
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { plan: 'PRO' },
    });
    
    // Return the updated tenant data
    return NextResponse.json(
      { 
        message: 'Tenant plan updated successfully',
        tenant: updatedTenant 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating tenant plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

// Export the handler wrapped with admin authentication
export const POST = withAdminAuth(handler);