"use client";

import { supabase } from "@/lib/supabaseClient";
import { QuranRecitation } from "@/lib/types";

const TABLE = "quran";

const clientOrThrow = () => {
  if (!supabase) throw new Error("Supabase client not initialised. Check env vars.");
  return supabase;
};

export async function fetchQuran(): Promise<QuranRecitation[]> {
  const client = clientOrThrow();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    date: row.date ? new Date(row.date) : new Date(),
    surah: row.surah,
    verses: row.verses,
    notes: row.notes ?? "",
    completed: row.completed,
  }));
}

export async function addRecitation(recitation: QuranRecitation) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).insert({
    id: recitation.id,
    date: recitation.date.toISOString(),
    surah: recitation.surah,
    verses: recitation.verses,
    notes: recitation.notes ?? null,
    completed: recitation.completed,
  });
  if (error) throw error;
}

export async function updateRecitation(id: string, updates: Partial<QuranRecitation>) {
  const client = clientOrThrow();
  const { error } = await client
    .from(TABLE)
    .update({
      date: updates.date ? updates.date.toISOString() : undefined,
      surah: updates.surah,
      verses: updates.verses,
      notes: updates.notes ?? null,
      completed: updates.completed,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRecitation(id: string) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

