// src/app/ingredients/IngredientPanel.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIngredients } from "./hooks/useIngredients";
import { IngredientGrid } from "./components/IngredientGrid";
import { AddIngredientModal } from "./components/AddIngredientModal";
import { SearchAndFilter } from "./components/SearchAndFilter";
import { BasilSuccess } from "../components/mascot/BasilComponents";
import { DynamicAmbientBackground } from "../components/ambient-background/DynamicAmbientBackground";

export type IngredientRow = {
  ingredient_id: number;
  name: string;
  category: string;
  default_unit: string;
  is_allergen: boolean;
};

type Props = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function IngredientPanel({ supabaseUrl, supabaseAnonKey }: Props) {
  const {
    ingredients,
    isLoading,
    isEnriching,
    error,
    search,
    setSearch,
    categories,
    categoryFilter,
    setCategoryFilter,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    enrichIngredient,
    enrichDatabase,
  } = useIngredients(supabaseUrl, supabaseAnonKey);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  });

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, show: true });
    setTimeout(() => setToast({ message: "", show: false }), 2000);
  }, []);

  const handleSave = async (
    data: Omit<IngredientRow, "ingredient_id">
  ): Promise<boolean> => {
    let ok: boolean;
    if (editingId) {
      ok = await updateIngredient(editingId, data);
      if (ok) showToast("Ingredient updated! 🌿");
    } else {
      ok = await addIngredient(data);
      if (ok) showToast("Ingredient added! 🥬");
    }
    if (ok) {
      setModalOpen(false);
      setEditingId(null);
    }
    return ok;
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Remove this ingredient from the master database?")) {
      const ok = await deleteIngredient(id);
      if (ok) showToast("Ingredient removed.");
    }
  };

  const editingIngredient = editingId
    ? ingredients.find((i) => i.ingredient_id === editingId)
    : undefined;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="relative min-h-screen bg-[var(--color-cream)] font-[family-name:var(--font-body)]">
      {/* Ambient floating ingredients – keeps the page alive */}
      <DynamicAmbientBackground />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header with title and action buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-handwritten)] text-4xl text-[var(--color-ink)]">
              Master Ingredients 🥬
            </h1>
            <p className="text-sm text-[var(--color-ink-muted)] mt-1">
              Manage the global ingredient catalog.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => {
                setEditingId(null);
                setModalOpen(true);
              }}
              disabled={mounted && isEnriching}
              className="bg-[var(--color-sage)] text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#3c8247] disabled:opacity-50 flex items-center gap-2 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Add Ingredient
            </button>

            <button
              onClick={async () => {
                const ok = await enrichDatabase();
                if (ok) showToast("New ingredients imported! 🥗");
              }}
              disabled={mounted && (isEnriching || isLoading)}
              className="border border-[var(--color-border)] bg-transparent text-[var(--color-ink)] px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-[var(--color-ink)] hover:bg-[var(--color-surface)] disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isEnriching ? (
                <>
                  <span className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-[var(--color-ink)] border-t-transparent" />
                  Enriching…
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Enrich Database
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search and category filter chips */}
        <div className="mb-6">
          <SearchAndFilter
            search={search}
            onSearchChange={setSearch}
            categories={categories}
            selectedCategory={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />
        </div>

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[var(--color-tomato)]/20 bg-[var(--color-tomato)]/10 p-4 text-sm text-[var(--color-tomato)] mb-4"
          >
            {error}
          </motion.div>
        )}

        {/* Ingredient cards grid */}
        <IngredientGrid
          ingredients={ingredients}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onEnrich={enrichIngredient}
        />

        {/* Add / Edit modal */}
        <AddIngredientModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingId(null);
          }}
          onSave={handleSave}
          initial={editingIngredient}
        />

        {/* Success toast with Basil */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-warm-surface)] border border-[var(--color-sage)] rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3"
            >
              <BasilSuccess size={40} />
              <p className="font-[family-name:var(--font-handwritten)] text-lg text-[var(--color-text-primary)]">
                {toast.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}