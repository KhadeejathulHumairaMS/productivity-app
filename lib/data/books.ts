"use client";

import { supabase } from "@/lib/supabaseClient";
import { Book } from "@/lib/types";

const TABLE = "books";

const clientOrThrow = () => {
  if (!supabase) throw new Error("Supabase client not initialised. Check env vars.");
  return supabase;
};

export async function fetchBooks(): Promise<Book[]> {
  const client = clientOrThrow();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("started_date", { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    status: row.status,
    imageUrl: row.image_url ?? "",
    completedDate: row.completed_date ? new Date(row.completed_date) : undefined,
    startedDate: row.started_date ? new Date(row.started_date) : undefined,
    notes: row.notes ?? "",
  }));
}

export async function addBook(book: Book) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).insert({
    id: book.id,
    title: book.title,
    author: book.author,
    status: book.status,
    image_url: book.imageUrl,
    completed_date: book.completedDate ? book.completedDate.toISOString() : null,
    started_date: book.startedDate ? book.startedDate.toISOString() : null,
    notes: book.notes,
  });
  if (error) throw error;
}

export async function updateBook(id: string, updates: Partial<Book>) {
  const client = clientOrThrow();
  const { error } = await client
    .from(TABLE)
    .update({
      title: updates.title,
      author: updates.author,
      status: updates.status,
      image_url: updates.imageUrl,
      completed_date: updates.completedDate
        ? updates.completedDate.toISOString()
        : null,
      started_date: updates.startedDate ? updates.startedDate.toISOString() : null,
      notes: updates.notes,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteBook(id: string) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

