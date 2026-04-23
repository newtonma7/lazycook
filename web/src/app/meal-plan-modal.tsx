"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
    addMealPlanAndReturn: (formData: FormData) => Promise<{ meal_plan_id: number } | null>;
};

export function NewMealPlanModal({ addMealPlanAndReturn }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formData = new FormData(formRef.current!);
            const result = await addMealPlanAndReturn(formData);
            if (result) {
                setIsOpen(false);
                formRef.current?.reset();
                router.push(`/dashboard?tab=meal_plan&plan=${result.meal_plan_id}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
                New Meal Plan
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <div className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-medium text-zinc-900">Add New Meal Plan</h2>
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
                            <div className="flex flex-col gap-1">
                                <label htmlFor="mp-name" className="text-sm text-zinc-600">
                                    Plan Name
                                </label>
                                <input
                                    id="mp-name"
                                    name="plan_name"
                                    type="text"
                                    required
                                    disabled={isLoading}
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="mp-consumer" className="text-sm text-zinc-600">
                                    Consumer ID
                                </label>
                                <input
                                    id="mp-consumer"
                                    name="consumer_id"
                                    type="number"
                                    min={1}
                                    required
                                    disabled={isLoading}
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="mp-start" className="text-sm text-zinc-600">
                                    Start Date
                                </label>
                                <input
                                    id="mp-start"
                                    name="start_date"
                                    type="date"
                                    disabled={isLoading}
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="mp-end" className="text-sm text-zinc-600">
                                    End Date
                                </label>
                                <input
                                    id="mp-end"
                                    name="end_date"
                                    type="date"
                                    disabled={isLoading}
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
                                >
                                    {isLoading ? "Creating..." : "Create Meal Plan"}
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
