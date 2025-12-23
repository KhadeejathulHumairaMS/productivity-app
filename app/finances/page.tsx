'use client';

import { useState, useEffect } from 'react';
import { FinancialEntry } from '@/lib/types';
import { storage } from '@/lib/storage';
import { Plus, Trash2, Edit2, DollarSign, TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { usePageTitle } from '@/lib/usePageTitle';

export default function FinancesPage() {
  usePageTitle('Financial Tracker | Personal Productivity Hub');
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'expense' as 'salary' | 'expense' | 'savings' | 'investment',
    amount: '',
    description: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    setEntries(storage.finances.get());
  }, []);

  const saveEntries = (updatedEntries: FinancialEntry[]) => {
    setEntries(updatedEntries);
    storage.finances.set(updatedEntries);
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description.trim()) return;

    if (editingId) {
      saveEntries(
        entries.map((entry) =>
          entry.id === editingId
            ? {
                ...entry,
                ...formData,
                amount: parseFloat(formData.amount),
                date: new Date(formData.date),
              }
            : entry
        )
      );
    } else {
      const entry: FinancialEntry = {
        id: Date.now().toString(),
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category || undefined,
        date: new Date(formData.date),
      };
      saveEntries([...entries, entry]);
    }
    resetForm();
  };

  const startEdit = (entry: FinancialEntry) => {
    setEditingId(entry.id);
    setFormData({
      type: entry.type,
      amount: entry.amount.toString(),
      description: entry.description,
      category: entry.category || '',
      date: format(entry.date, 'yyyy-MM-dd'),
    });
    setShowForm(true);
  };

  const deleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      saveEntries(entries.filter((entry) => entry.id !== id));
    }
  };

  // Calculate totals
  const salary = entries
    .filter((e) => e.type === 'salary')
    .reduce((sum, e) => sum + e.amount, 0);
  const expenses = entries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  const savings = entries
    .filter((e) => e.type === 'savings')
    .reduce((sum, e) => sum + e.amount, 0);
  const investments = entries
    .filter((e) => e.type === 'investment')
    .reduce((sum, e) => sum + e.amount, 0);
  const netIncome = salary - expenses - savings - investments;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'salary':
        return <TrendingUp size={20} className="text-green-600" />;
      case 'expense':
        return <TrendingDown size={20} className="text-red-600" />;
      case 'savings':
        return <PiggyBank size={20} className="text-blue-600" />;
      case 'investment':
        return <Wallet size={20} className="text-purple-600" />;
      default:
        return <DollarSign size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'salary':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'expense':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      case 'savings':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'investment':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Financial Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your salary, expenses, savings, and investments
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">Salary</span>
            <TrendingUp size={24} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${salary.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">Expenses</span>
            <TrendingDown size={24} className="text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${expenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">Savings</span>
            <PiggyBank size={24} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${savings.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">Net Income</span>
            <DollarSign size={24} className={netIncome >= 0 ? 'text-green-600' : 'text-red-600'} />
          </div>
          <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netIncome.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'salary' | 'expense' | 'savings' | 'investment',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="salary">Salary</option>
                <option value="expense">Expense</option>
                <option value="savings">Savings</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category (optional)
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Food, Rent, Utilities"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Entry
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

      {/* Entries List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            All Entries ({entries.length})
          </h2>
        </div>
        {entries.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No entries yet. Add one to get started!
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {entries
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={getTypeColor(entry.type) + ' p-2 rounded-lg'}>
                        {getTypeIcon(entry.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {entry.description}
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              entry.type === 'salary'
                                ? 'text-green-600'
                                : entry.type === 'expense'
                                ? 'text-red-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {entry.type === 'expense' ? '-' : '+'}${entry.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span>{format(entry.date, 'MMM dd, yyyy')}</span>
                          {entry.category && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                              {entry.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(entry)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
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
    </div>
  );
}

