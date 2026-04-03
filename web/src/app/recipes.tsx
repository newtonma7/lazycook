import { createClient } from "@supabase/supabase-js";
import { Fragment } from "react";
import {
    addRecipe,
    addRecipeIngredient,
    deleteRecipe,
    deleteRecipeIngredient,
    updateRecipe,
    updateRecipeIngredient,
} from "./actions";

export type RecipeRow = {
    recipe_id: number;
    title: string;
    description: string | null;
    instructions: string | null;
    prep_time_min: number | null;
    cook_time_min: number | null;
    servings: number | null;
    created_at: string | null;
    updated_at: string | null;
    is_public: boolean;
};

export type RecipeIngredientRow = {
    recipe_id: number;
    ingredient_id: number;
    required_quantity: string | number | null;
    unit: string | null;
    is_optional: boolean;
    preparation_note: string | null;
};

type IngredientOption = {
    ingredient_id: number;
    name: string;
};

type Props = {
    supabaseUrl: string;
    supabaseAnonKey: string;
};

function formatTimestamp(value: string | null) {
    if (!value) return "-";

    return new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export async function RecipePanel({ supabaseUrl, supabaseAnonKey }: Props) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const [{ data: recipesData, error: recipesError }, { data: recipeIngredientsData, error: recipeIngredientsError }, { data: ingredientsData, error: ingredientsError }] =
        await Promise.all([
            supabase
                .from("recipe")
                .select("recipe_id, title, description, instructions, prep_time_min, cook_time_min, servings, created_at, updated_at, is_public")
                .order("recipe_id", { ascending: true }),
            supabase
                .from("recipe_ingredient")
                .select("recipe_id, ingredient_id, required_quantity, unit, is_optional, preparation_note")
                .order("recipe_id", { ascending: true })
                .order("ingredient_id", { ascending: true }),
            supabase.from("ingredient").select("ingredient_id, name").order("name", { ascending: true }),
        ]);

    if (recipesError || recipeIngredientsError || ingredientsError) {
        const message = recipesError?.message ?? recipeIngredientsError?.message ?? ingredientsError?.message ?? "Unknown error";

        return (
            <p className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
                Failed to load recipe data: {message}
            </p>
        );
    }

    const recipes = (recipesData ?? []) as RecipeRow[];
    const recipeIngredients = (recipeIngredientsData ?? []) as RecipeIngredientRow[];
    const ingredients = (ingredientsData ?? []) as IngredientOption[];

    const ingredientNameById = new Map(ingredients.map((ingredient) => [ingredient.ingredient_id, ingredient.name]));
    const ingredientsByRecipeId = new Map<number, RecipeIngredientRow[]>();

    for (const item of recipeIngredients) {
        const existing = ingredientsByRecipeId.get(item.recipe_id) ?? [];
        existing.push(item);
        ingredientsByRecipeId.set(item.recipe_id, existing);
    }

    return (
        <>
            <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
                <h2 className="mb-4 text-lg font-medium">Add New Recipe</h2>
                <form action={addRecipe} className="grid gap-4 lg:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="recipe-title" className="text-sm text-zinc-600">
                            Title
                        </label>
                        <input
                            id="recipe-title"
                            name="title"
                            type="text"
                            required
                            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="recipe-public" className="text-sm text-zinc-600">
                            Public
                        </label>
                        <select
                            id="recipe-public"
                            name="is_public"
                            defaultValue="true"
                            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1 lg:col-span-2">
                        <label htmlFor="recipe-description" className="text-sm text-zinc-600">
                            Description
                        </label>
                        <textarea
                            id="recipe-description"
                            name="description"
                            rows={2}
                            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1 lg:col-span-2">
                        <label htmlFor="recipe-instructions" className="text-sm text-zinc-600">
                            Instructions
                        </label>
                        <textarea
                            id="recipe-instructions"
                            name="instructions"
                            rows={4}
                            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="recipe-prep" className="text-sm text-zinc-600">
                            Prep time (min)
                        </label>
                        <input
                            id="recipe-prep"
                            name="prep_time_min"
                            type="number"
                            min={0}
                            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="recipe-cook" className="text-sm text-zinc-600">
                            Cook time (min)
                        </label>
                        <input
                            id="recipe-cook"
                            name="cook_time_min"
                            type="number"
                            min={0}
                            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="recipe-servings" className="text-sm text-zinc-600">
                            Servings
                        </label>
                        <input
                            id="recipe-servings"
                            name="servings"
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
                            <th className="px-4 py-3 font-medium">recipe_id</th>
                            <th className="px-4 py-3 font-medium">title</th>
                            <th className="px-4 py-3 font-medium">description</th>
                            <th className="px-4 py-3 font-medium">instructions</th>
                            <th className="px-4 py-3 font-medium">prep_time_min</th>
                            <th className="px-4 py-3 font-medium">cook_time_min</th>
                            <th className="px-4 py-3 font-medium">servings</th>
                            <th className="px-4 py-3 font-medium">is_public</th>
                            <th className="px-4 py-3 font-medium">created_at</th>
                            <th className="px-4 py-3 font-medium">updated_at</th>
                            <th className="px-4 py-3 font-medium">Modify</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipes.map((recipe) => {
                            const recipeFormId = `recipe-form-${recipe.recipe_id}`;
                            const relatedIngredients = ingredientsByRecipeId.get(recipe.recipe_id) ?? [];

                            return (
                                <Fragment key={recipe.recipe_id}>
                                    <tr className="border-t border-zinc-200 align-top">
                                        <td className="px-4 py-3 whitespace-nowrap">{recipe.recipe_id}</td>
                                        <td className="px-4 py-3">
                                            <input
                                                form={recipeFormId}
                                                name="title"
                                                type="text"
                                                required
                                                defaultValue={recipe.title}
                                                className="w-full min-w-[180px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <textarea
                                                form={recipeFormId}
                                                name="description"
                                                rows={3}
                                                defaultValue={recipe.description ?? ""}
                                                className="w-full min-w-[220px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <textarea
                                                form={recipeFormId}
                                                name="instructions"
                                                rows={4}
                                                defaultValue={recipe.instructions ?? ""}
                                                className="w-full min-w-[260px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                form={recipeFormId}
                                                name="prep_time_min"
                                                type="number"
                                                min={0}
                                                defaultValue={recipe.prep_time_min ?? ""}
                                                className="w-full min-w-[92px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                form={recipeFormId}
                                                name="cook_time_min"
                                                type="number"
                                                min={0}
                                                defaultValue={recipe.cook_time_min ?? ""}
                                                className="w-full min-w-[92px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                form={recipeFormId}
                                                name="servings"
                                                type="number"
                                                min={1}
                                                defaultValue={recipe.servings ?? ""}
                                                className="w-full min-w-[80px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                form={recipeFormId}
                                                name="is_public"
                                                defaultValue={recipe.is_public ? "true" : "false"}
                                                className="w-full min-w-[84px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-zinc-600">{formatTimestamp(recipe.created_at)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-zinc-600">{formatTimestamp(recipe.updated_at)}</td>
                                        <td className="px-4 py-3">
                                            <form id={recipeFormId} action={updateRecipe} className="flex min-w-[150px] flex-col gap-2">
                                                <input type="hidden" name="recipe_id" value={recipe.recipe_id} />
                                                <button
                                                    type="submit"
                                                    className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                >
                                                    Save changes
                                                </button>
                                                <button
                                                    type="submit"
                                                    formAction={deleteRecipe}
                                                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                                >
                                                    Delete
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                    <tr key={`recipe-ingredients-${recipe.recipe_id}`} className="border-t border-zinc-100 bg-zinc-50/70">
                                        <td colSpan={11} className="px-4 py-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-zinc-900">Recipe ingredients</h3>
                                                    <p className="mt-1 text-xs text-zinc-600">Manage the ingredient rows linked to recipe {recipe.recipe_id}.</p>
                                                </div>

                                                <form action={addRecipeIngredient} className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 lg:grid-cols-[minmax(180px,1.6fr)_minmax(120px,0.8fr)_minmax(120px,0.8fr)_minmax(100px,0.7fr)_minmax(220px,1.4fr)_auto]">
                                                    <input type="hidden" name="recipe_id" value={recipe.recipe_id} />
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
                                                                {ingredient.name} ({ingredient.ingredient_id})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        name="required_quantity"
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
                                                    <select
                                                        name="is_optional"
                                                        defaultValue="false"
                                                        className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    >
                                                        <option value="false">Required</option>
                                                        <option value="true">Optional</option>
                                                    </select>
                                                    <input
                                                        name="preparation_note"
                                                        type="text"
                                                        placeholder="Preparation note"
                                                        className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                                                    >
                                                        Add ingredient
                                                    </button>
                                                </form>

                                                <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
                                                    <table className="min-w-full text-left text-xs">
                                                        <thead className="bg-zinc-100 text-zinc-700">
                                                            <tr>
                                                                <th className="px-3 py-2 font-medium">ingredient</th>
                                                                <th className="px-3 py-2 font-medium">required_quantity</th>
                                                                <th className="px-3 py-2 font-medium">unit</th>
                                                                <th className="px-3 py-2 font-medium">is_optional</th>
                                                                <th className="px-3 py-2 font-medium">preparation_note</th>
                                                                <th className="px-3 py-2 font-medium">Modify</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {relatedIngredients.map((item) => {
                                                                const ingredientFormId = `recipe-ingredient-form-${recipe.recipe_id}-${item.ingredient_id}`;

                                                                return (
                                                                    <tr key={`${item.recipe_id}-${item.ingredient_id}`} className="border-t border-zinc-200 align-top">
                                                                        <td className="px-3 py-2">
                                                                            <select
                                                                                form={ingredientFormId}
                                                                                name="ingredient_id"
                                                                                defaultValue={String(item.ingredient_id)}
                                                                                className="w-full min-w-[200px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            >
                                                                                {ingredients.map((ingredient) => (
                                                                                    <option key={ingredient.ingredient_id} value={ingredient.ingredient_id}>
                                                                                        {ingredient.name} ({ingredient.ingredient_id})
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <div className="mt-1 text-[11px] text-zinc-500">
                                                                                Current: {ingredientNameById.get(item.ingredient_id) ?? `Ingredient ${item.ingredient_id}`}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <input
                                                                                form={ingredientFormId}
                                                                                name="required_quantity"
                                                                                type="text"
                                                                                defaultValue={item.required_quantity ?? ""}
                                                                                className="w-full min-w-[110px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <input
                                                                                form={ingredientFormId}
                                                                                name="unit"
                                                                                type="text"
                                                                                defaultValue={item.unit ?? ""}
                                                                                className="w-full min-w-[100px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <select
                                                                                form={ingredientFormId}
                                                                                name="is_optional"
                                                                                defaultValue={item.is_optional ? "true" : "false"}
                                                                                className="w-full min-w-[92px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            >
                                                                                <option value="false">Required</option>
                                                                                <option value="true">Optional</option>
                                                                            </select>
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <input
                                                                                form={ingredientFormId}
                                                                                name="preparation_note"
                                                                                type="text"
                                                                                defaultValue={item.preparation_note ?? ""}
                                                                                className="w-full min-w-[180px] rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <form id={ingredientFormId} action={updateRecipeIngredient} className="flex min-w-[140px] flex-col gap-2">
                                                                                <input type="hidden" name="recipe_id" value={item.recipe_id} />
                                                                                <input type="hidden" name="original_ingredient_id" value={item.ingredient_id} />
                                                                                <button
                                                                                    type="submit"
                                                                                    className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                                                >
                                                                                    Save changes
                                                                                </button>
                                                                                <button
                                                                                    type="submit"
                                                                                    formAction={deleteRecipeIngredient}
                                                                                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </form>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                            {relatedIngredients.length === 0 && (
                                                                <tr className="border-t border-zinc-200">
                                                                    <td className="px-3 py-3 text-zinc-500" colSpan={6}>
                                                                        No recipe_ingredient rows linked to this recipe yet.
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
                        {recipes.length === 0 && (
                            <tr className="border-t border-zinc-200">
                                <td className="px-4 py-3 text-zinc-500" colSpan={11}>
                                    No recipe rows found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
