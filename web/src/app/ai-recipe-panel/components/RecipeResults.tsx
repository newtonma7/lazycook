// components/ai-recipe-panel/components/RecipeResults.tsx
import { motion, AnimatePresence } from "framer-motion";
import { spring, easeOut } from "@/lib/animation";
import { BasilLoading, BasilEmpty } from "../../components/mascot/BasilComponents";
import { CozyLoading } from "./CozyLoading";
import type { Recipe } from "../types";

type Props = {
  recipes: Recipe[];
  isGenerating: boolean;
  isGeneratingMore: boolean;
  canLoadMore: boolean;
  onSelectRecipe: (recipe: Recipe) => void;
  onGenerateMore: () => void;
  canGenerateMore: boolean;
};

export function RecipeResults({
  recipes,
  isGenerating,
  isGeneratingMore,
  canLoadMore,
  onSelectRecipe,
  onGenerateMore,
  canGenerateMore,
}: Props) {
  // Loading state – initial generation (not “more”)
  if (isGenerating && !isGeneratingMore) {
    return <CozyLoading />;
  }

  // Empty state – nothing generated yet
  if (!isGenerating && recipes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <BasilEmpty />
        <h3 className="font-[family-name:var(--font-handwritten)] text-3xl text-[var(--color-text-primary)] mt-6">
          The kitchen is a blank canvas. 🌿
        </h3>
        <p className="mt-2 max-w-sm text-center text-base text-[var(--color-text-secondary)]">
          Tell Basil what you’re craving or adjust your pantry — he’ll whip up
          something delicious.
        </p>
      </motion.div>
    );
  }

  // Grid of recipe cards
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={easeOut}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {recipes.map((r, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ ...spring, delay: i * 0.06 }}
              whileHover={{
                y: -4,
                boxShadow: "0 12px 32px rgba(44,32,22,0.12)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectRecipe(r)}
              className="group cursor-pointer overflow-hidden rounded-[2rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] p-8 transition-colors"
            >
              {/* Gradient top line on hover */}
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-blush)] opacity-0 transition-opacity group-hover:opacity-100" />
              <div>
                <h4 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--color-text-primary)]">
                  {r.title}
                </h4>
                <p className="mt-3 line-clamp-3 text-sm italic leading-relaxed text-[var(--color-text-secondary)]">
                  “{r.description}”
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-[var(--color-warm-border-soft)] pt-5">
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-ghost)]">
                  {r.prepTime}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-terracotta)] transition-transform group-hover:translate-x-1">
                  View →
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Skeleton cards while loading more */}
        {isGeneratingMore &&
          [1, 2, 3].map((i) => (
            <div
              key={`skel-${i}`}
              className="h-[280px] animate-pulse rounded-[2rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)]"
            />
          ))}
      </div>

      {/* “More Inspirations” button */}
      {!isGeneratingMore && canLoadMore && recipes.length >= 1 && (
        <div className="flex justify-center pt-4">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onGenerateMore}
            disabled={!canGenerateMore}
            className="rounded-full border border-[var(--color-warm-border)] bg-[var(--color-warm-surface-2)] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] transition-all hover:border-[var(--color-text-primary)] hover:bg-[var(--color-warm-surface)]"
          >
            More Inspirations ✨
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}