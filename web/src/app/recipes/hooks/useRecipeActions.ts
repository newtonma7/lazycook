// src/app/recipes/hooks/useRecipeActions.ts
"use client";
import { useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Recipe } from "../types";

export function useRecipeActions(
  supabaseUrl: string,
  supabaseAnonKey: string,
  consumerId: number | null
) {
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );

  
  const saveToMyKitchen = async (recipeToClone: Recipe) => {
    if (!consumerId) return;
    const { data: newRecipe, error: recipeError } = await supabase
      .from("recipe")
      .insert({
        consumer_id: consumerId,
        title: recipeToClone.title,
        description: recipeToClone.description,
        instructions: recipeToClone.instructions,
        prep_time_min: recipeToClone.prep_time_min,
        cook_time_min: recipeToClone.cook_time_min,
        servings: recipeToClone.servings,
        is_public: false,
      })
      .select("recipe_id")
      .single();

    if (recipeError) throw recipeError;

    if (recipeToClone.recipe_ingredient.length > 0) {
      const newIngredients = recipeToClone.recipe_ingredient.map((ing) => ({
        recipe_id: newRecipe.recipe_id,
        ingredient_id: ing.ingredient_id,
        required_quantity: ing.required_quantity,
        unit: ing.unit,
        preparation_note: ing.preparation_note,
        is_optional: ing.is_optional,
      }));
      await supabase.from("recipe_ingredient").insert(newIngredients);
    }
  };

  const toggleRecipeVisibility = async (recipe: Recipe) => {
    if (!consumerId) return;
    const updatedIsPublic = !recipe.is_public;
    const { error } = await supabase
      .from("recipe")
      .update({ is_public: updatedIsPublic })
      .eq("recipe_id", recipe.recipe_id);
    if (error) throw error;
    return { ...recipe, is_public: updatedIsPublic };
  };

  const saveEdit = async (draft: Recipe) => {
    if (!consumerId) return;
    await supabase
      .from("recipe")
      .update({
        title: draft.title,
        description: draft.description,
        instructions: draft.instructions,
        prep_time_min: draft.prep_time_min,
        cook_time_min: draft.cook_time_min,
        servings: draft.servings,
        is_public: draft.is_public,
      })
      .eq("recipe_id", draft.recipe_id);

    await supabase.from("recipe_ingredient").delete().eq("recipe_id", draft.recipe_id);
    if (draft.recipe_ingredient.length > 0) {
      const mapped = draft.recipe_ingredient.map((ing) => ({
        recipe_id: draft.recipe_id,
        ingredient_id: ing.ingredient_id,
        required_quantity: ing.required_quantity,
        unit: ing.unit,
        preparation_note: ing.preparation_note,
        is_optional: ing.is_optional,
      }));
      await supabase.from("recipe_ingredient").insert(mapped);
    }
  };
  const deleteRecipe = async (recipeId: number) => {
    if (!consumerId) return;
    // Delete ingredients first (RPC or simple)
    await supabase.from("recipe_ingredient").delete().eq("recipe_id", recipeId);
    const { error } = await supabase.from("recipe").delete().eq("recipe_id", recipeId);
    if (error) throw error;
    };

    return { saveToMyKitchen, toggleRecipeVisibility, saveEdit, deleteRecipe };
}
