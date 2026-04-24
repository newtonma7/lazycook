// src/app/recipes/components/RecipeCard.tsx
import { motion } from "framer-motion";
import { Clock, Users, Globe, Lock, ChefHat } from "lucide-react";
import { spring } from "@/lib/animation";
import type { Recipe } from "../types";

type Props = {
  recipe: Recipe;
  isAdmin: boolean;
  showVisibilityIcons: boolean;
  onClick: () => void;
};

export function RecipeCard({ recipe, isAdmin, showVisibilityIcons, onClick }: Props) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={spring}
      className="group cursor-pointer bg-[var(--color-surface)] rounded-[1.5rem] border border-[var(--color-border)] p-6 relative flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md hover:border-[var(--color-tomato)]/30 transition-all"
    >
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-20 group-hover:rotate-12 transition-all">
        <ChefHat className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-ink)] leading-tight mb-2 group-hover:text-[var(--color-tomato)] transition-colors">
          {recipe.title}
        </h3>
        <p className="text-xs text-[var(--color-ink-light)] italic line-clamp-2 leading-relaxed mb-6">
          "{recipe.description}"
        </p>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-light)]">
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
            <Clock className="w-2.5 h-2.5 text-[var(--color-turmeric)]" />{" "}
            {(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)}m
          </span>
          <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
            <Users className="w-2.5 h-2.5 text-[var(--color-sage)]" /> {recipe.servings}
          </span>
        </div>
        {showVisibilityIcons && (
          <div className="flex items-center gap-2">
            {recipe.is_public ? (
              <Globe className="w-3 h-3 text-[var(--color-sage)] opacity-50" />
            ) : (
              <Lock className="w-3 h-3 text-[var(--color-ink-muted)] opacity-30" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}