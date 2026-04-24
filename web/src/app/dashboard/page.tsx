import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { AccountPanel } from "../account";
import { IngredientPanel } from "../ingredient";
import { MealPlanPanel } from "../meal-plan/meal-plan";
import { PantryPanel } from "../pantry";
import { RecipePanel } from "../recipes/recipes";
import { AiRecipePanel } from "../ai-recipe-panel/AiRecipePanel";
import { getCurrentAccount } from "../account-auth";
import { DashboardNav } from "./DashboardNav";
import { type Tab } from "../table-tabs";
import { AlertCircle, ArrowLeft, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ tab?: string; message?: string; error?: string; plan?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  noStore();
  
  const params = await searchParams;
  const currentAccount = await getCurrentAccount();
  
  // Strict preservation of legacy ID and role logic
  const consumerId = currentAccount?.role === "consumer" ? Number(currentAccount.userId) : null;
  const adminId = currentAccount?.role === "admin" ? Number(currentAccount.userId) : null;
  const isAdmin = currentAccount?.role === "admin";
  
  const parsedPlanId = params.plan ? Number.parseInt(params.plan, 10) : NaN;
  const selectedMealPlanId = Number.isFinite(parsedPlanId) && parsedPlanId > 0 ? parsedPlanId : null;

  // Active Tab Logic with Admin Protection
  const activeTab = (
    (params.tab === "ingredient" && isAdmin) ||
      params.tab === "recipe" ||
      params.tab === "pantry" ||
      params.tab === "meal_plan" ||
      params.tab === "ai-recipe"
      ? params.tab
      : "account"
  ) as Tab;

  // Sanitizing Supabase Environment Variables
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^"|"$/g, "");
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^"|"$/g, "");

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream p-6">
        <div className="max-w-md w-full bg-warm-white p-8 rounded-3xl shadow-premium border border-terracotta/20 text-center">
          <AlertCircle className="w-12 h-12 text-terracotta mx-auto mb-4" />
          <h1 className="font-serif text-2xl mb-2 text-charcoal">Configuration Missing</h1>
          <p className="text-stone mb-6">Missing Supabase environment variables. Please check your .env files.</p>
        </div>
      </main>
    );
  }

  const hour = new Date().getHours();
  const timeContext = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return (
    <div className="min-h-screen bg-cream selection:bg-saffron/30">
      <header className="border-b border-mist bg-warm-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2">
              <span className="font-serif text-2xl italic tracking-tighter text-charcoal group-hover:text-terracotta transition-colors">
                lazycook
              </span>
            </Link>
            {!!currentAccount && (
              <nav className="hidden lg:block">
                <DashboardNav isAdmin={isAdmin} activeTab={activeTab} />
              </nav>
            )}
          </div>
          
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-mist text-stone text-xs font-body tracking-wide hover:bg-charcoal hover:text-warm-white hover:border-charcoal transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-saffron fill-saffron/20" />
            <span className="text-stone uppercase tracking-widest text-[10px] font-bold">Kitchen Intelligence</span>
          </div>
          <h1 className="text-5xl font-serif text-charcoal leading-tight">
            Good {timeContext}{currentAccount?.userId ? `, Chef` : ''}.
          </h1>
          <p className="mt-3 text-stone text-lg max-w-2xl font-sans">
            {activeTab === "ai-recipe" ? "Your AI assistant is analyzing your pantry." : 
             activeTab === "pantry" ? "Review and restock your kitchen essentials." :
             "Manage your profile and kitchen preferences."}
          </p>
        </section>

        <div className="relative">
          <Suspense fallback={
            <div className="h-96 w-full bg-warm-white rounded-3xl animate-pulse flex items-center justify-center border border-mist">
              <Sparkles className="w-8 h-8 text-mist animate-bounce" />
            </div>
          }>
            <section 
              aria-labelledby="panel-heading"
              className="bg-warm-white rounded-3xl shadow-premium border border-mist min-h-[500px] overflow-hidden transition-all duration-500"
            >
              <h2 id="panel-heading" className="sr-only">
                {activeTab === "account" && "Account records"}
                {activeTab === "ingredient" && "Ingredient records"}
                {activeTab === "recipe" && "Recipe records"}
                {activeTab === "pantry" && "Pantry records"}
                {activeTab === "meal_plan" && "Meal Plan records"}
                {activeTab === "ai-recipe" && "AI Chef records"}
              </h2>

              <div className="p-8">
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
                  <AiRecipePanel 
                    supabaseUrl={supabaseUrl} 
                    supabaseAnonKey={supabaseAnonKey} 
                    consumerId={consumerId} 
                    adminId={adminId} 
                  />
                )}
              </div>
            </section>
          </Suspense>
        </div>
      </main>
    </div>
  );
}