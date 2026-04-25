import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { AccountPanel } from "../account";
import { IngredientPanel } from "../ingredients/IngredientPanel";
import { MealPlanPanel } from "../meal-plan/meal-plan";
import { PantryPanel } from "../pantry/PantryPanel";
import { RecipePanel } from "../recipes/RecipePanel";
import { AiRecipePanel } from "../ai-recipe-panel/AiRecipePanel";
import { getCurrentAccount } from "../auth/account-auth";
import { DashboardNav } from "./DashboardNav";
import { type Tab } from "../table-tabs";
import { AlertCircle, ArrowLeft, Sparkles } from "lucide-react";
import { BasilLoading, BasilIdle, BasilMealPlan } from "../components/mascot/BasilComponents";
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
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-cream)] p-6 font-[family-name:var(--font-body)]">
        <div className="max-w-md w-full bg-[var(--color-warm-surface)] p-8 rounded-3xl shadow-[0_4px_24px_rgba(44,36,32,0.08)] border border-[var(--color-warm-border)] text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-tomato)]" />
          <AlertCircle className="w-12 h-12 text-[var(--color-terracotta)] mx-auto mb-4" />
          <h1 className="font-[family-name:var(--font-display)] text-2xl mb-2 text-[var(--color-text-primary)]">Configuration Missing</h1>
          <p className="text-[var(--color-ink-muted)] mb-8">Missing Supabase environment variables. Please check your .env files.</p>
        </div>
      </main>
    );
  }

  const hour = new Date().getHours();
  const timeContext = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  // --- MODULAR GREETING CONFIGURATION ---
  // You can easily modify this map to decide which tabs show the "Hello, Chef" greeting
  const tabConfig: Record<string, { showGreeting: boolean; description: string }> = {
    "account": { 
        showGreeting: true, 
        description: "Manage your chef profile and kitchen preferences." 
    },
    "pantry": { 
        showGreeting: false, // Hidden because Pantry has its own internal header
        description: "Review your inventory and restock your essentials." 
    },
    "recipe": { 
        showGreeting: false, // Hidden to avoid redundancy with "Kitchen Archive" header
        description: "Curate your personal cookbook and discover shared inspiration." 
    },
    "meal_plan": { 
        showGreeting: false, 
        description: "Orchestrate your week with purposeful meal prep." 
    },
    "ai-recipe": { 
        showGreeting: false, 
        description: "Your AI sous-chef is ready to draft today's menu." 
    },
    "ingredient": { 
        showGreeting: false, 
        description: "Govern the master culinary ingredient database." 
    }
  };

  const currentTabConfig = tabConfig[activeTab] || tabConfig["account"];

  return (
    <div className="h-screen flex flex-col bg-[var(--color-cream)] selection:bg-[var(--color-tomato)]/10 font-[family-name:var(--font-body)] overflow-hidden">
      <header className="border-b border-[var(--color-border-light)] bg-[var(--color-cream)]/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2">
              {/* Tiny Basil napping beside the logo */}
              <BasilIdle size={32} />
              <span className="font-[family-name:var(--font-display)] text-xl italic tracking-tight text-[var(--color-ink)] group-hover:text-[var(--color-tomato)] transition-colors">
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
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-ink-muted)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] hover:border-[var(--color-ink)] transition-all duration-300"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-6 md:pt-10 w-full flex flex-col overflow-hidden">
        
        {/* MODULAR GREETING: Only shows if currentAccount exists AND tab config allows it */}
        {!!currentAccount && currentTabConfig.showGreeting && (
          <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Sparkles className="w-4 h-4 text-[var(--color-turmeric)]" />
                <span className="font-[family-name:var(--font-display)] text-[24px] italic text-[var(--color-tomato)]">
                  your kitchen, this {timeContext}
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-[family-name:var(--font-display)] text-[var(--color-ink)] leading-tight font-bold tracking-tight">
                Hello{currentAccount?.userId ? `, Chef` : ''}.
              </h1>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <BasilMealPlan size={80} />
              <p className="text-[var(--color-ink-muted)] text-base max-w-sm text-right italic">
                {currentTabConfig.description}
              </p>
            </div>
          </section>
        )}

        <div className="flex-1 relative overflow-hidden flex flex-col">
          <Suspense 
            key={activeTab} 
            fallback={
              <div className="h-full w-full bg-[var(--color-surface)] rounded-[2rem] flex flex-col items-center justify-center border border-[var(--color-border-light)] gap-4">
                <BasilLoading size={60} />
                <p className="font-[family-name:var(--font-handwritten)] text-lg text-[var(--color-ink-muted)] animate-pulse">
                  just a moment… ☕
                </p>
              </div>
            }
          >
            <section 
              aria-labelledby="panel-heading"
              className="flex-1 overflow-y-auto custom-scrollbar pb-6"
            >
              <h2 id="panel-heading" className="sr-only">
                {activeTab === "account" && "Account records"}
                {activeTab === "ingredient" && "Ingredient records"}
                {activeTab === "recipe" && "Recipe records"}
                {activeTab === "pantry" && "Pantry records"}
                {activeTab === "meal_plan" && "Meal Plan records"}
                {activeTab === "ai-recipe" && "AI Chef records"}
              </h2>

              <div className="w-full">
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
                  <PantryPanel
                    supabaseUrl={supabaseUrl}
                    supabaseAnonKey={supabaseAnonKey}
                    consumerId={consumerId}
                    isAdmin={isAdmin}
                  />
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