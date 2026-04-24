// components/Header.tsx
import { ChefHat, Settings2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PantryOption } from "../types";

type Props = {
  ollamaStatus: "checking" | "connected" | "disconnected";
  pantries: PantryOption[];
  selectedPantryId: number | null;
  onPantryChange: (id: number) => void;
  showSetup: boolean;
  onToggleSetup: () => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
};

export function Header({
  ollamaStatus,
  pantries,
  selectedPantryId,
  onPantryChange,
  showSetup,
  onToggleSetup,
  showAdvanced,
  onToggleAdvanced,
}: Props) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-sage-soft)]">
          <ChefHat className="h-5 w-5 text-[var(--color-sage)]" />
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-handwritten)] text-3xl text-[var(--color-text-primary)]">
            Basil’s Kitchen ✨
          </h1>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                ollamaStatus === "connected"
                  ? "bg-[var(--color-sage)]"
                  : ollamaStatus === "checking"
                  ? "bg-[var(--color-butter)] animate-pulse"
                  : "bg-[var(--color-terracotta)]"
              )}
            />
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
              {ollamaStatus === "connected"
                ? "Chef Ready"
                : ollamaStatus === "checking"
                ? "Waking Chef..."
                : "Chef Offline"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Visible pantry switcher */}
        <div className="relative">
          <select
            value={selectedPantryId ?? ""}
            onChange={(e) => onPantryChange(Number(e.target.value))}
            className="appearance-none rounded-xl border border-[var(--color-warm-border)] bg-[var(--color-warm-surface-2)] px-4 py-2 pr-8 text-xs font-semibold text-[var(--color-text-primary)] outline-none transition-colors hover:border-[var(--color-sage)]"
          >
            {pantries.length === 0 ? (
              <option value="" disabled>No pantries found</option>
            ) : (
              pantries.map((p) => (
                <option key={p.pantry_id} value={p.pantry_id}>
                  {p.pantry_name}
                </option>
              ))
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[var(--color-text-ghost)]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <button
          onClick={onToggleSetup}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all",
            showSetup
              ? "bg-[var(--color-butter-soft)] text-[var(--color-butter)] border border-[var(--color-butter)]/20"
              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-surface-2)]"
          )}
        >
          <Settings2 className="h-4 w-4" /> Setup
        </button>

        <button
          onClick={onToggleAdvanced}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all",
            showAdvanced
              ? "bg-[var(--color-sage-soft)] text-[var(--color-sage)] border border-[var(--color-sage)]/20"
              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-surface-2)]"
          )}
        >
          <Wand2 className="h-4 w-4" /> Tune
        </button>
      </div>
    </div>
  );
}