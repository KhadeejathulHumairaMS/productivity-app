"use client";

import { supabase } from "@/lib/supabaseClient";
import { Goal } from "@/lib/types";

const TABLE = "goals";

const clientOrThrow = () => {
  if (!supabase) throw new Error("Supabase client not initialised. Check env vars.");
  return supabase;
};

export async function fetchGoals(): Promise<Goal[]> {
  const client = clientOrThrow();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    reminder: row.reminder ? new Date(row.reminder) : undefined,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    type: row.type,
  }));
}

export async function addGoal(goal: Goal) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).insert({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    image_url: goal.imageUrl,
    reminder: goal.reminder ? goal.reminder.toISOString() : null,
    created_at: goal.createdAt.toISOString(),
    type: goal.type,
  });
  if (error) throw error;
}

export async function updateGoal(id: string, updates: Partial<Goal>) {
  const client = clientOrThrow();
  const { error } = await client
    .from(TABLE)
    .update({
      title: updates.title,
      description: updates.description,
      image_url: updates.imageUrl,
      reminder: updates.reminder ? updates.reminder.toISOString() : null,
      type: updates.type,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteGoal(id: string) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

