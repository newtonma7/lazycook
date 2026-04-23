"use client";

import { useState, useRef } from "react";

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
            <button
                onClick={() => setIsOpen(true)}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
                Edit Details
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <div className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-medium text-zinc-900">Edit Meal Plan Details</h2>
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
                                <label htmlFor="edit-plan-name" className="text-sm text-zinc-600">
                                    Plan Name
                                </label>
                                <input
                                    id="edit-plan-name"
                                    name="plan_name"
                                    type="text"
                                    required
                                    disabled={isLoading}
                                    defaultValue={plan_name}
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="edit-start-date" className="text-sm text-zinc-600">
                                    Start Date
                                </label>
                                <input
                                    id="edit-start-date"
                                    name="start_date"
                                    type="date"
                                    disabled={isLoading}
                                    defaultValue={start_date ?? ""}
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="edit-end-date" className="text-sm text-zinc-600">
                                    End Date
                                </label>
                                <input
                                    id="edit-end-date"
                                    name="end_date"
                                    type="date"
                                    disabled={isLoading}
                                    defaultValue={end_date ?? ""}
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={handleDelete}
                                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50"
                                >
                                    {isLoading ? "Deleting..." : "Delete Meal Plan"}
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
