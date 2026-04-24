"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pen, Trash2 } from "lucide-react";
import { spring } from "@/lib/animation";

type RecipeOption = {
    recipe_id: number;
    title: string;
};

type Props = {
    meal_plan_item_id: number;
    recipe_id: number;
    scheduled_for: string | null;
    meal_type: string | null;
    servings: number | null;
    meal_plan_id: number;
    recipes: RecipeOption[];
    updateMealPlanItem: (formData: FormData) => Promise<void>;
    deleteMealPlanItem: (formData: FormData) => Promise<void>;
};

export function EditMealPlanItemModal({
    meal_plan_item_id,
    recipe_id,
    scheduled_for,
    meal_type,
    servings,
    meal_plan_id,
    recipes,
    updateMealPlanItem,
    deleteMealPlanItem,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formData = new FormData(formRef.current!);
            await updateMealPlanItem(formData);
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to remove this dish from the plan?")) {
            setIsLoading(true);
            try {
                const formData = new FormData();
                formData.append("meal_plan_item_id", String(meal_plan_item_id));
                formData.append("redirect_plan_id", String(meal_plan_id));
                await deleteMealPlanItem(formData);
                setIsOpen(false);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5 p-2 cursor-pointer"
            >
                <Pen className="w-3.5 h-3.5" /> Edit
            </button>

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
                                    <span className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-ink-muted)] mb-1 block">
                                        tweak the schedule
                                    </span>
                                    <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--color-ink)] tracking-tight">
                                        Edit Item
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
                                <input type="hidden" name="meal_plan_item_id" value={meal_plan_item_id} />
                                <input type="hidden" name="redirect_plan_id" value={meal_plan_id} />

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="edit-item-recipe" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                                        Recipe
                                    </label>
                                    <select
                                        id="edit-item-recipe"
                                        name="recipe_id"
                                        required
                                        disabled={isLoading}
                                        defaultValue={String(recipe_id)}
                                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner cursor-pointer"
                                    >
                                        {recipes.map((recipe) => (
                                            <option key={recipe.recipe_id} value={recipe.recipe_id}>
                                                {recipe.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="edit-item-date" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                                        Scheduled Date
                                    </label>
                                    <input
                                        id="edit-item-date"
                                        name="scheduled_for"
                                        type="date"
                                        disabled={isLoading}
                                        defaultValue={scheduled_for ?? ""}
                                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] font-[family-name:var(--font-mono)] text-[var(--color-ink)] focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="edit-item-meal-type" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                                            Meal Type
                                        </label>
                                        <input
                                            id="edit-item-meal-type"
                                            name="meal_type"
                                            type="text"
                                            disabled={isLoading}
                                            defaultValue={meal_type ?? ""}
                                            placeholder="e.g. Lunch"
                                            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/50 focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="edit-item-servings" className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                                            Servings
                                        </label>
                                        <input
                                            id="edit-item-servings"
                                            name="servings"
                                            type="number"
                                            min={1}
                                            disabled={isLoading}
                                            defaultValue={servings ?? ""}
                                            placeholder="Qty"
                                            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-[15px] font-[family-name:var(--font-mono)] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/50 focus:border-[var(--color-sage)] focus:outline-none disabled:opacity-50 transition-colors shadow-inner"
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
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        type="button"
                                        disabled={isLoading}
                                        onClick={handleDelete}
                                        className="rounded-full bg-[var(--color-tomato)]/10 text-[var(--color-tomato)] border border-[var(--color-tomato)]/20 p-3.5 focus:outline-none disabled:opacity-50 hover:bg-[var(--color-tomato)] hover:text-white transition-colors cursor-pointer"
                                        title="Delete Item"
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