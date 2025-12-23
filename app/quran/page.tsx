'use client';

import { useState, useEffect } from 'react';
import { QuranRecitation } from '@/lib/types';
import { Plus, Trash2, Edit2, BookOpen, CheckCircle, Calendar, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { usePageTitle } from '@/lib/usePageTitle';
import {
  fetchQuran,
  addRecitation as addRecitationRemote,
  updateRecitation as updateRecitationRemote,
  deleteRecitation as deleteRecitationRemote,
} from '@/lib/data/quran';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const COMMON_SURAHS = [
  'Al-Fatiha',
  'Al-Baqarah',
  'Ali Imran',
  'An-Nisa',
  'Al-Maidah',
  'Al-Anam',
  'Al-Araf',
  'Al-Anfal',
  'At-Tawbah',
  'Yunus',
  'Hud',
  'Yusuf',
  'Ar-Rad',
  'Ibrahim',
  'Al-Hijr',
  'An-Nahl',
  'Al-Isra',
  'Al-Kahf',
  'Maryam',
  'Ta-Ha',
  'Al-Anbiya',
  'Al-Hajj',
  'Al-Muminun',
  'An-Nur',
  'Al-Furqan',
];

export default function QuranPage() {
  usePageTitle('Quran Tracker | Personal Productivity Hub');
  const [recitations, setRecitations] = useState<QuranRecitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    surah: '',
    verses: '',
    notes: '',
    completed: true,
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchQuran();
        setRecitations(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load recitations from Supabase.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setFormData({
      surah: '',
      verses: '',
      notes: '',
      completed: true,
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.surah.trim() || !formData.verses.trim()) return;

    if (editingId) {
      const updated = recitations.map((recitation) =>
        recitation.id === editingId
          ? {
              ...recitation,
              ...formData,
              date: new Date(formData.date),
            }
          : recitation
      );
      setRecitations(updated);
      updateRecitationRemote(editingId, {
        surah: formData.surah,
        verses: formData.verses,
        notes: formData.notes || '',
        completed: formData.completed,
        date: new Date(formData.date),
      }).catch((err) => {
        console.error(err);
        setError('Failed to update recitation in Supabase.');
      });
    } else {
      const recitation: QuranRecitation = {
        id: Date.now().toString(),
        surah: formData.surah,
        verses: formData.verses,
        notes: formData.notes || undefined,
        completed: formData.completed,
        date: new Date(formData.date),
      };
      setRecitations([...recitations, recitation]);
      addRecitationRemote(recitation).catch((err) => {
        console.error(err);
        setError('Failed to add recitation to Supabase.');
      });
    }
    resetForm();
  };

  const startEdit = (recitation: QuranRecitation) => {
    setEditingId(recitation.id);
    setFormData({
      surah: recitation.surah,
      verses: recitation.verses,
      notes: recitation.notes || '',
      completed: recitation.completed,
      date: format(recitation.date, 'yyyy-MM-dd'),
    });
    setShowForm(true);
  };

  const deleteRecitation = (id: string) => {
    setConfirmDeleteId(id);
  };

  const toggleComplete = (id: string) => {
    const updated = recitations.map((recitation) =>
      recitation.id === id ? { ...recitation, completed: !recitation.completed } : recitation
    );
    setRecitations(updated);
    const target = updated.find((r) => r.id === id);
    if (target) {
      updateRecitationRemote(id, { completed: target.completed }).catch((err) => {
        console.error(err);
        setError('Failed to update recitation in Supabase.');
      });
    }
  };

  const sortedRecitations = [...recitations].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const completedCount = recitations.filter((r) => r.completed).length;
  const totalCount = recitations.length;

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
            Quran Recitation Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your daily Quran recitation and progress
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Recitation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Recitations</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{completedCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-blue-600">
            {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Surah *
                </label>
                <input
                  type="text"
                  list="surahs"
                  value={formData.surah}
                  onChange={(e) => setFormData({ ...formData, surah: e.target.value })}
                  required
                  placeholder="Enter surah name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <datalist id="surahs">
                  {COMMON_SURAHS.map((surah) => (
                    <option key={surah} value={surah} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verses *
                </label>
                <input
                  type="text"
                  value={formData.verses}
                  onChange={(e) => setFormData({ ...formData, verses: e.target.value })}
                  required
                  placeholder="e.g., 1-10 or Al-Fatiha"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Your reflections or notes..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="completed"
                checked={formData.completed}
                onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="completed" className="text-sm text-gray-700 dark:text-gray-300">
                Mark as completed
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Recitation
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

      {/* Recitations List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={24} />
            Recitation History ({sortedRecitations.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            Loading recitations...
          </div>
        ) : sortedRecitations.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No recitations yet. Add one to get started!
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedRecitations.map((recitation) => (
              <div
                key={recitation.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  recitation.completed ? '' : 'opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleComplete(recitation.id)}
                      className={`p-2 rounded-lg ${
                        recitation.completed
                          ? 'bg-green-100 dark:bg-green-900 text-green-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                      }`}
                    >
                      {recitation.completed ? (
                        <CheckCircle size={24} />
                      ) : (
                        <Circle size={24} />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {recitation.surah}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                          {recitation.verses}
                        </span>
                        {recitation.completed && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(recitation.date, 'MMM dd, yyyy')}
                        </span>
                        {recitation.notes && (
                          <span className="italic">"{recitation.notes}"</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(recitation)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteRecitation(recitation.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete recitation?"
        message="This will remove the recitation entry."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            setRecitations(recitations.filter((recitation) => recitation.id !== confirmDeleteId));
            deleteRecitationRemote(confirmDeleteId).catch((err) => {
              console.error(err);
              setError('Failed to delete recitation in Supabase.');
            });
            setConfirmDeleteId(null);
          }
        }}
      />
    </div>
  );
}

