// src/app/pantry/components/AdminPantryList.tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pencil, Trash2, Check, X, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PantryRow, ConsumerInfo } from "../types";

type Props = {
  pantries: PantryRow[];
  consumers: Map<number, ConsumerInfo>;
  selectedId: number | null;
  editId: number | null;
  editName: string;
  onSelect: (id: number) => void;
  onEditStart: (id: number, name: string) => void;
  onEditNameChange: (name: string) => void;
  onEditSave: (id: number) => void;
  onEditCancel: () => void;
  onDelete: (id: number) => void;
};

export function AdminPantryList({
  pantries,
  consumers,
  selectedId,
  editId,
  editName,
  onSelect,
  onEditStart,
  onEditNameChange,
  onEditSave,
  onEditCancel,
  onDelete,
}: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "owner">("name");

  const filtered = useMemo(() => {
    let list = pantries;
    if (search.trim()) {
      const lc = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.pantry_name.toLowerCase().includes(lc) ||
          consumers.get(p.consumer_id ?? 0)?.email?.toLowerCase().includes(lc)
      );
    }
    if (sortBy === "name") {
      list = [...list].sort((a, b) => a.pantry_name.localeCompare(b.pantry_name));
    } else {
      list = [...list].sort((a, b) => {
        const emailA = consumers.get(a.consumer_id ?? 0)?.email ?? "";
        const emailB = consumers.get(b.consumer_id ?? 0)?.email ?? "";
        return emailA.localeCompare(emailB);
      });
    }
    return list;
  }, [pantries, search, sortBy, consumers]);

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-muted)]" />
          <input
            type="text"
            placeholder="Search by pantry name or owner email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] focus:border-[var(--color-sage)] outline-none"
          />
        </div>
        <div className="flex gap-2 text-xs font-bold uppercase tracking-widest">
          <button
            onClick={() => setSortBy("name")}
            className={cn(
              "px-3 py-1.5 rounded-full border transition-colors",
              sortBy === "name"
                ? "bg-[var(--color-sage)] text-white border-[var(--color-sage)]"
                : "bg-[var(--color-surface)] text-[var(--color-ink-muted)] border-[var(--color-border-light)]"
            )}
          >
            Name
          </button>
          <button
            onClick={() => setSortBy("owner")}
            className={cn(
              "px-3 py-1.5 rounded-full border transition-colors",
              sortBy === "owner"
                ? "bg-[var(--color-sage)] text-white border-[var(--color-sage)]"
                : "bg-[var(--color-surface)] text-[var(--color-ink-muted)] border-[var(--color-border-light)]"
            )}
          >
            Owner
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-warm-surface-2)] text-[var(--color-ink-muted)] text-xs uppercase tracking-widest">
              <tr>
                <th className="px-5 py-3 text-left font-bold">Pantry Name</th>
                <th className="px-5 py-3 text-left font-bold">Owner</th>
                <th className="px-5 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((pantry) => {
                  const owner = pantry.consumer_id
                    ? consumers.get(pantry.consumer_id)
                    : undefined;
                  const isSelected = selectedId === pantry.pantry_id;
                  const isEditing = editId === pantry.pantry_id;

                  return (
                    <motion.tr
                      key={pantry.pantry_id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "border-t border-[var(--color-border-light)] transition-colors",
                        isSelected
                          ? "bg-[var(--color-sage-soft)]"
                          : "hover:bg-[var(--color-warm-surface-2)] cursor-pointer"
                      )}
                      onClick={() => {
                        if (!isEditing) onSelect(pantry.pantry_id);
                      }}
                    >
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => onEditNameChange(e.target.value)}
                              className="flex-1 rounded border border-[var(--color-border)] px-2 py-1 text-sm"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditSave(pantry.pantry_id);
                              }}
                              className="p-1 rounded bg-[var(--color-sage)] text-white"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditCancel();
                              }}
                              className="p-1 rounded bg-gray-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-semibold text-[var(--color-ink)]">
                            {pantry.pantry_name}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">
                        {owner ? (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {owner.email}
                            {owner.username ? ` (${owner.username})` : ""}
                          </div>
                        ) : (
                          <span className="italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!isEditing && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditStart(pantry.pantry_id, pantry.pantry_name);
                                }}
                                className="p-1.5 rounded-lg hover:bg-[var(--color-warm-surface-2)] text-[var(--color-ink-muted)]"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(pantry.pantry_id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {!isEditing && (
                            <span className="ml-2 text-[var(--color-sage)]">
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-[var(--color-ink-muted)] italic">
                    No pantries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}