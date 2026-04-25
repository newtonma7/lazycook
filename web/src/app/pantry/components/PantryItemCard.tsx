// components/PantryItemCard.tsx
import { motion } from "framer-motion";
import { Trash2, Calendar } from "lucide-react";
import { bouncySpring } from "@/lib/animation";
import type { PantryItemRow } from "../types";

type Props = {
  item: PantryItemRow;
  ingredientName: string;
  onDelete: (id: number) => void;
  urgencyColor: string;
  urgencyLabel: string | null;
};

export function PantryItemCard({ item, ingredientName, onDelete, urgencyColor, urgencyLabel }: Props) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={bouncySpring}
      className="group relative flex flex-col justify-between rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ backgroundColor: urgencyColor }}
      />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-[var(--color-ink)] truncate">{ingredientName}</h3>
          {(item.quantity_on_hand || item.unit) && (
            <span className="text-sm text-[var(--color-ink-light)]">
              {item.quantity_on_hand} {item.unit}
            </span>
          )}
        </div>
        <button
          onClick={() => onDelete(item.pantry_item_id)}
          className="text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-colors ml-2 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {item.expiration_date ? (
          <>
            <Calendar className="w-3.5 h-3.5" style={{ color: urgencyColor }} />
            <span className="font-mono" style={{ color: urgencyColor }}>{item.expiration_date}</span>
          </>
        ) : (
          <span className="text-[var(--color-ink-muted)] italic">No expiry</span>
        )}
      </div>
      {urgencyLabel && (
        <span className="mt-2 text-xs font-bold uppercase tracking-wide" style={{ color: urgencyColor }}>
          {urgencyLabel}
        </span>
      )}
    </motion.div>
  );
}