import { createClient } from "@supabase/supabase-js";
import { Fragment } from "react";
import {
    addMealPlan,
    addMealPlanItem,
    deleteMealPlan,
    deleteMealPlanItem,
    updateMealPlan,
    updateMealPlanItem,
} from "./actions";

export type MealPlanRow = {
    meal_plan_id: number;
    consumer_id: number | null;
    plan_name: string;
    start_date: string | null;
    end_date: string | null;
};

export type MealPlanItemRow = {
    meal_plan_item_id: number;
    meal_plan_id: number;
    recipe_id: number;
    scheduled_for: string | null;
    meal_type: string | null;
    servings: number | null;
};

type RecipeOption = {
    recipe_id: number;
    title: string;
};

type Props = {
    supabaseUrl: string;
    supabaseAnonKey: string;
};

export async function MealPlanPanel({ supabaseUrl, supabaseAnonKey }: Props) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const [
        { data: plansData, error: plansError },
        { data: itemsData, error: itemsError },
        { data: recipesData, error: recipesError },
    ] = await Promise.all([
        supabase
            .from("meal_plan")
            .select("meal_plan_id, consumer_id, plan_name, start_date, end_date")
            .order("meal_plan_id", { ascending: true }),
        supabase
            .from("meal_plan_item")
            .select("meal_plan_item_id, meal_plan_id, recipe_id, scheduled_for, meal_type, servings")
            .order("meal_plan_id", { ascending: true })
            .order("meal_plan_item_id", { ascending: true }),
        supabase.from("recipe").select("recipe_id, title").order("title", { ascending: true }),
    ]);

    if (plansError || itemsError || recipesError) {
        const message = plansError?.message ?? itemsError?.message ?? recipesError?.message ?? "Unknown error";

        return (
            <p className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
                Failed to load meal plan data: {message}
            </p>
        );
    }

    const plans = (plansData ?? []) as MealPlanRow[];
    const items = (itemsData ?? []) as MealPlanItemRow[];
    const recipes = (recipesData ?? []) as RecipeOption[];

    const recipeTitleById = new Map(recipes.map((r) => [r.recipe_id, r.title]));
    const itemsByPlanId = new Map<number, MealPlanItemRow[]>();

    for (const item of items) {
        const existing = itemsByPlanId.get(item.meal_plan_id) ?? [];
        existing.push(item);
        itemsByPlanId.set(item.meal_plan_id, existing);
    }

    return (
        <>
            <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
                <h2 className="mb-4 text-lg font-medium">Add New Meal Plan</h2>
                <form action={addMealPlan} className="grid gap-4 lg:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="mp-name" className="text-sm text-zinc-600">
                            Plan Name
                        </label>
                        <input
                            id="mp-name"
                            name="plan_name"
                            type="text"
                            required
                            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
                            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
                            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
                            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        >
                            Insert Record
                        </button>
                    </div>
                </form>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-200">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-zinc-100">
                        <tr>
                            <th className="px-4 py-3 font-medium">meal_plan_id</th>
                            <th className="px-4 py-3 font-medium">consumer_id</th>
                            <th className="px-4 py-3 font-medium">plan_name</th>
                            <th className="px-4 py-3 font-medium">start_date</th>
                            <th className="px-4 py-3 font-medium">end_date</th>
                            <th className="px-4 py-3 font-medium">Modify</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans.map((plan) => {
                            const planFormId = `meal-plan-form-${plan.meal_plan_id}`;
                            const relatedItems = itemsByPlanId.get(plan.meal_plan_id) ?? [];

                            return (
                                <Fragment key={plan.meal_plan_id}>
                                    <tr className="border-t border-zinc-200 align-top">
                                        <td className="px-4 py-3 whitespace-nowrap">{plan.meal_plan_id}</td>
                                        <td className="px-4 py-3">
                                            <input
                                                form={planFormId}
                                                name="consumer_id"
                                                type="number"
                                                min={1}
                                                required
                                                defaultValue={plan.consumer_id ?? ""}
                                                className="w-full min-w-[80px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                form={planFormId}
                                                name="plan_name"
                                                type="text"
                                                required
                                                defaultValue={plan.plan_name}
                                                className="w-full min-w-[180px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                form={planFormId}
                                                name="start_date"
                                                type="date"
                                                defaultValue={plan.start_date ?? ""}
                                                className="w-full min-w-[130px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                form={planFormId}
                                                name="end_date"
                                                type="date"
                                                defaultValue={plan.end_date ?? ""}
                                                className="w-full min-w-[130px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <form id={planFormId} action={updateMealPlan} className="flex min-w-[150px] flex-col gap-2">
                                                <input type="hidden" name="meal_plan_id" value={plan.meal_plan_id} />
                                                <button
                                                    type="submit"
                                                    className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                >
                                                    Save changes
                                                </button>
                                                <button
                                                    type="submit"
                                                    formAction={deleteMealPlan}
                                                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                                >
                                                    Delete
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                    <tr className="border-t border-zinc-100 bg-zinc-50/70">
                                        <td colSpan={6} className="px-4 py-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-zinc-900">Meal plan items</h3>
                                                    <p className="mt-1 text-xs text-zinc-600">Manage the items in meal plan {plan.meal_plan_id}.</p>
                                                </div>

                                                <form action={addMealPlanItem} className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 lg:grid-cols-[minmax(180px,1.6fr)_minmax(120px,0.8fr)_minmax(120px,0.8fr)_minmax(100px,0.7fr)_auto]">
                                                    <input type="hidden" name="meal_plan_id" value={plan.meal_plan_id} />
                                                    <select
                                                        name="recipe_id"
                                                        required
                                                        defaultValue=""
                                                        className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    >
                                                        <option value="" disabled>
                                                            Select recipe
                                                        </option>
                                                        {recipes.map((recipe) => (
                                                            <option key={recipe.recipe_id} value={recipe.recipe_id}>
                                                                {recipe.title} ({recipe.recipe_id})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        name="scheduled_for"
                                                        type="date"
                                                        className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    />
                                                    <input
                                                        name="meal_type"
                                                        type="text"
                                                        placeholder="Meal type"
                                                        className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    />
                                                    <input
                                                        name="servings"
                                                        type="number"
                                                        min={1}
                                                        placeholder="Servings"
                                                        className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                                                    >
                                                        Add item
                                                    </button>
                                                </form>

                                                <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
                                                    <table className="min-w-full text-left text-xs">
                                                        <thead className="bg-zinc-100 text-zinc-700">
                                                            <tr>
                                                                <th className="px-3 py-2 font-medium">meal_plan_item_id</th>
                                                                <th className="px-3 py-2 font-medium">recipe</th>
                                                                <th className="px-3 py-2 font-medium">scheduled_for</th>
                                                                <th className="px-3 py-2 font-medium">meal_type</th>
                                                                <th className="px-3 py-2 font-medium">servings</th>
                                                                <th className="px-3 py-2 font-medium">Modify</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {relatedItems.map((item) => {
                                                                const itemFormId = `meal-plan-item-form-${item.meal_plan_item_id}`;

                                                                return (
                                                                    <tr key={item.meal_plan_item_id} className="border-t border-zinc-200 align-top">
                                                                        <td className="px-3 py-2 whitespace-nowrap">{item.meal_plan_item_id}</td>
                                                                        <td className="px-3 py-2">
                                                                            <select
                                                                                form={itemFormId}
                                                                                name="recipe_id"
                                                                                defaultValue={String(item.recipe_id)}
                                                                                className="w-full min-w-[200px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            >
                                                                                {recipes.map((recipe) => (
                                                                                    <option key={recipe.recipe_id} value={recipe.recipe_id}>
                                                                                        {recipe.title} ({recipe.recipe_id})
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <div className="mt-1 text-[11px] text-zinc-500">
                                                                                Current: {recipeTitleById.get(item.recipe_id) ?? `Recipe ${item.recipe_id}`}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <input
                                                                                form={itemFormId}
                                                                                name="scheduled_for"
                                                                                type="date"
                                                                                defaultValue={item.scheduled_for ?? ""}
                                                                                className="w-full min-w-[130px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <input
                                                                                form={itemFormId}
                                                                                name="meal_type"
                                                                                type="text"
                                                                                defaultValue={item.meal_type ?? ""}
                                                                                className="w-full min-w-[120px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <input
                                                                                form={itemFormId}
                                                                                name="servings"
                                                                                type="number"
                                                                                min={1}
                                                                                defaultValue={item.servings ?? ""}
                                                                                className="w-full min-w-[80px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <form id={itemFormId} action={updateMealPlanItem} className="flex min-w-[140px] flex-col gap-2">
                                                                                <input type="hidden" name="meal_plan_item_id" value={item.meal_plan_item_id} />
                                                                                <button
                                                                                    type="submit"
                                                                                    className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                                                >
                                                                                    Save changes
                                                                                </button>
                                                                                <button
                                                                                    type="submit"
                                                                                    formAction={deleteMealPlanItem}
                                                                                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </form>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                            {relatedItems.length === 0 && (
                                                                <tr className="border-t border-zinc-200">
                                                                    <td className="px-3 py-3 text-zinc-500" colSpan={6}>
                                                                        No meal_plan_item rows linked to this plan yet.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </Fragment>
                            );
                        })}
                        {plans.length === 0 && (
                            <tr className="border-t border-zinc-200">
                                <td className="px-4 py-3 text-zinc-500" colSpan={6}>
                                    No meal_plan rows found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
