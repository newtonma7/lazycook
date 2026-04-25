// hooks/usePantries.ts
"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import type { PantryRow, ConsumerInfo } from "../types";

export function usePantries(
  supabaseUrl: string,
  supabaseAnonKey: string,
  consumerId: number | null,
  isAdmin: boolean
) {
  const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);

  const [pantries, setPantries] = useState<PantryRow[]>([]);
  const [consumers, setConsumers] = useState<ConsumerInfo[]>([]);
  const [selectedPantryId, setSelectedPantryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPantries = async () => {
    let query = supabase.from("pantry").select("pantry_id, consumer_id, pantry_name").order("pantry_name");
    if (!isAdmin && consumerId) {
      query = query.eq("consumer_id", consumerId);
    }
    const { data, error: err } = await query;
    if (err) {
      setError("Failed to load pantries.");
    } else {
      const pantriesData = (data ?? []) as PantryRow[];
      setPantries(pantriesData);
      setSelectedPantryId((prev) =>
        pantriesData.length > 0 ? (prev && pantriesData.some(p => p.pantry_id === prev) ? prev : pantriesData[0].pantry_id) : null
      );
    }
  };

  const fetchConsumers = async () => {
    if (!isAdmin) return;
    const { data, error: err } = await supabase.from("consumer").select("consumer_id, email, username").order("email");
    if (!err && data) setConsumers(data as ConsumerInfo[]);
  };

  const load = async () => {
    setLoading(true);
    await Promise.all([fetchPantries(), fetchConsumers()]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [consumerId, isAdmin]);

  const createPantry = async (name: string, consId: number | null) => {
    const payload: any = { pantry_name: name };
    if (consId) payload.consumer_id = consId;
    const { error: err } = await supabase.from("pantry").insert(payload);
    if (err) return false;
    await fetchPantries();
    return true;
  };

  const updatePantry = async (id: number, name: string) => {
    const { error: err } = await supabase.from("pantry").update({ pantry_name: name }).eq("pantry_id", id);
    if (err) return false;
    await fetchPantries();
    return true;
  };

  const deletePantry = async (id: number) => {
    const { error: err } = await supabase.from("pantry").delete().eq("pantry_id", id);
    if (err) return false;
    if (selectedPantryId === id) setSelectedPantryId(null);
    await fetchPantries();
    return true;
  };

  const consumerMap = useMemo(() => {
    const map = new Map<number, ConsumerInfo>();
    consumers.forEach(c => map.set(c.consumer_id, c));
    return map;
  }, [consumers]);

  return {
    pantries,
    consumers: consumerMap,
    selectedPantryId,
    setSelectedPantryId,
    loading,
    error,
    setError,
    createPantry,
    updatePantry,
    deletePantry,
  };
}