interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
  };
  message?: string;
}

interface Note {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  tenantId: string;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  /**
   * Login with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise resolving to the login response
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    if (data.token) {
      this.token = data.token;
    }

    return data;
  }

  /**
   * Get all notes for the authenticated user
   * @returns Promise resolving to an array of notes
   */
  async getNotes(): Promise<Note[]> {
    const response = await fetch(`${this.baseUrl}/notes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch notes');
    }

    return data.notes;
  }

  /**
   * Create a new note
   * @param title The note title
   * @param content The note content
   * @returns Promise resolving to the created note
   */
  async createNote(title: string, content: string): Promise<Note> {
    const response = await fetch(`${this.baseUrl}/notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create note');
    }

    return data.note;
  }

  /**
   * Delete a note by ID
   * @param id The note ID
   * @returns Promise resolving to the deletion result
   */
  async deleteNote(id: string): Promise<Note> {
    const response = await fetch(`${this.baseUrl}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete note');
    }

    return data.note;
  }

  /**
   * Set the authentication token
   * @param token JWT token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear the authentication token
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Check if the client is authenticated
   * @returns boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }
}

const apiClient = new ApiClient();
export default apiClient;