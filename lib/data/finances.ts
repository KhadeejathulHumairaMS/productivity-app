"use client";

import { supabase } from "@/lib/supabaseClient";
import { FinancialEntry } from "@/lib/types";

const TABLE = "finances";

const clientOrThrow = () => {
  if (!supabase) throw new Error("Supabase client not initialised. Check env vars.");
  return supabase;
};

export async function fetchFinances(): Promise<FinancialEntry[]> {
  const client = clientOrThrow();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    description: row.description,
    date: row.date ? new Date(row.date) : new Date(),
    category: row.category ?? undefined,
  }));
}

export async function addFinance(entry: FinancialEntry) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).insert({
    id: entry.id,
    type: entry.type,
    amount: entry.amount,
    description: entry.description,
    date: entry.date.toISOString(),
    category: entry.category ?? null,
  });
  if (error) throw error;
}

export async function updateFinance(id: string, updates: Partial<FinancialEntry>) {
  const client = clientOrThrow();
  const { error } = await client
    .from(TABLE)
    .update({
      type: updates.type,
      amount: updates.amount,
      description: updates.description,
      date: updates.date ? updates.date.toISOString() : null,
      category: updates.category ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteFinance(id: string) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

