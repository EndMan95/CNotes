import prisma from '../prisma';

interface CreateNoteParams {
  title: string;
  content?: string;
  authorId: string;
  tenantId: string;
}

interface UpdateNoteParams {
  id: string;
  tenantId: string;
  title?: string;
  content?: string;
}

/**
 * Creates a new note with plan-based limitations
 * @param params - The note creation parameters
 * @returns The created note
 * @throws Error if note limit is reached for Free plan
 */
export async function createNote(params: CreateNoteParams) {
  const { title, content, authorId, tenantId } = params;

  // Query the tenant's plan
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Check note limit for Free plan
  if (tenant.plan === 'FREE') {
    // Count existing notes for this tenant
    const noteCount = await prisma.note.count({
      where: { tenantId },
    });

    // Throw error if note limit reached (3 or more notes)
    if (noteCount >= 3) {
      throw new Error('Note limit reached for Free plan');
    }
  }

  // Create and return the new note
  const newNote = await prisma.note.create({
    data: {
      title,
      content,
      authorId,
      tenantId,
    },
  });

  return newNote;
}

/**
 * Gets all notes for a specific tenant
 * @param tenantId - The ID of the tenant
 * @returns Array of notes belonging to the tenant
 */
export async function getNotesByTenant(tenantId: string) {
  const notes = await prisma.note.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  return notes;
}

/**
 * Gets a specific note by ID, ensuring it belongs to the specified tenant
 * @param id - The ID of the note
 * @param tenantId - The ID of the tenant
 * @returns The note if found, null otherwise
 */
export async function getNoteById(id: string, tenantId: string) {
  const note = await prisma.note.findUnique({
    where: { 
      id,
      tenantId, // Ensure the note belongs to the specified tenant
    },
  });

  return note;
}

/**
 * Updates a specific note by ID, ensuring it belongs to the specified tenant
 * @param params - The update parameters including note ID, tenant ID, and fields to update
 * @returns The updated note
 * @throws Error if note is not found within the specified tenant
 */
export async function updateNoteById(params: UpdateNoteParams) {
  const { id, tenantId, ...updateData } = params;

  // First check if the note exists within the tenant
  const existingNote = await prisma.note.findUnique({
    where: { 
      id,
      tenantId,
    },
  });

  if (!existingNote) {
    throw new Error('Note not found');
  }

  // Update the note
  const updatedNote = await prisma.note.update({
    where: { 
      id,
      tenantId,
    },
    data: updateData,
  });

  return updatedNote;
}

/**
 * Deletes a specific note by ID, ensuring it belongs to the specified tenant
 * @param id - The ID of the note
 * @param tenantId - The ID of the tenant
 * @returns The deleted note
 * @throws Error if note is not found within the specified tenant
 */
export async function deleteNoteById(id: string, tenantId: string) {
  // First check if the note exists within the tenant
  const existingNote = await prisma.note.findUnique({
    where: { 
      id,
      tenantId,
    },
  });

  if (!existingNote) {
    throw new Error('Note not found');
  }

  // Delete the note
  const deletedNote = await prisma.note.delete({
    where: { 
      id,
      tenantId,
    },
  });

  return deletedNote;
}