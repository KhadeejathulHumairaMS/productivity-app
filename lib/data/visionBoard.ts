"use client";

import { supabase } from "@/lib/supabaseClient";
import { VisionBoardItem } from "@/lib/types";

const TABLE = "vision_board";

const clientOrThrow = () => {
  if (!supabase) throw new Error("Supabase client not initialised. Check env vars.");
  return supabase;
};

export async function fetchVisionBoard(): Promise<VisionBoardItem[]> {
  const client = clientOrThrow();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    imageUrl: row.image_url ?? "",
    quote: row.quote ?? "",
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  }));
}

export async function addVisionItem(item: VisionBoardItem) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).insert({
    id: item.id,
    image_url: item.imageUrl,
    quote: item.quote,
    created_at: item.createdAt.toISOString(),
  });
  if (error) throw error;
}

export async function updateVisionItem(id: string, updates: Partial<VisionBoardItem>) {
  const client = clientOrThrow();
  const { error } = await client
    .from(TABLE)
    .update({
      image_url: updates.imageUrl,
      quote: updates.quote,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteVisionItem(id: string) {
  const client = clientOrThrow();
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

