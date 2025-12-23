'use client';

import { useState, useEffect } from 'react';
import { Todo } from '@/lib/types';
import { Plus, Trash2, Edit2, Check, X, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { usePageTitle } from '@/lib/usePageTitle';
import { addTodo, deleteTodo as deleteTodoRemote, fetchTodos, updateTodo as updateTodoRemote } from '@/lib/data/todos';

export default function TodosPage() {
  usePageTitle('Todos | Personal Productivity Hub');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [showReminderInput, setShowReminderInput] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTodos();
        setTodos(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load todos from Supabase.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      reminder: reminderDate ? new Date(reminderDate) : undefined,
      createdAt: new Date(),
    };
    
    setTodos((prev) => [...prev, todo]);
    setNewTodo('');
    setReminderDate('');
    try {
      await addTodo(todo);
    } catch (err: any) {
      console.error(err);
      setError('Failed to add todo to Supabase.');
    }
  };

  const toggleComplete = (id: string) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updated);
    const target = updated.find((t) => t.id === id);
    if (target) {
      updateTodoRemote(id, { completed: target.completed }).catch((err) => {
        console.error(err);
        setError('Failed to update todo in Supabase.');
      });
    }
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    deleteTodoRemote(id).catch((err) => {
      console.error(err);
      setError('Failed to delete todo in Supabase.');
    });
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setReminderDate(todo.reminder ? format(todo.reminder, 'yyyy-MM-dd\'T\'HH:mm') : '');
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingId) return;
    
    const updated = todos.map((todo) =>
      todo.id === editingId
        ? {
            ...todo,
            text: editText,
            reminder: reminderDate ? new Date(reminderDate) : undefined,
          }
        : todo
    );
    setTodos(updated);
    updateTodoRemote(editingId, {
      text: editText,
      reminder: reminderDate ? new Date(reminderDate) : undefined,
    }).catch((err) => {
      console.error(err);
      setError('Failed to save todo in Supabase.');
    });
    
    setEditingId(null);
    setEditText('');
    setReminderDate('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setReminderDate('');
  };

  const checkReminders = () => {
    const now = new Date();
    todos.forEach((todo) => {
      if (todo.reminder && !todo.completed && new Date(todo.reminder) <= now) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Reminder: ${todo.text}`, {
            body: 'This task is due now!',
            icon: '/favicon.ico',
          });
        }
      }
    });
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders();
    
    return () => clearInterval(interval);
  }, [todos]);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Todo List
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your daily tasks and set reminders
        </p>
      </div>

      {/* Add Todo Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="datetime-local"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleAddTodo}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </div>
      </div>

      {/* Todos List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading todos...
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No tasks yet. Add one above to get started!
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-start gap-4 ${
                todo.completed ? 'opacity-60' : ''
              }`}
            >
              <button
                onClick={() => toggleComplete(todo.id)}
                className={`mt-1 p-1 rounded ${
                  todo.completed
                    ? 'bg-green-500 text-white'
                    : 'border-2 border-gray-300 dark:border-gray-600'
                }`}
              >
                {todo.completed && <Check size={16} />}
              </button>

              <div className="flex-1">
                {editingId === todo.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="datetime-local"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p
                      className={`text-lg ${
                        todo.completed
                          ? 'line-through text-gray-500 dark:text-gray-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {todo.text}
                    </p>
                    {todo.reminder && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <Bell size={14} />
                        <span>
                          Reminder: {format(new Date(todo.reminder), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {editingId !== todo.id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(todo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
