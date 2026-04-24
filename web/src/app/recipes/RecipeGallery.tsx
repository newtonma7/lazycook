// components/recipes/RecipeGallery.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Clock, Users, Globe, Lock, ChefHat, Pen, Trash2, 
  Play, X, Save, Plus, ArrowLeft, Sparkles, Heart, UtensilsCrossed 
} from "lucide-react";
import { spring } from "@/lib/animation";
import { cn } from "@/lib/utils";

type IngredientOption = { ingredient_id: number; name: string };
type Ingredient = { name: string };

type RecipeIngredient = {
  ingredient_id: number;
  required_quantity: string | null;
  unit: string | null;
  preparation_note: string | null;
  is_optional: boolean;
  ingredient: Ingredient | null;
};

type Recipe = {
  recipe_id: number;
  consumer_id: number | null;
  title: string;
  description: string | null;
  instructions: string | null;
  prep_time_min: number | null;
  cook_time_min: number | null;
  servings: number | null;
  is_public: boolean;
  recipe_ingredient: RecipeIngredient[];
};

type ConsumerInfo = {
  consumer_id: number;
  email: string;
  username: string | null;
};

type Props = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  consumerId: number | null;
  ingredients: IngredientOption[];
  isAdmin?: boolean;
  consumers?: ConsumerInfo[];
};

const FloatingEmoticon = ({ emoji, delay = 0, x = "0%", y = "0%" }: { emoji: string, delay?: number, x?: string, y?: string }) => (
  <motion.span
    initial={{ y: 0 }}
    animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
    className="absolute text-xl pointer-events-none select-none opacity-30 z-0"
    style={{ left: x, top: y }}
  >
    {emoji}
  </motion.span>
);

