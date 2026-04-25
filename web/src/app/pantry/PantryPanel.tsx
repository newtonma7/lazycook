// src/app/pantry/PantryPanel.tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { DynamicAmbientBackground } from "../components/ambient-background/DynamicAmbientBackground";
import { BasilEmpty, BasilError } from "../components/mascot/BasilComponents";
import { usePantries } from "./hooks/usePantries";
import { usePantryItems } from "./hooks/usePantryItems";
import { useIngredients } from "./hooks/useIngredients";
import { AdminPantryList } from "./components/AdminPantryList";
import { AddIngredientForm } from "./components/AddIngredientForm";
import { ExpiryBanner } from "./components/ExpiryBanner";
import { PantryHeader } from "./components/PantryHeader";
import { PantryItemCard } from "./components/PantryItemCard";
import { PantryDetail } from "./components/PantryDetail";
import { daysLeft, urgencyColor, urgencyLabel } from "@/app/helpers/dateUtils";

type Props = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  consumerId: number | null;
  isAdmin?: boolean;
};

export function PantryPanel({ supabaseUrl, supabaseAnonKey, consumerId, isAdmin = false }: Props) {
  const {
    pantries,
    consumers,
    selectedPantryId,
    setSelectedPantryId,
    loading: pantriesLoading,
    error: pantriesError,
    setError: setPantriesError,
    createPantry,
    updatePantry,
    deletePantry,
  } = usePantries(supabaseUrl, supabaseAnonKey, consumerId, isAdmin);

  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    addItem,
    deleteItem,
    fetchItems,
  } = usePantryItems(supabaseUrl, supabaseAnonKey, selectedPantryId);

  const { ingredients, ingredientNameById } = useIngredients(supabaseUrl, supabaseAnonKey);

  const [search, setSearch] = useState("");
  const [showNewPantryForm, setShowNewPantryForm] = useState(false);
  const [newPantryName, setNewPantryName] = useState("");
  const [newPantryConsumerId, setNewPantryConsumerId] = useState<number | "">(
    isAdmin ? "" : consumerId ?? ""
  );
  const [editPantryId, setEditPantryId] = useState<number | null>(null);
  const [editPantryName, setEditPantryName] = useState("");
  const [localError, setLocalError] = useState("");

  const error = pantriesError || itemsError || localError;

  // ── Handlers ──────────────────────────────────────

  const handleNewPantryOpen = () => {
    setNewPantryName("");
    setNewPantryConsumerId(isAdmin ? "" : consumerId ?? "");
    setShowNewPantryForm(true);
  };

  const handleCreatePantry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPantryName.trim()) return;
    const ok = await createPantry(
      newPantryName.trim(),
      isAdmin ? (newPantryConsumerId as number) : consumerId
    );
    if (!ok) setLocalError("Could not create pantry.");
    else setShowNewPantryForm(false);
  };

  const handleUpdatePantry = async (id: number) => {
    const ok = await updatePantry(id, editPantryName.trim());
    if (!ok) setLocalError("Could not rename pantry.");
    else {
      setEditPantryId(null);
      setEditPantryName("");
    }
  };

  const handleDeletePantry = async (id: number) => {
    if (!confirm("Delete this pantry and all its items?")) return;
    const ok = await deletePantry(id);
    if (!ok) setLocalError("Could not delete pantry.");
  };

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const l = search.toLowerCase();
    return items.filter((item) => {
      const name = ingredientNameById.get(item.ingredient_id)?.toLowerCase() ?? "";
      return name.includes(l);
    });
  }, [items, search, ingredientNameById]);

  const handleAddItem = async (item: Omit<import("./types").PantryItemRow, "pantry_item_id">) => {
    if (!selectedPantryId) return false;
    const ok = await addItem({ ...item, pantry_id: selectedPantryId });
    if (ok) {
      fetchItems(); // force a refresh to guarantee UI update
      return true;
    }
    return false;
  };

  // ── Loading / empty states ─────────────────────────

  if (pantriesLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-[var(--color-cream)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-8 h-8 border-2 border-[var(--color-sage)] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!consumerId && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-96 bg-[var(--color-cream)]">
        <p className="text-[var(--color-ink-muted)] italic">
          Please log in as a consumer to view your pantry.
        </p>
      </div>
    );
  }

  // ── Selected pantry details (for PantryDetail wrapper) ─

  const selectedPantry = selectedPantryId
    ? pantries.find((p) => p.pantry_id === selectedPantryId)
    : undefined;
  const selectedOwner = selectedPantry?.consumer_id
    ? consumers.get(selectedPantry.consumer_id)
    : undefined;

  // ── Render ─────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-[var(--color-cream)] font-[family-name:var(--font-body)]">
      <DynamicAmbientBackground />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* ── Header ── */}
        <PantryHeader
          isAdmin={isAdmin}
          pantryCount={pantries.length}
          selectedName={
            selectedPantryId
              ? pantries.find((p) => p.pantry_id === selectedPantryId)?.pantry_name
              : undefined
          }
          onNewPantry={handleNewPantryOpen}
        />

        {/* ── New Pantry Form ── */}
        <AnimatePresence>
          {showNewPantryForm && (
            <motion.form
              onSubmit={handleCreatePantry}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-3 p-4 border border-[var(--color-border-light)] rounded-2xl bg-[var(--color-surface)] shadow-sm">
                <input
                  type="text"
                  placeholder="Pantry name (e.g. Main Kitchen)"
                  value={newPantryName}
                  onChange={(e) => setNewPantryName(e.target.value)}
                  required
                  className="flex-1 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-sage)]"
                />
                {isAdmin && (
                  <select
                    value={newPantryConsumerId}
                    onChange={(e) => setNewPantryConsumerId(Number(e.target.value))}
                    required
                    className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-4 py-2.5 text-sm outline-none"
                  >
                    <option value="" disabled>
                      Owner (consumer)
                    </option>
                    {Array.from(consumers.values()).map((c) => (
                      <option key={c.consumer_id} value={c.consumer_id}>
                        {c.email}
                        {c.username ? ` (${c.username})` : ""}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--color-sage)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-olive)]"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewPantryForm(false)}
                  className="rounded-xl border border-[var(--color-border-light)] px-4 py-2.5 text-sm text-[var(--color-ink-muted)]"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* ── Empty State ── */}
        {pantries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <BasilEmpty size={90} />
            <h2 className="font-[family-name:var(--font-handwritten)] text-3xl text-[var(--color-ink)] mt-6 mb-3">
              {isAdmin ? "No pantries yet" : "Your pantry is empty 🪴"}
            </h2>
            <p className="text-[var(--color-ink-muted)] text-center max-w-md mb-6">
              {isAdmin
                ? "Create a new pantry and assign it to a consumer."
                : "Start tracking ingredients so Basil can suggest recipes."}
            </p>
            <button
              onClick={handleNewPantryOpen}
              className="rounded-full bg-[var(--color-tomato)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-sm hover:opacity-90"
            >
              <Plus className="inline w-4 h-4 mr-1" /> Create Pantry
            </button>
          </motion.div>
        )}

        {/* ── Pantry List / Select ── */}
        {pantries.length > 0 && (
          <>
            {isAdmin ? (
              <AdminPantryList
                pantries={pantries}
                consumers={consumers}
                selectedId={selectedPantryId}
                editId={editPantryId}
                editName={editPantryName}
                onSelect={setSelectedPantryId}
                onEditStart={(id, name) => {
                  setEditPantryId(id);
                  setEditPantryName(name);
                }}
                onEditNameChange={setEditPantryName}
                onEditSave={handleUpdatePantry}
                onEditCancel={() => {
                  setEditPantryId(null);
                  setEditPantryName("");
                }}
                onDelete={handleDeletePantry}
              />
            ) : (
              pantries.length > 1 && (
                <div className="mb-6">
                  <select
                    value={selectedPantryId ?? ""}
                    onChange={(e) => setSelectedPantryId(Number(e.target.value))}
                    className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium"
                  >
                    {pantries.map((p) => (
                      <option key={p.pantry_id} value={p.pantry_id}>
                        {p.pantry_name}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}

            {/* ── Ingredient Section (wrapped in PantryDetail for admin scroll) ── */}
            {selectedPantryId && (
              <PantryDetail selectedPantry={selectedPantry} owner={selectedOwner}>
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]" />
                    <input
                      type="text"
                      placeholder="Search ingredients..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] text-sm"
                    />
                  </div>
                  <AddIngredientForm ingredients={ingredients} onAddItem={handleAddItem} />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-xl border border-[var(--color-tomato)]/20 bg-[var(--color-terracotta-soft)] px-4 py-2 text-sm flex items-center gap-3"
                  >
                    <BasilError size={30} />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {filteredItems.map((item) => (
                      <PantryItemCard
                        key={item.pantry_item_id}
                        item={item}
                        ingredientName={ingredientNameById.get(item.ingredient_id) ?? "Unknown"}
                        onDelete={deleteItem}
                        urgencyColor={urgencyColor(item.expiration_date)}
                        urgencyLabel={urgencyLabel(item.expiration_date)}
                      />
                    ))}
                  </AnimatePresence>
                  {filteredItems.length === 0 && !itemsLoading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-[var(--color-ink-muted)] italic text-lg">
                      no ingredients here yet 🥕
                    </div>
                  )}
                </div>

                <ExpiryBanner items={items} />
              </PantryDetail>
            )}
          </>
        )}
      </div>
    </div>
  );
}