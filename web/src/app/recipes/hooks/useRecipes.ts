// src/app/recipes/hooks/useRecipes.ts
"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Recipe, IngredientOption } from "../types";

export function useRecipes(
  supabaseUrl: string,
  supabaseAnonKey: string,
  consumerId: number | null,
  viewMode: "personal" | "public",
  isAdmin: boolean,
  adminUserId: number | null,
  adminMode: "all" | "user"
) {
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      setIsLoading(true);
      let query = supabase
        .from("recipe")
        .select(`*, recipe_ingredient (ingredient_id, required_quantity, unit, preparation_note, is_optional, ingredient (name))`)
        .order("created_at", { ascending: false });

      if (consumerId !== null) {
        query =
          viewMode === "personal"
            ? query.eq("consumer_id", consumerId)
            : query.eq("is_public", true).neq("consumer_id", consumerId);
      } else {
        // admin
        if (adminMode === "user" && adminUserId) {
          query = query.eq("consumer_id", adminUserId);
        }
        // else "all" => no filter
      }

      const { data, error } = await query;
      if (!error && data) setRecipes(data as unknown as Recipe[]);
      setIsLoading(false);
    }

    fetchRecipes();
  }, [supabase, viewMode, consumerId, isAdmin, adminMode, adminUserId]);

  return { recipes, setRecipes, isLoading };
}