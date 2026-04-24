// components/ai-recipe-panel/components/AiRecipeDetail.tsx
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Save } from "lucide-react";
import { spring } from "@/lib/animation";
import type { Recipe } from "../types";

type Props = {
  recipe: Recipe;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
};

export function AiRecipeDetail({ recipe, onBack, onSave, isSaving, canSave }: Props) {
  const pantryItems = Array.isArray(recipe.pantryIngredients)
    ? recipe.pantryIngredients.filter(
        (i: unknown): i is string => typeof i === "string" && i.trim().length > 0
      )
    : [];
  const additionalItems = Array.isArray(recipe.additionalIngredients)
    ? recipe.additionalIngredients.filter(
        (i: unknown): i is string => typeof i === "string" && i.trim().length > 0
      )
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      className="relative overflow-hidden rounded-[2rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] p-8 shadow-sm md:p-12"
    >
      <div className="absolute left-0 top-0 h-2 w-full bg-[var(--color-sage)]" />

      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />{" "}
          Back to Menu
        </button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onSave}
          disabled={isSaving || !canSave}
          className="flex items-center gap-2 rounded-full border border-[var(--color-warm-border)] px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all hover:bg-[var(--color-text-primary)] hover:text-[var(--color-parchment)] disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {isSaving ? "Saving…" : "Save to Cookbook 📖"}
        </motion.button>
      </div>

      <div className="mb-12 border-b border-[var(--color-warm-border-soft)] pb-10">
        <h2 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--color-text-primary)] md:text-6xl">
          {recipe.title}
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <p className="max-w-2xl text-lg italic leading-relaxed text-[var(--color-text-secondary)]">
            “{recipe.description}”
          </p>
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-sage)]/20 bg-[var(--color-sage-soft)] px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[var(--color-sage)]">
            <Clock className="h-3.5 w-3.5" />
            {recipe.prepTime}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h5 className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
            🌿 Ingredients
          </h5>
          <div className="max-h-[500px] overflow-y-auto pr-4 scrollbar-thin">
            {pantryItems.length > 0 && (
              <ul className="space-y-3">
                {pantryItems.map((item, idx) => (
                  <li
                    key={`pantry-${idx}`}
                    className="flex items-start gap-3 pb-3 border-b border-[var(--color-warm-border-soft)] last:border-0"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-sage)]" />
                    <span className="text-sm leading-snug text-[var(--color-text-primary)]">
                      {item.replace(/^[*-]\s*/, "").trim()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {additionalItems.length > 0 && (
              <div className="mt-8 border-t border-[var(--color-warm-border-soft)] pt-6">
                <h5 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                  + Pantry Additions
                </h5>
                <ul className="space-y-3 opacity-80">
                  {additionalItems.map((item, idx) => (
                    <li key={`extra-${idx}`} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-text-secondary)]" />
                      <span className="text-sm leading-snug text-[var(--color-text-secondary)]">
                        {item.replace(/^[*-]\s*/, "").trim()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          <h5 className="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
            👩‍🍳 Preparation
          </h5>
          <ol className="space-y-10">
            {(Array.isArray(recipe.instructions) ? recipe.instructions : []).map(
              (step, index) => (
                <li key={index} className="flex gap-6">
                  <span className="shrink-0 font-[family-name:var(--font-handwritten)] text-3xl italic text-[var(--color-blush)]">
                    {index + 1}.
                  </span>
                  <p className="pt-1 text-lg leading-relaxed text-[var(--color-text-secondary)]">
                    {step}
                  </p>
                </li>
              )
            )}
          </ol>
        </div>
      </div>
    </motion.div>
  );
}