// src/app/ingredient/components/AddIngredientModal.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { spring } from "@/lib/animation";
import type { IngredientRow } from "../IngredientPanel";

type Props = {
  onSave: (
    data: Pick<IngredientRow, "name" | "category" | "default_unit" | "is_allergen">
  ) => Promise<boolean>;
  initial?: IngredientRow;
  isOpen: boolean;
  onClose: () => void;
};

export function AddIngredientModal({ onSave, initial, isOpen, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [defaultUnit, setDefaultUnit] = useState(initial?.default_unit ?? "");
  const [isAllergen, setIsAllergen] = useState(initial?.is_allergen ?? false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !defaultUnit) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    const ok = await onSave({
        name,
        category,
        default_unit: defaultUnit,
        is_allergen: isAllergen,
    });
    setLoading(false);
    if (ok) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-[family-name:var(--font-body)]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={spring}
            className="relative w-full max-w-md rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-2xl z-10"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-sage)] block mb-1">
                  {initial ? "update ingredient" : "new ingredient"}
                </span>
                <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--color-ink)]">
                  {initial ? "Edit" : "Add"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] bg-[var(--color-cream)] p-2 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <p className="text-xs text-[var(--color-tomato)] mb-4 bg-[var(--color-tomato)]/10 p-3 rounded-xl text-center">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:border-[var(--color-sage)] outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:border-[var(--color-sage)] outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">Default Unit</label>
                <input
                  type="text"
                  required
                  value={defaultUnit}
                  onChange={(e) => setDefaultUnit(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:border-[var(--color-sage)] outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--color-ink)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllergen}
                  onChange={(e) => setIsAllergen(e.target.checked)}
                  className="accent-[var(--color-sage)] w-4 h-4"
                />
                Mark as allergen
              </label>

              <div className="flex gap-3 pt-4 border-t border-[var(--color-border-light)]">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full bg-[var(--color-ink)] px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-cream)] hover:bg-[var(--color-sage)] transition-colors"
                >
                  {loading ? "Saving..." : initial ? "Update" : "Add Ingredient"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-[var(--color-border)] px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] hover:border-[var(--color-ink)]"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}