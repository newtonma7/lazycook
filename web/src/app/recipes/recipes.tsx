import { createSupabaseServerAuthClient, getCurrentAccount } from "../auth/account-auth";
import { RecipeGallery } from "./RecipeGallery";

type Props = {
    supabaseUrl: string;
    supabaseAnonKey: string;
};

export async function RecipePanel({ supabaseUrl, supabaseAnonKey }: Props) {
  const account = await getCurrentAccount();
  const consumerId = account?.role === "consumer" ? Number(account.userId) : null;

  // Protect the component
  if (!consumerId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="rounded-2xl border border-tomato/30 bg-tomato/10 p-6 text-tomato font-body text-sm shadow-sm">
          <span className="font-display font-bold text-lg block mb-1">Authentication Required</span>
          Please log in as a consumer to view and manage your kitchen.
        </p>
      </div>
    );
  }

  const supabase = createSupabaseServerAuthClient();

  // Fetch the master ingredients list so users can add new ingredients during inline-editing
  const { data: ingredientsData, error } = await supabase
    .from("ingredient")
    .select("ingredient_id, name")
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="rounded-2xl border border-tomato/30 bg-tomato/10 p-6 text-tomato font-body text-sm shadow-sm">
          <span className="font-display font-bold text-lg block mb-1">Database Error</span>
          Failed to load ingredients: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <RecipeGallery 
        supabaseUrl={supabaseUrl} 
        supabaseAnonKey={supabaseAnonKey}
        consumerId={consumerId}
        ingredients={ingredientsData || []} 
      />
    </div>
  );
}