"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { spring } from "@/lib/animation";

type RecipeOption = {
    recipe_id: number;
    title: string;
};

type Props = {
    meal_plan_id: number;
    recipes: RecipeOption[];
    addMealPlanItem: (formData: FormData) => Promise<void>;
};

export function AddMealPlanItemModal({ meal_plan_id, recipes, addMealPlanItem }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formData = new FormData(formRef.current!);
            await addMealPlanItem(formData);
            setIsOpen(false);
            formRef.current?.reset();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsOpen(true)}
                className="bg-[var(--color-sage)] text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#3c8247] transition-colors shadow-[0_4px_14px_rgba(74,156,87,0.2)] flex items-center gap-2 cursor-pointer"
            >
                <Plus className="w-3.5 h-3.5" /> Add Recipe
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-[family-name:var(--font-body)]">
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
                                        expand your menu
                                    </span>
                                    <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--color-ink)] tracking-tight">
                                        Add Item
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    disabled={isLoading}
                                    className="text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-colors disabled:opacity-50 bg-[var(--color-cream)] hover:bg-[var(--color-tomato)]/10 p-2 rounded-full"
                                    aria-label="Close modal"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form ref={formRef} onSubmit={handleSubmit} className="grid gap-6">
                                <input type="hidden" name="meal_plan_id" value={meal_plan_id} />
                                <input type="hidden" name="redirect_plan_id" value={meal_plan_id} />

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="add-recipe" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                                        Recipe
                                    </label>
                                    <select
                                        id="add-recipe"
                                        name="recipe_id"
                                        required
                                        disabled={isLoading}
                                        defaultValue=""
                                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner cursor-pointer"
                                    >
                                        <option value="" disabled>
                                            Select a recipe to schedule...
                                        </option>
                                        {recipes.map((recipe) => (
                                            <option key={recipe.recipe_id} value={recipe.recipe_id}>
                                                {recipe.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="add-date" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                                        Scheduled Date
                                    </label>
                                    <input
                                        id="add-date"
                                        name="scheduled_for"
                                        type="date"
                                        disabled={isLoading}
                                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] font-[family-name:var(--font-mono)] text-[var(--color-ink)] focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="add-meal-type" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                                            Meal Type
                                        </label>
                                        <input
                                            id="add-meal-type"
                                            name="meal_type"
                                            type="text"
                                            placeholder="e.g. Dinner"
                                            disabled={isLoading}
                                            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/50 focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="add-servings" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                                            Servings
                                        </label>
                                        <input
                                            id="add-servings"
                                            name="servings"
                                            type="number"
                                            min={1}
                                            placeholder="Qty"
                                            disabled={isLoading}
                                            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] font-[family-name:var(--font-mono)] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/50 focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
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
                                        {isLoading ? "Adding..." : "Add to Plan"}
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
            </AnimatePresence>
        </>
    );
}