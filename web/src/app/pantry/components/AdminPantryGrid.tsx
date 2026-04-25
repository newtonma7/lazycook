// components/AdminPantryGrid.tsx
import { motion } from "framer-motion";
import { User, Pencil, Trash2, Check, X } from "lucide-react";
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

export function AdminPantryGrid({
  pantries, consumers, selectedId, editId, editName,
  onSelect, onEditStart, onEditNameChange, onEditSave, onEditCancel, onDelete
}: Props) {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pantries.map(pantry => {
        const owner = pantry.consumer_id ? consumers.get(pantry.consumer_id) : undefined;
        const isSelected = selectedId === pantry.pantry_id;
        const isEditing = editId === pantry.pantry_id;

        return (
          <motion.div key={pantry.pantry_id} layout
            className={cn(
              "relative rounded-2xl border p-5 transition-all cursor-pointer",
              isSelected ? "border-[var(--color-sage)] bg-[var(--color-sage-soft)] shadow-md" : "border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-sage)]"
            )}
            onClick={() => !isEditing && onSelect(pantry.pantry_id)}
          >
            <div className="absolute top-3 right-3 flex gap-1">
              {!isEditing ? (
                <>
                  <button onClick={e => { e.stopPropagation(); onEditStart(pantry.pantry_id, pantry.pantry_name); }} className="p-1 rounded hover:bg-[var(--color-warm-surface-2)]">
                    <Pencil className="w-4 h-4 text-[var(--color-ink-muted)]" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); onDelete(pantry.pantry_id); }} className="p-1 rounded hover:bg-red-100">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </>
              ) : (
                <div className="flex gap-1">
                  <button onClick={e => { e.stopPropagation(); onEditSave(pantry.pantry_id); }} className="p-1 rounded bg-[var(--color-sage)] text-white">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); onEditCancel(); }} className="p-1 rounded bg-gray-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={e => onEditNameChange(e.target.value)}
                className="font-semibold text-[var(--color-ink)] w-full pr-20 border rounded px-2 py-1 text-sm"
                autoFocus
              />
            ) : (
              <h3 className="font-semibold text-[var(--color-ink)] truncate pr-16">{pantry.pantry_name}</h3>
            )}
            {owner && !isEditing && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-[var(--color-ink-muted)]">
                <User className="w-3 h-3" />
                {owner.email}{owner.username ? ` (${owner.username})` : ""}
              </div>
            )}
            <div className="mt-3 text-xs text-[var(--color-ink-muted)]">
              {/* Optional: item count could go here in future */}
              {/* If we want item count, we'd need to pass it in, but for now skip */}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}