// src/app/pantry/components/PantryDetail.tsx
"use client";

import { motion } from "framer-motion";
import { useScrollTo } from "@/app/helpers/useScrollTo";
import type { PantryRow, ConsumerInfo } from "../types";

type Props = {
  selectedPantry: PantryRow | undefined;
  owner: ConsumerInfo | undefined;
  children: React.ReactNode;
};

export function PantryDetail({ selectedPantry, owner, children }: Props) {
  const scrollRef = useScrollTo(selectedPantry);

  if (!selectedPantry) return null;

  return (
    <div ref={scrollRef}>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[var(--color-border-light)] pb-4">
        <div>
          <h2 className="font-[family-name:var(--font-handwritten)] text-3xl text-[var(--color-ink)]">
            {selectedPantry.pantry_name}
          </h2>
          {owner && (
            <p className="text-sm text-[var(--color-ink-muted)]">
              Owned by {owner.email}
              {owner.username ? ` (${owner.username})` : ""}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}