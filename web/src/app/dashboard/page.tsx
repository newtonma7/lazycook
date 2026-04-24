import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { AccountPanel } from "../account";
import { IngredientPanel } from "../ingredient";
import { MealPlanPanel } from "../meal-plan/meal-plan";
import { PantryPanel } from "../pantry";
import { RecipePanel } from "../recipes/recipes";
import { AiRecipePanel } from "../ai-recipe-panel/AiRecipePanel";
import { getCurrentAccount } from "../auth/account-auth";
import { DashboardNav } from "./DashboardNav";
import { type Tab } from "../table-tabs";
import { AlertCircle, ArrowLeft, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

// Updated to standard Next.js 15 strictly typed searchParams
type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  noStore();
  
  const params = await searchParams;
  const currentAccount = await getCurrentAccount();
  
  const consumerId = currentAccount?.role === "consumer" ? Number(currentAccount.userId) : null;
  const adminId = currentAccount?.role === "admin" ? Number(currentAccount.userId) : null;
  const isAdmin = currentAccount?.role === "admin";
  
  // Safely extract string values from potentially array-based search params
  const rawTab = params?.tab;
  const tabStr = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  
  const rawPlan = params?.plan;
  const planStr = Array.isArray(rawPlan) ? rawPlan[0] : rawPlan;
  
  const rawMessage = params?.message;
  const messageStr = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
  
  const rawError = params?.error;
  const errorStr = Array.isArray(rawError) ? rawError[0] : rawError;
  
  const parsedPlanId = planStr ? Number.parseInt(planStr, 10) : NaN;
  const selectedMealPlanId = Number.isFinite(parsedPlanId) && parsedPlanId > 0 ? parsedPlanId : null;

  const activeTab = (
    (tabStr === "ingredient" && isAdmin) ||
      tabStr === "recipe" ||
      tabStr === "pantry" ||
      tabStr === "meal_plan" ||
      tabStr === "ai-recipe"
      ? tabStr
      : "account"
  ) as Tab;

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^"|"$/g, "");
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^"|"$/g, "");

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-parchment)] p-6">
        <div className="max-w-md w-full bg-[var(--color-warm-surface)] p-8 rounded-3xl shadow-[0_4px_24px_rgba(44,36,32,0.08)] border border-[var(--color-warm-border)] text-center">
          <AlertCircle className="w-12 h-12 text-[var(--color-terracotta)] mx-auto mb-4" />
          <h1 className="font-[family-name:var(--font-display)] text-2xl mb-2 text-[var(--color-text-primary)]">Configuration Missing</h1>
          <p className="text-[var(--color-text-secondary)] font-[family-name:var(--font-ui)] mb-6">Missing Supabase environment variables. Please check your .env files.</p>
        </div>
      </main>
    );
  }

  const hour = new Date().getHours();
  const timeContext = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  // Contextual descriptions for the "Chef's Notebook" header
  const tabDescriptions: Record<string, string> = {
    "account": "Manage your chef profile and kitchen preferences.",
    "pantry": "Review your inventory and restock your essentials.",
    "recipe": "Curate your personal cookbook and discover shared inspiration.",
    "meal_plan": "Orchestrate your week with purposeful meal prep.",
    "ai-recipe": "Your AI sous-chef is ready to draft today's menu.",
    "ingredient": "Govern the master culinary ingredient database."
  };

  const headerDescription = tabDescriptions[activeTab] || tabDescriptions["account"];

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] selection:bg-[var(--color-saffron-soft)] font-[family-name:var(--font-ui)]">
      <header className="border-b border-[var(--color-warm-border)] bg-[var(--color-warm-surface)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2">
              <span className="font-[family-name:var(--font-display)] text-2xl italic tracking-tighter text-[var(--color-text-primary)] group-hover:text-[var(--color-terracotta)] transition-colors">
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
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-warm-border)] text-[var(--color-text-secondary)] text-xs tracking-wide hover:bg-[var(--color-text-primary)] hover:text-[var(--color-warm-surface)] hover:border-[var(--color-text-primary)] transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out">
        <section className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[var(--color-saffron)]" />
              <span className="font-[family-name:var(--font-handwritten)] text-[var(--color-text-secondary)] text-[18px]">
                your kitchen, this {timeContext}
              </span>
            </div>
            <h1 className="text-3xl font-[family-name:var(--font-display)] text-[var(--color-text-primary)] leading-tight">
              Hello{currentAccount?.userId ? `, Chef` : ''}.
            </h1>
          </div>
          
          <p className="text-[var(--color-text-secondary)] text-sm max-w-sm hidden md:block text-right">
            {headerDescription}
          </p>
        </section>

        <div className="relative">
          {/* CRITICAL FIX: Added key={activeTab} to Suspense. This forces React to unmount the old component tree and boundary before streaming the new one, preventing RSC stream crashes during client-side tab navigation. */}
          <Suspense 
            key={activeTab} 
            fallback={
              <div className="h-96 w-full bg-[var(--color-warm-surface)] rounded-2xl animate-pulse flex items-center justify-center border border-[var(--color-warm-border)]">
                <Sparkles className="w-8 h-8 text-[var(--color-text-ghost)] animate-bounce" />
              </div>
            }
          >
            <section 
              aria-labelledby="panel-heading"
              className="bg-[var(--color-warm-surface)] rounded-2xl shadow-[0_4px_24px_rgba(44,36,32,0.08)] border border-[var(--color-warm-border)] min-h-[500px] overflow-hidden transition-all duration-500"
            >
              <h2 id="panel-heading" className="sr-only">
                {activeTab === "account" && "Account records"}
                {activeTab === "ingredient" && "Ingredient records"}
                {activeTab === "recipe" && "Recipe records"}
                {activeTab === "pantry" && "Pantry records"}
                {activeTab === "meal_plan" && "Meal Plan records"}
                {activeTab === "ai-recipe" && "AI Chef records"}
              </h2>

              <div className="p-6 md:p-8">
                {activeTab === "account" && (
                  <AccountPanel message={messageStr} error={errorStr} currentAccount={currentAccount} />
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