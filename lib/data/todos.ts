"use client";

import { supabase } from "@/lib/supabaseClient";
import { Todo } from "@/lib/types";

const TABLE = "todos";

const withClient = () => {
  if (!supabase) {
    throw new Error("Supabase client not initialised. Check env vars.");
  }
  return supabase;
};

export async function fetchTodos(): Promise<Todo[]> {
  const client = withClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    text: row.text,
    completed: row.completed,
    reminder: row.reminder ? new Date(row.reminder) : undefined,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  }));
}

export async function addTodo(todo: Todo) {
  const client = withClient();
  const { error } = await client.from(TABLE).insert({
    id: todo.id,
    text: todo.text,
    completed: todo.completed,
    reminder: todo.reminder ? todo.reminder.toISOString() : null,
    created_at: todo.createdAt.toISOString(),
  });
  if (error) throw error;
}

export async function updateTodo(id: string, updates: Partial<Todo>) {
  const client = withClient();
  const { error } = await client
    .from(TABLE)
    .update({
      text: updates.text,
      completed: updates.completed,
      reminder: updates.reminder ? updates.reminder.toISOString() : null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTodo(id: string) {
  const client = withClient();
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

