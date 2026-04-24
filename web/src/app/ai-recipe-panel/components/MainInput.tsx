// components/MainInput.tsx
import { motion } from "framer-motion";
import { Search, Sparkles, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const rotatingPlaceholders = [
  "something cozy for tonight... 🍜",
  "quick lunch under 20 minutes ⚡",
  "impress someone special 🌹",
  "use my carrots before they go sad 🥕",
];

const moodChips = [
  { emoji: "⚡", label: "Quick", hint: "Make it under 30 mins" },
  { emoji: "🥗", label: "Healthy", hint: "Light and nourishing" },
  { emoji: "🫂", label: "Comfort", hint: "Classic comfort food" },
  { emoji: "✨", label: "Impress", hint: "Date‑night worthy" },
  { emoji: "🥕", label: "Use Expiring", hint: "Prioritise what’s fading" },
];

type Props = {
  placeholderIndex: number;
  customInstructions: string;
  onInstructionsChange: (v: string) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isGenerating: boolean;
  activeMood: string | null;
  onMoodClick: (mood: string) => void;
  activePantryName: string;
  selectedIngredientCount: number;
  totalIngredients: number;
  onOpenTuning: () => void;
};

export function MainInput({
  placeholderIndex,
  customInstructions,
  onInstructionsChange,
  onGenerate,
  canGenerate,
  isGenerating,
  activeMood,
  onMoodClick,
  activePantryName,
  selectedIngredientCount,
  totalIngredients,
  onOpenTuning,
}: Props) {
  return (
    <div className="mb-8">
      <div className="relative mx-auto max-w-3xl">
        <div className="flex items-center overflow-hidden rounded-[2.5rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] shadow-sm transition-shadow focus-within:shadow-md">
          <div className="flex w-full items-center px-5 py-5">
            <Search className="mr-3 h-5 w-5 text-[var(--color-text-ghost)]" />
            <motion.input
              key="chef-input"
              type="text"
              value={customInstructions}
              onChange={(e) => onInstructionsChange(e.target.value)}
              placeholder={rotatingPlaceholders[placeholderIndex]}
              className="w-full bg-transparent text-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-ghost)] outline-none font-[family-name:var(--font-handwritten)]"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onGenerate}
            disabled={!canGenerate}
            className="mr-2 shrink-0 rounded-full bg-[var(--color-terracotta)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-[0_4px_14px_rgba(196,103,58,0.2)] transition-opacity hover:opacity-90 disabled:opacity-30 disabled:shadow-none"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 animate-pulse" /> Cooking…</span>
            ) : (
              "✨ Inspire Me"
            )}
          </motion.button>
        </div>

        {/* Context bar */}
        <div className="mt-6 mb-4 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface)] px-4 py-1.5 shadow-sm">
            <span className="text-[var(--color-text-primary)]">🪴</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">{activePantryName}</span>
          </div>
          <span className="text-[var(--color-warm-border)]">—</span>
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface)] px-4 py-1.5 shadow-sm">
            <span className="text-[var(--color-text-primary)]">🥕</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
              <strong className="text-[var(--color-text-primary)]">{selectedIngredientCount}</strong> / {totalIngredients} Ready
            </span>
          </div>
          <button
            onClick={onOpenTuning}
            className="ml-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-sage)] transition-colors hover:bg-[var(--color-sage-soft)]"
          >
            <Settings2 className="h-3.5 w-3.5" /> Adjust
          </button>
        </div>

        {/* Mood chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {moodChips.map((chip) => (
            <motion.button
              key={chip.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onMoodClick(chip.label)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                activeMood === chip.label
                  ? "border-[var(--color-sage)] bg-[var(--color-sage-soft)] text-[var(--color-sage)]"
                  : "border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-warm-border)]"
              )}
            >
              <span>{chip.emoji}</span> {chip.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}