// components/ai-recipe-panel/AiRecipePanel.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { ChefHat, Settings2, Search, Plus, X, Save, ArrowLeft, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { spring, easeOut, microEase } from "@/lib/animation";
import { cn } from "@/lib/utils";

interface Recipe {
  id: number;
  title: string;
  description: string;
  pantryIngredients: string[];
  additionalIngredients: string[];
  instructions: string[];
  prepTime: string;
}

interface PantryOption {
  pantry_id: number;
  pantry_name: string;
}

export function AiRecipePanel({ supabaseUrl, supabaseAnonKey, consumerId, adminId }: { supabaseUrl: string; supabaseAnonKey: string; consumerId: number | null, adminId: number | null }) {
  const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);

  // States
  const [pantries, setPantries] = useState<PantryOption[]>([]);
  const [selectedPantryId, setSelectedPantryId] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Flexibility Control (1 = Strict, 5 = Gourmet)
  const [flexibility, setFlexibility] = useState(2);

  // Creativeness State (1 = Traditional, 5 = Experimental)
  const [creativeness, setCreativeness] = useState(2);

  const creativenessLabels: Record<number, string> = {
    1: "Traditional (Classics)",
    2: "Familiar (Standard)",
    3: "Modern (Trends)",
    4: "Fusion (Bold)",
    5: "Avant-Garde (Lab)"
  };

  // Quantity Control (1 = Single, 4 = Meal Prep)
  const [quantity, setQuantity] = useState(1);

  const quantityLabels: Record<number, string> = {
    1: "Single Serving",
    2: "Dinner for Two",
    3: "Family Feast",
    4: "Bulk Meal Prep"
  };
  
  // Negative Ingredients States
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [excludeInput, setExcludeInput] = useState("");
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addExclusion = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && excludeInput.trim()) {
      e.preventDefault(); 
      if (!excludedIngredients.includes(excludeInput.trim())) {
        setExcludedIngredients([...excludedIngredients, excludeInput.trim()]);
      }
      setExcludeInput("");
    }
  };

  const removeExclusion = (item: string) => {
    setExcludedIngredients(excludedIngredients.filter(i => i !== item));
  };

  const [customInstructions, setCustomInstructions] = useState("");

  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [showSetup, setShowSetup] = useState(false);
  const [isPantryVisible, setIsPantryVisible] = useState(true);
  const [error, setError] = useState("");

  // Flexibility Labels
  const flexibilityLabels: Record<number, string> = {
    1: "Strict (Pantry Only)",
    2: "Balanced (Staples + 1)",
    3: "Creative (Staples + 3)",
    4: "Enthusiast (Shop Trip)",
    5: "Gourmet (Quality First)"
  };

  useEffect(() => {
    async function init() {
      const { data } = await supabase
        .from("pantry")
        .select("pantry_id, pantry_name")
        .order("pantry_name", { ascending: true });
        
      if (data && data.length > 0) {
        setPantries(data as PantryOption[]);
        setSelectedPantryId(data[0].pantry_id);
      }
      checkOllama();
    }
    init();
  }, [supabase]);

  useEffect(() => {
    async function fetchIngredientsForPantry() {
      if (!selectedPantryId) return;
      const { data } = await supabase
        .from("pantry_item")
        .select(`ingredient:ingredient_id (name)`)
        .eq("pantry_id", selectedPantryId);

      if (data) {
        const names = data
          .map((row: any) => row.ingredient?.name)
          .filter((name: unknown): name is string => typeof name === 'string' && !!name)
          .sort();
        setIngredients(names);
        setSelectedIngredients(names); 
      }
    }
    fetchIngredientsForPantry();
  }, [supabase, selectedPantryId]);

  const parseIngredientString = (rawString: string) => {
    const match = rawString.trim().match(/^([\d\.\/]+(?:[\s-][\d\.\/]+)?)\s*([a-zA-Z]+)?\s+(.*)$/);
    if (match) {
      let quantity = match[1].trim();
      let unit = match[2] ? match[2].toLowerCase() : null;
      let name = match[3].trim();
      
      const commonUnits = ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'tsp', 'tbsp', 'cup', 'cups', 'pinch', 'clove', 'cloves', 'slice', 'slices', 'sprig', 'sprigs', 'can'];
      if (unit && !commonUnits.includes(unit)) {
        name = `${unit} ${name}`;
        unit = null;
      }
      return { quantity, unit, name };
    }
    return { quantity: null, unit: null, name: rawString };
  };

  const saveRecipeToDatabase = async (recipe: Recipe) => {
    try {
      setIsSaving(true);
      setError("");

      const prepTimeMatch = recipe.prepTime.match(/\d+/);
      const prepTimeMin = prepTimeMatch ? parseInt(prepTimeMatch[0], 10) : null;
      
      const formattedInstructions = recipe.instructions
        .map((step, index) => `${index + 1}. ${step}`)
        .join("\n\n");

      const { data: newRecipe, error: recipeError } = await supabase
        .from("recipe")
        .insert({
          consumer_id: consumerId,
          admin_id: adminId,
          title: recipe.title,
          description: recipe.description,
          instructions: formattedInstructions,
          prep_time_min: prepTimeMin,
          cook_time_min: null,
          servings: quantity,
          is_public: false
        })
        .select("recipe_id")
        .single();

      if (recipeError) throw recipeError;
      const createdRecipeId = newRecipe.recipe_id;

      const allAiIngredients = [
        ...(Array.isArray(recipe.pantryIngredients) ? recipe.pantryIngredients : []),
        ...(Array.isArray(recipe.additionalIngredients) ? recipe.additionalIngredients : [])
      ];

      const { data: dbIngredients } = await supabase.from("ingredient").select("ingredient_id, name");
      const existingIngredients = dbIngredients || [];

      const recipeIngredientRows = [];

      for (const rawString of allAiIngredients) {
        if (!rawString.trim()) continue;

        const { quantity: parsedQty, unit: parsedUnit, name: parsedName } = parseIngredientString(rawString);
        
        let matchedIngredient = existingIngredients.find(
          dbIng => parsedName.toLowerCase().includes(dbIng.name.toLowerCase()) || 
                   dbIng.name.toLowerCase().includes(parsedName.toLowerCase())
        );

        let ingredientId = matchedIngredient?.ingredient_id;

        if (!ingredientId) {
          const { data: newIng, error: ingError } = await supabase
            .from("ingredient")
            .insert({ name: parsedName })
            .select("ingredient_id")
            .single();
            
          if (!ingError && newIng) {
            ingredientId = newIng.ingredient_id;
            existingIngredients.push({ ingredient_id: ingredientId, name: parsedName }); 
          }
        }

        if (ingredientId) {
          recipeIngredientRows.push({
            recipe_id: createdRecipeId,
            ingredient_id: ingredientId,
            required_quantity: parsedQty,
            unit: parsedUnit,
            is_optional: false,
            preparation_note: parsedName
          });
        }
      }

      if (recipeIngredientRows.length > 0) {
        const { error: relationError } = await supabase
          .from("recipe_ingredient")
          .insert(recipeIngredientRows);
        if (relationError) throw relationError;
      }

      alert(`Success! "${recipe.title}" has been saved to your collection.`);

    } catch (err: any) {
      console.error("DB Save Error:", err);
      setError(`Failed to save recipe: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const checkOllama = async () => {
    try {
      const res = await fetch("http://127.0.0.1:11434/api/tags");
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
        if (data.models?.length > 0) setSelectedModel((prev: string) => prev || data.models[0].name);
        setOllamaStatus("connected");
      } else { setOllamaStatus("disconnected"); }
    } catch { setOllamaStatus("disconnected"); }
  };

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients((prev: string[]) => 
      prev.includes(ing) ? prev.filter((item: string) => item !== ing) : [...prev, ing]
    );
  };

  const generateMeal = async (isAppending: boolean = false) => {
    if (!selectedModel || selectedIngredients.length === 0) {
      setError("Please select at least one ingredient from the pantry.");
      return;
    }
    setError("");

    if (isAppending) setIsGeneratingMore(true);
    else {
      setIsGenerating(true);
      setRecipes([]); 
      setSelectedRecipe(null);
      setIsPantryVisible(true);
      setCanLoadMore(true);
    }
    
    const avoidanceContext = isAppending && recipes.length > 0 
      ? `\n[STRICT DUPLICATE PREVENTION] Do NOT repeat: ${recipes.map(r => r.title).join(", ")}.` : "";

    const flexibilityInstructions = [
      "Level 1 (Spartan): STRICTLY limit to the pantry list + Water/Salt/Pepper/Oil/Butter. NO EXCEPTIONS.",
      "Level 2 (Modest): Pantry + staples + EXACTLY ONE fresh aromatic or acid to wake up the dish.",
      "Level 3 (Home Cook): Pantry + staples + specific dry spices, fresh herbs, and liquid condiments to make a well-rounded meal.",
      "Level 4 (Chef de Partie): Unrestricted access to standard groceries. You MUST add complementary proteins, cheeses/creams, or extra vegetables, plus sauces, to complete a rich dish.",
      "Level 5 (Executive Chef): THE BLANK CHECK. Absolute freedom. Transform the pantry items into a massive gourmet entree by adding premium proteins and rich mother sauces."
    ][flexibility - 1];

    const creativenessInstructions = [
      "Level 1: Strictly Traditional. Stick to classic, culturally authentic flavor profiles.", 
      "Level 2: Familiar. Standard, well-loved home-cooking pairings and sauces.", 
      "Level 3: Modern. Contemporary restaurant-style pairings.", 
      "Level 4: Bold Fusion. Creative combinations bridging different cuisines.", 
      "Level 5: Experimental Avant-Garde. Highly unconventional, 'Chef-Lab' concepts."
    ][creativeness - 1];

    const familiarGourmetBridge = (flexibility >= 4 && creativeness <= 2)
      ? "ELEVATED CLASSICS MANDATE: You are on Gourmet flexibility but Familiar creativity. You MUST create distinct, well-known classic flavor profiles." 
      : "";

    const chefDirection = customInstructions.trim() 
      ? `\n[MANDATORY THEMATIC OVERRIDE] Execute this exact vibe: "${customInstructions}". DIETARY STRICTNESS: Obey implied diets (vegetarian, vegan, etc.) flawlessly.` 
      : "";

    const qualityRule = flexibility <= 2
      ? "ADHERENCE OVER TASTE: Honor the strict ingredient limits even if the dish is highly simplistic."
      : "STRUCTURAL OVERLOAD: You are COMMANDED to add substantial structural ingredients AND complex flavor layers.";
    const numRecipes = flexibility >= 4 ? 3 : 2;

    const schemaObjects = Array.from({ length: numRecipes })
      .map((_, i) => `{ "id": ${i + 1}, "title": "Distinct Recipe Name", "description": "3-sentence flavor deep-dive", "prepTime": "XX mins", "pantryIngredients": ["Qty + Item"], "additionalIngredients": ["Qty + Item"], "instructions": ["Clean step text without numbers"] }`)
      .join(", ");

    const spiceLexicon = flexibility >= 3 
      ? `\n[ADAPTIVE FLAVOR MANDATE] 
      - BREAK THE DEFAULT BIAS: Never default to just "Salt and Black Pepper". 
      - CONTEXTUAL SEASONING: Curate the exact spices, fresh herbs, acid, or sauces the dish naturally NEEDS to be exceptional.`
      : "";

    const prompt = `
      [ROLE] Michelin-Star Chef & Precision Culinary Architect.
      [GOAL] Craft EXACTLY ${numRecipes} completely distinct recipes using: ${selectedIngredients.join(", ")}.${avoidanceContext}${chefDirection}
      
      [CREATIVITY & VIBE] 
      - BASE CREATIVITY: ${creativenessInstructions}
      - ${familiarGourmetBridge}
      ${spiceLexicon}
      
      [PRECISION MEASUREMENTS] 
      - Every item MUST have specific counts/volumes (e.g. '3 Carrots', '2 tbsp'). Mathematically scale for ${quantityLabels[quantity]}.
      - SEPARATE INGREDIENTS: Write '1 tsp Salt' and '1 tsp Black Pepper' as two completely separate array items.
      - BASE INGREDIENT NOMENCLATURE: Absolutely NO descriptive adjectives or prep instructions in the ingredient arrays. Write '1 cup Onion' (NOT 'Diced Red Onion').
      
      [INGREDIENT RULES]
      - SORTING: 'pantryIngredients' gets items explicitly found here: ${selectedIngredients.join(", ")}. 
      - 'additionalIngredients' gets EVERYTHING else.
      - NEGATIVE LIST: NEVER use: ${excludedIngredients.join(", ") || "None"}.
      - FLEXIBILITY RULE: ${flexibilityInstructions}
      
      [CULINARY MANDATE]
      - ${qualityRule}
      
      [EXECUTION]
      - 8-12 micro-steps focusing on TECHNIQUE. DO NOT NUMBER THE STEPS.
      
      [SCHEMA (STRICT JSON)] 
      Return a raw JSON array containing EXACTLY ${numRecipes} objects. You MUST follow this exact structure:
      [
        ${schemaObjects}
      ]
    `;
    
    try {
      const res = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          model: selectedModel, 
          prompt: prompt, 
          stream: false, 
          format: "json",
          options: { num_predict: 8192, temperature: 0.8 }
        }),
      });

      const data = await res.json();
      const parsed = JSON.parse(data.response.trim().replace(/^```json/, "").replace(/```$/, ""));
      
      let finalArray: Recipe[] = [];
      if (Array.isArray(parsed)) finalArray = parsed;
      else if (parsed && typeof parsed === 'object' && parsed.title) finalArray = [parsed];
      else if (parsed && typeof parsed === 'object') {
        const nestedArray = Object.values(parsed).find(val => Array.isArray(val));
        finalArray = (nestedArray as Recipe[]) || [parsed];
      }

      if (finalArray.length < numRecipes) setCanLoadMore(false);
      if (isAppending) setRecipes((prev: Recipe[]) => [...prev, ...finalArray]);
      else setRecipes(finalArray);
    } catch (err: unknown) {
      setError("Chef's handwriting was illegible. Ensure Ollama is running properly.");
    } finally {
      setIsGenerating(false);
      setIsGeneratingMore(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 font-[family-name:var(--font-body)] text-[var(--color-ink)] flex flex-col lg:flex-row gap-8 items-start">
      
      {/* SIDEBAR */}
      <AnimatePresence>
        {isPantryVisible && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, width: 0, overflow: 'hidden' }}
            transition={spring}
            className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24 z-10"
          >
            <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm space-y-6">
              
              {/* Active Location Dropdown */}
              <div className="pb-5 border-b border-[var(--color-border-light)]">
                <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-2 block">Pantry Origin</label>
                <select 
                  value={selectedPantryId || ""} 
                  onChange={(e) => setSelectedPantryId(Number(e.target.value))}
                  className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-tomato)] transition-colors cursor-pointer appearance-none shadow-inner"
                >
                  {pantries.length === 0 ? <option value="" disabled>No Pantries Found</option> : pantries.map((p: PantryOption) => <option key={p.pantry_id} value={p.pantry_id}>{p.pantry_name}</option>)}
                </select>
              </div>

              {/* Sliders */}
              {[
                { label: "Flexibility", value: flexibility, setter: setFlexibility, max: 5, valueLabel: flexibilityLabels[flexibility] },
                { label: "Portion Size", value: quantity, setter: setQuantity, max: 4, valueLabel: quantityLabels[quantity] },
                { label: "Creativeness", value: creativeness, setter: setCreativeness, max: 5, valueLabel: creativenessLabels[creativeness] }
              ].map((slider, idx) => (
                <div key={idx} className="pb-5 border-b border-[var(--color-border-light)] flex flex-col gap-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">{slider.label}</span>
                    <span className="text-[10px] font-bold text-[var(--color-sage)] uppercase tracking-widest text-right">{slider.valueLabel}</span>
                  </div>
                  <input 
                    type="range" min="1" max={slider.max} step="1" 
                    value={slider.value} 
                    onChange={(e) => slider.setter(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[var(--color-border-light)] rounded-lg appearance-none cursor-pointer accent-[var(--color-sage)] hover:accent-[var(--color-olive)] transition-all" 
                  />
                </div>
              ))}

              {/* Kitchen Bans */}
              <div className="pb-5 border-b border-[var(--color-border-light)] flex flex-col gap-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Kitchen Bans</span>
                  <span className="text-[10px] font-bold text-[var(--color-tomato)] uppercase tracking-widest">{excludedIngredients.length} Active</span>
                </div>
                <input 
                  type="text" placeholder="Ban ingredients (Press Enter)..." value={excludeInput} onChange={(e) => setExcludeInput(e.target.value)} onKeyDown={addExclusion}
                  className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-cream)] px-4 py-2.5 text-xs text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] outline-none focus:border-[var(--color-tomato)] transition-colors shadow-inner"
                />
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <AnimatePresence>
                    {excludedIngredients.map(item => (
                      <motion.button 
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={microEase}
                        key={item} onClick={() => removeExclusion(item)} 
                        className="flex items-center gap-1.5 bg-[var(--color-tomato)]/10 text-[var(--color-tomato)] border border-[var(--color-tomato)]/20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-[var(--color-tomato)]/20 transition-colors cursor-pointer"
                      >
                        {item} <X className="w-3 h-3" />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Chef's Direction */}
              <div className="pb-5 border-b border-[var(--color-border-light)] flex flex-col gap-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Chef's Direction</span>
                  {customInstructions && (
                    <button onClick={() => setCustomInstructions("")} className="text-[10px] font-bold text-[var(--color-tomato)] uppercase tracking-widest hover:opacity-70 transition-colors cursor-pointer">
                      Clear
                    </button>
                  )}
                </div>
                <textarea 
                  placeholder="e.g., 'Vietnamese inspired', 'Extra spicy', 'Make it a soup'..." 
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full h-20 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-cream)] px-4 py-2.5 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-peach)] transition-colors resize-none placeholder-[var(--color-ink-muted)] shadow-inner"
                />
              </div>

              {/* Pantry Filter */}
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[var(--color-ink)] uppercase tracking-widest text-[11px] flex items-center gap-2">
                  Pantry Filter
                </h4>
                <button onClick={() => setSelectedIngredients(selectedIngredients.length === ingredients.length ? [] : ingredients)} className="text-[10px] font-bold uppercase text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer">
                  {selectedIngredients.length === ingredients.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              
              <div className="max-h-[300px] lg:max-h-[350px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
                {ingredients.length > 0 ? ingredients.map((ing: string, i: number) => {
                  const isSelected = selectedIngredients.includes(ing);
                  return (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleIngredient(ing)} 
                      className={cn(
                        "group flex items-center gap-3 text-sm px-4 py-2.5 rounded-xl border transition-colors cursor-pointer select-none",
                        isSelected 
                          ? "bg-[var(--color-cream)] border-[var(--color-sage)] text-[var(--color-ink)]" 
                          : "bg-[var(--color-surface)] border-[var(--color-border-light)] text-[var(--color-ink-muted)] hover:border-[var(--color-border)] hover:text-[var(--color-ink)]"
                      )}
                    >
                      <div className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        isSelected ? "bg-[var(--color-sage)] border-[var(--color-sage)] text-white" : "border-[var(--color-border)] bg-[var(--color-cream)] group-hover:border-[var(--color-ink-muted)]"
                      )}>
                        {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="truncate">{ing}</span>
                    </motion.div>
                  );
                }) : <div className="text-center py-8 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-cream)]/50"><p className="text-xs text-[var(--color-ink-muted)] font-medium">No items found.</p></div>}
              </div>

              <div className="pt-4 border-t border-[var(--color-border-light)] flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase text-[var(--color-ink-muted)]">Inventory Ratio</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md text-[var(--color-ink)] bg-[var(--color-border-light)]">
                  {selectedIngredients.length} / {ingredients.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="flex-1 space-y-6 min-w-0 transition-all duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between rounded-[2rem] bg-[var(--color-surface)] border border-[var(--color-border)] p-4 px-6 shadow-sm gap-6">
          
          <div className="flex items-center gap-4 shrink-0">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPantryVisible(!isPantryVisible)} 
              className="p-2 rounded-full border border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer" 
              title={isPantryVisible ? "Hide Pantry" : "Show Pantry"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
            </motion.button>
            <div className="flex flex-col">
              <h3 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">AI Kitchen</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn("h-2 w-2 rounded-full", ollamaStatus === "connected" ? "bg-[var(--color-sage)]" : "bg-[var(--color-tomato)]")} />
                <span className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-tight">{ollamaStatus === "connected" ? "Chef Ready" : "Chef Offline"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-end w-full">
            {ollamaStatus === "connected" && (
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-1.5 text-[11px] font-bold text-[var(--color-ink-muted)] outline-none hover:border-[var(--color-sage)] transition-colors cursor-pointer max-w-[140px] truncate">
                {models.map((m: any) => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            )}
            
            <button 
              onClick={() => setShowSetup(!showSetup)} 
              className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors uppercase tracking-widest cursor-pointer"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            <motion.button 
              whileTap={{ scale: 0.96 }}
              onClick={() => generateMeal(false)} 
              disabled={!mounted || isGenerating || ollamaStatus !== "connected" || selectedIngredients.length === 0}
              className="bg-[var(--color-tomato)] text-white px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-30 transition-opacity shadow-[0_4px_14px_rgba(193,68,14,0.2)] cursor-pointer shrink-0"
            >
              {isGenerating && !isGeneratingMore ? "Crafting..." : "Draft Menu"}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showSetup && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-cream)] p-8 overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="font-bold text-[var(--color-ink)] uppercase tracking-widest text-xs mb-1">Local AI Configuration</h4>
                  <p className="text-[11px] text-[var(--color-ink-muted)] font-medium">Ensure your local kitchen link is active</p>
                </div>
                <a 
                  href="https://ollama.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="border border-[var(--color-border)] px-4 py-2 rounded-xl text-[10px] font-bold text-[var(--color-ink)] uppercase tracking-widest hover:bg-[var(--color-surface)] transition-all cursor-pointer"
                >
                  Get Ollama →
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h5 className="font-bold text-[var(--color-ink)] text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-cream)] text-[9px]">1</span>
                    Model Status
                  </h5>
                  <p className="text-sm leading-relaxed text-[var(--color-ink-light)]">
                    Open your terminal and ensure the Ollama app is running in the background. 
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-bold text-[var(--color-ink)] text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-cream)] text-[9px]">2</span>
                    Terminal Command
                  </h5>
                  <code className="block bg-[var(--color-ink)] text-[var(--color-parchment)] p-4 rounded-xl font-[family-name:var(--font-mono)] text-[12px] shadow-inner select-all">
                    ollama run {selectedModel || "gemma4:e4b"}
                  </code>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="text-center text-[var(--color-tomato)] text-sm font-medium bg-[var(--color-tomato)]/10 py-3 rounded-xl border border-[var(--color-tomato)]/20">{error}</p>}

        <div className="min-h-[500px]">
          {isGenerating && !isGeneratingMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[280px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] animate-pulse flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[var(--color-border-light)]" />
                </div>
              ))}
            </div>
          )}

          {!isGenerating && !selectedRecipe && recipes.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((r: Recipe, i: number) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(28,25,23,0.06)" }}
                    transition={spring}
                    onClick={() => { setSelectedRecipe(r); setIsPantryVisible(false); }} 
                    className="group cursor-pointer rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 flex flex-col justify-between transition-colors overflow-hidden relative"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-peach)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <h4 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)] mb-3 leading-tight">{r.title}</h4>
                      <p className="text-sm text-[var(--color-ink-light)] leading-relaxed line-clamp-3 italic">"{r.description}"</p>
                    </div>
                    <div className="flex justify-between items-center pt-6 mt-4 border-t border-[var(--color-border-light)]">
                       <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-ink-muted)] uppercase tracking-widest">{r.prepTime}</span>
                       <span className="text-[10px] font-bold text-[var(--color-tomato)] uppercase tracking-widest group-hover:translate-x-1 transition-transform">View →</span>
                    </div>
                  </motion.div>
                ))}
                {isGeneratingMore && [1, 2, 3].map((i) => <div key={`skel-${i}`} className="h-[280px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] animate-pulse" />)}
              </div>

              {!isGeneratingMore && canLoadMore && recipes.length >= 1 && (
                <div className="flex justify-center pt-4 pb-4">
                  <motion.button 
                    whileTap={{ scale: 0.96 }}
                    onClick={() => generateMeal(true)} 
                    disabled={ollamaStatus !== "connected"} 
                    className="border border-[var(--color-border)] bg-[var(--color-cream)] px-8 py-3.5 rounded-full text-[11px] font-bold text-[var(--color-ink)] uppercase tracking-widest hover:border-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-all cursor-pointer"
                  >
                    Generate More Variations
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {selectedRecipe && !isGenerating && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
              className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-12 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-tomato)]" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                <button onClick={() => { setSelectedRecipe(null); setIsPantryVisible(true); }} className="group flex items-center gap-2 text-[11px] font-bold tracking-widest text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors uppercase cursor-pointer">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Menu
                </button>
                
                <motion.button 
                  whileTap={{ scale: 0.96 }}
                  onClick={() => saveRecipeToDatabase(selectedRecipe)}
                  disabled={isSaving}
                  className="border border-[var(--color-border)] bg-transparent text-[var(--color-ink)] px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? "Saving..." : "Save to Database"}
                </motion.button>
              </div>
              
              <div className="mb-12 pb-10 border-b border-[var(--color-border-light)]">
                <h2 className="text-4xl md:text-6xl font-[family-name:var(--font-display)] text-[var(--color-ink)] tracking-tight mb-6">{selectedRecipe.title}</h2>
                <div className="flex flex-wrap items-center gap-6">
                  <p className="text-lg text-[var(--color-ink-light)] italic max-w-2xl leading-relaxed">"{selectedRecipe.description}"</p>
                  <div className="bg-[var(--color-sage)]/10 px-4 py-1.5 rounded-full border border-[var(--color-sage)]/20 text-[11px] font-[family-name:var(--font-mono)] text-[var(--color-sage)] uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedRecipe.prepTime}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-4">
                  <h5 className="font-bold uppercase text-[var(--color-ink)] text-[11px] tracking-widest mb-6 flex items-center gap-3">
                    Ingredients
                  </h5>
                  <div className="max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[var(--color-border)] flex flex-col gap-8">
                    <ul className="space-y-3">
                      {(() => {
                        const items = Array.isArray(selectedRecipe.pantryIngredients) ? selectedRecipe.pantryIngredients : [];
                        return items.filter((i: unknown): i is string => typeof i === 'string' && i.trim().length > 0).map((item: string, idx: number) => (
                          <li key={`pantry-${idx}`} className="flex items-start gap-3 pb-3 border-b border-[var(--color-border-light)] last:border-0">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-sage)] shrink-0" />
                            <span className="text-sm text-[var(--color-ink)] leading-snug">{item.replace(/^[*-]\s*/, '').trim()}</span>
                          </li>
                        ));
                      })()}
                    </ul>
                    
                    {Array.isArray(selectedRecipe.additionalIngredients) && selectedRecipe.additionalIngredients.length > 0 && (
                      <div className="pt-6 border-t border-[var(--color-border-light)]">
                        <h5 className="font-bold uppercase text-[var(--color-ink-muted)] text-[10px] tracking-widest mb-4">Pantry Additions</h5>
                        <ul className="space-y-3 opacity-80">
                          {selectedRecipe.additionalIngredients.filter((i: unknown): i is string => typeof i === 'string' && i.trim().length > 0).map((item: string, idx: number) => (
                            <li key={`extra-${idx}`} className="flex items-start gap-3">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--color-ink-muted)] shrink-0" />
                              <span className="text-sm text-[var(--color-ink-muted)] leading-snug">{item.replace(/^[*-]\s*/, '').trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <h5 className="font-bold uppercase text-[var(--color-ink)] text-[11px] tracking-widest mb-8 flex items-center gap-3">
                    Preparation
                  </h5>
                  <ol className="space-y-10">
                    {(Array.isArray(selectedRecipe.instructions) ? selectedRecipe.instructions : []).map((step: string, index: number) => (
                      <li key={index} className="flex gap-6 group">
                        <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-peach)] italic shrink-0 w-8">
                          {index + 1}.
                        </span>
                        <p className="text-[17px] leading-relaxed text-[var(--color-ink-light)] pt-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </motion.div>
          )}

          {!isGenerating && !selectedRecipe && recipes.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 border border-dashed border-[var(--color-border)] rounded-[2rem] bg-[var(--color-cream)]/50"
            >
              <ChefHat className="w-12 h-12 text-[var(--color-border)] mb-6" />
              <h3 className="font-[family-name:var(--font-display)] text-4xl text-[var(--color-ink)] mb-4 text-center">
                The kitchen is a <span className="italic text-[var(--color-ink-light)]">blank canvas.</span>
              </h3>
              <p className="text-[var(--color-ink-muted)] text-base max-w-sm mx-auto text-center leading-relaxed">
                Adjust your constraints and select ingredients from the pantry to draft a menu.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}