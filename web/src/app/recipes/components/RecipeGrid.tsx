// src/app/recipes/components/RecipeGrid.tsx
import { UtensilsCrossed } from "lucide-react";
import type { Recipe } from "../types";
import { RecipeCard } from "./RecipeCard";
import { BasilEmpty } from "../../components/mascot/BasilComponents";

type Props = {
  recipes: Recipe[];
  isLoading: boolean;
  isAdmin: boolean;
  showVisibilityIcons: boolean;
  onRecipeClick: (recipe: Recipe) => void;
};

export function RecipeGrid({ recipes, isLoading, isAdmin, showVisibilityIcons, onRecipeClick }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 bg-[var(--color-surface)] rounded-[1.5rem] animate-pulse border border-[var(--color-border-light)]" />
        ))}
      </div>
    );
  }

    if (recipes.length === 0) {
    return (
        <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-[2.5rem] bg-[var(--color-surface)]/30">
        <BasilEmpty size={80} />
        <p className="mt-4 font-[family-name:var(--font-handwritten)] text-xl italic text-[var(--color-ink-muted)]">
            The counter is clean. No recipes found.
        </p>
        </div>
    );
    }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.recipe_id}
          recipe={recipe}
          isAdmin={isAdmin}
          showVisibilityIcons={showVisibilityIcons}
          onClick={() => onRecipeClick(recipe)}
        />
      ))}
    </div>
  );
}