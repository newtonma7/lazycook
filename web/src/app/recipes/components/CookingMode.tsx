// src/app/recipes/components/CookingMode.tsx
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Recipe } from "../types";
import { useState } from "react";
type Props = {
  recipe: Recipe;
  onClose: () => void;
};

function formatInstructions(text: string | null) {
  return !text ? [] : text.split('\n').filter(s => s.trim().length > 0);
}

export function CookingMode({ recipe, onClose }: Props) {
  const [step, setStep] = useState(0);
  const steps = formatInstructions(recipe.instructions);
  const progress = steps.length > 0 ? ((step + 1) / steps.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[var(--color-ink)] flex flex-col font-[family-name:var(--font-body)]"
    >
      <div className="h-1.5 bg-[var(--color-ink-light)] w-full">
        <motion.div
          className="h-full bg-[var(--color-sage)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex-1 flex flex-col p-6 md:p-16 max-w-5xl mx-auto w-full text-center">
        <div className="flex justify-between items-center mb-16 opacity-40">
          <button
            onClick={onClose}
            className="text-[var(--color-cream)] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" /> Stop Cooking
          </button>
          <span className="text-[var(--color-sage)] text-[10px] font-bold uppercase tracking-widest">
            {steps.length > 0 ? `Step ${step + 1} of ${steps.length}` : "No Instructions"}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center relative">
          {steps.length > 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[15rem] font-[family-name:var(--font-display)] font-bold text-[var(--color-cream)] opacity-[0.03] select-none pointer-events-none leading-none">
              {step + 1}
            </div>
          )}
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl text-[var(--color-cream)] font-[family-name:var(--font-display)] italic leading-tight z-10"
          >
            {steps.length > 0
              ? steps[step]?.replace(/^[\d\.\)]+\s*/, '')
              : "This recipe doesn't have any instructions yet. Time to improvise!"}
          </motion.p>
        </div>

        <div className="mt-16 flex gap-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0 || steps.length === 0}
            className="flex-1 rounded-full border border-[var(--color-cream)]/20 text-[var(--color-cream)] py-5 text-xs font-bold uppercase tracking-widest disabled:opacity-10 cursor-pointer"
          >
            Previous
          </button>
          <button
            onClick={() =>
              step === steps.length - 1 || steps.length === 0
                ? onClose()
                : setStep(step + 1)
            }
            className="flex-[2] rounded-full bg-[var(--color-cream)] text-[var(--color-ink)] py-5 text-xs font-bold uppercase tracking-widest hover:bg-white transition-all cursor-pointer"
          >
            {step === steps.length - 1 || steps.length === 0 ? "Finish" : "Next Step"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}