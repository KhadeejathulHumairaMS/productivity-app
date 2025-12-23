export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  reminder?: Date;
  createdAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  reminder?: Date;
  createdAt: Date;
  type: 'short-term' | 'long-term';
}

export interface VisionBoardItem {
  id: string;
  imageUrl?: string;
  quote?: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  status: 'completed' | 'in-progress';
  imageUrl?: string;
  completedDate?: Date;
  startedDate?: Date;
  notes?: string;
}

export interface FinancialEntry {
  id: string;
  type: 'salary' | 'expense' | 'savings' | 'investment';
  amount: number;
  description: string;
  date: Date;
  category?: string;
}

export interface PrayerRecord {
  id: string;
  date: string; // YYYY-MM-DD format
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface QuranRecitation {
  id: string;
  date: Date;
  surah: string;
  verses: string; // e.g., "1-10" or "Al-Fatiha"
  notes?: string;
  completed: boolean;
}

