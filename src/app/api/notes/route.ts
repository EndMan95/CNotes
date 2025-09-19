import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedHandler } from '@/auth';
import { getNotesByTenant, createNote } from '@/lib/services';

interface UserPayload {
  userId: string;
  tenantId: string;
  role: string;
}

interface CreateNoteBody {
  title: string;
  content?: string;
}

/**
 * GET handler - Get all notes for the authenticated user's tenant
 */
const getHandler: AuthenticatedHandler<{ params: object }> = async (
  request,
  context,
  payload
) => {
  try {
    const { tenantId } = payload;

    // Get all notes for the tenant
    const notes = await getNotesByTenant(tenantId);

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
};

/**
 * POST handler - Create a new note for the authenticated user's tenant
 */
const postHandler: AuthenticatedHandler<{ params: object }> = async (
  request,
  context,
  payload
) => {
  try {
    const { userId, tenantId } = payload;

    // Parse the request body
    const body: CreateNoteBody = await request.json();
    const { title, content } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Create the note
    const newNote = await createNote({
      title,
      content,
      authorId: userId,
      tenantId,
    });

    return NextResponse.json(
      {
        message: "Note created successfully",
        note: newNote,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
  console.error('Error creating note:', error);
  // First, check if the error is an actual Error object
  if (error instanceof Error) {
    // Now we can safely access error.message
    if (error.message === 'Note limit reached for Free plan') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message === 'Tenant not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
  }
  // Fallback for any other kind of error
  return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
}
};

// Export handlers wrapped with authentication
export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);