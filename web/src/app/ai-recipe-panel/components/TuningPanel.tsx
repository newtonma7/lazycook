// components/TuningPanel.tsx
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { spring, microEase } from "@/lib/animation";
import { cn } from "@/lib/utils";

type Slider = {
  label: string;
  value: number;
  setter: (v: number) => void;
  max: number;
  valueLabel: string;
};

type Props = {
  show: boolean;
  onClose: () => void;
  sliders: Slider[];
  excludedIngredients: string[];
  excludeInput: string;
  onExcludeInputChange: (v: string) => void;
  onAddExclusion: (e: React.KeyboardEvent) => void;
  onRemoveExclusion: (item: string) => void;
  ingredients: string[];
  selectedIngredients: string[];
  toggleIngredient: (ing: string) => void;
  setSelectedIngredients: (arr: string[]) => void;
};

export function TuningPanel({
  show,
  onClose,
  sliders,
  excludedIngredients,
  excludeInput,
  onExcludeInputChange,
  onAddExclusion,
  onRemoveExclusion,
  ingredients,
  selectedIngredients,
  toggleIngredient,
  setSelectedIngredients,
}: Props) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={spring}
      className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] p-6 shadow-lg"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-text-primary)]">tune your kitchen 🌿</h2>
        <button onClick={onClose} className="rounded-full p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-surface-2)]">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-6">
        {sliders.map((slider, idx) => (
          <div key={idx} className="border-b border-[var(--color-warm-border-soft)] pb-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">{slider.label}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-sage)]">{slider.valueLabel}</span>
            </div>
            <input
              type="range"
              min="1"
              max={slider.max}
              step="1"
              value={slider.value}
              onChange={(e) => slider.setter(parseInt(e.target.value))}
              className="h-1.5 w-full cursor-pointer rounded-lg bg-[var(--color-warm-border-soft)] accent-[var(--color-sage)] hover:accent-[var(--color-terracotta)]"
            />
          </div>
        ))}
        {/* Kitchen Bans */}
        <div className="border-b border-[var(--color-warm-border-soft)] pb-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Kitchen Bans</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-terracotta)]">{excludedIngredients.length} Active</span>
          </div>
          <input
            type="text"
            placeholder="Ban ingredients (Press Enter)…"
            value={excludeInput}
            onChange={(e) => onExcludeInputChange(e.target.value)}
            onKeyDown={onAddExclusion}
            className="w-full rounded-xl border border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface-2)] px-4 py-2.5 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-ghost)] outline-none focus:border-[var(--color-terracotta)]"
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            <AnimatePresence>
              {excludedIngredients.map((item) => (
                <motion.button
                  key={item}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={microEase}
                  onClick={() => onRemoveExclusion(item)}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--color-terracotta)]/20 bg-[var(--color-terracotta-soft)] px-2.5 py-1 text-xs font-bold uppercase tracking-tight text-[var(--color-terracotta)] hover:bg-[var(--color-terracotta)]/10"
                >
                  {item} <X className="h-3 w-3" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
        {/* Ingredient filter */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Pantry Filter</h4>
            <button
              onClick={() => setSelectedIngredients(selectedIngredients.length === ingredients.length ? [] : ingredients)}
              className="text-xs font-bold uppercase text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              {selectedIngredients.length === ingredients.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="max-h-[300px] space-y-2 overflow-y-auto pr-2">
            {ingredients.length > 0 ? (
              ingredients.map((ing) => {
                const isSelected = selectedIngredients.includes(ing);
                return (
                  <motion.div
                    key={ing}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleIngredient(ing)}
                    className={cn(
                      "flex cursor-pointer select-none items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors",
                      isSelected
                        ? "border-[var(--color-sage)] bg-[var(--color-sage-soft)] text-[var(--color-text-primary)]"
                        : "border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-warm-border)]"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        isSelected ? "border-[var(--color-sage)] bg-[var(--color-sage)] text-white" : "border-[var(--color-warm-border)] bg-[var(--color-warm-surface-2)]"
                      )}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                    <span className="truncate">{ing}</span>
                  </motion.div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface-2)] py-8 text-center">
                <p className="text-xs font-medium text-[var(--color-text-ghost)]">No items found.</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-warm-border-soft)] pt-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Inventory Ratio</span>
            <span className="rounded-md bg-[var(--color-warm-border-soft)] px-2 py-0.5 text-xs font-bold text-[var(--color-text-primary)]">
              {selectedIngredients.length} / {ingredients.length}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}