// components/meal-plan/new-meal-plan-modal.tsx
"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { spring } from "@/lib/animation";
import { BasilSuccess } from "../components/mascot/BasilComponents";

type Props = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  consumerId: number;
};

export function NewMealPlanModal({ supabaseUrl, supabaseAnonKey, consumerId }: Props) {
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const planName = (form.elements.namedItem("plan_name") as HTMLInputElement)?.value.trim();
    const startDate = (form.elements.namedItem("start_date") as HTMLInputElement)?.value || null;
    const endDate = (form.elements.namedItem("end_date") as HTMLInputElement)?.value || null;

    if (!planName) {
      setError("Plan name is required.");
      return;
    }

    setIsLoading(true);
    setError("");

    const { data, error: insertError } = await supabase
      .from("meal_plan")
      .insert({
        consumer_id: consumerId,
        plan_name: planName,
        start_date: startDate,
        end_date: endDate,
      })
      .select("meal_plan_id")
      .single();

    setIsLoading(false);

    if (insertError || !data) {
      setError(insertError?.message ?? "Failed to create plan.");
      return;
    }

    // Success: close modal, show celebration, then navigate
    setIsOpen(false);
    form.reset();
    setShowSuccess(true);

    // Wait for celebration to be seen, then redirect
    setTimeout(() => {
      setShowSuccess(false);
      router.push(`/dashboard?tab=meal_plan&plan=${data.meal_plan_id}`);
    }, 1500);
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          setIsOpen(true);
          setError("");
        }}
        className="bg-[var(--color-ink)] text-[var(--color-cream)] px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--color-sage)] transition-colors shadow-[0_4px_14px_rgba(28,25,23,0.15)] flex items-center gap-2 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" /> New Meal Plan
      </motion.button>

      <AnimatePresence>
        {isOpen && !showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-[family-name:var(--font-body)]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={spring}
              className="relative w-full max-w-lg rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 md:p-10 shadow-2xl z-10"
            >
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <span className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-sage)] mb-1 block">
                    start fresh
                  </span>
                  <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--color-ink)] tracking-tight">
                    Create Plan
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-colors disabled:opacity-50 bg-[var(--color-cream)] hover:bg-[var(--color-tomato)]/10 p-2 rounded-full cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <p className="text-xs text-[var(--color-tomato)] mb-4 bg-[var(--color-tomato)]/10 p-3 rounded-xl text-center font-medium">
                  {error}
                </p>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="grid gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="mp-name" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                    Plan Name
                  </label>
                  <input
                    id="mp-name"
                    name="plan_name"
                    type="text"
                    required
                    placeholder="e.g. Italian Week"
                    disabled={isLoading}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/50 focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="mp-start" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                      Start Date
                    </label>
                    <input
                      id="mp-start"
                      name="start_date"
                      type="date"
                      disabled={isLoading}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] font-[family-name:var(--font-mono)] text-[var(--color-ink)] focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="mp-end" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                      End Date
                    </label>
                    <input
                      id="mp-end"
                      name="end_date"
                      type="date"
                      disabled={isLoading}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] font-[family-name:var(--font-mono)] text-[var(--color-ink)] focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-6 mt-2 border-t border-[var(--color-border-light)]">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-full bg-[var(--color-ink)] px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-cream)] hover:bg-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-md cursor-pointer"
                  >
                    {isLoading ? "Creating..." : "Create Plan"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="flex-1 rounded-full border border-[var(--color-border)] bg-transparent px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Success celebration */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/50 backdrop-blur-sm font-[family-name:var(--font-body)]"
          >
            <div className="bg-[var(--color-warm-surface)] rounded-[2rem] p-8 text-center shadow-2xl">
              <BasilSuccess size={80} />
              <p className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-text-primary)] mt-4">
                New plan created! 🎉
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}