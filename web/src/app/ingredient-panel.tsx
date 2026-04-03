import { createClient } from "@supabase/supabase-js";
import { addIngredient, deleteIngredient, updateIngredient } from "./actions";

export type IngredientRow = {
  ingredient_id: number;
  name: string;
  category: string;
  default_unit: string;
  is_allergen: boolean;
};

type Props = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export async function IngredientPanel({ supabaseUrl, supabaseAnonKey }: Props) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from("ingredient")
    .select("ingredient_id, name, category, default_unit, is_allergen")
    .order("ingredient_id", { ascending: true });

  const rows = (data ?? []) as IngredientRow[];

  return (
    <>
      <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
        <h2 className="mb-4 text-lg font-medium">Add New Ingredient</h2>
        <form action={addIngredient} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="ing-name" className="text-sm text-zinc-600">
              Name
            </label>
            <input
              id="ing-name"
              name="name"
              type="text"
              required
              className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="ing-category" className="text-sm text-zinc-600">
              Category
            </label>
            <input
              id="ing-category"
              name="category"
              type="text"
              required
              className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="ing-unit" className="text-sm text-zinc-600">
              Default unit
            </label>
            <input
              id="ing-unit"
              name="default_unit"
              type="text"
              required
              placeholder="e.g. lbs, tbsp"
              className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="ing-allergen" className="text-sm text-zinc-600">
              Allergen
            </label>
            <select
              id="ing-allergen"
              name="is_allergen"
              defaultValue="false"
              className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Insert Record
          </button>
        </form>
      </div>

      {error ? (
        <p className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
          Failed to load data: {error.message}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-100">
              <tr>
                <th className="px-4 py-3 font-medium">ingredient_id</th>
                <th className="px-4 py-3 font-medium">name</th>
                <th className="px-4 py-3 font-medium">category</th>
                <th className="px-4 py-3 font-medium">default_unit</th>
                <th className="px-4 py-3 font-medium">is_allergen</th>
                <th className="px-4 py-3 font-medium">Update</th>
                <th className="px-4 py-3 font-medium">Delete</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.ingredient_id} className="border-t border-zinc-200 align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{row.ingredient_id}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.category}</td>
                  <td className="px-4 py-3">{row.default_unit}</td>
                  <td className="px-4 py-3">{row.is_allergen ? "true" : "false"}</td>
                  <td className="px-4 py-3">
                    <form action={updateIngredient} className="flex min-w-[200px] flex-col gap-2">
                      <input type="hidden" name="ingredient_id" value={row.ingredient_id} />
                      <input
                        name="name"
                        type="text"
                        required
                        defaultValue={row.name}
                        className="w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                        aria-label={`Name for ingredient ${row.ingredient_id}`}
                      />
                      <input
                        name="category"
                        type="text"
                        required
                        defaultValue={row.category}
                        className="w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                        aria-label={`Category for ingredient ${row.ingredient_id}`}
                      />
                      <input
                        name="default_unit"
                        type="text"
                        required
                        defaultValue={row.default_unit}
                        className="w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                        aria-label={`Default unit for ingredient ${row.ingredient_id}`}
                      />
                      <select
                        name="is_allergen"
                        defaultValue={row.is_allergen ? "true" : "false"}
                        className="w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                        aria-label={`Allergen for ingredient ${row.ingredient_id}`}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      >
                        Save changes
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteIngredient}>
                      <input type="hidden" name="ingredient_id" value={row.ingredient_id} />
                      <button
                        type="submit"
                        className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr className="border-t border-zinc-200">
                  <td className="px-4 py-3 text-zinc-500" colSpan={7}>
                    No ingredient rows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
