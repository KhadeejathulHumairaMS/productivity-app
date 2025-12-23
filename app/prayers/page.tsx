'use client';

import { useState, useEffect } from 'react';
import { PrayerRecord } from '@/lib/types';
import { CheckCircle, Circle, Calendar, TrendingUp, Trash2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { usePageTitle } from '@/lib/usePageTitle';
import { fetchPrayers, upsertPrayer } from '@/lib/data/prayers';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const PRAYERS = [
  { key: 'fajr', label: 'Fajr', time: 'Dawn' },
  { key: 'dhuhr', label: 'Dhuhr', time: 'Noon' },
  { key: 'asr', label: 'Asr', time: 'Afternoon' },
  { key: 'maghrib', label: 'Maghrib', time: 'Sunset' },
  { key: 'isha', label: 'Isha', time: 'Night' },
] as const;

export default function PrayersPage() {
  usePageTitle('Prayer Tracker | Personal Productivity Hub');
  const [records, setRecords] = useState<PrayerRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmClearDate, setConfirmClearDate] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPrayers();
        setRecords(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load prayers from Supabase.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getTodayRecord = (): PrayerRecord => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return records.find((r) => r.date === today) || {
      id: today,
      date: today,
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    };
  };

  const getDateRecord = (date: string): PrayerRecord => {
    return records.find((r) => r.date === date) || {
      id: date,
      date,
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    };
  };

  const togglePrayer = (prayerKey: keyof Omit<PrayerRecord, 'id' | 'date'>) => {
    const record = getDateRecord(selectedDate);
    const updatedRecord = {
      ...record,
      [prayerKey]: !record[prayerKey],
    };

    const existingIndex = records.findIndex((r) => r.date === selectedDate);
    let updatedRecords: PrayerRecord[];

    if (existingIndex >= 0) {
      updatedRecords = records.map((r) => (r.date === selectedDate ? updatedRecord : r));
    } else {
      updatedRecords = [...records, updatedRecord];
    }

    setRecords(updatedRecords);
    upsertPrayer(updatedRecord).catch((err) => {
      console.error(err);
      setError('Failed to save prayer record to Supabase.');
    });
  };

  const clearDay = (date: string) => {
    setConfirmClearDate(date);
  };

  const getPrayerCount = (date: string): number => {
    const record = getDateRecord(date);
    return [record.fajr, record.dhuhr, record.asr, record.maghrib, record.isha].filter(Boolean).length;
  };

  const getWeekStats = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weekRecords = weekDays.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return {
        date: dateStr,
        count: getPrayerCount(dateStr),
        record: getDateRecord(dateStr),
      };
    });

    const totalPrayers = weekRecords.reduce((sum, day) => sum + day.count, 0);
    const perfectDays = weekRecords.filter((day) => day.count === 5).length;

    return { weekRecords, totalPrayers, perfectDays };
  };

  const weekStats = getWeekStats();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Prayer Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your daily 5 prayers
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode('day')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'day'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Daily View
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'week'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Weekly View
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading prayers...</div>
      ) : viewMode === 'day' ? (
        <>
          {/* Date Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <Calendar size={24} className="text-blue-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <span className="text-gray-600 dark:text-gray-400">
                {format(parseISO(selectedDate), 'EEEE, MMMM dd, yyyy')}
              </span>
              <button
                onClick={() => clearDay(selectedDate)}
                className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Trash2 size={16} />
                Clear day
              </button>
            </div>
          </div>

          {/* Prayer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {PRAYERS.map((prayer) => {
              const record = getDateRecord(selectedDate);
              const isCompleted = record[prayer.key];
              return (
                <div
                  key={prayer.key}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
                    isCompleted ? 'border-2 border-green-500' : 'border-2 border-transparent'
                  }`}
                  onClick={() => togglePrayer(prayer.key)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {prayer.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{prayer.time}</p>
                    </div>
                    <div className={`p-3 rounded-full ${isCompleted ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {isCompleted ? (
                        <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <Circle size={32} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <TrendingUp size={24} className="text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Daily Summary
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {getPrayerCount(selectedDate)} out of 5 prayers completed
                </p>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${(getPrayerCount(selectedDate) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Weekly Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Prayers</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {weekStats.totalPrayers}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                out of {weekStats.weekRecords.length * 5} possible
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Perfect Days</h3>
              <p className="text-3xl font-bold text-green-600">
                {weekStats.perfectDays}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                days with all 5 prayers
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Average</h3>
              <p className="text-3xl font-bold text-blue-600">
                {weekStats.weekRecords.length > 0
                  ? (weekStats.totalPrayers / weekStats.weekRecords.length).toFixed(1)
                  : '0'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                prayers per day
              </p>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              This Week
            </h3>
            <div className="space-y-3">
              {weekStats.weekRecords.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedDate(day.date);
                    setViewMode('day');
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-900 dark:text-white w-32">
                      {format(parseISO(day.date), 'EEEE, MMM dd')}
                    </span>
                    <div className="flex gap-2">
                      {PRAYERS.map((prayer) => (
                        <div
                          key={prayer.key}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            day.record[prayer.key]
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          {day.record[prayer.key] ? (
                            <CheckCircle size={16} />
                          ) : (
                            <Circle size={16} className="text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {day.count}/5
                    </span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(day.count / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <ConfirmDialog
        open={!!confirmClearDate}
        title="Clear prayers for the day?"
        message="This will unmark all prayers for the selected date."
        onCancel={() => setConfirmClearDate(null)}
        onConfirm={() => {
          if (confirmClearDate) {
            const updatedRecord = {
              id: confirmClearDate,
              date: confirmClearDate,
              fajr: false,
              dhuhr: false,
              asr: false,
              maghrib: false,
              isha: false,
            };
            const existingIndex = records.findIndex((r) => r.date === confirmClearDate);
            let updatedRecords: PrayerRecord[];
            if (existingIndex >= 0) {
              updatedRecords = records.map((r) => (r.date === confirmClearDate ? updatedRecord : r));
            } else {
              updatedRecords = [...records, updatedRecord];
            }
            setRecords(updatedRecords);
            upsertPrayer(updatedRecord).catch((err) => {
              console.error(err);
              setError('Failed to clear prayers in Supabase.');
            });
            setConfirmClearDate(null);
          }
        }}
      />
    </div>
  );
}

