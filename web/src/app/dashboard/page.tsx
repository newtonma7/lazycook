import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { AccountPanel } from "../account";
import { IngredientPanel } from "../ingredient";
import { MealPlanPanel } from "../meal-plan/meal-plan";
import { PantryPanel } from "../pantry";
import { RecipePanel } from "../recipes";
import { AiRecipePanel } from "../ai-recipe-panel";
import { getCurrentAccount } from "../account-auth";
import { TableTabs, type Tab } from "../table-tabs";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ tab?: string; message?: string; error?: string; plan?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentAccount = await getCurrentAccount();
  const isAdmin = currentAccount?.role === "admin";
  const parsedPlanId = params.plan ? Number.parseInt(params.plan, 10) : NaN;
  const selectedMealPlanId = Number.isFinite(parsedPlanId) && parsedPlanId > 0 ? parsedPlanId : null;

  const activeTab = (
    (params.tab === "ingredient" && isAdmin) ||
      params.tab === "recipe" ||
      params.tab === "pantry" ||
      params.tab === "meal_plan" ||
      params.tab === "ai-recipe"
      ? params.tab
      : "account"
  ) as Tab;

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^"|"$/g, "");
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^"|"$/g, "");

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16">
        <h1 className="mb-4 font-display text-2xl text-ink">Supabase data</h1>
        <p className="rounded-md border border-tomato/30 bg-tomato/5 p-4 font-body text-tomato">
          Missing Supabase environment variables.
        </p>
      </main>
    );
  }

  noStore();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      {/* Dashboard header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/" className="font-display text-2xl italic text-ink tracking-tight hover:text-tomato transition-colors duration-300">
            lazycook
          </Link>
          <p className="mt-1 font-body text-sm text-ink-muted">Dashboard</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-border px-4 py-2 font-body text-xs text-ink-muted tracking-wide transition-all duration-300 hover:bg-ink hover:text-cream hover:border-ink"
        >
          &larr; Home
        </Link>
      </div>

      {!!currentAccount && (
        <TableTabs active={activeTab} isAdmin={isAdmin} />
      )}

      <section aria-labelledby="panel-heading" className={`border border-border bg-surface p-6 shadow-sm ${!!currentAccount ? "rounded-b-lg border-t-0" : "rounded-lg"}`}>
        <h2 id="panel-heading" className="sr-only">
          {activeTab === "account" && "Account records"}
          {activeTab === "ingredient" && "Ingredient records"}
          {activeTab === "recipe" && "Recipe records"}
          {activeTab === "pantry" && "Pantry records"}
          {activeTab === "meal_plan" && "Meal Plan records"}
          {activeTab === "ai-recipe" && "AI Chef records"}
        </h2>

        {activeTab === "account" && (
          <AccountPanel message={params.message} error={params.error} />
        )}
        {activeTab === "ingredient" && (
          <IngredientPanel supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
        )}
        {activeTab === "recipe" && (
          <RecipePanel supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
        )}
        {activeTab === "pantry" && (
          <PantryPanel supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
        )}
        {activeTab === "meal_plan" && (
          <MealPlanPanel
            supabaseUrl={supabaseUrl}
            supabaseAnonKey={supabaseAnonKey}
            selectedPlanId={selectedMealPlanId}
          />
        )}
        {activeTab === "ai-recipe" && (
          <AiRecipePanel supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
        )}
      </section>
    </main>
  );
}
