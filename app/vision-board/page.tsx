'use client';

import { useState, useEffect } from 'react';
import { VisionBoardItem } from '@/lib/types';
import { Plus, Trash2, Edit2, Image as ImageIcon, Quote } from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';
import { addVisionItem, deleteVisionItem, fetchVisionBoard, updateVisionItem } from '@/lib/data/visionBoard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { getDirectImageUrl } from '@/lib/imageUtils';

export default function VisionBoardPage() {
  usePageTitle('Vision Board | Personal Productivity Hub');
  const [items, setItems] = useState<VisionBoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: '',
    quote: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchVisionBoard();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load vision board from Supabase.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setFormData({ imageUrl: '', quote: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim() && !formData.quote.trim()) {
      alert('Please add either an image URL or a quote');
      return;
    }

    if (editingId) {
      const updated = items.map((item) =>
        item.id === editingId ? { ...item, ...formData } : item
      );
      setItems(updated);
      updateVisionItem(editingId, { ...formData }).catch((err) => {
        console.error(err);
        setError('Failed to update item in Supabase.');
      });
    } else {
      const item: VisionBoardItem = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
      };
      setItems([...items, item]);
      addVisionItem(item).catch((err) => {
        console.error(err);
        setError('Failed to add item to Supabase.');
      });
    }
    resetForm();
  };

  const startEdit = (item: VisionBoardItem) => {
    setEditingId(item.id);
    setFormData({
      imageUrl: item.imageUrl || '',
      quote: item.quote || '',
    });
    setShowForm(true);
  };

  const deleteItem = (id: string) => {
    setConfirmDeleteId(id);
  };

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
            Vision Board
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add images and motivational quotes to inspire you
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: For Unsplash images, right-click the image and select "Copy image address" to get the direct URL
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivational Quote
              </label>
              <textarea
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                rows={4}
                placeholder="Enter an inspiring quote..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Item
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

      {/* Vision Board Items */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Loading vision board...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p>No items yet. Add images or quotes to build your vision board!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden relative group"
            >
              {item.imageUrl && item.imageUrl.trim() !== '' && (
                <div className="relative h-64 bg-gray-100 dark:bg-gray-700">
                  <img
                    src={getDirectImageUrl(item.imageUrl)}
                    alt="Vision board"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load. Original URL:', item.imageUrl || 'N/A', 'Converted URL:', getDirectImageUrl(item.imageUrl));
                      const img = e.target as HTMLImageElement;
                      const parent = img.parentElement;
                      if (parent) {
                        img.style.display = 'none';
                        // Show error message
                        if (!parent.querySelector('.image-error-msg')) {
                          const errorMsg = document.createElement('div');
                          errorMsg.className = 'image-error-msg absolute inset-0 flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700';
                          errorMsg.innerHTML = `
                            <div class="text-center text-gray-500 dark:text-gray-400">
                              <p class="text-sm font-medium mb-1">⚠️ Image failed to load</p>
                              <p class="text-xs">Please use a direct image URL</p>
                              <p class="text-xs mt-1 opacity-75">For Unsplash: Right-click image → Copy image address</p>
                            </div>
                          `;
                          parent.appendChild(errorMsg);
                        }
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
              {item.quote && (
                <div className="p-6 relative">
                  <Quote size={24} className="text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-lg italic text-gray-800 dark:text-gray-200">
                    "{item.quote}"
                  </p>
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete item?"
        message="This will remove the item from your vision board."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            setItems(items.filter((item) => item.id !== confirmDeleteId));
            deleteVisionItem(confirmDeleteId).catch((err) => {
              console.error(err);
              setError('Failed to delete item in Supabase.');
            });
            setConfirmDeleteId(null);
          }
        }}
      />
    </div>
  );
}

