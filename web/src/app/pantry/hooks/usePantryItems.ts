// hooks/usePantryItems.ts
"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import type { PantryItemRow } from "../types";

export function usePantryItems(
  supabaseUrl: string,
  supabaseAnonKey: string,
  pantryId: number | null
) {
  const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);

  const [items, setItems] = useState<PantryItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!pantryId) { setItems([]); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("pantry_item")
      .select("pantry_item_id, pantry_id, ingredient_id, purchase_date, quantity_on_hand, unit, expiration_date")
      .eq("pantry_id", pantryId)
      .order("pantry_item_id");
    if (err) {
      setError("Failed to load ingredients.");
    } else {
      setItems((data ?? []) as PantryItemRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [pantryId]);

  const addItem = async (item: Omit<PantryItemRow, "pantry_item_id">) => {
    const { error: err } = await supabase.from("pantry_item").insert(item);
    if (err) return false;
    fetchItems();
    return true;
  };

  const deleteItem = async (itemId: number) => {
    const { error: err } = await supabase.from("pantry_item").delete().eq("pantry_item_id", itemId);
    if (err) return false;
    fetchItems();
    return true;
  };

  return { items, loading, error, setError, addItem, deleteItem, fetchItems };
}