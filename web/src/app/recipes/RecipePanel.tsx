// components/recipes/RecipePanel.tsx
import { createSupabaseServerAuthClient, getCurrentAccount } from "../auth/account-auth";
import { RecipeGallery } from "./RecipeGallery";
import { ChefHat } from "lucide-react";

type ConsumerInfo = {
  consumer_id: number;
  email: string;
  username: string | null;
};

type Props = {
    supabaseUrl: string;
    supabaseAnonKey: string;
};

export async function RecipePanel({ supabaseUrl, supabaseAnonKey }: Props) {
  const account = await getCurrentAccount();
  
  const isAuthorized = account?.role === "consumer" || account?.role === "admin";
  const userId = account && isAuthorized ? Number(account.userId) : null;
  const isAdmin = account?.role === "admin";

  if (!isAuthorized || !userId) {
    return (
      <div className="w-full font-[family-name:var(--font-body)] animate-in fade-in duration-700 hide-scrollbar">
        <div className="max-w-md mx-auto mt-12 rounded-[2.5rem] border border-[var(--color-tomato)]/20 bg-[var(--color-tomato)]/5 p-8 text-center relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-tomato)] opacity-40" />
          <ChefHat className="w-10 h-10 text-[var(--color-tomato)]/40 mx-auto mb-4" />
          <h3 className="font-[family-name:var(--font-display)] text-3xl italic text-[var(--color-ink)] mb-2">Access Restricted</h3>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-6">
            Please log in as a registered chef to view and manage the kitchen gallery.
          </p>
        </div>
      </div>
    );
  }

  const supabase = createSupabaseServerAuthClient();

  const { data: ingredientsData, error } = await supabase
    .from("ingredient")
    .select("ingredient_id, name")
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="w-full font-[family-name:var(--font-body)]">
        <div className="max-w-md mx-auto mt-12 rounded-[2rem] border border-[var(--color-tomato)]/20 bg-[var(--color-tomato)]/5 p-6 text-center">
          <span className="font-[family-name:var(--font-display)] font-bold text-xl text-[var(--color-tomato)] block mb-1">Database Error</span>
          <p className="text-xs text-[var(--color-ink-muted)]">{error.message}</p>
        </div>
      </div>
    );
  }

  // If admin, fetch consumer list for the "User Kitchen" dropdown
  let consumers: ConsumerInfo[] = [];
  if (isAdmin) {
    const { data: consumerData } = await supabase
      .from("consumer")
      .select("consumer_id, email, username")
      .order("email");
    consumers = (consumerData as ConsumerInfo[]) || [];
  }

  return (
    <RecipeGallery 
      supabaseUrl={supabaseUrl} 
      supabaseAnonKey={supabaseAnonKey}
      consumerId={isAdmin ? null : userId}
      ingredients={ingredientsData || []} 
      isAdmin={isAdmin}
      consumers={consumers}
    />
  );
}