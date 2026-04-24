// hooks/usePantry.ts
"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import type { PantryOption } from "../types";

export function usePantry(
  supabaseUrl: string,
  supabaseAnonKey: string,
  consumerId: number | null
) {
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );

  const [pantries, setPantries] = useState<PantryOption[]>([]);
  const [selectedPantryId, setSelectedPantryId] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Fetch pantries
  useEffect(() => {
    async function loadPantries() {
      let query = supabase
        .from("pantry")
        .select("pantry_id, pantry_name")
        .order("pantry_name");
      if (consumerId) query = query.eq("consumer_id", consumerId);
      const { data } = await query;
      if (data && data.length > 0) {
        setPantries(data as PantryOption[]);
        setSelectedPantryId((prev) => prev ?? data[0].pantry_id);
      } else {
        setPantries([]);
        setSelectedPantryId(null);
      }
    }
    loadPantries();
  }, [supabase, consumerId]);

  // Fetch ingredients for selected pantry
  useEffect(() => {
    async function loadIngredients() {
      if (!selectedPantryId) {
        setIngredients([]);
        setSelectedIngredients([]);
        return;
      }
      const { data } = await supabase
        .from("pantry_item")
        .select("ingredient:ingredient_id (name)")
        .eq("pantry_id", selectedPantryId);
      if (data) {
        const names = data
          .map((row: any) => row.ingredient?.name)
          .filter((n: unknown): n is string => typeof n === "string" && !!n)
          .sort();
        setIngredients(names);
        setSelectedIngredients(names); // start all selected
      }
    }
    loadIngredients();
  }, [supabase, selectedPantryId]);

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const selectAll = () => setSelectedIngredients(ingredients);
  const deselectAll = () => setSelectedIngredients([]);

  const activePantryName =
    pantries.find((p) => p.pantry_id === selectedPantryId)?.pantry_name ??
    "Select pantry";

  return {
    pantries,
    selectedPantryId,
    setSelectedPantryId,
    ingredients,
    selectedIngredients,
    setSelectedIngredients,
    toggleIngredient,
    selectAll,
    deselectAll,
    activePantryName,
  };
}