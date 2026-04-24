// components/meal-plan/add-meal-plan-item-modal.tsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Plus, ChefHat, Globe } from "lucide-react";
import { spring } from "@/lib/animation";
import { cn } from "@/lib/utils";
import { BasilSuccess } from "../components/mascot/BasilComponents";
import { useRouter } from "next/navigation";

type RecipeOption = {
  recipe_id: number;
  title: string;
};

type Props = {
  meal_plan_id: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
  consumerId: number | null;
};

export function AddMealPlanItemModal({
  meal_plan_id,
  supabaseUrl,
  supabaseAnonKey,
  consumerId,
}: Props) {
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<"personal" | "public">("personal");
  const [allRecipes, setAllRecipes] = useState<RecipeOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();
  // Fetch recipes whenever tab or consumerId changes
  useEffect(() => {
    if (!isOpen || (!consumerId && tab === "personal")) return;

    async function fetchRecipes() {
      let query = supabase
        .from("recipe")
        .select("recipe_id, title")
        .order("title", { ascending: true });

      if (tab === "personal" && consumerId) {
        query = query.eq("consumer_id", consumerId);
      } else if (tab === "public") {
        query = query.eq("is_public", true);
        if (consumerId) query = query.neq("consumer_id", consumerId);
      }

      const { data } = await query;
      if (data) setAllRecipes(data as RecipeOption[]);
    }

    fetchRecipes();
  }, [isOpen, tab, consumerId, supabase]);

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return allRecipes;
    const lower = searchQuery.toLowerCase();
    return allRecipes.filter((r) => r.title.toLowerCase().includes(lower));
  }, [allRecipes, searchQuery]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRecipeId) {
      setError("Please select a recipe first.");
      return;
    }

    const form = formRef.current;
    if (!form) return;

    const scheduledFor = (form.elements.namedItem("scheduled_for") as HTMLInputElement)?.value || null;
    const mealType = (form.elements.namedItem("meal_type") as HTMLInputElement)?.value || null;
    const servingsRaw = (form.elements.namedItem("servings") as HTMLInputElement)?.value;
    const servings = servingsRaw ? Number(servingsRaw) : null;

    setIsLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("meal_plan_item").insert({
      meal_plan_id,
      recipe_id: selectedRecipeId,
      scheduled_for: scheduledFor,
      meal_type: mealType || null,
      servings,
    });

    setIsLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.refresh();
    // Success: show celebration, close modal, refresh parent
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsOpen(false);
      setSelectedRecipeId(null);
      setSearchQuery("");
      form.reset();
    }, 1500);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedRecipeId(null);
    setSearchQuery("");
    setError("");
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(true)}
        className="bg-[var(--color-sage)] text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#3c8247] transition-colors shadow-[0_4px_14px_rgba(74,156,87,0.2)] flex items-center gap-2 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" /> Add Recipe
      </motion.button>

      <AnimatePresence>
        {isOpen && !showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-[family-name:var(--font-body)]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={spring}
              className="relative w-full max-w-lg rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-2xl z-10 max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <span className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-sage)] block mb-1">
                    expand your menu
                  </span>
                  <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--color-ink)] tracking-tight">
                    Add Item
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  disabled={isLoading}
                  className="text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-colors disabled:opacity-50 bg-[var(--color-cream)] hover:bg-[var(--color-tomato)]/10 p-2 rounded-full"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs, search, recipe list (same as before) */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => { setTab("personal"); setSelectedRecipeId(null); }}
                  className={cn("flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    tab === "personal" ? "bg-[var(--color-sage-soft)] text-[var(--color-sage)] border border-[var(--color-sage)]/30" : "bg-[var(--color-warm-surface-2)] text-[var(--color-ink-muted)] border border-[var(--color-border)]")}
                >
                  <ChefHat className="w-3.5 h-3.5" /> My Kitchen
                </button>
                <button
                  onClick={() => { setTab("public"); setSelectedRecipeId(null); }}
                  className={cn("flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    tab === "public" ? "bg-[var(--color-sage-soft)] text-[var(--color-sage)] border border-[var(--color-sage)]/30" : "bg-[var(--color-warm-surface-2)] text-[var(--color-ink-muted)] border border-[var(--color-border)]")}
                >
                  <Globe className="w-3.5 h-3.5" /> Community
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-muted)]" />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/60 focus:border-[var(--color-sage)] outline-none"
                />
              </div>

              <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1 hide-scrollbar">
                {filteredRecipes.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-cream)]/50">
                    <ChefHat className="w-6 h-6 text-[var(--color-border)] mx-auto mb-2" />
                    <p className="text-xs text-[var(--color-ink-muted)] italic">No recipes found</p>
                  </div>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <motion.div
                      key={recipe.recipe_id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRecipeId(recipe.recipe_id)}
                      className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all",
                        selectedRecipeId === recipe.recipe_id ? "border-[var(--color-sage)] bg-[var(--color-sage-soft)]" : "border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-sage)] hover:bg-[var(--color-sage-soft)]/50")}
                    >
                      <div className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        selectedRecipeId === recipe.recipe_id ? "border-[var(--color-sage)] bg-[var(--color-sage)]" : "border-[var(--color-border)]")}>
                        {selectedRecipeId === recipe.recipe_id && (
                          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-[var(--color-ink)] line-clamp-1">{recipe.title}</span>
                    </motion.div>
                  ))
                )}
              </div>

              {error && (
                <p className="text-xs text-[var(--color-tomato)] mt-2">{error}</p>
              )}

              {/* Scheduling fields */}
              <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 mt-6 pt-4 border-t border-[var(--color-border-light)]">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">Scheduled Date</label>
                  <input name="scheduled_for" type="date" required disabled={isLoading} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-sm font-mono text-[var(--color-ink)] focus:border-[var(--color-sage)] outline-none disabled:opacity-50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">Meal Type</label>
                    <input name="meal_type" type="text" placeholder="e.g. Dinner" disabled={isLoading} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/50 focus:border-[var(--color-sage)] outline-none disabled:opacity-50" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">Servings</label>
                    <input name="servings" type="number" min={1} placeholder="Qty" disabled={isLoading} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-sm font-mono text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/50 focus:border-[var(--color-sage)] outline-none disabled:opacity-50" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isLoading || !selectedRecipeId}
                    className="flex-1 rounded-full bg-[var(--color-ink)] px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-cream)] hover:bg-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-md cursor-pointer"
                  >
                    {isLoading ? "Adding..." : "Add to Plan"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={closeModal}
                    disabled={isLoading}
                    className="flex-1 rounded-full border border-[var(--color-border)] bg-transparent px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Success celebration overlay */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/50 backdrop-blur-sm"
          >
            <div className="bg-[var(--color-warm-surface)] rounded-[2rem] p-8 text-center shadow-2xl">
              <BasilSuccess size={80} />
              <p className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-text-primary)] mt-4">
                Added to your plan! 🎉
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}