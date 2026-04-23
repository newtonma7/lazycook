import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
    addMealPlan,
    addMealPlanAndReturn,
    addMealPlanItem,
    deleteMealPlan,
    deleteMealPlanItem,
    updateMealPlan,
    updateMealPlanItem,
} from "../actions";
import { NewMealPlanModal } from "./meal-plan-modal";
import { EditMealPlanModal } from "./edit-meal-plan-modal";
import { AddMealPlanItemModal } from "./add-meal-plan-item-modal";
import { getCurrentAccount } from "../account-auth";

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
    selectedPlanId?: number | null;
};

function formatDate(value: string | null) {
    if (!value) {
        return "Not set";
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function formatDateRange(startDate: string | null, endDate: string | null) {
    if (!startDate && !endDate) {
        return "No date range";
    }

    if (!startDate) {
        return `Until ${formatDate(endDate)}`;
    }

    if (!endDate) {
        return `Starting ${formatDate(startDate)}`;
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function sortItemsByDateAndId(a: MealPlanItemRow, b: MealPlanItemRow) {
    const aDate = a.scheduled_for ?? "9999-12-31";
    const bDate = b.scheduled_for ?? "9999-12-31";

    if (aDate !== bDate) {
        return aDate.localeCompare(bDate);
    }

    return a.meal_plan_item_id - b.meal_plan_item_id;
}

function getRecipeName(recipeId: number, recipeTitleById: Map<number, string>) {
    return recipeTitleById.get(recipeId) ?? `Recipe ${recipeId}`;
}

export async function MealPlanPanel({ supabaseUrl, supabaseAnonKey, selectedPlanId }: Props) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const currentAccount = await getCurrentAccount();

    const currentConsumerId = currentAccount?.role === "consumer" ? Number.parseInt(currentAccount.userId, 10) : null;

    const [
        { data: plansData, error: plansError },
        { data: itemsData, error: itemsError },
        { data: recipesData, error: recipesError },
    ] = await Promise.all([
        supabase
            .from("meal_plan")
            .select("meal_plan_id, consumer_id, plan_name, start_date, end_date")
            .eq("consumer_id", currentConsumerId ?? -1)
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

    const selectedPlan = typeof selectedPlanId === "number"
        ? plans.find((plan) => plan.meal_plan_id === selectedPlanId) ?? null
        : null;

    if (!selectedPlan) {
        const sortedPlans = [...plans].sort((a, b) => a.meal_plan_id - b.meal_plan_id);

        return (
            <div className="space-y-8">
                {typeof selectedPlanId === "number" && (
                    <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Meal plan {selectedPlanId} was not found.
                    </p>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-zinc-900">Meal Plans</h2>
                        <p className="mt-1 text-sm text-zinc-600">Select a plan to view and manage its details.</p>
                    </div>
                    {currentConsumerId && <NewMealPlanModal addMealPlanAndReturn={addMealPlanAndReturn} consumerId={currentConsumerId} />}
                </div>

                {sortedPlans.length === 0 ? (
                    <p className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-600">
                        No meal plans found.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {sortedPlans.map((plan) => {
                            const relatedItems = (itemsByPlanId.get(plan.meal_plan_id) ?? []).slice().sort(sortItemsByDateAndId);
                            const recipePreview = relatedItems
                                .slice(0, 5)
                                .map((item) => getRecipeName(item.recipe_id, recipeTitleById));

                            return (
                                <Link
                                    key={plan.meal_plan_id}
                                    href={`/dashboard?tab=meal_plan&plan=${plan.meal_plan_id}`}
                                    className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                                >
                                    <h3 className="mt-2 text-lg font-semibold text-zinc-900 group-hover:text-blue-700">{plan.plan_name}</h3>
                                    <p className="mt-2 text-sm text-zinc-600">{formatDateRange(plan.start_date, plan.end_date)}</p>

                                    <div className="mt-4 border-t border-zinc-100 pt-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Recipes:</p>
                                        {recipePreview.length === 0 ? (
                                            <p className="mt-2 text-sm text-zinc-500">No recipes in this plan yet.</p>
                                        ) : (
                                            <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                                                {recipePreview.map((recipeName, index) => (
                                                    <li key={`${plan.meal_plan_id}-${index}`} className="truncate">
                                                        {recipeName}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {relatedItems.length > 5 && (
                                            <p className="mt-2 text-xs text-zinc-500">+{relatedItems.length - 5} more</p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    const selectedItems = (itemsByPlanId.get(selectedPlan.meal_plan_id) ?? []).slice().sort(sortItemsByDateAndId);
    const itemsByDate = new Map<string, MealPlanItemRow[]>();

    for (const item of selectedItems) {
        const dateKey = item.scheduled_for ?? "Unscheduled";
        const existing = itemsByDate.get(dateKey) ?? [];
        existing.push(item);
        itemsByDate.set(dateKey, existing);
    }

    const groupedItems = Array.from(itemsByDate.entries()).sort(([a], [b]) => {
        if (a === "Unscheduled") return 1;
        if (b === "Unscheduled") return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900">{selectedPlan.plan_name}</h2>
                    <p className="mt-1 text-sm text-zinc-600">{formatDateRange(selectedPlan.start_date, selectedPlan.end_date)}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <EditMealPlanModal
                        meal_plan_id={selectedPlan.meal_plan_id}
                        plan_name={selectedPlan.plan_name}
                        start_date={selectedPlan.start_date}
                        end_date={selectedPlan.end_date}
                        updateMealPlan={updateMealPlan}
                        deleteMealPlan={deleteMealPlan}
                    />
                    <Link
                        href="/dashboard?tab=meal_plan"
                        className="rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                        Back to All Meal Plans
                    </Link>
                </div>
            </div>

            <AddMealPlanItemModal
                meal_plan_id={selectedPlan.meal_plan_id}
                recipes={recipes}
                addMealPlanItem={addMealPlanItem}
            />

            <div className="space-y-4">
                <h3 className="text-base font-medium text-zinc-900">Meal plan items by date</h3>

                {groupedItems.length === 0 ? (
                    <p className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-600">
                        No meal plan items linked to this plan yet.
                    </p>
                ) : (
                    groupedItems.map(([dateKey, dateItems]) => (
                        <section key={dateKey} className="overflow-x-auto rounded-lg border border-zinc-200">
                            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                                <h4 className="text-sm font-semibold text-zinc-900">
                                    {dateKey === "Unscheduled" ? "Unscheduled" : formatDate(dateKey)}
                                </h4>
                                <span className="text-xs text-zinc-600">{dateItems.length} item(s)</span>
                            </div>

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
                                    {dateItems.map((item) => {
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
                                                                {recipe.title}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="mt-1 text-[11px] text-zinc-500">
                                                        Current: {getRecipeName(item.recipe_id, recipeTitleById)}
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
                                                        <input type="hidden" name="redirect_plan_id" value={selectedPlan.meal_plan_id} />
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
                                </tbody>
                            </table>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}
