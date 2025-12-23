'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/lib/types';
import { Plus, Trash2, Edit2, FileText, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { usePageTitle } from '@/lib/usePageTitle';
import { fetchNotes, addNote as addNoteRemote, updateNote as updateNoteRemote, deleteNote as deleteNoteRemote } from '@/lib/data/notes';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function NotesPage() {
  usePageTitle('Notes | Personal Productivity Hub');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNotes();
        setNotes(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load notes from Supabase.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setFormData({ title: '', content: '' });
    setShowForm(false);
    setEditingId(null);
    setSelectedNote(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      const updated = notes.map((note) =>
        note.id === editingId
          ? {
              ...note,
              title: formData.title,
              content: formData.content,
              updatedAt: new Date(),
            }
          : note
      );
      setNotes(updated);
      updateNoteRemote(editingId, {
        title: formData.title,
        content: formData.content,
        updatedAt: new Date(),
      }).catch((err) => {
        console.error(err);
        setError('Failed to update note in Supabase.');
      });
    } else {
      const note: Note = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes([...notes, note]);
      addNoteRemote(note).catch((err) => {
        console.error(err);
        setError('Failed to add note to Supabase.');
      });
    }
    resetForm();
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setFormData({ title: note.title, content: note.content });
    setSelectedNote(note);
    setShowForm(true);
  };

  const deleteNote = (id: string) => {
    setConfirmDeleteId(id);
  };

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Notes & Writings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Write and save your personal thoughts and ideas
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          New Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={20} />
              All Notes ({notes.length})
            </h2>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading notes...</p>
            ) : notes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No notes yet. Create one to get started!
              </p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {notes
                  .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                  .map((note) => (
                    <div
                      key={note.id}
                      onClick={() => openNote(note)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedNote?.id === note.id
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {note.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {format(note.updatedAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Note Editor/Viewer */}
        <div className="lg:col-span-2">
          {showForm ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {editingId ? 'Edit Note' : 'New Note'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save size={18} />
                    {editingId ? 'Update' : 'Save'} Note
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : selectedNote ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedNote.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {format(selectedNote.createdAt, 'MMM dd, yyyy HH:mm')} | Updated:{' '}
                    {format(selectedNote.updatedAt, 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(selectedNote)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => deleteNote(selectedNote.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedNote.content || 'No content'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                Select a note from the list or create a new one
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete note?"
        message="This will remove the note permanently."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            setNotes(notes.filter((note) => note.id !== confirmDeleteId));
            deleteNoteRemote(confirmDeleteId).catch((err) => {
              console.error(err);
              setError('Failed to delete note in Supabase.');
            });
            if (selectedNote?.id === confirmDeleteId) {
              setSelectedNote(null);
            }
            setConfirmDeleteId(null);
          }
        }}
      />
    </div>
  );
}

