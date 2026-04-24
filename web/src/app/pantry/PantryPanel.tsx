// components/pantry/PantryPanel.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  Pencil,
  X,
  User,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { spring, microEase, bouncySpring } from "@/lib/animation";
import { AmbientBackground } from "../components/ambient-background/AmbientBackground";
import { BasilEmpty } from "../components/mascot/BasilComponents";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type PantryRow = {
  pantry_id: number;
  consumer_id: number | null;
  pantry_name: string;
};

type PantryItemRow = {
  pantry_item_id: number;
  pantry_id: number;
  ingredient_id: number;
  purchase_date: string | null;
  quantity_on_hand: string | number | null;
  unit: string | null;
  expiration_date: string | null;
};

type IngredientOption = {
  ingredient_id: number;
  name: string;
};

type ConsumerInfo = {
  consumer_id: number;
  email: string;
  username: string | null;
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function daysLeft(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const exp = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function urgencyColor(expiryDate: string | null): string {
  if (!expiryDate) return "var(--color-sage)";
  const days = daysLeft(expiryDate);
  if (days === null || days > 6) return "var(--color-sage)";
  if (days >= 2) return "var(--color-butter)";
  return "var(--color-terracotta)";
}

function urgencyLabel(expiryDate: string | null): string | null {
  if (!expiryDate) return null;
  const days = daysLeft(expiryDate);
  if (days === null || days > 6) return null;
  if (days >= 2) return "Use me soon! 🧡";
  return "Use me now! 🔥";
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function PantryPanel({
  supabaseUrl,
  supabaseAnonKey,
  consumerId,
  isAdmin = false,
}: {
  supabaseUrl: string;
  supabaseAnonKey: string;
  consumerId: number | null;
  isAdmin?: boolean;
}) {
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );

  const [pantries, setPantries] = useState<PantryRow[]>([]);
  const [consumers, setConsumers] = useState<ConsumerInfo[]>([]);
  const [selectedPantryId, setSelectedPantryId] = useState<number | null>(null);
  const [items, setItems] = useState<PantryItemRow[]>([]);
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNewPantryForm, setShowNewPantryForm] = useState(false);
  const [newPantryName, setNewPantryName] = useState("");
  const [newPantryConsumerId, setNewPantryConsumerId] = useState<number | "">(
    isAdmin ? "" : consumerId ?? ""
  );
  const [editPantryId, setEditPantryId] = useState<number | null>(null);
  const [editPantryName, setEditPantryName] = useState("");
  const [error, setError] = useState("");

  // New item form fields
  const [newIngredient, setNewIngredient] = useState<number | "">("");
  const [newQty, setNewQty] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newPurchaseDate, setNewPurchaseDate] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("");

  /* ------------------------- data fetching --------------------------------- */
  const fetchPantries = async () => {
    let query = supabase
      .from("pantry")
      .select("pantry_id, consumer_id, pantry_name")
      .order("pantry_name");

    if (!isAdmin && consumerId) {
      query = query.eq("consumer_id", consumerId);
    }

    const { data, error: err } = await query;
    if (err) {
      setError("Failed to load pantries.");
    } else {
      const pantriesData = (data ?? []) as PantryRow[];
      setPantries(pantriesData);
      if (pantriesData.length > 0) {
        setSelectedPantryId((prev) =>
          prev && pantriesData.some((p) => p.pantry_id === prev)
            ? prev
            : pantriesData[0].pantry_id
        );
      } else {
        setSelectedPantryId(null);
      }
    }
  };

  const fetchConsumers = async () => {
    if (!isAdmin) return;
    const { data, error: err } = await supabase
      .from("consumer")
      .select("consumer_id, email, username")
      .order("email");
    if (!err && data) {
      setConsumers(data as ConsumerInfo[]);
    }
  };

  const fetchItems = async (pantryId: number) => {
    const { data, error: err } = await supabase
      .from("pantry_item")
      .select(
        "pantry_item_id, pantry_id, ingredient_id, purchase_date, quantity_on_hand, unit, expiration_date"
      )
      .eq("pantry_id", pantryId)
      .order("pantry_item_id");
    if (err) setError("Failed to load ingredients.");
    else setItems((data ?? []) as PantryItemRow[]);
  };

  const fetchIngredients = async () => {
    const { data, error: err } = await supabase
      .from("ingredient")
      .select("ingredient_id, name")
      .order("name");
    if (err) setError("Failed to load ingredient list.");
    else setIngredients((data ?? []) as IngredientOption[]);
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchPantries(), fetchConsumers(), fetchIngredients()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [consumerId, isAdmin]);

  useEffect(() => {
    if (selectedPantryId) fetchItems(selectedPantryId);
    else setItems([]);
  }, [selectedPantryId]);

  /* ------------------------- derived data ---------------------------------- */
  const consumerMap = useMemo(() => {
    const map = new Map<number, ConsumerInfo>();
    consumers.forEach((c) => map.set(c.consumer_id, c));
    return map;
  }, [consumers]);

  const ingredientNameById = useMemo(() => {
    const map = new Map<number, string>();
    ingredients.forEach((i) => map.set(i.ingredient_id, i.name));
    return map;
  }, [ingredients]);

  const filteredItems = search.trim()
    ? items.filter((item) => {
        const name = ingredientNameById.get(item.ingredient_id)?.toLowerCase() ?? "";
        return name.includes(search.toLowerCase());
      })
    : items;

  /* ------------------------- handlers -------------------------------------- */
  const handleCreatePantry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPantryName.trim()) return;
    if (isAdmin && !newPantryConsumerId) {
      setError("Please select a consumer for the pantry.");
      return;
    }
    const payload: any = { pantry_name: newPantryName.trim() };
    if (isAdmin) payload.consumer_id = newPantryConsumerId;
    else if (consumerId) payload.consumer_id = consumerId;

    const { error: err } = await supabase.from("pantry").insert(payload);
    if (err) {
      setError("Could not create pantry.");
      return;
    }
    setNewPantryName("");
    setNewPantryConsumerId(isAdmin ? "" : consumerId ?? "");
    setShowNewPantryForm(false);
    await fetchPantries();
    setError("");
  };

  const handleUpdatePantry = async (pantryId: number) => {
    if (!editPantryName.trim()) return;
    const { error: err } = await supabase
      .from("pantry")
      .update({ pantry_name: editPantryName.trim() })
      .eq("pantry_id", pantryId);
    if (err) {
      setError("Could not rename pantry.");
      return;
    }
    setEditPantryId(null);
    setEditPantryName("");
    await fetchPantries();
    setError("");
  };

  const handleDeletePantry = async (pantryId: number) => {
    if (!confirm("Delete this pantry and all its items? This cannot be undone.")) return;
    const { error: err } = await supabase
      .from("pantry")
      .delete()
      .eq("pantry_id", pantryId);
    if (err) {
      setError("Could not delete pantry.");
      return;
    }
    if (selectedPantryId === pantryId) {
      setSelectedPantryId(null);
    }
    await fetchPantries();
    setError("");
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient || !selectedPantryId) return;
    const { error: err } = await supabase.from("pantry_item").insert({
      pantry_id: selectedPantryId,
      ingredient_id: newIngredient,
      quantity_on_hand: newQty || null,
      unit: newUnit || null,
      purchase_date: newPurchaseDate || null,
      expiration_date: newExpiryDate || null,
    });
    if (err) {
      setError("Could not add ingredient. It may already exist.");
      return;
    }
    setNewIngredient("");
    setNewQty("");
    setNewUnit("");
    setNewPurchaseDate("");
    setNewExpiryDate("");
    setShowAddForm(false);
    fetchItems(selectedPantryId);
    setError("");
  };

  const handleDeleteItem = async (itemId: number) => {
    const { error: err } = await supabase
      .from("pantry_item")
      .delete()
      .eq("pantry_item_id", itemId);
    if (err) {
      setError("Could not remove ingredient.");
      return;
    }
    fetchItems(selectedPantryId!);
    setError("");
  };

  /* ------------------------- render ---------------------------------------- */
  if (loading) {
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

  return (
    <div className="relative min-h-screen bg-[var(--color-cream)] font-[family-name:var(--font-body)]">
      <AmbientBackground elements={["🥕", "🌿", "🫐", "🧅", "🍋", "🌾"]} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <BasilEmpty />
            <h1 className="font-[family-name:var(--font-handwritten)] text-4xl text-[var(--color-ink)]">
              {isAdmin ? "all pantries 👥" : "your pantry 🥕"}
            </h1>
          </div>

          {/* Pantry controls — switcher / create / admin actions */}
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <span className="text-xs text-[var(--color-ink-muted)] mr-2">
                {pantries.length} pantry{pantries.length !== 1 && "ies"}
              </span>
            )}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setNewPantryName("");
                setNewPantryConsumerId(isAdmin ? "" : consumerId ?? "");
                setShowNewPantryForm(true);
              }}
              className="flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-linen)] transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Pantry
            </motion.button>
          </div>
        </div>

        {/* New pantry form */}
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
                  className="flex-1 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-sage)]"
                />
                {isAdmin && (
                  <select
                    value={newPantryConsumerId}
                    onChange={(e) => setNewPantryConsumerId(Number(e.target.value))}
                    required
                    className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-sage)]"
                  >
                    <option value="" disabled>
                      Owner (consumer)
                    </option>
                    {consumers.map((c) => (
                      <option key={c.consumer_id} value={c.consumer_id}>
                        {c.email} {c.username ? `(${c.username})` : ""}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--color-sage)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-olive)] transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewPantryForm(false)}
                  className="rounded-xl border border-[var(--color-border-light)] px-4 py-2.5 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-linen)]"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Empty state – no pantries at all */}
        {pantries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <BasilEmpty />
            <h2 className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-ink)] mt-6 mb-2">
              {isAdmin ? "no pantries exist yet" : "your pantry is empty 🪴"}
            </h2>
            <p className="text-[var(--color-ink-muted)] text-center max-w-md mb-6">
              {isAdmin
                ? "Create a new pantry and assign it to a consumer."
                : "Create your first pantry so Basil can start tracking your ingredients."}
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setNewPantryName("");
                setNewPantryConsumerId(isAdmin ? "" : consumerId ?? "");
                setShowNewPantryForm(true);
              }}
              className="rounded-full bg-[var(--color-tomato)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-sm hover:opacity-90"
            >
              <Plus className="inline h-4 w-4 mr-1" /> Create Pantry
            </motion.button>
          </motion.div>
        )}

        {/* Pantry list (admin view) or single pantry (consumer) */}
        {pantries.length > 0 && (
          <>
            {isAdmin ? (
              // Admin: list of all pantries with actions, click to select
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pantries.map((pantry) => {
                  const owner = pantry.consumer_id
                    ? consumerMap.get(pantry.consumer_id)
                    : null;
                  const isSelected = selectedPantryId === pantry.pantry_id;
                  const isEditing = editPantryId === pantry.pantry_id;

                  return (
                    <motion.div
                      key={pantry.pantry_id}
                      layout
                      className={cn(
                        "relative rounded-2xl border p-4 transition-all cursor-pointer",
                        isSelected
                          ? "border-[var(--color-sage)] bg-[var(--color-sage-soft)] shadow-md"
                          : "border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-sage)]"
                      )}
                      onClick={() => {
                        if (!isEditing) setSelectedPantryId(pantry.pantry_id);
                      }}
                    >
                      {/* Edit / delete icons */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditPantryId(pantry.pantry_id);
                            setEditPantryName(pantry.pantry_name);
                          }}
                          className="p-1 rounded hover:bg-[var(--color-warm-surface-2)]"
                        >
                          <Pencil className="h-4 w-4 text-[var(--color-ink-muted)]" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePantry(pantry.pantry_id);
                          }}
                          className="p-1 rounded hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>

                      {/* Pantry info */}
                      <h3 className="font-semibold text-[var(--color-ink)] truncate pr-12">
                        {pantry.pantry_name}
                      </h3>
                      {owner && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-ink-muted)]">
                          <User className="h-3 w-3" />
                          {owner.email}
                          {owner.username && ` (${owner.username})`}
                        </div>
                      )}

                      {/* Inline rename form */}
                      {isEditing && (
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            value={editPantryName}
                            onChange={(e) => setEditPantryName(e.target.value)}
                            className="flex-1 rounded border px-2 py-1 text-sm"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdatePantry(pantry.pantry_id);
                            }}
                            className="p-1 rounded bg-[var(--color-sage)] text-white"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditPantryId(null);
                            }}
                            className="p-1 rounded bg-gray-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              // Consumer: just show the selected pantry dropdown
              <div className="mb-6">
                {pantries.length > 1 && (
                  <select
                    value={selectedPantryId ?? ""}
                    onChange={(e) => setSelectedPantryId(Number(e.target.value))}
                    className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] outline-none focus:border-[var(--color-sage)]"
                  >
                    {pantries.map((p) => (
                      <option key={p.pantry_id} value={p.pantry_id}>
                        {p.pantry_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Ingredient section – only when a pantry is selected */}
            {selectedPantryId && (
              <>
                {/* Search + Add ingredient */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-muted)]" />
                    <input
                      type="text"
                      placeholder="search ingredients..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] outline-none focus:border-[var(--color-sage)]"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 rounded-full bg-[var(--color-tomato)] px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow-sm hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    Add Ingredient
                  </motion.button>
                </div>

                {/* Add ingredient form */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.form
                      onSubmit={handleAddItem}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 border border-[var(--color-border-light)] rounded-2xl bg-[var(--color-surface)] shadow-sm">
                        <select
                          value={newIngredient}
                          onChange={(e) => setNewIngredient(Number(e.target.value))}
                          required
                          className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-sage)]"
                        >
                          <option value="" disabled>
                            Ingredient
                          </option>
                          {ingredients.map((i) => (
                            <option key={i.ingredient_id} value={i.ingredient_id}>
                              {i.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Quantity"
                          value={newQty}
                          onChange={(e) => setNewQty(e.target.value)}
                          className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-4 py-2.5 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Unit"
                          value={newUnit}
                          onChange={(e) => setNewUnit(e.target.value)}
                          className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-4 py-2.5 text-sm"
                        />
                        <input
                          type="date"
                          value={newPurchaseDate}
                          onChange={(e) => setNewPurchaseDate(e.target.value)}
                          className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-4 py-2.5 text-sm"
                        />
                        <input
                          type="date"
                          value={newExpiryDate}
                          onChange={(e) => setNewExpiryDate(e.target.value)}
                          className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-linen)] px-4 py-2.5 text-sm"
                        />
                        <div className="sm:col-span-2 lg:col-span-1 flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 rounded-xl bg-[var(--color-sage)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-olive)] transition-colors"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="rounded-xl border border-[var(--color-border-light)] px-4 py-2.5 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-linen)]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-xl border border-[var(--color-tomato)]/20 bg-[var(--color-terracotta-soft)] px-4 py-2 text-sm text-[var(--color-tomato)]"
                  >
                    <AlertCircle className="inline h-4 w-4 mr-1" /> {error}
                  </motion.div>
                )}

                {/* Ingredient cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {filteredItems.map((item) => {
                      const name = ingredientNameById.get(item.ingredient_id) ?? "Unknown";
                      const qty = item.quantity_on_hand ? `${item.quantity_on_hand}` : "";
                      const unit = item.unit ?? "";
                      const expiry = item.expiration_date;
                      const urgency = urgencyColor(expiry);
                      const label = urgencyLabel(expiry);

                      return (
                        <motion.div
                          key={item.pantry_item_id}
                          layout
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={bouncySpring}
                          className="group relative flex flex-col justify-between rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                          {/* Expiry left bar */}
                          <div
                            className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
                            style={{ backgroundColor: urgency }}
                          />
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-[var(--color-ink)] truncate">
                                {name}
                              </h3>
                              {qty && (
                                <span className="text-sm text-[var(--color-ink-light)]">
                                  {qty} {unit}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteItem(item.pantry_item_id)}
                              className="text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-colors ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-xs">
                            {expiry ? (
                              <>
                                <Calendar className="h-3.5 w-3.5" style={{ color: urgency }} />
                                <span className="font-mono" style={{ color: urgency }}>
                                  {expiry}
                                </span>
                              </>
                            ) : (
                              <span className="text-[var(--color-ink-muted)] italic">No expiry</span>
                            )}
                          </div>
                          {label && (
                            <span
                              className="mt-2 text-xs font-bold uppercase tracking-wide"
                              style={{ color: urgency }}
                            >
                              {label}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {filteredItems.length === 0 && !loading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16">
                      <p className="text-[var(--color-ink-muted)] text-lg italic">
                        no ingredients here yet 🥕
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}