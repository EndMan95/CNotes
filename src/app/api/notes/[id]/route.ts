import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedHandler } from '@/auth';
import { getNoteById, updateNoteById, deleteNoteById } from '@/lib/services';

interface UserPayload {
  userId: string;
  tenantId: string;
  role: string;
}

interface UpdateNoteBody {
  title?: string;
  content?: string;
}

/**
 * GET handler - Get a single note by ID, ensuring it belongs to the user's tenant
 */
const getHandler: AuthenticatedHandler = async (request, context, payload) => {
  try {
    const { tenantId } = payload;
    const { id } = context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }
    
    // Get the note by ID, ensuring it belongs to the user's tenant
    const note = await getNoteById(id as string, tenantId);
    
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
};

/**
 * PUT handler - Update a note by ID using request body data
 */
const putHandler: AuthenticatedHandler = async (request, context, payload) => {
  try {
    const { tenantId } = payload;
    const { id } = context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }
    
    // Parse the request body
    const body: UpdateNoteBody = await request.json();
    const { title, content } = body;
    
    // Update the note
    const updatedNote = await updateNoteById({
      id: id as string,
      tenantId,
      title,
      content,
    });
    
    return NextResponse.json(
      { 
        message: 'Note updated successfully',
        note: updatedNote 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating note:', error);
    
    // Handle specific error cases
    if (error.message === 'Note not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
};

/**
 * DELETE handler - Delete a note by ID
 */
const deleteHandler: AuthenticatedHandler = async (request, context, payload) => {
  try {
    const { tenantId } = payload;
    const { id } = context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the note
    const deletedNote = await deleteNoteById(id as string, tenantId);
    
    return NextResponse.json(
      { 
        message: 'Note deleted successfully',
        note: deletedNote 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting note:', error);
    
    // Handle specific error cases
    if (error.message === 'Note not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
};

// Export handlers wrapped with authentication
export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);