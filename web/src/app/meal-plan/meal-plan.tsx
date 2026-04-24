import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
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
import { EditMealPlanItemModal } from "./edit-meal-plan-item-modal";
import { AddMealPlanItemModal } from "./add-meal-plan-item-modal";
import { getCurrentAccount } from "../auth/account-auth";

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

    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });
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
            <div className="font-[family-name:var(--font-body)]">
                <p className="rounded-[2rem] border border-[var(--color-tomato)]/30 bg-[var(--color-tomato)]/10 p-6 text-[var(--color-tomato)] text-sm shadow-sm">
                    <span className="font-[family-name:var(--font-display)] font-bold text-xl block mb-1">Database Error</span>
                    Failed to load meal plan data: {message}
                </p>
            </div>
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

    // --- ALL PLANS VIEW ---
    if (!selectedPlan) {
        const sortedPlans = [...plans].sort((a, b) => a.meal_plan_id - b.meal_plan_id);

        return (
            <div className="space-y-8 font-[family-name:var(--font-body)] w-full animate-in fade-in duration-500">
                {typeof selectedPlanId === "number" && (
                    <p className="rounded-[2rem] border border-[var(--color-tomato)]/30 bg-[var(--color-tomato)]/10 px-6 py-4 text-sm text-[var(--color-tomato)] shadow-sm">
                        Meal plan {selectedPlanId} was not found.
                    </p>
                )}

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[var(--color-border-light)]">
                    <div className="flex flex-col relative">
                        <span className="font-[family-name:var(--font-handwritten)] text-[28px] text-[var(--color-tomato)] mb-[-6px] ml-1 z-10 block">
                            orchestrate your week
                        </span>
                        <h2 className="font-[family-name:var(--font-display)] text-5xl md:text-6xl font-bold tracking-tight text-[var(--color-ink)] relative z-0">
                            Meal Plans
                        </h2>
                    </div>
                    <div className="pb-2 shrink-0">
                        {currentConsumerId && <NewMealPlanModal addMealPlanAndReturn={addMealPlanAndReturn} consumerId={currentConsumerId} />}
                    </div>
                </div>

                {sortedPlans.length === 0 ? (
                    <div className="text-center py-32 border border-dashed border-[var(--color-border)] rounded-[3rem] bg-[var(--color-surface)]/50 shadow-sm">
                        <p className="font-[family-name:var(--font-handwritten)] text-3xl text-[var(--color-ink)] mb-2">no plans yet</p>
                        <p className="text-sm text-[var(--color-ink-muted)] italic">Create your first meal plan to start organizing your kitchen.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {sortedPlans.map((plan) => {
                            const relatedItems = (itemsByPlanId.get(plan.meal_plan_id) ?? []).slice().sort(sortItemsByDateAndId);
                            const recipePreview = relatedItems
                                .slice(0, 5)
                                .map((item) => getRecipeName(item.recipe_id, recipeTitleById));

                            return (
                                <Link
                                    key={plan.meal_plan_id}
                                    href={`/dashboard?tab=meal_plan&plan=${plan.meal_plan_id}`}
                                    className="group flex flex-col rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-sage)] hover:shadow-lg relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-sage)] opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)] group-hover:text-[var(--color-sage)] transition-colors leading-tight mb-2">
                                        {plan.plan_name}
                                    </h3>
                                    <p className="text-sm text-[var(--color-ink-muted)] italic">
                                        {formatDateRange(plan.start_date, plan.end_date)}
                                    </p>

                                    <div className="mt-6 border-t border-[var(--color-border-light)] pt-5 flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-ink-muted)] mb-3">
                                            Scheduled Recipes:
                                        </p>
                                        {recipePreview.length === 0 ? (
                                            <p className="text-sm text-[var(--color-ink-muted)] italic">No recipes in this plan yet.</p>
                                        ) : (
                                            <ul className="space-y-2 text-sm text-[var(--color-ink)]">
                                                {recipePreview.map((recipeName, index) => (
                                                    <li key={`${plan.meal_plan_id}-${index}`} className="flex items-start gap-2 truncate">
                                                        <span className="mt-2 w-1 h-1 rounded-full bg-[var(--color-ink-muted)] shrink-0" />
                                                        <span className="truncate">{recipeName}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {relatedItems.length > 5 && (
                                            <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-sage)]">
                                                + {relatedItems.length - 5} more
                                            </p>
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

    // --- SINGLE PLAN VIEW ---
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
        <div className="space-y-10 font-[family-name:var(--font-body)] w-full animate-in fade-in duration-500 relative">

            {/* Detail Header */}
            <div className="flex flex-col gap-6 relative z-10 border-b border-[var(--color-border-light)] pb-8">
                <Link
                    href="/dashboard?tab=meal_plan"
                    className="group flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-colors uppercase cursor-pointer self-start"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Plans
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-5xl md:text-6xl font-[family-name:var(--font-display)] font-bold text-[var(--color-ink)] tracking-tight leading-[1.1]">
                            {selectedPlan.plan_name}
                        </h2>
                        <p className="mt-3 text-lg text-[var(--color-ink-muted)] italic">
                            {formatDateRange(selectedPlan.start_date, selectedPlan.end_date)}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <AddMealPlanItemModal
                            meal_plan_id={selectedPlan.meal_plan_id}
                            recipes={recipes}
                            addMealPlanItem={addMealPlanItem}
                        />
                        <EditMealPlanModal
                            meal_plan_id={selectedPlan.meal_plan_id}
                            plan_name={selectedPlan.plan_name}
                            start_date={selectedPlan.start_date}
                            end_date={selectedPlan.end_date}
                            updateMealPlan={updateMealPlan}
                            deleteMealPlan={deleteMealPlan}
                        />
                    </div>
                </div>
            </div>

            {/* Items Container */}
            <div className="space-y-12 max-w-5xl">
                {groupedItems.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-[var(--color-border)] rounded-[3rem] bg-[var(--color-surface)]/50 shadow-sm">
                        <p className="font-[family-name:var(--font-handwritten)] text-3xl text-[var(--color-ink)] mb-2">blank canvas</p>
                        <p className="text-sm text-[var(--color-ink-muted)] italic">No recipes scheduled for this plan yet.</p>
                    </div>
                ) : (
                    groupedItems.map(([dateKey, dateItems]) => (
                        <section key={dateKey} className="space-y-6">
                            <div className="flex items-end justify-between border-b border-[var(--color-border-light)] pb-3">
                                <h4 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
                                    {dateKey === "Unscheduled" ? "Unscheduled" : formatDate(dateKey)}
                                </h4>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                                    {dateItems.length} item{dateItems.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {dateItems.map((item) => (
                                    <Link
                                        key={item.meal_plan_item_id}
                                        href={`/dashboard?tab=recipe&recipe=${item.recipe_id}&back=meal_plan&plan=${selectedPlan.meal_plan_id}`}
                                        className="group rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm hover:shadow-md hover:border-[var(--color-tomato)]/50 transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                {item.meal_type && (
                                                    <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] mb-2 bg-[var(--color-cream)] border border-[var(--color-border-light)] px-2 py-0.5 rounded-md">
                                                        {item.meal_type}
                                                    </span>
                                                )}
                                                <h5 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-ink)] leading-tight mb-2 truncate group-hover:text-[var(--color-tomato)] transition-colors">
                                                    {getRecipeName(item.recipe_id, recipeTitleById)}
                                                </h5>
                                                {item.servings && (
                                                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-light)] font-[family-name:var(--font-mono)] mt-3">
                                                        {item.servings} {item.servings === 1 ? "serving" : "servings"}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <EditMealPlanItemModal
                                                    meal_plan_item_id={item.meal_plan_item_id}
                                                    recipe_id={item.recipe_id}
                                                    scheduled_for={item.scheduled_for}
                                                    meal_type={item.meal_type}
                                                    servings={item.servings}
                                                    meal_plan_id={selectedPlan.meal_plan_id}
                                                    recipes={recipes}
                                                    updateMealPlanItem={updateMealPlanItem}
                                                    deleteMealPlanItem={deleteMealPlanItem}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}