export function RecipeGallery({ supabaseUrl, supabaseAnonKey, consumerId, ingredients, isAdmin = false, consumers = [] }: Props) {
  const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);

  // Admin has two tabs: "all" and "user"
  const [adminViewMode, setAdminViewMode] = useState<"all" | "user">("all");
  // For consumer: "personal" or "public"
  const [consumerViewMode, setConsumerViewMode] = useState<"personal" | "public">("personal");

  // Which user's kitchen is admin looking at?
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Recipe | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "quick" | "simple">("all");

  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [cookStep, setCookStep] = useState(0);

  useEffect(() => {
    async function fetchRecipes() {
      setIsLoading(true);
      setSelectedRecipe(null);
      setIsEditing(false);
      setCookingRecipe(null);

      let query = supabase
        .from("recipe")
        .select(`*, recipe_ingredient (ingredient_id, required_quantity, unit, preparation_note, is_optional, ingredient (name))`)
        .order("created_at", { ascending: false });

      if (consumerId !== null) {
        // consumer
        query = consumerViewMode === "personal" 
          ? query.eq("consumer_id", consumerId) 
          : query.eq("is_public", true).neq("consumer_id", consumerId);
      } else {
        // admin
        if (adminViewMode === "user" && selectedUserId) {
          query = query.eq("consumer_id", selectedUserId);
        }
        // "all" -> no filter, already all recipes
      }

      const { data, error } = await query;
      if (!error && data) setRecipes(data as unknown as Recipe[]);
      setIsLoading(false);
    }
    
    fetchRecipes();
  }, [supabase, consumerViewMode, consumerId, adminViewMode, selectedUserId]);

  const displayRecipes = useMemo(() => {
    return recipes.filter(r => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        r.title.toLowerCase().includes(searchLower) || 
        (r.description?.toLowerCase() || "").includes(searchLower) ||
        r.recipe_ingredient.some(ing => (ing.ingredient?.name || "").toLowerCase().includes(searchLower));

      let matchesFilter = true;
      if (activeFilter === "quick") matchesFilter = ((r.prep_time_min || 0) + (r.cook_time_min || 0)) <= 30;
      if (activeFilter === "simple") matchesFilter = r.recipe_ingredient.length <= 5;

      return matchesSearch && matchesFilter;
    });
  }, [recipes, searchQuery, activeFilter]);

  const saveToMyKitchen = async (recipeToClone: Recipe) => {
    if (!consumerId) return;
    try {
      setIsProcessing(true);
      const { data: newRecipe, error: recipeError } = await supabase.from("recipe").insert({
        consumer_id: consumerId,
        title: recipeToClone.title,
        description: recipeToClone.description,
        instructions: recipeToClone.instructions,
        prep_time_min: recipeToClone.prep_time_min,
        cook_time_min: recipeToClone.cook_time_min,
        servings: recipeToClone.servings,
        is_public: false 
      }).select("recipe_id").single();

      if (recipeError) throw recipeError;
      if (recipeToClone.recipe_ingredient.length > 0) {
        const newIngredients = recipeToClone.recipe_ingredient.map(ing => ({
          recipe_id: newRecipe.recipe_id,
          ingredient_id: ing.ingredient_id,
          required_quantity: ing.required_quantity,
          unit: ing.unit,
          preparation_note: ing.preparation_note,
          is_optional: ing.is_optional
        }));
        await supabase.from("recipe_ingredient").insert(newIngredients);
      }
      // Refresh
      const { data } = await supabase.from("recipe").select(`*, recipe_ingredient (ingredient_id, required_quantity, unit, preparation_note, is_optional, ingredient (name))`).order("created_at", { ascending: false });
      if (data) setRecipes(data as Recipe[]);
      setConsumerViewMode("personal");
    } catch (error) { console.error(error); } finally { setIsProcessing(false); }
  };

  const startEditing = () => { setDraft(JSON.parse(JSON.stringify(selectedRecipe))); setIsEditing(true); };
  const cancelEditing = () => { setDraft(null); setIsEditing(false); };

  const handleSaveEdit = async () => {
    if (!draft || !consumerId) return;
    try {
      setIsProcessing(true);
      await supabase.from("recipe").update({
        title: draft.title, description: draft.description, instructions: draft.instructions,
        prep_time_min: draft.prep_time_min, cook_time_min: draft.cook_time_min,
        servings: draft.servings, is_public: draft.is_public
      }).eq("recipe_id", draft.recipe_id);
      await supabase.from("recipe_ingredient").delete().eq("recipe_id", draft.recipe_id);
      if (draft.recipe_ingredient.length > 0) {
        const mappedIngs = draft.recipe_ingredient.map(ing => ({
          recipe_id: draft.recipe_id, ingredient_id: ing.ingredient_id, required_quantity: ing.required_quantity,
          unit: ing.unit, preparation_note: ing.preparation_note, is_optional: ing.is_optional
        }));
        await supabase.from("recipe_ingredient").insert(mappedIngs);
      }
      setRecipes(recipes.map(r => r.recipe_id === draft.recipe_id ? draft : r));
      setSelectedRecipe(draft); setIsEditing(false);
    } catch (error) { console.error(error); } finally { setIsProcessing(false); }
  };

  const startCooking = (recipe: Recipe) => {
    setCookingRecipe(recipe);
    setCookStep(0);
  };

  const formatInstructions = (text: string | null) => !text ? [] : text.split('\n').filter(s => s.trim().length > 0);
  const displayRecipe = isEditing && draft ? draft : selectedRecipe;

  // --- IMMERSIVE COOKING MODE (unchanged) ---
  if (cookingRecipe) {
    const steps = formatInstructions(cookingRecipe.instructions);
    const progress = steps.length > 0 ? ((cookStep + 1) / steps.length) * 100 : 0;

    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[var(--color-ink)] flex flex-col font-[family-name:var(--font-body)]"
      >
        <div className="h-1.5 bg-[var(--color-ink-light)] w-full">
          <motion.div className="h-full bg-[var(--color-sage)]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
        </div>
        <div className="flex-1 flex flex-col p-6 md:p-16 max-w-5xl mx-auto w-full text-center">
          <div className="flex justify-between items-center mb-16 opacity-40">
            <button onClick={() => setCookingRecipe(null)} className="text-[var(--color-cream)] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" /> Stop Cooking
            </button>
            <span className="text-[var(--color-sage)] text-[10px] font-bold uppercase tracking-widest">
              {steps.length > 0 ? `Step ${cookStep + 1} of ${steps.length}` : "No Instructions"}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center relative">
             {steps.length > 0 && (
               <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[15rem] font-[family-name:var(--font-display)] font-bold text-[var(--color-cream)] opacity-[0.03] select-none pointer-events-none leading-none">
                 {cookStep + 1}
               </div>
             )}
             <motion.p 
               key={cookStep}
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
               className="text-4xl md:text-6xl text-[var(--color-cream)] font-[family-name:var(--font-display)] italic leading-tight z-10"
             >
               {steps.length > 0 
                 ? steps[cookStep]?.replace(/^[\d\.\)]+\s*/, '') 
                 : "This recipe doesn't have any instructions yet. Time to improvise!"}
             </motion.p>
          </div>

          <div className="mt-16 flex gap-4">
            <button 
              onClick={() => setCookStep(Math.max(0, cookStep - 1))}
              disabled={cookStep === 0 || steps.length === 0}
              className="flex-1 rounded-full border border-[var(--color-cream)]/20 text-[var(--color-cream)] py-5 text-xs font-bold uppercase tracking-widest disabled:opacity-10 cursor-pointer"
            >
              Previous
            </button>
            <button 
              onClick={() => (cookStep === steps.length - 1 || steps.length === 0) ? setCookingRecipe(null) : setCookStep(cookStep + 1)}
              className="flex-[2] rounded-full bg-[var(--color-cream)] text-[var(--color-ink)] py-5 text-xs font-bold uppercase tracking-widest hover:bg-white transition-all cursor-pointer"
            >
              {(cookStep === steps.length - 1 || steps.length === 0) ? "Finish" : "Next Step"}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // --- GALLERY VIEW ---
  return (
    <div className="font-[family-name:var(--font-body)] text-[var(--color-ink)] animate-in fade-in duration-700 w-full relative">
      
      <AnimatePresence mode="wait">
        {!selectedRecipe && (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--color-border-light)] pb-6 relative">
              <div className="relative">
                <FloatingEmoticon emoji="🍎" x="-40px" y="-15px" delay={0} />
                <span className="font-[family-name:var(--font-display)] text-xl italic text-[var(--color-tomato)] block mb-[-4px] ml-0.5">
                  the kitchen archive
                </span>
                <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold tracking-tight">
                  Recipe Gallery
                </h1>
              </div>

              <div className="flex gap-6 items-center text-[10px] font-bold uppercase tracking-[0.2em]">
                {isAdmin ? (
                  <>
                    <button 
                      onClick={() => setAdminViewMode("all")} 
                      className={cn("transition-all cursor-pointer", adminViewMode === "all" ? "text-[var(--color-tomato)] border-b-2 border-[var(--color-tomato)] pb-1" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]")}
                    >
                      All Recipes
                    </button>
                    <button 
                      onClick={() => setAdminViewMode("user")} 
                      className={cn("transition-all cursor-pointer", adminViewMode === "user" ? "text-[var(--color-tomato)] border-b-2 border-[var(--color-tomato)] pb-1" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]")}
                    >
                      User Kitchen
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setConsumerViewMode("personal")} 
                      className={cn("transition-all cursor-pointer", consumerViewMode === "personal" ? "text-[var(--color-tomato)] border-b-2 border-[var(--color-tomato)] pb-1" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]")}
                    >
                      My Kitchen
                    </button>
                    <button 
                      onClick={() => setConsumerViewMode("public")} 
                      className={cn("transition-all cursor-pointer", consumerViewMode === "public" ? "text-[var(--color-tomato)] border-b-2 border-[var(--color-tomato)] pb-1" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]")}
                    >
                      Community
                    </button>
                  </>
                )}
              </div>
            </header>

            {/* Consumer picker for admin in "User Kitchen" mode */}
            {isAdmin && adminViewMode === "user" && (
              <div className="mb-6">
                <select
                  value={selectedUserId ?? ""}
                  onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                  className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-sage)]"
                >
                  <option value="">Select a user...</option>
                  {consumers.map(c => (
                    <option key={c.consumer_id} value={c.consumer_id}>
                      {c.email} {c.username ? `(${c.username})` : ""}
                    </option>
                  ))}
                </select>
                {!selectedUserId && (
                  <p className="mt-2 text-xs text-[var(--color-ink-muted)] italic">
                    Choose a consumer to view their kitchen.
                  </p>
                )}
              </div>
            )}

            {/* Search and filter (unchanged) */}
            <div className="mb-8 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full relative group">
                <Search className="absolute left-0 bottom-2.5 w-3.5 h-3.5 text-[var(--color-ink-muted)] group-focus-within:text-[var(--color-tomato)] transition-colors" />
                <input 
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes..." 
                  className="w-full bg-transparent border-b border-[var(--color-border-light)] pl-6 pb-1.5 text-base focus:border-[var(--color-tomato)] outline-none transition-all placeholder:text-[var(--color-ink-muted)]/40 italic"
                />
              </div>
              <div className="flex gap-3 scrollbar-none overflow-x-auto w-full md:w-auto pb-1">
                {["all", "quick", "simple"].map(f => (
                  <button 
                    key={f} onClick={() => setActiveFilter(f as any)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all cursor-pointer whitespace-nowrap",
                      activeFilter === f ? "bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]" : "border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink)]"
                    )}
                  >
                    {f === "all" ? "All" : f === "quick" ? "< 30 Min" : "5 Ingredients"}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-56 bg-[var(--color-surface)] rounded-[1.5rem] animate-pulse border border-[var(--color-border-light)]" />)}
              </div>
            ) : displayRecipes.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-[2.5rem] bg-[var(--color-surface)]/30">
                 <UtensilsCrossed className="w-8 h-8 text-[var(--color-border)] mx-auto mb-3" />
                 <p className="font-[family-name:var(--font-display)] text-xl italic text-[var(--color-ink-muted)]">The counter is clean. No recipes found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayRecipes.map(recipe => (
                  <motion.div 
                    key={recipe.recipe_id} onClick={() => setSelectedRecipe(recipe)}
                    whileHover={{ y: -4 }} transition={spring}
                    className="group cursor-pointer bg-[var(--color-surface)] rounded-[1.5rem] border border-[var(--color-border)] p-6 relative flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md hover:border-[var(--color-tomato)]/30 transition-all"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-20 group-hover:rotate-12 transition-all">
                      <ChefHat className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-ink)] leading-tight mb-2 group-hover:text-[var(--color-tomato)] transition-colors">
                        {recipe.title}
                      </h3>
                      <p className="text-xs text-[var(--color-ink-light)] italic line-clamp-2 leading-relaxed mb-6">
                        "{recipe.description}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-light)]">
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                          <Clock className="w-2.5 h-2.5 text-[var(--color-turmeric)]" /> {(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)}m
                        </span>
                        <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                          <Users className="w-2.5 h-2.5 text-[var(--color-sage)]" /> {recipe.servings}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {recipe.is_public && !isAdmin && consumerViewMode === "personal" && (
                          <span title="Shared" className="flex items-center">
                            <Globe className="w-3 h-3 text-[var(--color-sage)] opacity-50" />
                          </span>
                        )}
                        {!recipe.is_public && !isAdmin && consumerViewMode === "personal" && (
                          <span title="Private" className="flex items-center">
                            <Lock className="w-3 h-3 text-[var(--color-ink-muted)] opacity-30" />
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {displayRecipe && !cookingRecipe && (
          <motion.div key="detail" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-6">
              <button 
                onClick={() => setSelectedRecipe(null)} 
                className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Archive
              </button>
              
              <div className="flex gap-2">
                {!isAdmin && consumerViewMode === "personal" && (
                  !isEditing ? (
                    <>
                      <button onClick={startEditing} className="px-5 py-2 rounded-full border border-[var(--color-border)] text-[9px] font-bold uppercase tracking-widest hover:border-[var(--color-ink)] transition-all cursor-pointer">
                        <Pen className="w-2.5 h-2.5 inline mr-1" /> Edit
                      </button>
                      <button onClick={() => startCooking(displayRecipe)} className="px-6 py-2 rounded-full bg-[var(--color-ink)] text-[var(--color-cream)] text-[9px] font-bold uppercase tracking-widest hover:bg-[var(--color-tomato)] transition-all cursor-pointer flex items-center gap-1.5">
                        <Play className="w-2.5 h-2.5 fill-current" /> Start Cooking
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={cancelEditing} className="px-5 py-2 text-[9px] font-bold uppercase tracking-widest text-[var(--color-tomato)] cursor-pointer">Cancel</button>
                      <button onClick={handleSaveEdit} className="px-6 py-2 rounded-full bg-[var(--color-sage)] text-white text-[9px] font-bold uppercase tracking-widest hover:shadow-md transition-all cursor-pointer">
                        Save Changes
                      </button>
                    </>
                  )
                )}
                {isAdmin && consumerId && (
                  <button onClick={() => saveToMyKitchen(displayRecipe)} className="px-6 py-2 rounded-full bg-[var(--color-ink)] text-[var(--color-cream)] text-[9px] font-bold uppercase tracking-widest hover:bg-[var(--color-sage)] transition-all cursor-pointer">
                    Save to My Kitchen
                  </button>
                )}
                {!isAdmin && consumerViewMode === "public" && consumerId && (
                  <button onClick={() => saveToMyKitchen(displayRecipe)} className="px-6 py-2 rounded-full bg-[var(--color-ink)] text-[var(--color-cream)] text-[9px] font-bold uppercase tracking-widest hover:bg-[var(--color-sage)] transition-all cursor-pointer">
                    Save to My Kitchen
                  </button>
                )}
              </div>
            </header>

            {/* Recipe detail (unchanged) */}
            <div className="grid gap-8 lg:grid-cols-12 relative z-10 pb-8">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[var(--color-surface)] rounded-[2rem] p-6 border border-[var(--color-border)] relative overflow-hidden">
                  <FloatingEmoticon emoji="🌿" x="80%" y="10%" delay={1} />
                  <h4 className="font-[family-name:var(--font-display)] text-2xl italic text-[var(--color-tomato)] mb-6">
                    mise en place
                  </h4>
                  <ul className="space-y-4">
                    {displayRecipe.recipe_ingredient.map((ing, idx) => (
                      <li key={idx} className="flex justify-between items-baseline border-b border-[var(--color-border-light)] pb-3 last:border-0 group">
                        <div className="flex flex-col flex-1">
                          <span className="font-bold text-[14px] text-[var(--color-ink)] capitalize">{ing.ingredient?.name}</span>
                          {isEditing ? (
                            <input 
                              value={ing.preparation_note || ""} onChange={e => {
                                if(!draft) return;
                                const n = [...draft.recipe_ingredient]; n[idx].preparation_note = e.target.value;
                                setDraft({...draft, recipe_ingredient: n});
                              }}
                              className="text-[10px] italic bg-transparent border-b border-dashed border-[var(--color-border)] outline-none focus:border-[var(--color-tomato)] mt-0.5"
                            />
                          ) : (
                            <span className="text-[11px] text-[var(--color-ink-muted)] italic">{ing.preparation_note}</span>
                          )}
                        </div>
                        <span className="text-[12px] font-[family-name:var(--font-mono)] font-medium text-[var(--color-ink-muted)]">
                          {ing.required_quantity} {ing.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                <div>
                  {isEditing ? (
                    <input 
                      value={draft?.title} onChange={e => setDraft({...draft!, title: e.target.value})}
                      className="text-4xl md:text-5xl font-[family-name:var(--font-display)] font-bold bg-transparent border-b border-[var(--color-border)] w-full outline-none focus:border-[var(--color-tomato)] mb-4 py-1.5"
                    />
                  ) : (
                    <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-display)] font-bold tracking-tight mb-4 leading-tight">
                      {displayRecipe.title}
                    </h2>
                  )}
                  {isEditing ? (
                    <textarea 
                      value={draft?.description || ""} onChange={e => setDraft({...draft!, description: e.target.value})}
                      className="text-xl italic text-[var(--color-ink-muted)] bg-transparent border-b border-[var(--color-border)] w-full outline-none focus:border-[var(--color-tomato)] py-1.5 min-h-[80px]"
                    />
                  ) : (
                    <p className="text-xl italic text-[var(--color-ink-light)] leading-relaxed">
                      "{displayRecipe.description}"
                    </p>
                  )}
                </div>

                <div className="space-y-8 border-t border-[var(--color-border-light)] pt-8">
                  <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-ink-muted)] mb-6">
                    Method
                  </h4>
                  {isEditing ? (
                    <textarea 
                      value={draft?.instructions || ""} onChange={e => setDraft({...draft!, instructions: e.target.value})}
                      className="w-full min-h-[300px] text-lg leading-relaxed bg-transparent border-l-2 border-dashed border-[var(--color-border)] pl-6 outline-none focus:border-[var(--color-tomato)]"
                    />
                  ) : (
                    <div className="space-y-8">
                      {formatInstructions(displayRecipe.instructions).map((step, i) => (
                        <div key={i} className="flex gap-6 group">
                          <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-border)] italic shrink-0 w-8 text-right group-hover:text-[var(--color-tomato)] transition-colors select-none">
                            {i + 1}.
                          </span>
                          <p className="text-lg leading-[1.7] text-[var(--color-ink)] pt-1.5 font-medium">
                            {step.replace(/^[\d\.\)]+\s*/, '')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}