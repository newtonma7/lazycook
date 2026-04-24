// src/app/recipes/RecipeGallery.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useRecipes } from "./hooks/useRecipes";
import { useRecipeActions } from "./hooks/useRecipeActions";
import { GalleryHeader } from "./components/GalleryHeader";
import { RecipeGrid } from "./components/RecipeGrid";
import { CookingMode } from "./components/CookingMode";
import { RecipeDetail } from "./components/RecipeDetail";
import type { IngredientOption, Recipe, ConsumerInfo } from "./types";

type Props = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  consumerId: number | null;
  ingredients: IngredientOption[];
  isAdmin?: boolean;
  consumers?: ConsumerInfo[];
};

export function RecipeGallery({ supabaseUrl, supabaseAnonKey, consumerId, ingredients, isAdmin = false, consumers = [] }: Props) {
  const searchParams = useSearchParams();

  // Deep‑link params
  const backTo = searchParams.get("back");
  const planId = searchParams.get("plan");
  const recipeIdParam = searchParams.get("recipe");

  const [viewMode, setViewMode] = useState<"personal" | "public">(isAdmin ? "public" : "personal");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "quick" | "simple">("all");
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

  const [adminUserId, setAdminUserId] = useState<number | null>(null);
  const [adminMode, setAdminMode] = useState<"all" | "user">("all");

  const { recipes, setRecipes, isLoading } = useRecipes(
    supabaseUrl, supabaseAnonKey, consumerId, viewMode, isAdmin, adminUserId, adminMode
  );

  const { saveToMyKitchen, toggleRecipeVisibility, saveEdit, deleteRecipe } = useRecipeActions(supabaseUrl, supabaseAnonKey, consumerId);

  // Auto‑select recipe from URL param once recipes are loaded
  useEffect(() => {
    if (recipeIdParam && recipes.length > 0) {
      const recipe = recipes.find(r => r.recipe_id === Number(recipeIdParam));
      if (recipe) setSelectedRecipe(recipe);
    }
  }, [recipeIdParam, recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const s = searchQuery.toLowerCase();
      return (
        !s ||
        r.title.toLowerCase().includes(s) ||
        (r.description?.toLowerCase() || "").includes(s) ||
        r.recipe_ingredient.some((ing) => (ing.ingredient?.name || "").toLowerCase().includes(s))
      ) &&
      (activeFilter === "all" ? true :
       activeFilter === "quick" ? ((r.prep_time_min || 0) + (r.cook_time_min || 0)) <= 30 :
       /* simple */ r.recipe_ingredient.length <= 5);
    });
  }, [recipes, searchQuery, activeFilter]);

  const handleToggleVisibility = async (recipe: Recipe) => {
    if (!consumerId) return;
    const updated = await toggleRecipeVisibility(recipe);
    if (updated) {
      setRecipes((prev) => prev.map(r => r.recipe_id === updated.recipe_id ? updated : r));
      setSelectedRecipe(updated);
    }
    return updated;
  };

  const handleSaveEdit = async (draft: Recipe) => {
    await saveEdit(draft);
    const updated = { ...draft };
    setRecipes((prev) => prev.map(r => r.recipe_id === updated.recipe_id ? updated : r));
    setSelectedRecipe(updated);
  };

  const handleDelete = async (recipeId: number) => {
    try {
      await deleteRecipe(recipeId);
      setRecipes((prev) => prev.filter(r => r.recipe_id !== recipeId));
      setSelectedRecipe(null);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const isOwner = !isAdmin && consumerId !== null;

  return (
    <div className="font-[family-name:var(--font-body)] text-[var(--color-ink)] animate-in fade-in duration-700 w-full relative">
      <AnimatePresence mode="wait">
        {!selectedRecipe && (
          <div key="grid">
            <GalleryHeader
              isAdmin={isAdmin}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
            <RecipeGrid
              recipes={filteredRecipes}
              isLoading={isLoading}
              isAdmin={isAdmin}
              showVisibilityIcons={!isAdmin && viewMode === "personal"}
              onRecipeClick={setSelectedRecipe}
            />
          </div>
        )}

        {selectedRecipe && !cookingRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            isAdmin={isAdmin}
            isOwner={isOwner}
            onBack={() => setSelectedRecipe(null)}
            onStartCooking={setCookingRecipe}
            onSaveToMyKitchen={saveToMyKitchen}
            onToggleVisibility={handleToggleVisibility}
            onSaveEdit={handleSaveEdit}
            onDelete={handleDelete}
            consumerId={consumerId}
            backTo={backTo ?? undefined}
            planId={planId ?? undefined}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cookingRecipe && (
          <CookingMode
            recipe={cookingRecipe}
            onClose={() => setCookingRecipe(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}