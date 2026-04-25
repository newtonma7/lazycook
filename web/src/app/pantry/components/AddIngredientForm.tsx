// src/app/pantry/components/AddIngredientForm.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { spring } from "@/lib/animation";
import { BasilSuccess } from "../../components/mascot/BasilComponents";
import type { IngredientOption, PantryItemRow } from "../types";

type Props = {
  ingredients: IngredientOption[];
  onAddItem: (item: Omit<PantryItemRow, "pantry_item_id">) => Promise<boolean>;
};

export function AddIngredientForm({ ingredients, onAddItem }: Props) {
  const [open, setOpen] = useState(false);
  const [ingredientId, setIngredientId] = useState<number | null>(null);
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientId) return;
    setLoading(true);
    const ok = await onAddItem({
      pantry_id: 0, // parent fills
      ingredient_id: ingredientId,
      quantity_on_hand: qty || null,
      unit: unit || null,
      purchase_date: purchaseDate || null,
      expiration_date: expiryDate || null,
    });
    setLoading(false);
    if (ok) {
      setIngredientId(null);
      setQty("");
      setUnit("");
      setPurchaseDate("");
      setExpiryDate("");
      setOpen(false);
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    }
  };

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-[var(--color-tomato)] px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow-sm hover:opacity-90"
      >
        <Plus className="w-4 h-4" /> Add Ingredient
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={spring}
            className="absolute right-0 top-full mt-2 w-[480px] max-w-[calc(100vw-2rem)] z-50 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={ingredientId ?? ""}
                  onChange={(e) => setIngredientId(e.target.value ? Number(e.target.value) : null)}
                  required
                  className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-sage)]"
                >
                  <option value="">Select ingredient</option>
                  {ingredients.map((i) => (
                    <option key={i.ingredient_id} value={i.ingredient_id}>
                      {i.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Qty"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="flex-1 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-3 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="flex-1 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-3 py-2.5 text-sm"
                  />
                </div>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-3 py-2.5 text-sm"
                />
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-3 py-2.5 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-[var(--color-ink-muted)] hover:bg-[var(--color-linen)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !ingredientId}
                  className="px-5 py-2 rounded-full bg-[var(--color-sage)] text-xs font-bold uppercase tracking-widest text-white hover:bg-[var(--color-olive)] disabled:opacity-50"
                >
                  {loading ? "Adding…" : "Add"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-warm-surface)] border border-[var(--color-sage)] rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3"
          >
            <BasilSuccess size={36} />
            <span className="font-[family-name:var(--font-handwritten)] text-base">
              Added to your kitchen! 🌿
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}