// src/app/recipes/components/CookingMode.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Recipe } from "../types";

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
      <div className="h-2 bg-[var(--color-ink-light)] w-full">
        <motion.div
          className="h-full bg-[var(--color-sage)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col p-6 md:p-12 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={onClose}
            className="text-[var(--color-cream)]/50 hover:text-[var(--color-cream)] font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 transition-colors"
          >
            <X className="w-5 h-5" /> Exit Kitchen
          </button>
          <span className="text-[var(--color-cream)]/30 font-[family-name:var(--font-display)] italic text-xl">{recipe.title}</span>
          <span className="text-[var(--color-sage)] font-black uppercase tracking-[0.2em] text-[10px]">
            Step {step + 1} of {steps.length}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center relative">
          <div className="absolute -left-8 md:-left-16 top-0 text-[12rem] font-[family-name:var(--font-display)] font-bold text-[var(--color-cream)]/5 select-none leading-none pointer-events-none">
            {step + 1}
          </div>
          <p className="text-3xl md:text-5xl lg:text-6xl text-[var(--color-cream)] font-[family-name:var(--font-display)] leading-tight z-10">
            {steps[step]?.replace(/^[\d\.\)]+\s*/, '') || "This recipe doesn't have any instructions yet. Time to improvise!"}
          </p>
        </div>

        <div className="mt-12 flex justify-between items-center gap-4">
          <button
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="px-8 py-5 rounded-2xl border border-[var(--color-cream)]/20 text-[var(--color-cream)] font-black uppercase tracking-widest text-xs disabled:opacity-20 hover:bg-[var(--color-cream)]/10 transition-all active:scale-95"
          >
            Previous
          </button>

          {step === steps.length - 1 ? (
            <button
              onClick={onClose}
              className="flex-1 px-8 py-5 rounded-2xl bg-[var(--color-sage)] text-white font-black uppercase tracking-widest text-xs hover:bg-[var(--color-olive)] transition-all active:scale-95 shadow-lg"
            >
              Bon Appétit (Finish)
            </button>
          ) : (
            <button
              onClick={() => setStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="flex-1 px-8 py-5 rounded-2xl bg-[var(--color-cream)] text-[var(--color-ink)] font-black uppercase tracking-widest text-xs hover:bg-white transition-all active:scale-95 shadow-lg"
            >
              Next Step
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}