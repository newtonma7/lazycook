// hooks/useIngredients.ts (replace the existing file)
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import type { IngredientRow } from "../IngredientPanel";

export function useIngredients(supabaseUrl: string, supabaseAnonKey: string) {
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );

  const [allIngredients, setAllIngredients] = useState<IngredientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const fetchIngredients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("ingredient")
      .select("ingredient_id, name, category, default_unit, is_allergen")
      .order("name", { ascending: true });
    if (err) {
      setError(err.message);
    } else {
      setAllIngredients((data as IngredientRow[]) ?? []);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Filtering
  const filteredIngredients = useMemo(() => {
    let list = allIngredients;
    if (search.trim()) {
      const lc = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(lc) ||
          i.category.toLowerCase().includes(lc)
      );
    }
    if (categoryFilter) {
      list = list.filter((i) => i.category === categoryFilter);
    }
    return list;
  }, [allIngredients, search, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set(allIngredients.map((i) => i.category));
    return Array.from(set).sort();
  }, [allIngredients]);

  const addIngredient = async (data: Omit<IngredientRow, "ingredient_id">) => {
    const { error: err } = await supabase.from("ingredient").insert([data]);
    if (err) {
      setError(err.message);
      return false;
    }
    fetchIngredients();
    return true;
  };

  const updateIngredient = async (id: number, data: Partial<IngredientRow>) => {
    const { error: err } = await supabase
      .from("ingredient")
      .update(data)
      .eq("ingredient_id", id);
    if (err) {
      setError(err.message);
      return false;
    }
    fetchIngredients();
    return true;
  };

  const deleteIngredient = async (id: number) => {
    const { error: err } = await supabase
      .from("ingredient")
      .delete()
      .eq("ingredient_id", id);
    if (err) {
      setError(err.message);
      return false;
    }
    fetchIngredients();
    return true;
  };

  const enrichIngredient = async (id: number) => {
    const ing = allIngredients.find((i) => i.ingredient_id === id);
    if (!ing) return false;

    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(ing.name)}&json=1&page_size=1&lc=en`
      );
      const data = await res.json();
      const product = data.products?.[0];
      if (!product) return false;

      const updates: Partial<IngredientRow> = {};
      if (!ing.category && product.categories) {
        updates.category = product.categories.split(',')[0].trim();
      }
      if (!ing.default_unit && product.quantity) {
        updates.default_unit = product.quantity;
      }
      if (!ing.is_allergen && product.allergens) {
        updates.is_allergen = product.allergens.toLowerCase().includes('true');
      }

      if (Object.keys(updates).length === 0) return true;

      const { error } = await supabase
        .from("ingredient")
        .update(updates)
        .eq("ingredient_id", id);
      if (error) {
        setError(error.message);
        return false;
      }
      fetchIngredients();
      return true;
    } catch (err) {
      setError("Enrichment failed. Please try again later.");
      return false;
    }
  };

    const enrichDatabase = async () => {
    setIsEnriching(true);
    const existing = new Set(allIngredients.map(i => i.name.toLowerCase()));
    const categories = [
        "vegetables",
        "fruits",
        "dairy",
        "meats",
        "beverages",
        "spices",
        "pasta",
        "baking",
        "seafood",
        "condiments",
        "cereals",
        "snacks",
        "sugary snacks",
        "legumes",
        "nuts",
    ];

    let newIngredients: Omit<IngredientRow, "ingredient_id">[] = [];
    let stopped = false;

    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    for (const category of categories) {
        if (stopped) break;

        try {
        const res = await fetch(
            `https://world.openfoodfacts.org/category/${encodeURIComponent(category)}.json?page_size=20&lc=en`
        );

        // If rate limited, stop entirely – no point continuing
        if (res.status === 429) {
            setError("Too many requests — paused. Please wait a moment and try again.");
            stopped = true;
            break;
        }

        const data = await res.json();
        if (!data.products) continue;

        for (const product of data.products) {
            const name = (product.product_name || "").trim();
            if (!name) continue;
            if (existing.has(name.toLowerCase())) continue;

            const cat = product.categories
            ? product.categories.split(',')[0].trim()
            : category;
            const unit = product.quantity || "";

            newIngredients.push({
            name,
            category: cat,
            default_unit: unit,
            is_allergen: false,
            });
            existing.add(name.toLowerCase());
        }

        // Wait 2 seconds before next category to respect rate limits
        await sleep(2000);
        } catch (err) {
        // skip category on network error
        }
    }

    let success = false;
    if (!stopped && newIngredients.length > 0) {
        const { error } = await supabase.from("ingredient").insert(newIngredients);
        if (error) {
        setError(error.message);
        } else {
        success = true;
        fetchIngredients();
        }
    }

    setIsEnriching(false);
    return success;
    };

  return {
    ingredients: filteredIngredients,
    isLoading,
    isEnriching,
    error,
    search,
    setSearch,
    categories,
    categoryFilter,
    setCategoryFilter,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    enrichIngredient,
    enrichDatabase,
  };
}