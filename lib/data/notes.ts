"use client";

import { supabase } from "@/lib/supabaseClient";
import { Note } from "@/lib/types";

const TABLE = "notes";

const clientOrThrow = () => {
  if (!supabase) throw new Error("Supabase client not initialised. Check env vars.");
  return supabase;
};

export async function fetchNotes(): Promise<Note[]> {
  const client = clientOrThrow();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content ?? "",
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  }));
}

export async function addNote(note: Note) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).insert({
    id: note.id,
    title: note.title,
    content: note.content,
    created_at: note.createdAt.toISOString(),
    updated_at: note.updatedAt.toISOString(),
  });
  if (error) throw error;
}

export async function updateNote(id: string, updates: Partial<Note>) {
  const client = clientOrThrow();
  const { error } = await client
    .from(TABLE)
    .update({
      title: updates.title,
      content: updates.content,
      updated_at: updates.updatedAt ? updates.updatedAt.toISOString() : new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteNote(id: string) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

