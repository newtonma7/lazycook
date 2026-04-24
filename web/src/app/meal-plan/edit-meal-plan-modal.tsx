"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings2, Trash2 } from "lucide-react";
import { spring } from "@/lib/animation";

type Props = {
    meal_plan_id: number;
    plan_name: string;
    start_date: string | null;
    end_date: string | null;
    updateMealPlan: (formData: FormData) => Promise<void>;
    deleteMealPlan: (formData: FormData) => Promise<void>;
};

export function EditMealPlanModal({
    meal_plan_id,
    plan_name,
    start_date,
    end_date,
    updateMealPlan,
    deleteMealPlan
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formData = new FormData(formRef.current!);
            await updateMealPlan(formData);
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this meal plan? This action cannot be undone.")) {
            setIsLoading(true);
            try {
                const formData = new FormData();
                formData.append("meal_plan_id", String(meal_plan_id));
                formData.append("redirect_plan_id", String(meal_plan_id));
                await deleteMealPlan(formData);
                setIsOpen(false);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsOpen(true)}
                className="border border-[var(--color-border)] bg-transparent text-[var(--color-ink)] px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
                <Settings2 className="w-3.5 h-3.5" /> Plan Settings
            </motion.button>

            <AnimatePresence>
                {isOpen && (
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
                                    <span className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-ink-muted)] mb-1 block">
                                        plan metadata
                                    </span>
                                    <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--color-ink)] tracking-tight">
                                        Plan Settings
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

                            <form ref={formRef} onSubmit={handleSubmit} className="grid gap-6">
                                <input type="hidden" name="meal_plan_id" value={meal_plan_id} />
                                <input type="hidden" name="redirect_plan_id" value={meal_plan_id} />

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="edit-plan-name" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                                        Plan Name
                                    </label>
                                    <input
                                        id="edit-plan-name"
                                        name="plan_name"
                                        type="text"
                                        required
                                        disabled={isLoading}
                                        defaultValue={plan_name}
                                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="edit-start-date" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                                            Start Date
                                        </label>
                                        <input
                                            id="edit-start-date"
                                            name="start_date"
                                            type="date"
                                            disabled={isLoading}
                                            defaultValue={start_date ?? ""}
                                            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] font-[family-name:var(--font-mono)] text-[var(--color-ink)] focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="edit-end-date" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                                            End Date
                                        </label>
                                        <input
                                            id="edit-end-date"
                                            name="end_date"
                                            type="date"
                                            disabled={isLoading}
                                            defaultValue={end_date ?? ""}
                                            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] font-[family-name:var(--font-mono)] text-[var(--color-ink)] focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-6 mt-2 border-t border-[var(--color-border-light)]">
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 rounded-full bg-[var(--color-ink)] px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-cream)] hover:bg-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-md cursor-pointer"
                                    >
                                        {isLoading ? "Saving..." : "Save Changes"}
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

                                    {/* The title prop is safely on the motion.button, not the Lucide icon! */}
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        type="button"
                                        disabled={isLoading}
                                        onClick={handleDelete}
                                        className="rounded-full bg-[var(--color-tomato)]/10 text-[var(--color-tomato)] border border-[var(--color-tomato)]/20 p-3.5 focus:outline-none disabled:opacity-50 hover:bg-[var(--color-tomato)] hover:text-white transition-colors cursor-pointer"
                                        title="Delete Plan"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}