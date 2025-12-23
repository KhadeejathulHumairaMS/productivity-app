'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { storage } from '@/lib/storage';
import type {
  Todo,
  Goal,
  Book,
  FinancialEntry,
  PrayerRecord,
  QuranRecitation,
} from '@/lib/types';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  BookOpen,
  IndianRupee,
  Clock,
  BookMarked,
  ChevronRight,
} from 'lucide-react';
import { format, isToday, isSameDay } from 'date-fns';
import { usePageTitle } from '@/lib/usePageTitle';
import { fetchPrayers } from '@/lib/data/prayers';
import { fetchTodos } from '@/lib/data/todos';
import { fetchGoals } from '@/lib/data/goals';
import { fetchBooks } from '@/lib/data/books';
import { fetchFinances } from '@/lib/data/finances';
import { fetchQuran } from '@/lib/data/quran';

export default function DashboardPage() {
  usePageTitle('Dashboard | Personal Productivity Hub');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [finances, setFinances] = useState<FinancialEntry[]>([]);
  const [prayers, setPrayers] = useState<PrayerRecord[]>([]);
  const [quran, setQuran] = useState<QuranRecitation[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          todosData,
          goalsData,
          booksData,
          financesData,
          prayersData,
          quranData,
        ] = await Promise.all([
          fetchTodos().catch(() => storage.todos.get()),
          fetchGoals().catch(() => storage.goals.get()),
          fetchBooks().catch(() => storage.books.get()),
          fetchFinances().catch(() => storage.finances.get()),
          fetchPrayers().catch(() => storage.prayers.get()),
          fetchQuran().catch(() => storage.quran.get()),
        ]);
        setTodos(todosData);
        setGoals(goalsData);
        setBooks(booksData);
        setFinances(financesData);
        setPrayers(prayersData);
        setQuran(quranData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };
    load();
  }, []);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const overdueTodos = useMemo(
    () =>
      todos.filter(
        (t) =>
          !t.completed &&
          t.reminder &&
          new Date(t.reminder) < today
      ),
    [todos, today]
  );

  const todayTodos = useMemo(
    () =>
      todos.filter(
        (t) =>
          !t.completed &&
          t.reminder &&
          isToday(new Date(t.reminder))
      ),
    [todos]
  );

  const completedTodosToday = useMemo(
    () =>
      todos.filter(
        (t) =>
          t.completed &&
          isToday(new Date(t.createdAt))
      ),
    [todos]
  );

  const shortTermGoals = goals.filter((g) => g.type === 'short-term');
  const longTermGoals = goals.filter((g) => g.type === 'long-term');

  const inProgressBooks = books.filter((b) => b.status === 'in-progress');
  const completedBooks = books.filter((b) => b.status === 'completed');

  const todayPrayerRecord: PrayerRecord | undefined = prayers.find(
    (p) => p.date === todayStr
  );
  const todayPrayerCount = todayPrayerRecord
    ? [
        todayPrayerRecord.fajr,
        todayPrayerRecord.dhuhr,
        todayPrayerRecord.asr,
        todayPrayerRecord.maghrib,
        todayPrayerRecord.isha,
      ].filter(Boolean).length
    : 0;

  const todayQuranCount = quran.filter((r) => isToday(r.date)).length;

  const monthKey = format(today, 'yyyy-MM');
  const monthFinances = finances.filter(
    (f) => format(f.date, 'yyyy-MM') === monthKey
  );
  const salary = monthFinances
    .filter((e) => e.type === 'salary')
    .reduce((sum, e) => sum + e.amount, 0);
  const expenses = monthFinances
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  const savings = monthFinances
    .filter((e) => e.type === 'savings')
    .reduce((sum, e) => sum + e.amount, 0);
  const investments = monthFinances
    .filter((e) => e.type === 'investment')
    .reduce((sum, e) => sum + e.amount, 0);
  const net = salary - expenses - savings - investments;

  const latestQuran = [...quran].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )[0];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard className="text-blue-600" size={28} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your day across tasks, worship, goals, and finances
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {format(today, 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700"
          >
            <CheckSquare size={16} />
            Todos
          </Link>
          <Link
            href="/prayers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700"
          >
            <Clock size={16} />
            Prayers
          </Link>
          <Link
            href="/quran"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700"
          >
            <BookMarked size={16} />
            Quran
          </Link>
        </div>
      </div>

      {/* Top Grid: Worship + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Prayer Today */}
        <Link
          href="/prayers"
          className="group bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-md border border-gray-200/70 dark:border-gray-800/70 p-5 flex flex-col justify-between hover:border-blue-400 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Today
              </p>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Prayer Tracker
              </h2>
            </div>
            <Clock className="text-blue-500" size={26} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {todayPrayerCount} / 5 prayers completed
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-3">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(todayPrayerCount / 5) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Fajr • Dhuhr • Asr • Maghrib • Isha
            </span>
            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
              Open <ChevronRight size={14} />
            </span>
          </div>
        </Link>

        {/* Quran Today */}
        <Link
          href="/quran"
          className="group bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-md border border-gray-200/70 dark:border-gray-800/70 p-5 flex flex-col justify-between hover:border-blue-400 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Today
              </p>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Quran Recitation
              </h2>
            </div>
            <BookMarked className="text-emerald-500" size={26} />
          </div>
          {todayQuranCount === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              No recitation logged yet for today.
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {todayQuranCount} recitation{todayQuranCount > 1 ? 's' : ''} logged today.
            </p>
          )}
          {latestQuran && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Last: {latestQuran.surah} ({latestQuran.verses}) on{' '}
              {format(latestQuran.date, 'MMM dd')}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Keep your daily connection consistent.</span>
            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
              Log recitation <ChevronRight size={14} />
            </span>
          </div>
        </Link>

        {/* Tasks Today */}
        <Link
          href="/"
          className="group bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-md border border-gray-200/70 dark:border-gray-800/70 p-5 flex flex-col justify-between hover:border-blue-400 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Today
              </p>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Tasks Overview
              </h2>
            </div>
            <CheckSquare className="text-indigo-500" size={26} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {todayTodos.length} task{todayTodos.length !== 1 ? 's' : ''} due today
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
            {overdueTodos.length} overdue task{overdueTodos.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {completedTodosToday.length} completed today
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Stay ahead of your most important items.</span>
            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
              Open todos <ChevronRight size={14} />
            </span>
          </div>
        </Link>
      </div>

      {/* Second Grid: Goals, Books, Finances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Goals */}
        <Link
          href="/goals"
          className="group bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-md border border-gray-200/70 dark:border-gray-800/70 p-5 flex flex-col justify-between hover:border-blue-400 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Goals
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Short-term and long-term focus
              </p>
            </div>
            <Target className="text-pink-500" size={26} />
          </div>
          <div className="flex items-center gap-6 mb-3">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {shortTermGoals.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Short-term goals
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {longTermGoals.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Long-term goals
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>Review and refresh your priorities.</span>
            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
              View goals <ChevronRight size={14} />
            </span>
          </p>
        </Link>

        {/* Books */}
        <Link
          href="/books"
          className="group bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-md border border-gray-200/70 dark:border-gray-800/70 p-5 flex flex-col justify-between hover:border-blue-400 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Books
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reading journey
              </p>
            </div>
            <BookOpen className="text-violet-500" size={26} />
          </div>
          <div className="flex items-center gap-6 mb-3">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {inProgressBooks.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                In progress
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedBooks.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completed
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>Keep your mind growing.</span>
            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
              View books <ChevronRight size={14} />
            </span>
          </p>
        </Link>

        {/* Finances */}
        <Link
          href="/finances"
          className="group bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-md border border-gray-200/70 dark:border-gray-800/70 p-5 flex flex-col justify-between hover:border-blue-400 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                This Month&apos;s Finances
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Salary, expenses, savings &amp; investments
              </p>
            </div>
            <IndianRupee className="text-emerald-500" size={26} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Salary</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(salary)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Expenses</p>
              <p className="font-semibold text-red-600">
                -{formatCurrency(expenses)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Savings</p>
              <p className="font-semibold text-blue-600">
                -{formatCurrency(savings)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Investments</p>
              <p className="font-semibold text-purple-600">
                -{formatCurrency(investments)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`text-sm font-semibold ${
                net >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              Net: {net >= 0 ? '+' : '-'}{formatCurrency(Math.abs(net))}
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              Open finances <ChevronRight size={14} />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}


