// hooks/useIngredients.ts
"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import type { IngredientOption } from "../types";

export function useIngredients(supabaseUrl: string, supabaseAnonKey: string) {
  const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);

  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from("ingredient").select("ingredient_id, name").order("name");
    if (err) {
      setError("Failed to load ingredient list.");
    } else {
      setIngredients((data ?? []) as IngredientOption[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchIngredients(); }, []);

  const ingredientNameById = useMemo(() => {
    const map = new Map<number, string>();
    ingredients.forEach(i => map.set(i.ingredient_id, i.name));
    return map;
  }, [ingredients]);

  return { ingredients, loading, error, ingredientNameById };
}