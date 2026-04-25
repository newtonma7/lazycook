// src/app/ingredient/components/IngredientGrid.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { IngredientCard } from "./IngredientCard";
import type { IngredientRow } from "../IngredientPanel";

type Props = {
  ingredients: IngredientRow[];
  isLoading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onEnrich: (id: number) => Promise<boolean>;   // ← new
};

export function IngredientGrid({ ingredients, isLoading, onEdit, onDelete, onEnrich }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-3xl bg-[var(--color-surface)]/30">
        <p className="text-[var(--color-ink-muted)] italic">
          No ingredients found. Try adjusting the search or category filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence>
        {ingredients.map((ing) => (
          <IngredientCard
            key={ing.ingredient_id}
            ingredient={ing}
            onEdit={onEdit}
            onDelete={onDelete}
            onEnrich={onEnrich}   // ← forwarded
          />
        ))}
      </AnimatePresence>
    </div>
  );
}