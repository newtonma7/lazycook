"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

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

export function AiRecipePanel({ supabaseUrl, supabaseAnonKey }: { supabaseUrl: string; supabaseAnonKey: string }) {
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
  
  // Flexibility Control (1 = Strict, 5 = Gourmet)
  const [flexibility, setFlexibility] = useState(2);

  // NEW: Creativeness State (1 = Traditional, 5 = Experimental)
  const [creativeness, setCreativeness] = useState(2);

  const creativenessLabels: Record<number, string> = {
    1: "Traditional (Grounded Classics)",
    2: "Familiar (Standard Pairings)",
    3: "Modern (Current Trends)",
    4: "Fusion (Bold & Unique)",
    5: "Avant-Garde (Experimental Lab)"
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
      e.preventDefault(); // Prevent form submission
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
    4: "Enthusiast (Shopping Trip)",
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

    // 1. Exponential Flexibility Scaling (Now forces PROTEINS and MAJOR additions on high levels)
    const flexibilityInstructions = [
      "Level 1 (Spartan): STRICTLY limit to the pantry list + Water/Salt/Pepper/Oil/Butter. NO EXCEPTIONS.",
      "Level 2 (Modest): Pantry + staples + EXACTLY ONE fresh aromatic or acid to wake up the dish.",
      "Level 3 (Home Cook): Pantry + staples + specific dry spices, fresh herbs, and liquid condiments to make a well-rounded meal.",
      "Level 4 (Chef de Partie): Unrestricted access to standard groceries. You MUST add complementary proteins (meats, seafood, or plant-based), cheeses, or extra vegetables, plus sauces, to complete a rich, restaurant-quality dish.",
      "Level 5 (Executive Chef): THE BLANK CHECK. Absolute freedom. Transform the pantry items into a massive gourmet entree by adding premium proteins (e.g., pancetta, short rib, scallops), artisanal cheeses, rich mother sauces, and complex pairings. Do not just season the pantry items—build a complete, luxurious meal around them."
    ][flexibility - 1];

    const creativenessInstructions = [
      "Level 1: Strictly Traditional. Stick to classic, culturally authentic flavor profiles.", 
      "Level 2: Familiar. Standard, well-loved home-cooking pairings and sauces.", 
      "Level 3: Modern. Contemporary restaurant-style pairings.", 
      "Level 4: Bold Fusion. Creative combinations bridging different cuisines.", 
      "Level 5: Experimental Avant-Garde. Highly unconventional, 'Chef-Lab' concepts."
    ][creativeness - 1];

    // NEW: The "Elevated Classics" Bridge to fix the constraint conflict
    const familiarGourmetBridge = (flexibility >= 4 && creativeness <= 2)
      ? "ELEVATED CLASSICS MANDATE: You are on Gourmet flexibility but Familiar creativity. You MUST create distinct, well-known classic flavor profiles (e.g., a rich Marinara, a perfect Aglio e Olio, a classic Alfredo). Do NOT invent weird fusions. Achieve 'Gourmet' status by using high-end traditional ingredients and premium techniques (confit, slow-roasting, emulsions)." 
      : "";

    const chefDirection = customInstructions.trim() 
      ? `\n[MANDATORY THEMATIC OVERRIDE] Execute this vibe: "${customInstructions}". Naturally integrate required ingredients into "additionalIngredients" ONLY IF Flexibility is Level 2 or higher.` : "";

    // 2. Dynamic Quality Rule (Now explicitly demands structural additions like meat)
    const qualityRule = flexibility <= 2
      ? "ADHERENCE OVER TASTE: Honor the strict ingredient limits even if the dish is highly simplistic."
      : "STRUCTURAL & FLAVOR OVERLOAD: Salt and pepper are NOT enough. You are COMMANDED to add substantial structural ingredients (meats, proteins, heavy dairy, secondary vegetables) AND complex flavor layers (spices, wine, broths) to build a complete, fulfilling masterpiece. If the pantry is only carbs and veg, YOU MUST ADD A PROTEIN OR RICH FAT BASE.";

    // 1. Force a strict integer, no ranges.
    const numRecipes = flexibility >= 4 ? 3 : 2;

    // 2. Dynamically build the JSON schema to physically hold the exact number of objects.
    const schemaObjects = Array.from({ length: numRecipes }).map((_, i) => `{ 
          "id": ${i + 1}, 
          "title": "Distinct Recipe Name", 
          "description": "3-sentence flavor deep-dive", 
          "prepTime": "XX mins", 
          "pantryIngredients": ["Qty + Item"], 
          "additionalIngredients": ["Qty + Item"], 
          "instructions": ["Clean step text without numbers"] 
        }`).join(",\n        ");

    const spiceLexicon = flexibility >= 3 
      ? `\n[FLAVOR BOMB LEXICON] 
      - BREAK THE DEFAULT BIAS: Stop defaulting to just "Salt" and "Black Pepper". 
      - USE PUNCHY, REAL-WORLD SEASONINGS: Use highly flavorful, recognizable pantry blends and sauces. e.g., Sriracha, Cajun seasoning, Everything Bagel seasoning, Chili Crisp, Hot Honey, Gochujang, Smoked Paprika, Curry Powder, Taco Seasoning, Pesto, Harissa, Soy Sauce, or Buffalo sauce.
      - NO PRETENTIOUS INGREDIENTS: Do not require hyper-rare or obscure fine-dining micro-ingredients. We want intense, fulfilling, and highly accessible flavor.`
      : "";

    const prompt = `
      [ROLE] Michelin-Star Chef & Precision Culinary Architect.
      [GOAL] Craft EXACTLY ${numRecipes} completely distinct recipes using: ${selectedIngredients.join(", ")}.${avoidanceContext}${chefDirection}
      
      [CREATIVITY & VIBE] 
      - BASE CREATIVITY: ${creativenessInstructions}
      - ${familiarGourmetBridge}
      - Make sure dishes are readable. Diners should easily get the gist of what the food is.
      ${spiceLexicon}
      
      [PRECISION MEASUREMENTS & ATOMIZATION] 
      - Every item MUST have specific counts/volumes (e.g. '3 Carrots', '2 tbsp'). Mathematically scale for ${quantityLabels[quantity]}.
      - SEPARATE INGREDIENTS: NEVER group ingredients. Write '1 tsp Salt' and '1 tsp Black Pepper' as two completely separate array items. Combining items like "Salt and Pepper" into one string is strictly forbidden.
      
      [INGREDIENT RULES: SORTING VS. LIMITING]
      - SORTING: perfectly sort ingredients. 'pantryIngredients' gets ONLY items explicitly found in this list: ${selectedIngredients.join(", ")}. 'additionalIngredients' gets EVERYTHING else (including staples).
      - LIMITING: Your limit is dictated ONLY by the Flexibility Rule. 
      - NEGATIVE LIST: NEVER use: ${excludedIngredients.join(", ") || "None"}.
      - FLEXIBILITY RULE: ${flexibilityInstructions}
      
      [CULINARY MANDATE]
      - ${qualityRule}
      
      [EXECUTION]
      - 8-12 micro-steps focusing on TECHNIQUE.
      - STRICT FORMATTING: DO NOT NUMBER THE STEPS. Do not write '1.', '2.', etc. Return clean text only.
      
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
          options: { num_predict: 8192, temperature: 0.8, top_p: 0.9 }
        }),
      });

      const data = await res.json();
      const parsed = JSON.parse(data.response.trim().replace(/^```json/, "").replace(/```$/, ""));
      
      let finalArray: Recipe[] = [];
      
      if (Array.isArray(parsed)) {
        // AI correctly returned an array
        finalArray = parsed;
      } else if (parsed && typeof parsed === 'object' && parsed.title) {
        // AI returned a single recipe object instead of an array
        finalArray = [parsed];
      } else if (parsed && typeof parsed === 'object') {
        // AI returned a wrapped object like { "recipes": [...] }
        const nestedArray = Object.values(parsed).find(val => Array.isArray(val));
        finalArray = (nestedArray as Recipe[]) || [parsed];
      }

      // EXHAUSTION LOGIC...

      if (finalArray.length < 3) setCanLoadMore(false);
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
    <div className="max-w-7xl mx-auto py-10 px-4 font-sans antialiased text-zinc-900 flex flex-col lg:flex-row gap-8 items-start">
      
      {/* SIDEBAR */}
      {isPantryVisible && (
        <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-10 animate-in slide-in-from-left-4 fade-in duration-300 z-10">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/40 space-y-6">
            
            {/* Active Location Dropdown */}
            <div className="pb-6 border-b border-zinc-100">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 block">Active Location</label>
              <select 
                value={selectedPantryId || ""} 
                onChange={(e) => setSelectedPantryId(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-bold text-zinc-700 outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none"
              >
                {pantries.length === 0 ? <option value="" disabled>No Pantries Found</option> : pantries.map((p: PantryOption) => <option key={p.pantry_id} value={p.pantry_id}>{p.pantry_name}</option>)}
              </select>
            </div>

            {/* 1. Flexibility Slider */}
            <div className="pb-6 border-b border-zinc-100 flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Flexibility</span>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{flexibilityLabels[flexibility]}</span>
              </div>
              <input type="range" min="1" max="5" step="1" value={flexibility} onChange={(e) => setFlexibility(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600 transition-all" />
            </div>

            {/* 2. Portion Slider */}
            <div className="pb-6 border-b border-zinc-100 flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Portion</span>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{quantityLabels[quantity]}</span>
              </div>
              <input type="range" min="1" max="4" step="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600 transition-all" />
            </div>

            {/* 3. Creativeness Slider */}
            <div className="pb-6 border-b border-zinc-100 flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Creativeness</span>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest text-right">{creativenessLabels[creativeness]}</span>
              </div>
              <input 
                type="range" min="1" max="5" step="1" 
                value={creativeness} 
                onChange={(e) => setCreativeness(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600 transition-all"
              />
              <p className="text-[9px] text-zinc-400 font-medium leading-relaxed italic">Controls how 'out there' the flavor combinations and dish concepts will be.</p>
            </div>

            {/* 4. Kitchen Bans (Negative List) */}
            <div className="pb-6 border-b border-zinc-100 flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Kitchen Bans</span>
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">{excludedIngredients.length} Active</span>
              </div>
              <input 
                type="text" placeholder="Ban ingredients..." value={excludeInput} onChange={(e) => setExcludeInput(e.target.value)} onKeyDown={addExclusion}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-700 outline-none focus:border-red-400 transition-colors"
              />
              <div className="flex flex-wrap gap-1.5 mt-1">
                {excludedIngredients.map(item => (
                  <button key={item} onClick={() => removeExclusion(item)} className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight hover:bg-red-100 transition-colors">
                    {item} <span>×</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Chef's Direction (Custom Instructions) */}
            <div className="pb-6 border-b border-zinc-100 flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Chef's Direction</span>
                {customInstructions && (
                  <button 
                    onClick={() => setCustomInstructions("")} 
                    className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:text-red-500 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea 
                placeholder="e.g., 'Vietnamese inspired', 'Extra spicy', 'Make it a soup'..." 
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full h-20 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-700 outline-none focus:border-emerald-400 transition-colors resize-none placeholder:font-medium placeholder:text-zinc-300"
              />
            </div>

            <div className="flex justify-between items-center">
              <h4 className="font-black text-zinc-900 uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${selectedIngredients.length > 0 ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"}`} />
                Pantry Filter
              </h4>
              <button onClick={() => setSelectedIngredients(selectedIngredients.length === ingredients.length ? [] : ingredients)} className="text-[9px] font-black uppercase text-zinc-400 hover:text-emerald-500 transition-colors">
                {selectedIngredients.length === ingredients.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            
            <div className="max-h-[300px] lg:max-h-[400px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
              {ingredients.length > 0 ? ingredients.map((ing: string, i: number) => {
                const isSelected = selectedIngredients.includes(ing);
                return (
                  <div key={i} onClick={() => toggleIngredient(ing)} className={`group flex items-center gap-3 text-[13px] font-bold px-3 py-2.5 rounded-xl border transition-all cursor-pointer select-none ${isSelected ? "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100" : "bg-white border-dashed border-zinc-200 text-zinc-400 opacity-60 hover:opacity-100 hover:border-emerald-300"}`}>
                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-300 bg-zinc-50"}`}>
                      {isSelected && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="truncate">{ing}</span>
                  </div>
                );
              }) : <div className="text-center py-8 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50"><p className="text-xs text-zinc-400 font-medium">No items found.</p></div>}
            </div>

            <div className="pt-5 border-t border-zinc-100 flex justify-between items-center">
              <span className="text-[9px] font-black uppercase text-zinc-400">Inventory Ratio</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${selectedIngredients.length === 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                {selectedIngredients.length} / {ingredients.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 space-y-8 min-w-0 transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center justify-between rounded-3xl bg-white border border-zinc-200 p-5 shadow-sm gap-8">
          
          <div className="flex items-center gap-5 shrink-0">
            <button onClick={() => setIsPantryVisible(!isPantryVisible)} className="p-1 text-zinc-400 hover:text-emerald-500 transition-colors group" title={isPantryVisible ? "Hide Pantry" : "Show Pantry"}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
            <div className="flex flex-col">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kitchen Link</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`h-2 w-2 rounded-full ${ollamaStatus === "connected" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-400"}`} />
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight">{ollamaStatus === "connected" ? "Chef Ready" : "Chef Offline"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap justify-end w-full">
            {ollamaStatus === "connected" && (
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-bold text-zinc-600 outline-none hover:border-emerald-400 transition-colors cursor-pointer max-w-[120px] truncate">
                {models.map((m: any) => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            )}
            
          {/* Setup Button with Question Mark Icon */}
            <button 
              onClick={() => setShowSetup(!showSetup)} 
              className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 hover:text-emerald-600 transition-colors uppercase tracking-widest shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              {showSetup ? "Close" : "Setup"}
            </button>

            <button 
              onClick={() => generateMeal(false)} 
              disabled={!mounted || isGenerating || ollamaStatus !== "connected" || selectedIngredients.length === 0}
              className="bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-emerald-600 disabled:opacity-20 transition-all active:scale-95 shadow-lg shadow-zinc-200 shrink-0"
            >
              {isGenerating && !isGeneratingMore ? "CRAFTING..." : "DRAFT MENU"}
            </button>
          </div>
        </div>

        {showSetup && (
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/30 p-8 text-sm text-zinc-600 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="font-black text-zinc-900 uppercase tracking-widest text-xs mb-1">Local AI Configuration</h4>
                <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-tighter italic">Ensure your kitchen link is active</p>
              </div>
              <a 
                href="https://ollama.com" 
                target="_blank" 
                rel="noreferrer" 
                className="bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
              >
                Download Ollama →
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="font-black text-zinc-800 text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-white text-[8px]">1</span>
                  Model Status
                </h5>
                <p className="text-xs leading-relaxed text-zinc-500">
                  Open your terminal and ensure the <span className="font-bold text-zinc-700">Ollama</span> app is running in your menu bar. 
                </p>
              </div>
              
              <div className="space-y-4">
                <h5 className="font-black text-zinc-800 text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-white text-[8px]">2</span>
                  Terminal Command
                </h5>
                <code className="block bg-zinc-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] shadow-inner select-all">
                  ollama run {selectedModel || "gemma2"}
                </code>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-center text-red-500 text-xs font-bold bg-red-50 py-3 rounded-xl border border-red-100">{error}</p>}

        <div className="min-h-[500px]">
          {isGenerating && !isGeneratingMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {[1, 2, 3].map((i: number) => <div key={i} className="h-64 bg-white border border-zinc-100 rounded-3xl animate-pulse shadow-sm" />)}
            </div>
          )}

          {!isGenerating && !selectedRecipe && recipes.length > 0 && (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((r: Recipe, i: number) => (
                  <div key={i} onClick={() => { setSelectedRecipe(r); setIsPantryVisible(false); }} className="group cursor-pointer rounded-3xl border border-zinc-200 bg-white p-7 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all h-full flex flex-col justify-between border-t-4 border-t-transparent hover:border-t-emerald-500">
                    <div>
                      <h4 className="text-xl font-black text-zinc-900 group-hover:text-emerald-600 transition-colors mb-3 leading-tight">{r.title}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 mb-6 font-medium italic">"{r.description}"</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{r.prepTime}</span>
                       <span className="text-[10px] font-black text-emerald-600 uppercase">View Recipe →</span>
                    </div>
                  </div>
                ))}
                {isGeneratingMore && [1, 2, 3].map((i: number) => <div key={`skel-${i}`} className="h-64 bg-zinc-50 border border-zinc-100 rounded-3xl animate-pulse shadow-sm" />)}
              </div>

              {!isGeneratingMore && canLoadMore && recipes.length >= 1 && (
                <div className="flex justify-center border-t border-zinc-100 pt-8 pb-4">
                  <button onClick={() => generateMeal(true)} disabled={ollamaStatus !== "connected"} className="flex items-center gap-3 bg-white border border-zinc-200 px-8 py-3.5 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all shadow-sm group active:scale-95">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 group-hover:animate-ping" />
                    Load More Variations
                  </button>
                </div>
              )}
              {!canLoadMore && recipes.length >= 1 && <div className="flex justify-center pt-4 pb-4"><p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">No More Options Found</p></div>}
            </div>
          )}

          {selectedRecipe && !isGenerating && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-12 shadow-2xl shadow-zinc-200/50 animate-in zoom-in-95 duration-300 border-t-[12px] border-t-emerald-500">
              <button onClick={() => { setSelectedRecipe(null); setIsPantryVisible(true); }} className="group mb-8 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-zinc-400 hover:text-emerald-600 transition-colors uppercase">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Menu
              </button>
              
              <div className="mb-10 pb-8 border-b border-zinc-100">
                <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter mb-4">{selectedRecipe.title}</h2>
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-lg text-zinc-500 font-medium italic max-w-2xl leading-relaxed">{selectedRecipe.description}</p>
                  <div className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 text-[9px] font-black text-emerald-600 uppercase tracking-widest">{selectedRecipe.prepTime}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4">
                  <div className="bg-zinc-50/50 rounded-2xl border border-zinc-100 p-6">
                    <h5 className="font-black uppercase text-emerald-600 text-[10px] tracking-[0.3em] mb-6 flex items-center gap-2">
                      <span className="h-px w-4 bg-emerald-500" /> Ingredients
                    </h5>
                    <div className="max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent flex flex-col gap-8">
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const items = Array.isArray(selectedRecipe.pantryIngredients) ? selectedRecipe.pantryIngredients : [];
                          return items.filter((i: unknown): i is string => typeof i === 'string' && i.trim().length > 0).map((item: string, idx: number) => (
                            <div key={`pantry-${idx}`} className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 shadow-sm hover:border-emerald-300 transition-all">
                              <p className="text-[12px] font-bold text-zinc-700 leading-tight">{item.replace(/^[*-]\s*/, '').trim()}</p>
                            </div>
                          ));
                        })()}
                      </div>
                      {Array.isArray(selectedRecipe.additionalIngredients) && selectedRecipe.additionalIngredients.length > 0 && (
                        <div className="pt-6 border-t border-zinc-200 animate-in fade-in duration-500">
                          <h5 className="font-black uppercase text-amber-500 text-[10px] tracking-[0.3em] mb-4 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> Added Items</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedRecipe.additionalIngredients.filter((i: unknown): i is string => typeof i === 'string' && i.trim().length > 0).map((item: string, idx: number) => (
                              <div key={`extra-${idx}`} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 shadow-sm">
                                <p className="text-[12px] font-bold text-amber-700 leading-tight">{item.replace(/^[*-]\s*/, '').trim()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                  <h5 className="font-black uppercase text-emerald-600 text-[10px] tracking-[0.3em] flex items-center gap-2"><span className="h-px w-4 bg-emerald-500" /> Preparation</h5>
                  <ol className="space-y-8">
                    {(Array.isArray(selectedRecipe.instructions) ? selectedRecipe.instructions : []).map((step: string, index: number) => (
                      <li key={index} className="flex gap-6 group">
                        <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-black text-white shadow-lg group-hover:bg-emerald-600 transition-all group-hover:scale-110">{index + 1}</span>
                        <div className="prose prose-zinc max-w-none"><p className="text-[16px] leading-relaxed text-zinc-700 font-medium group-hover:text-zinc-950 transition-colors">{step}</p></div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {!isGenerating && !selectedRecipe && recipes.length === 0 && (
            <div className="text-center py-32 border-2 border-dashed border-zinc-200 rounded-3xl bg-white shadow-sm">
              <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[10px]">Awaiting Selection</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}