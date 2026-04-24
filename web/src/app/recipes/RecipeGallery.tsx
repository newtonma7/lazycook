"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

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

type Props = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  consumerId: number;
  ingredients: IngredientOption[];
};

export function RecipeGallery({ supabaseUrl, supabaseAnonKey, consumerId, ingredients }: Props) {
  const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);

  const [viewMode, setViewMode] = useState<"personal" | "public">("personal");
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

      query = viewMode === "personal" 
        ? query.eq("consumer_id", consumerId) 
        : query.eq("is_public", true).neq("consumer_id", consumerId);

      const { data, error } = await query;
      if (!error && data) setRecipes(data as unknown as Recipe[]);
      setIsLoading(false);
    }
    
    fetchRecipes();
  }, [supabase, viewMode, consumerId]);

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
    try {
      setIsProcessing(true);
      
      const { data: newRecipe, error: recipeError } = await supabase
        .from("recipe")
        .insert({
          consumer_id: consumerId,
          title: recipeToClone.title,
          description: recipeToClone.description,
          instructions: recipeToClone.instructions,
          prep_time_min: recipeToClone.prep_time_min,
          cook_time_min: recipeToClone.cook_time_min,
          servings: recipeToClone.servings,
          is_public: false 
        })
        .select("recipe_id")
        .single();

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
        
        const { error: ingError } = await supabase.from("recipe_ingredient").insert(newIngredients);
        if (ingError) throw ingError;
      }

      setViewMode("personal"); 
    } catch (error) {
      console.error("Failed to clone recipe:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startEditing = () => {
    setDraft(JSON.parse(JSON.stringify(selectedRecipe)));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(null);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!draft) return;
    try {
      setIsProcessing(true);

      const { error: recipeError } = await supabase
        .from("recipe")
        .update({
          title: draft.title,
          description: draft.description,
          instructions: draft.instructions,
          prep_time_min: draft.prep_time_min,
          cook_time_min: draft.cook_time_min,
          servings: draft.servings,
          is_public: draft.is_public
        })
        .eq("recipe_id", draft.recipe_id);

      if (recipeError) throw recipeError;

      await supabase.from("recipe_ingredient").delete().eq("recipe_id", draft.recipe_id);
      
      if (draft.recipe_ingredient.length > 0) {
        const mappedIngs = draft.recipe_ingredient.map(ing => ({
          recipe_id: draft.recipe_id,
          ingredient_id: ing.ingredient_id,
          required_quantity: ing.required_quantity,
          unit: ing.unit,
          preparation_note: ing.preparation_note,
          is_optional: ing.is_optional
        }));
        await supabase.from("recipe_ingredient").insert(mappedIngs);
      }

      const updatedRecipes = recipes.map(r => r.recipe_id === draft.recipe_id ? draft : r);
      setRecipes(updatedRecipes);
      setSelectedRecipe(draft);
      setIsEditing(false);

    } catch (error) {
      console.error("Failed to update recipe:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDraftChange = (field: keyof Recipe, value: any) => {
    setDraft(prev => prev ? { ...prev, [field]: value } : null);
  };

  const removeDraftIngredient = (indexToRemove: number) => {
    setDraft(prev => {
      if (!prev) return null;
      const newIngs = [...prev.recipe_ingredient];
      newIngs.splice(indexToRemove, 1);
      return { ...prev, recipe_ingredient: newIngs };
    });
  };

  const formatInstructions = (text: string | null) => {
    if (!text) return [];
    return text.split('\n').filter(step => step.trim().length > 0);
  };

  const startCooking = (recipe: Recipe) => {
    setCookingRecipe(recipe);
    setCookStep(0);
  };

  const displayRecipe = isEditing && draft ? draft : selectedRecipe;

  if (cookingRecipe) {
    const steps = formatInstructions(cookingRecipe.instructions);
    const progress = ((cookStep + 1) / steps.length) * 100;

    return (
      <div className="fixed inset-0 z-50 bg-ink flex flex-col animate-fade-in font-body">
        <div className="h-2 bg-ink-light w-full">
          <div className="h-full bg-sage transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex-1 flex flex-col p-6 md:p-12 max-w-5xl mx-auto w-full">
          <div className="flex justify-between items-center mb-12">
            <button onClick={() => setCookingRecipe(null)} className="text-cream/50 hover:text-cream font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 transition-colors">
              <span className="text-lg leading-none mb-0.5">×</span> Exit Kitchen
            </button>
            <span className="text-cream/30 font-display italic text-xl">{cookingRecipe.title}</span>
            <span className="text-sage font-black uppercase tracking-[0.2em] text-[10px]">Step {cookStep + 1} of {steps.length}</span>
          </div>

          <div className="flex-1 flex flex-col justify-center relative">
             <div className="absolute -left-8 md:-left-16 top-0 text-[12rem] font-display font-bold text-cream/5 select-none leading-none pointer-events-none">
               {cookStep + 1}
             </div>
             <p className="text-3xl md:text-5xl lg:text-6xl text-cream font-display leading-tight z-10">
               {steps[cookStep].replace(/^[\d\.\)]+\s*/, '')}
             </p>
          </div>

          <div className="mt-12 flex justify-between items-center gap-4">
            <button 
              onClick={() => setCookStep(prev => Math.max(0, prev - 1))}
              disabled={cookStep === 0}
              className="px-8 py-5 rounded-2xl border border-cream/20 text-cream font-black uppercase tracking-widest text-xs disabled:opacity-20 hover:bg-cream/10 transition-all active:scale-95"
            >
              Previous
            </button>
            
            {cookStep === steps.length - 1 ? (
              <button 
                onClick={() => setCookingRecipe(null)}
                className="flex-1 px-8 py-5 rounded-2xl bg-sage text-white font-black uppercase tracking-widest text-xs hover:bg-olive transition-all active:scale-95 shadow-lg shadow-sage/20"
              >
                Bon Appétit (Finish)
              </button>
            ) : (
              <button 
                onClick={() => setCookStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="flex-1 px-8 py-5 rounded-2xl bg-cream text-ink font-black uppercase tracking-widest text-xs hover:bg-white transition-all active:scale-95 shadow-lg"
              >
                Next Step
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-body text-ink max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
      {!selectedRecipe && (
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Recipe Gallery</h1>
              <p className="text-ink-muted mt-2 italic">Your personal cookbook and community discoveries.</p>
            </div>

            <div className="flex p-1.5 bg-border-light rounded-full border border-border shadow-inner shrink-0">
              <button onClick={() => setViewMode("personal")} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${viewMode === "personal" ? "bg-white text-sage shadow-sm" : "text-ink-muted hover:text-ink"}`}>
                My Kitchen
              </button>
              <button onClick={() => setViewMode("public")} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${viewMode === "public" ? "bg-white text-sage shadow-sm" : "text-ink-muted hover:text-ink"}`}>
                Community
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 pl-4 rounded-2xl border border-border shadow-sm">
             <div className="flex-1 flex items-center gap-3 w-full">
                <span className="text-xl">🔍</span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for pasta, garlic, quick dinners..." 
                  className="w-full bg-transparent outline-none text-sm placeholder:text-ink-muted/60 italic"
                />
             </div>
             <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                <button onClick={() => setActiveFilter("all")} className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === "all" ? "bg-ink text-cream" : "bg-cream text-ink-muted hover:bg-border-light"}`}>All</button>
                <button onClick={() => setActiveFilter("quick")} className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === "quick" ? "bg-turmeric text-white shadow-md shadow-turmeric/20" : "bg-cream text-ink-muted hover:bg-border-light"}`}>&lt; 30 Mins</button>
                <button onClick={() => setActiveFilter("simple")} className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === "simple" ? "bg-sage text-white shadow-md shadow-sage/20" : "bg-cream text-ink-muted hover:bg-border-light"}`}>5 Ingredients</button>
             </div>
          </div>
        </div>
      )}

      {!selectedRecipe && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-white rounded-3xl border border-border-light animate-pulse" />)}
            </div>
          ) : displayRecipes.length === 0 ? (
            <div className="text-center py-32 border-2 border-dashed border-border rounded-3xl bg-white shadow-sm">
              <span className="text-4xl mb-4 block">🪴</span>
              <p className="text-ink-muted font-black uppercase tracking-[0.3em] text-[10px] mb-2">The counter is clean</p>
              <p className="text-sm italic text-ink-light">No recipes match your current search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
              {displayRecipes.map(recipe => (
                <div key={recipe.recipe_id} onClick={() => setSelectedRecipe(recipe)} className="group cursor-pointer bg-white rounded-3xl border border-border p-6 shadow-sm hover:shadow-xl hover:border-sage hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-2xl text-ink leading-tight mb-3 group-hover:text-sage transition-colors">{recipe.title}</h3>
                    <p className="text-sm text-ink-muted italic line-clamp-3 leading-relaxed">"{recipe.description}"</p>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-border-light flex items-center justify-between">
                    <div className="flex gap-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-ink-light flex items-center gap-1.5">
                        <span className="text-turmeric text-sm">⏱</span> {(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)}m
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-ink-light flex items-center gap-1.5">
                         <span className="text-olive text-sm">🍽</span> {recipe.servings}
                      </span>
                    </div>
                    {recipe.is_public && viewMode === "personal" && (
                      <span className="bg-sage/10 text-sage px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-sage/20">Public</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {displayRecipe && !cookingRecipe && (
        <div className="bg-white rounded-[2rem] border border-border p-6 md:p-12 shadow-2xl animate-fade-in border-t-[12px] border-t-sage relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-cream rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>

          <div className="flex items-center justify-between mb-10 relative z-10">
            {!isEditing ? (
               <button onClick={() => setSelectedRecipe(null)} className="group flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-ink-muted hover:text-sage transition-colors uppercase">
                 <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to {viewMode === "personal" ? "Kitchen" : "Community"}
               </button>
            ) : (
               <span className="text-[10px] font-black tracking-[0.2em] text-turmeric uppercase flex items-center gap-2 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-turmeric"></span> Editing Mode
               </span>
            )}
            
            <div className="flex gap-3">
              {viewMode === "personal" ? (
                !isEditing ? (
                  <>
                    <button onClick={startEditing} className="bg-cream text-ink border border-border px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:border-sage hover:text-sage transition-all shadow-sm active:scale-95">
                      Tweak Recipe
                    </button>
                    <button onClick={() => startCooking(displayRecipe)} className="bg-ink text-cream px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-sage transition-all shadow-md active:scale-95 flex items-center gap-2">
                      <span className="text-sm">👨‍🍳</span> Start Cooking
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={cancelEditing} className="text-ink-muted hover:text-tomato px-4 text-[10px] font-black uppercase tracking-widest transition-colors">Cancel</button>
                    <button onClick={handleSaveEdit} disabled={isProcessing} className="bg-sage text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-olive transition-all shadow-md active:scale-95">
                      {isProcessing ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                )
              ) : (
                <button onClick={() => saveToMyKitchen(displayRecipe)} disabled={isProcessing} className="bg-sage text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-olive transition-all shadow-md active:scale-95">
                  {isProcessing ? "Saving..." : "Save to My Kitchen"}
                </button>
              )}
            </div>
          </div>

          <div className="mb-12 pb-10 border-b border-border-light relative z-10">
            {isEditing ? (
               <input 
                 value={draft?.title || ""} 
                 onChange={e => handleDraftChange("title", e.target.value)} 
                 className="text-4xl md:text-6xl font-display font-bold text-ink tracking-tight mb-6 w-full bg-cream/30 border-b-2 border-sage/50 focus:border-sage outline-none transition-colors px-2 py-1 rounded-t-lg"
                 placeholder="Recipe Title"
               />
            ) : (
              <h2 className="text-4xl md:text-6xl font-display font-bold text-ink tracking-tight mb-6">{displayRecipe.title}</h2>
            )}

            {isEditing ? (
              <textarea 
                value={draft?.description || ""} 
                onChange={e => handleDraftChange("description", e.target.value)}
                className="text-xl text-ink-muted italic w-full leading-relaxed bg-cream/30 border-b-2 border-sage/50 focus:border-sage outline-none resize-none px-2 py-1 rounded-t-lg"
                rows={2}
                placeholder="A short description or hook..."
              />
            ) : (
              <p className="text-xl text-ink-muted italic max-w-3xl leading-relaxed">{displayRecipe.description}</p>
            )}

            {isEditing && (
              <div className="flex gap-6 mt-6 pt-6 border-t border-border-light/50">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted">Prep (m)</label>
                  <input type="number" value={draft?.prep_time_min || 0} onChange={e => handleDraftChange("prep_time_min", parseInt(e.target.value))} className="w-16 bg-cream border border-border rounded-lg px-2 py-1 text-xs outline-none focus:border-sage" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted">Cook (m)</label>
                  <input type="number" value={draft?.cook_time_min || 0} onChange={e => handleDraftChange("cook_time_min", parseInt(e.target.value))} className="w-16 bg-cream border border-border rounded-lg px-2 py-1 text-xs outline-none focus:border-sage" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted">Servings</label>
                  <input type="number" value={draft?.servings || 0} onChange={e => handleDraftChange("servings", parseInt(e.target.value))} className="w-16 bg-cream border border-border rounded-lg px-2 py-1 text-xs outline-none focus:border-sage" />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                   <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted">Make Public</label>
                   <input type="checkbox" checked={draft?.is_public || false} onChange={e => handleDraftChange("is_public", e.target.checked)} className="accent-sage w-4 h-4 cursor-pointer" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative z-10">
            <div className="lg:col-span-4">
              <div className="bg-cream/50 rounded-3xl border border-border p-8">
                <h5 className="font-black uppercase text-sage text-[10px] tracking-[0.3em] mb-8 flex items-center gap-3">
                  <span className="h-px w-6 bg-sage"></span> Mise en place
                </h5>
                <ul className="space-y-4">
                  {displayRecipe.recipe_ingredient.map((ing, idx) => (
                    <li key={idx} className="flex justify-between items-baseline border-b border-border-light/50 pb-3 group">
                      <span className="font-bold text-sm text-ink capitalize flex-1">
                        {ing.ingredient?.name || "Unknown"}
                        {isEditing ? (
                          <input 
                            value={ing.preparation_note || ""} 
                            onChange={e => {
                               if(!draft) return;
                               const newIngs = [...draft.recipe_ingredient];
                               newIngs[idx].preparation_note = e.target.value;
                               setDraft({...draft, recipe_ingredient: newIngs});
                            }}
                            placeholder="Prep notes..."
                            className="block text-xs font-normal text-ink-muted italic mt-1 bg-transparent border-b border-dashed border-border focus:border-sage outline-none w-full max-w-[150px]"
                          />
                        ) : (
                          ing.preparation_note && <span className="block text-xs font-normal text-ink-muted italic normal-case mt-0.5">{ing.preparation_note}</span>
                        )}
                      </span>

                      <div className="flex items-center gap-2 ml-4">
                        {isEditing ? (
                          <>
                            <input 
                              value={ing.required_quantity || ""} 
                              onChange={e => {
                                 if(!draft) return;
                                 const newIngs = [...draft.recipe_ingredient];
                                 newIngs[idx].required_quantity = e.target.value;
                                 setDraft({...draft, recipe_ingredient: newIngs});
                              }}
                              placeholder="Qty" className="w-12 text-right text-xs font-black text-ink-light bg-transparent border-b border-dashed border-border focus:border-sage outline-none" 
                            />
                            <input 
                              value={ing.unit || ""} 
                              onChange={e => {
                                 if(!draft) return;
                                 const newIngs = [...draft.recipe_ingredient];
                                 newIngs[idx].unit = e.target.value;
                                 setDraft({...draft, recipe_ingredient: newIngs});
                              }}
                              placeholder="Unit" className="w-12 text-xs font-black text-ink-light bg-transparent border-b border-dashed border-border focus:border-sage outline-none" 
                            />
                            <button onClick={() => removeDraftIngredient(idx)} className="ml-2 text-tomato opacity-50 hover:opacity-100 transition-opacity">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-black text-ink-light whitespace-nowrap">
                            {ing.required_quantity} {ing.unit}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-8">
              <h5 className="font-black uppercase text-sage text-[10px] tracking-[0.3em] mb-8 flex items-center gap-3">
                <span className="h-px w-6 bg-sage"></span> Preparation
              </h5>
              
              {isEditing ? (
                 <textarea 
                    value={draft?.instructions || ""}
                    onChange={e => handleDraftChange("instructions", e.target.value)}
                    className="w-full h-[400px] text-lg leading-relaxed text-ink-light bg-cream/30 border-2 border-dashed border-border rounded-2xl p-6 focus:border-sage outline-none resize-y"
                    placeholder="Enter instructions, separated by line breaks..."
                 />
              ) : (
                <div className="space-y-10">
                  {formatInstructions(displayRecipe.instructions).map((step, idx) => (
                    <div key={idx} className="flex gap-6 group">
                      <span className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-cream border border-border text-xs font-display font-bold text-ink shadow-sm group-hover:bg-sage group-hover:text-white group-hover:border-sage transition-all">
                        {idx + 1}
                      </span>
                      <p className="text-lg leading-relaxed text-ink-light pt-1 group-hover:text-ink transition-colors">
                        {step.replace(/^[\d\.\)]+\s*/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}