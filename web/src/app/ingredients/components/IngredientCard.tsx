// components/IngredientCard.tsx
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { spring } from "@/lib/animation";
import { EnrichButton } from "./EnrichButton";
import type { IngredientRow } from "../types";

type Props = {
  ingredient: IngredientRow;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onEnrich: (id: number) => Promise<boolean>;
};

export function IngredientCard({ ingredient, onEdit, onDelete, onEnrich }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={spring}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow group relative"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15px] text-[var(--color-ink)] truncate">
            {ingredient.name}
          </h3>
          <p className="text-xs text-[var(--color-ink-muted)]">
            {ingredient.category || "—"}
          </p>
        </div>
        {ingredient.is_allergen && (
          <span className="shrink-0 text-[0.6rem] font-bold uppercase tracking-widest bg-[var(--color-tomato)]/10 text-[var(--color-tomato)] px-2 py-0.5 rounded-full">
            Allergen
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-[var(--color-ink-light)]">
          {ingredient.default_unit || "—"}
        </span>
        {/* Actions – always visible, subtle, with hover boost */}
        <div className="flex gap-1 items-center opacity-60 group-hover:opacity-100 transition-opacity">
          <EnrichButton onEnrich={() => onEnrich(ingredient.ingredient_id)} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(ingredient.ingredient_id);
            }}
            className="p-1.5 rounded-lg hover:bg-[var(--color-warm-surface-2)] text-[var(--color-ink-muted)] transition-colors"
            title="Edit ingredient"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(ingredient.ingredient_id);
            }}
            className="p-1.5 rounded-lg hover:bg-[var(--color-tomato)]/10 text-[var(--color-tomato)] transition-colors"
            title="Delete ingredient"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}