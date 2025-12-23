'use client';

import { useState, useEffect } from 'react';
import { Goal } from '@/lib/types';
import { Plus, Trash2, Edit2, Target, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { usePageTitle } from '@/lib/usePageTitle';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { addGoal, deleteGoal as deleteGoalRemote, fetchGoals, updateGoal as updateGoalRemote } from '@/lib/data/goals';

export default function GoalsPage() {
  usePageTitle('Goals | Personal Productivity Hub');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    reminder: '',
    type: 'short-term' as 'short-term' | 'long-term',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchGoals();
        setGoals(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load goals from Supabase.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      reminder: '',
      type: 'short-term',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      const updated = goals.map((goal) =>
        goal.id === editingId
          ? {
              ...goal,
              ...formData,
              reminder: formData.reminder ? new Date(formData.reminder) : undefined,
            }
          : goal
      );
      setGoals(updated);
      updateGoalRemote(editingId, {
        ...formData,
        reminder: formData.reminder ? new Date(formData.reminder) : undefined,
      }).catch((err) => {
        console.error(err);
        setError('Failed to update goal in Supabase.');
      });
    } else {
      const goal: Goal = {
        id: Date.now().toString(),
        ...formData,
        reminder: formData.reminder ? new Date(formData.reminder) : undefined,
        createdAt: new Date(),
      };
      setGoals([...goals, goal]);
      addGoal(goal).catch((err) => {
        console.error(err);
        setError('Failed to add goal to Supabase.');
      });
    }
    resetForm();
  };

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setFormData({
      title: goal.title,
      description: goal.description,
      imageUrl: goal.imageUrl || '',
      reminder: goal.reminder ? format(goal.reminder, 'yyyy-MM-dd\'T\'HH:mm') : '',
      type: goal.type,
    });
    setShowForm(true);
  };

  const deleteGoal = (id: string) => {
    setConfirmDeleteId(id);
  };

  const shortTermGoals = goals.filter((g) => g.type === 'short-term');
  const longTermGoals = goals.filter((g) => g.type === 'long-term');

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
            Goals
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set and track your short-term and long-term goals
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Goal
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goal Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'short-term' | 'long-term' })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="short-term">Short-Term</option>
                <option value="long-term">Long-Term</option>
              </select>
            </div>
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
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Image
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, imageUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="Or paste image URL here"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {formData.imageUrl && (
                  <div className="relative">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reminder
              </label>
              <input
                type="datetime-local"
                value={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Goal
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

      {/* Short-Term Goals */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target size={24} />
          Short-Term Goals
        </h2>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Loading goals...
          </p>
        ) : shortTermGoals.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No short-term goals yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortTermGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                {goal.imageUrl && (
                  <img
                    src={goal.imageUrl}
                    alt={goal.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {goal.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                    {goal.description}
                  </p>
                  {goal.reminder && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <Bell size={14} />
                      <span>{format(new Date(goal.reminder), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(goal)}
                      className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <Edit2 size={16} className="inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Long-Term Goals */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target size={24} />
          Long-Term Goals
        </h2>
        {longTermGoals.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No long-term goals yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {longTermGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                {goal.imageUrl && (
                  <img
                    src={goal.imageUrl}
                    alt={goal.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {goal.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                    {goal.description}
                  </p>
                  {goal.reminder && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <Bell size={14} />
                      <span>{format(new Date(goal.reminder), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(goal)}
                      className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <Edit2 size={16} className="inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                    >
                      <Trash2 size={16} />
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
        title="Delete goal?"
        message="This will remove the goal from your list."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            setGoals(goals.filter((goal) => goal.id !== confirmDeleteId));
            deleteGoalRemote(confirmDeleteId).catch((err) => {
              console.error(err);
              setError('Failed to delete goal in Supabase.');
            });
            setConfirmDeleteId(null);
          }
        }}
      />
    </div>
  );
}

