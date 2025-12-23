"use client";

import { supabase } from "@/lib/supabaseClient";
import { PrayerRecord } from "@/lib/types";

const TABLE = "prayers";

const clientOrThrow = () => {
  if (!supabase) throw new Error("Supabase client not initialised. Check env vars.");
  return supabase;
};

export async function fetchPrayers(): Promise<PrayerRecord[]> {
  const client = clientOrThrow();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    date: row.date,
    fajr: row.fajr,
    dhuhr: row.dhuhr,
    asr: row.asr,
    maghrib: row.maghrib,
    isha: row.isha,
  }));
}

export async function upsertPrayer(record: PrayerRecord) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).upsert({
    id: record.id,
    date: record.date,
    fajr: record.fajr,
    dhuhr: record.dhuhr,
    asr: record.asr,
    maghrib: record.maghrib,
    isha: record.isha,
  });
  if (error) throw error;
}

