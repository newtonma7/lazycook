import { unstable_noStore as noStore } from "next/cache";
import { AccountPanel } from "./account";
import { IngredientPanel } from "./ingredient";
import { MealPlanPanel } from "./meal-plan";
import { PantryPanel } from "./pantry";
import { RecipePanel } from "./recipes";
import { TableTabs } from "./table-tabs";

/** Always read fresh data from Supabase; avoid cached RSC payload after mutations. */
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ tab?: string; message?: string; error?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeTab = params.tab === "ingredient" || params.tab === "recipe" || params.tab === "pantry" || params.tab === "meal_plan" ? params.tab : "account";

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^"|"$/g, "");
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^"|"$/g, "");

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16">
        <h1 className="mb-4 text-2xl font-semibold">Supabase data</h1>
        <p className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
          Missing Supabase environment variables.
        </p>
      </main>
    );
  }

  noStore();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-16">
      <h1 className="text-3xl text-green-500">Connected</h1>
      <h1 className="mb-4 text-2xl font-semibold">LazyCook account and data</h1>

      <div className="mb-6">
        <TableTabs active={activeTab} />
      </div>

      <section aria-labelledby="panel-heading" className="rounded-b-lg border border-t-0 border-zinc-200 bg-white p-6 shadow-sm">
        <h2 id="panel-heading" className="sr-only">
          {activeTab === "account" ? "Account" : activeTab === "ingredient" ? "Ingredient" : activeTab === "recipe" ? "Recipe" : activeTab === "pantry" ? "Pantry" : "Meal Plan"} records
        </h2>
        {activeTab === "account" ? (
          <AccountPanel message={params.message} error={params.error} />
        ) : activeTab === "ingredient" ? (
          <IngredientPanel supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
        ) : activeTab === "recipe" ? (
          <RecipePanel supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
        ) : activeTab === "pantry" ? (
          <PantryPanel supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
        ) : (
          <MealPlanPanel supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
        )}
      </section>
    </main>
  );
}
