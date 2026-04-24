"use client";

import { useState, useRef } from "react";

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
            <button
                onClick={() => setIsOpen(true)}
                className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
            >
                Add Meal Plan Item
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <div className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-medium text-zinc-900">Add Meal Plan Item</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                                className="text-zinc-500 hover:text-zinc-700 focus:outline-none disabled:opacity-50"
                                aria-label="Close modal"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4">
                            <input type="hidden" name="meal_plan_id" value={meal_plan_id} />
                            <input type="hidden" name="redirect_plan_id" value={meal_plan_id} />

                            <div className="flex flex-col gap-1">
                                <label htmlFor="add-recipe" className="text-sm text-zinc-600">
                                    Recipe
                                </label>
                                <select
                                    id="add-recipe"
                                    name="recipe_id"
                                    required
                                    disabled={isLoading}
                                    defaultValue=""
                                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                >
                                    <option value="" disabled>
                                        Select recipe
                                    </option>
                                    {recipes.map((recipe) => (
                                        <option key={recipe.recipe_id} value={recipe.recipe_id}>
                                            {recipe.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="add-date" className="text-sm text-zinc-600">
                                    Scheduled Date
                                </label>
                                <input
                                    id="add-date"
                                    name="scheduled_for"
                                    type="date"
                                    disabled={isLoading}
                                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="add-meal-type" className="text-sm text-zinc-600">
                                    Meal Type
                                </label>
                                <input
                                    id="add-meal-type"
                                    name="meal_type"
                                    type="text"
                                    placeholder="e.g. Breakfast, Lunch, Dinner"
                                    disabled={isLoading}
                                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="add-servings" className="text-sm text-zinc-600">
                                    Servings
                                </label>
                                <input
                                    id="add-servings"
                                    name="servings"
                                    type="number"
                                    min={1}
                                    placeholder="Number of servings"
                                    disabled={isLoading}
                                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50"
                                >
                                    {isLoading ? "Adding..." : "Add Item"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isLoading}
                                    className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
