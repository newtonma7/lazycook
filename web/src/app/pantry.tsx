import { createClient } from "@supabase/supabase-js";
import { Fragment } from "react";
import {
    addPantry,
    addPantryItem,
    deletePantry,
    deletePantryItem,
    updatePantry,
    updatePantryItem,
} from "./actions";

export type PantryRow = {
    pantry_id: number;
    consumer_id: number | null;
    pantry_name: string;
};



export type PantryItemRow = {
    pantry_item_id: number;
    pantry_id: number;
    ingredient_id: number;
    purchase_date: string | null;
    quantity_on_hand: string | number | null;
    unit: string | null;
    expiration_date: string | null;
};

type IngredientOption = {
    ingredient_id: number;
    name: string;
};

type Props = {
    supabaseUrl: string;
    supabaseAnonKey: string;
};

export async function PantryPanel({ supabaseUrl, supabaseAnonKey }: Props) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const [
        { data: pantriesData, error: pantriesError },
        { data: pantryItemsData, error: pantryItemsError },
        { data: ingredientsData, error: ingredientsError },
    ] = await Promise.all([
        supabase
            .from("pantry")
            .select("pantry_id, consumer_id, pantry_name")
            .order("pantry_id", { ascending: true }),
        supabase
            .from("pantry_item")
            .select("pantry_item_id, pantry_id, ingredient_id, purchase_date, quantity_on_hand, unit, expiration_date")
            .order("pantry_id", { ascending: true })
            .order("pantry_item_id", { ascending: true }),
        supabase.from("ingredient").select("ingredient_id, name").order("name", { ascending: true }),
    ]);

    if (pantriesError || pantryItemsError || ingredientsError) {
        const message = pantriesError?.message ?? pantryItemsError?.message ?? ingredientsError?.message ?? "Unknown error";

        return (
            <p className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
                Failed to load pantry data: {message}
            </p>
        );
    }

    const pantries = (pantriesData ?? []) as PantryRow[];
    const pantryItems = (pantryItemsData ?? []) as PantryItemRow[];
    const ingredients = (ingredientsData ?? []) as IngredientOption[];

    const ingredientNameById = new Map(ingredients.map((i) => [i.ingredient_id, i.name]));
    const itemsByPantryId = new Map<number, PantryItemRow[]>();

    for (const item of pantryItems) {
        const existing = itemsByPantryId.get(item.pantry_id) ?? [];
        existing.push(item);
        itemsByPantryId.set(item.pantry_id, existing);
    }

    return (
        <>
            <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
                <h2 className="mb-4 text-lg font-medium">Add New Pantry</h2>
                <form action={addPantry} className="grid gap-4 lg:grid-cols-3">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="pantry-name" className="text-sm text-zinc-600">
                            Pantry Name
                        </label>
                        <input
                            id="pantry-name"
                            name="pantry_name"
                            type="text"
                            required
                            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="pantry-consumer" className="text-sm text-zinc-600">
                            Consumer ID (optional)
                        </label>
                        <input
                            id="pantry-consumer"
                            name="consumer_id"
                            type="number"
                            min={1}
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
                            <th className="px-4 py-3 font-medium">pantry_id</th>
                            <th className="px-4 py-3 font-medium">consumer_id</th>
                            <th className="px-4 py-3 font-medium">pantry_name</th>
                            <th className="px-4 py-3 font-medium">Modify</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pantries.map((pantry) => {
                            const pantryFormId = `pantry-form-${pantry.pantry_id}`;
                            const relatedItems = itemsByPantryId.get(pantry.pantry_id) ?? [];

                            return (
                                <Fragment key={pantry.pantry_id}>
                                    <tr className="border-t border-zinc-200 align-top">
                                        <td className="px-4 py-3 whitespace-nowrap">{pantry.pantry_id}</td>
                                        <td className="px-4 py-3">
                                            <input
                                                form={pantryFormId}
                                                name="consumer_id"
                                                type="number"
                                                min={1}
                                                defaultValue={pantry.consumer_id ?? ""}
                                                className="w-full min-w-[80px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                form={pantryFormId}
                                                name="pantry_name"
                                                type="text"
                                                required
                                                defaultValue={pantry.pantry_name}
                                                className="w-full min-w-[180px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <form id={pantryFormId} action={updatePantry} className="flex min-w-[150px] flex-col gap-2">
                                                <input type="hidden" name="pantry_id" value={pantry.pantry_id} />
                                                <button
                                                    type="submit"
                                                    className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                >
                                                    Save changes
                                                </button>
                                                <button
                                                    type="submit"
                                                    formAction={deletePantry}
                                                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                                >
                                                    Delete
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                    <tr className="border-t border-zinc-100 bg-zinc-50/70">
                                        <td colSpan={4} className="px-4 py-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-zinc-900">Pantry items</h3>
                                                    <p className="mt-1 text-xs text-zinc-600">Manage the items in pantry {pantry.pantry_id}.</p>
                                                </div>

                                                <form action={addPantryItem} className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 lg:grid-cols-[minmax(180px,1.6fr)_minmax(120px,0.8fr)_minmax(120px,0.8fr)_minmax(100px,0.7fr)_minmax(120px,0.8fr)_auto]">
                                                    <input type="hidden" name="pantry_id" value={pantry.pantry_id} />
                                                    <select
                                                        name="ingredient_id"
                                                        required
                                                        defaultValue=""
                                                        className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    >
                                                        <option value="" disabled>
                                                            Select ingredient
                                                        </option>
                                                        {ingredients.map((ingredient) => (
                                                            <option key={ingredient.ingredient_id} value={ingredient.ingredient_id}>
                                                                {ingredient.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        name="quantity_on_hand"
                                                        type="text"
                                                        placeholder="Quantity"
                                                        className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    />
                                                    <input
                                                        name="unit"
                                                        type="text"
                                                        placeholder="Unit"
                                                        className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    />
                                                    <input
                                                        name="purchase_date"
                                                        type="date"
                                                        className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    />
                                                    <input
                                                        name="expiration_date"
                                                        type="date"
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
                                                                <th className="px-3 py-2 font-medium">pantry_item_id</th>
                                                                <th className="px-3 py-2 font-medium">ingredient</th>
                                                                <th className="px-3 py-2 font-medium">quantity_on_hand</th>
                                                                <th className="px-3 py-2 font-medium">unit</th>
                                                                <th className="px-3 py-2 font-medium">purchase_date</th>
                                                                <th className="px-3 py-2 font-medium">expiration_date</th>
                                                                <th className="px-3 py-2 font-medium">Modify</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {relatedItems.map((item) => {
                                                                const itemFormId = `pantry-item-form-${item.pantry_item_id}`;

                                                                return (
                                                                    <tr key={item.pantry_item_id} className="border-t border-zinc-200 align-top">
                                                                        <td className="px-3 py-2 whitespace-nowrap">{item.pantry_item_id}</td>
                                                                        <td className="px-3 py-2">
                                                                            <select
                                                                                form={itemFormId}
                                                                                name="ingredient_id"
                                                                                defaultValue={String(item.ingredient_id)}
                                                                                className="w-full min-w-[200px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            >
                                                                                {ingredients.map((ingredient) => (
                                                                                    <option key={ingredient.ingredient_id} value={ingredient.ingredient_id}>
                                                                                        {ingredient.name}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <div className="mt-1 text-[11px] text-zinc-500">
                                                                                Current: {ingredientNameById.get(item.ingredient_id) ?? `Ingredient ${item.ingredient_id}`}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <input
                                                                                form={itemFormId}
                                                                                name="quantity_on_hand"
                                                                                type="text"
                                                                                defaultValue={item.quantity_on_hand ?? ""}
                                                                                className="w-full min-w-[100px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <input
                                                                                form={itemFormId}
                                                                                name="unit"
                                                                                type="text"
                                                                                defaultValue={item.unit ?? ""}
                                                                                className="w-full min-w-[100px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <input
                                                                                form={itemFormId}
                                                                                name="purchase_date"
                                                                                type="date"
                                                                                defaultValue={item.purchase_date ?? ""}
                                                                                className="w-full min-w-[130px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <input
                                                                                form={itemFormId}
                                                                                name="expiration_date"
                                                                                type="date"
                                                                                defaultValue={item.expiration_date ?? ""}
                                                                                className="w-full min-w-[130px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <form id={itemFormId} action={updatePantryItem} className="flex min-w-[140px] flex-col gap-2">
                                                                                <input type="hidden" name="pantry_item_id" value={item.pantry_item_id} />
                                                                                <button
                                                                                    type="submit"
                                                                                    className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                                                >
                                                                                    Save changes
                                                                                </button>
                                                                                <button
                                                                                    type="submit"
                                                                                    formAction={deletePantryItem}
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
                                                                    <td className="px-3 py-3 text-zinc-500" colSpan={7}>
                                                                        No pantry_item rows linked to this pantry yet.
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
                        {pantries.length === 0 && (
                            <tr className="border-t border-zinc-200">
                                <td className="px-4 py-3 text-zinc-500" colSpan={4}>
                                    No pantry rows found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
