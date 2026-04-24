// components/meal-plan/edit-meal-plan-item-modal.tsx
"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Pen, Trash2, X } from "lucide-react";
import { spring } from "@/lib/animation";
import { BasilSuccess } from "../components/mascot/BasilComponents";

type RecipeOption = {
  recipe_id: number;
  title: string;
};

type Props = {
  meal_plan_item_id: number;
  recipe_id: number;
  scheduled_for: string | null;
  meal_type: string | null;
  servings: number | null;
  meal_plan_id: number;
  recipes: RecipeOption[];
  supabaseUrl: string;
  supabaseAnonKey: string;
  consumerId: number | null;
};

export function EditMealPlanItemModal({
  meal_plan_item_id,
  recipe_id,
  scheduled_for,
  meal_type,
  servings,
  meal_plan_id,
  recipes,
  supabaseUrl,
  supabaseAnonKey,
  consumerId,
}: Props) {
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const recipeId = Number(
      (form.elements.namedItem("recipe_id") as HTMLSelectElement)?.value
    );
    const scheduledFor =
      (form.elements.namedItem("scheduled_for") as HTMLInputElement)?.value || null;
    const mealType =
      (form.elements.namedItem("meal_type") as HTMLInputElement)?.value || null;
    const servingsRaw = (form.elements.namedItem("servings") as HTMLInputElement)?.value;
    const servings = servingsRaw ? Number(servingsRaw) : null;

    setIsLoading(true);
    setError("");

    const { error: updateError } = await supabase
      .from("meal_plan_item")
      .update({
        recipe_id: recipeId,
        scheduled_for: scheduledFor,
        meal_type: mealType || null,
        servings,
      })
      .eq("meal_plan_item_id", meal_plan_item_id);

    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // Success: refresh the parent list, show celebration, close modal
    router.refresh();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsOpen(false);
    }, 1500);
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove this dish from your plan? It won’t affect the recipe itself.")) return;

    setIsLoading(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("meal_plan_item")
      .delete()
      .eq("meal_plan_item_id", meal_plan_item_id);

    setIsLoading(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.refresh();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(true);
          setError("");
        }}
        className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5 p-2 rounded-full hover:bg-[var(--color-warm-surface-2)]"
        aria-label="Edit meal plan item"
      >
        <Pen className="w-3.5 h-3.5" /> Edit
      </button>

      <AnimatePresence>
        {isOpen && !showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-[family-name:var(--font-body)]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={spring}
              className="relative w-full max-w-lg rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 md:p-10 shadow-2xl z-10"
            >
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <span className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-ink-muted)] mb-1 block">
                    tweak the schedule
                  </span>
                  <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--color-ink)] tracking-tight">
                    Edit Item
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-colors disabled:opacity-50 bg-[var(--color-cream)] hover:bg-[var(--color-tomato)]/10 p-2 rounded-full"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <p className="text-xs text-[var(--color-tomato)] mb-4 bg-[var(--color-tomato)]/10 p-3 rounded-xl text-center font-medium">
                  {error}
                </p>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="grid gap-6">
                {/* No redirect_plan_id or meal_plan_id needed – we handle everything client-side */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                    Recipe
                  </label>
                  <select
                    name="recipe_id"
                    required
                    disabled={isLoading}
                    defaultValue={String(recipe_id)}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner cursor-pointer"
                  >
                    {recipes.map((recipe) => (
                      <option key={recipe.recipe_id} value={recipe.recipe_id}>
                        {recipe.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                    Scheduled Date
                  </label>
                  <input
                    name="scheduled_for"
                    type="date"
                    disabled={isLoading}
                    defaultValue={scheduled_for ?? ""}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] font-[family-name:var(--font-mono)] text-[var(--color-ink)] focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                      Meal Type
                    </label>
                    <input
                      name="meal_type"
                      type="text"
                      disabled={isLoading}
                      defaultValue={meal_type ?? ""}
                      placeholder="e.g. Lunch"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/50 focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                      Servings
                    </label>
                    <input
                      name="servings"
                      type="number"
                      min={1}
                      disabled={isLoading}
                      defaultValue={servings ?? ""}
                      placeholder="Qty"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] font-[family-name:var(--font-mono)] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/50 focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-6 mt-2 border-t border-[var(--color-border-light)]">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-full bg-[var(--color-ink)] px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-cream)] hover:bg-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-md cursor-pointer"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="flex-1 rounded-full border border-[var(--color-border)] bg-transparent px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    disabled={isLoading}
                    onClick={handleDelete}
                    className="rounded-full bg-[var(--color-tomato)]/10 text-[var(--color-tomato)] border border-[var(--color-tomato)]/20 p-3.5 focus:outline-none disabled:opacity-50 hover:bg-[var(--color-tomato)] hover:text-white transition-colors cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/50 backdrop-blur-sm font-[family-name:var(--font-body)]"
          >
            <div className="bg-[var(--color-warm-surface)] rounded-[2rem] p-8 text-center shadow-2xl">
              <BasilSuccess size={80} />
              <p className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-text-primary)] mt-4">
                Plan updated! 🎉
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}