'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/lib/types';
import { Plus, Trash2, Edit2, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { usePageTitle } from '@/lib/usePageTitle';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  fetchBooks,
  addBook as addBookRemote,
  updateBook as updateBookRemote,
  deleteBook as deleteBookRemote,
} from '@/lib/data/books';
import { getDirectImageUrl } from '@/lib/imageUtils';

export default function BooksPage() {
  usePageTitle('Books Tracker | Personal Productivity Hub');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    status: 'in-progress' as 'completed' | 'in-progress',
    imageUrl: '',
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchBooks();
        setBooks(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load books from Supabase.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      status: 'in-progress',
      imageUrl: '',
      notes: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) return;

    if (editingId) {
      const updated = books.map((book) =>
        book.id === editingId
          ? {
              ...book,
              ...formData,
              completedDate:
                formData.status === 'completed' && book.status !== 'completed'
                  ? new Date()
                  : book.completedDate,
              startedDate: book.startedDate || new Date(),
            }
          : book
      );
      setBooks(updated);
      const target = updated.find((b) => b.id === editingId);
      updateBookRemote(editingId, {
        title: formData.title,
        author: formData.author,
        status: formData.status,
        imageUrl: formData.imageUrl,
        notes: formData.notes,
        completedDate: target?.completedDate,
        startedDate: target?.startedDate,
      }).catch((err) => {
        console.error(err);
        setError('Failed to update book in Supabase.');
      });
    } else {
      const book: Book = {
        id: Date.now().toString(),
        ...formData,
        startedDate: new Date(),
        completedDate: formData.status === 'completed' ? new Date() : undefined,
      };
      setBooks([...books, book]);
      addBookRemote(book).catch((err) => {
        console.error(err);
        setError('Failed to add book to Supabase.');
      });
    }
    resetForm();
  };

  const startEdit = (book: Book) => {
    setEditingId(book.id);
    setFormData({
      title: book.title,
      author: book.author,
      status: book.status,
      imageUrl: book.imageUrl || '',
      notes: book.notes || '',
    });
    setShowForm(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const deleteBook = (id: string) => {
    setConfirmDeleteId(id);
  };

  const markAsCompleted = (id: string) => {
    const updated: Book[] = books.map((book) =>
      book.id === id
        ? {
            ...book,
            status: 'completed',
            completedDate: new Date(),
          }
        : book
    );
    setBooks(updated);
    const target = updated.find((b) => b.id === id);
    if (target) {
      updateBookRemote(id, { status: 'completed', completedDate: target.completedDate }).catch(
        (err) => {
          console.error(err);
          setError('Failed to update book in Supabase.');
        }
      );
    }
  };

  const inProgressBooks = books.filter((b) => b.status === 'in-progress');
  const completedBooks = books.filter((b) => b.status === 'completed');

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Books Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your reading progress
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Book
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
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
                Author *
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'completed' | 'in-progress' })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cover Image
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white hover:file:bg-blue-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Upload a cover image (stored locally in your browser).
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Tip: For Unsplash images, right-click the image and select "Copy image address" to get the direct URL
                  </p>
                </div>
              </div>
              {formData.imageUrl && formData.imageUrl.trim() !== '' && (
                <div className="mt-3 relative">
                  <img
                    src={getDirectImageUrl(formData.imageUrl)}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      console.error('Preview image failed to load:', formData.imageUrl);
                      const img = e.target as HTMLImageElement;
                      const parent = img.parentElement;
                      if (parent) {
                        img.style.display = 'none';
                        if (!parent.querySelector('.image-error-msg')) {
                          const errorMsg = document.createElement('div');
                          errorMsg.className = 'image-error-msg w-full h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700';
                          errorMsg.innerHTML = `
                            <p class="text-xs text-gray-500 dark:text-gray-400 text-center px-2">Preview failed to load. Please check the URL.</p>
                          `;
                          parent.appendChild(errorMsg);
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Your thoughts about this book..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Book
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* In Progress Books */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock size={24} />
          In Progress ({inProgressBooks.length})
        </h2>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading books...</p>
        ) : inProgressBooks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No books in progress
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
                  <div className="flex gap-2">
                    <button
                      onClick={() => markAsCompleted(book.id)}
                      className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                      title="Mark as completed"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      onClick={() => startEdit(book)}
                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteBook(book.id)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {book.title}
                </h3>
                {book.imageUrl && book.imageUrl.trim() !== '' && (
                  <div className="relative mb-3">
                    <img
                      src={getDirectImageUrl(book.imageUrl)}
                      alt={book.title}
                      className="w-full h-40 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        console.error('Book cover failed to load. Original URL:', book.imageUrl || 'N/A', 'Converted URL:', getDirectImageUrl(book.imageUrl));
                        const img = e.target as HTMLImageElement;
                        const parent = img.parentElement;
                        if (parent) {
                          img.style.display = 'none';
                          if (!parent.querySelector('.image-error-msg')) {
                            const errorMsg = document.createElement('div');
                            errorMsg.className = 'image-error-msg w-full h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700';
                            errorMsg.innerHTML = `
                              <p class="text-xs text-gray-500 dark:text-gray-400 text-center px-2">Cover image failed to load</p>
                            `;
                            parent.appendChild(errorMsg);
                          }
                        }
                      }}
                    />
                  </div>
                )}
                <p className="text-gray-600 dark:text-gray-400 mb-2">by {book.author}</p>
                {book.startedDate && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Started: {format(book.startedDate, 'MMM dd, yyyy')}
                  </p>
                )}
                {book.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                    "{book.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Books */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle size={24} />
          Completed ({completedBooks.length})
        </h2>
        {completedBooks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No completed books yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(book)}
                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteBook(book.id)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {book.title}
                </h3>
                {book.imageUrl && book.imageUrl.trim() !== '' && (
                  <div className="relative mb-3">
                    <img
                      src={getDirectImageUrl(book.imageUrl)}
                      alt={book.title}
                      className="w-full h-40 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        console.error('Book cover failed to load. Original URL:', book.imageUrl || 'N/A', 'Converted URL:', getDirectImageUrl(book.imageUrl));
                        const img = e.target as HTMLImageElement;
                        const parent = img.parentElement;
                        if (parent) {
                          img.style.display = 'none';
                          if (!parent.querySelector('.image-error-msg')) {
                            const errorMsg = document.createElement('div');
                            errorMsg.className = 'image-error-msg w-full h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700';
                            errorMsg.innerHTML = `
                              <p class="text-xs text-gray-500 dark:text-gray-400 text-center px-2">Cover image failed to load</p>
                            `;
                            parent.appendChild(errorMsg);
                          }
                        }
                      }}
                    />
                  </div>
                )}
                <p className="text-gray-600 dark:text-gray-400 mb-2">by {book.author}</p>
                {book.completedDate && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Completed: {format(book.completedDate, 'MMM dd, yyyy')}
                  </p>
                )}
                {book.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                    "{book.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete book?"
        message="This will remove the book from your tracker."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            setBooks(books.filter((book) => book.id !== confirmDeleteId));
            deleteBookRemote(confirmDeleteId).catch((err) => {
              console.error(err);
              setError('Failed to delete book in Supabase.');
            });
            setConfirmDeleteId(null);
          }
        }}
      />
    </div>
  );
}

