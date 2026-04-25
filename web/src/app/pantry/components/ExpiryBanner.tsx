// components/ExpiryBanner.tsx
import { motion } from "framer-motion";
import { BasilExpiry } from "../../components/mascot/BasilComponents";
import type { PantryItemRow } from "../types";
import { daysLeft } from "../../helpers/dateUtils"; // you already have it

type Props = {
  items: PantryItemRow[];
};

export function ExpiryBanner({ items }: Props) {
  const hasUrgent = items.some(item => {
    const days = daysLeft(item.expiration_date);
    return days !== null && days <= 2;
  });
  if (!hasUrgent) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-2xl border border-[var(--color-terracotta)]/20 bg-[var(--color-terracotta-soft)] p-4 flex items-center gap-4"
    >
      <BasilExpiry size={60} />
      <div>
        <p className="text-sm font-bold text-[var(--color-terracotta)]">Some ingredients need attention!</p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">Basil is sweeping up — check expiring items and plan your meals.</p>
      </div>
    </motion.div>
  );
}