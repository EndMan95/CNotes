'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { ApiClient } from '../../lib/services/apiClient';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';

interface Note {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  tenantId: string;
}

export default function DashboardPage() {
  const { currentUser, logout, token } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  // Create ApiClient instance with useMemo to avoid recreating on every render
  const apiClient = useMemo(() => {
    const client = new ApiClient();
    if (token) {
      client.setToken(token);
    }
    return client;
  }, [token]);

  // Fetch notes on mount
  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const fetchedNotes = await apiClient.getNotes();
        setNotes(fetchedNotes);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [token, apiClient]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.title.trim()) return;
    
    try {
      const createdNote = await apiClient.createNote(newNote.title, newNote.content);
      setNotes(prev => [createdNote, ...prev]); // Add to the beginning of the list
      setNewNote({ title: '', content: '' });
      setIsCreateDialogOpen(false);
      setShowUpgradeAlert(false); // Hide any previous upgrade alert
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
      
      // Check if it's a note limit error
      if (errorMessage.includes('limit') && errorMessage.includes('Free plan')) {
        setShowUpgradeAlert(true);
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await apiClient.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
      setShowUpgradeAlert(false); // Hide any previous upgrade alert
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading your notes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-6 bg-white rounded-lg shadow">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {currentUser && (
              <p className="text-gray-600 mt-1">Welcome, {currentUser.email}</p>
            )}
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </header>

        {/* Upgrade Alert */}
        {showUpgradeAlert && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Upgrade Required</AlertTitle>
            <AlertDescription>
              You have reached the 3-note limit for the Free plan.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Create Note Button */}
        <div className="mb-6">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowUpgradeAlert(false)}>
                Create Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Note title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Note content (optional)"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Note</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No notes yet. Create your first note!</p>
            </div>
          ) : (
            notes.map((note) => (
              <Card key={note.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  {note.content && (
                    <p className="text-gray-600 line-clamp-3">{note.content}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}