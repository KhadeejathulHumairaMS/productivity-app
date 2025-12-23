'use client';

import { Todo, Goal, VisionBoardItem, Note, Book, FinancialEntry, PrayerRecord, QuranRecitation } from './types';

const STORAGE_KEYS = {
  todos: 'productivity-todos',
  goals: 'productivity-goals',
  visionBoard: 'productivity-vision-board',
  notes: 'productivity-notes',
  books: 'productivity-books',
  finances: 'productivity-finances',
  prayers: 'productivity-prayers',
  quran: 'productivity-quran',
};

export const storage = {
  todos: {
    get: (): Todo[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.todos);
      if (!data) return [];
      return JSON.parse(data).map((todo: any) => ({
        ...todo,
        reminder: todo.reminder ? new Date(todo.reminder) : undefined,
        createdAt: new Date(todo.createdAt),
      }));
    },
    set: (todos: Todo[]) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
    },
  },
  goals: {
    get: (): Goal[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.goals);
      if (!data) return [];
      return JSON.parse(data).map((goal: any) => ({
        ...goal,
        reminder: goal.reminder ? new Date(goal.reminder) : undefined,
        createdAt: new Date(goal.createdAt),
      }));
    },
    set: (goals: Goal[]) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
    },
  },
  visionBoard: {
    get: (): VisionBoardItem[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.visionBoard);
      if (!data) return [];
      return JSON.parse(data).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));
    },
    set: (items: VisionBoardItem[]) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.visionBoard, JSON.stringify(items));
    },
  },
  notes: {
    get: (): Note[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.notes);
      if (!data) return [];
      return JSON.parse(data).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    },
    set: (notes: Note[]) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
    },
  },
  books: {
    get: (): Book[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.books);
      if (!data) return [];
      return JSON.parse(data).map((book: any) => ({
        ...book,
        completedDate: book.completedDate ? new Date(book.completedDate) : undefined,
        startedDate: book.startedDate ? new Date(book.startedDate) : undefined,
      }));
    },
    set: (books: Book[]) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.books, JSON.stringify(books));
    },
  },
  finances: {
    get: (): FinancialEntry[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.finances);
      if (!data) return [];
      return JSON.parse(data).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      }));
    },
    set: (entries: FinancialEntry[]) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.finances, JSON.stringify(entries));
    },
  },
  prayers: {
    get: (): PrayerRecord[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.prayers);
      if (!data) return [];
      return JSON.parse(data);
    },
    set: (records: PrayerRecord[]) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.prayers, JSON.stringify(records));
    },
  },
  quran: {
    get: (): QuranRecitation[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.quran);
      if (!data) return [];
      return JSON.parse(data).map((recitation: any) => ({
        ...recitation,
        date: new Date(recitation.date),
      }));
    },
    set: (recitations: QuranRecitation[]) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.quran, JSON.stringify(recitations));
    },
  },
};

