"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";

interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
}

interface PantryOption {
  pantry_id: number;
  pantry_name: string;
}

export function AiRecipePanel({ supabaseUrl, supabaseAnonKey }: { supabaseUrl: string; supabaseAnonKey: string }) {
  const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);

  // NEW: Pantry Selection States
  const [pantries, setPantries] = useState<PantryOption[]>([]);
  const [selectedPantryId, setSelectedPantryId] = useState<number | null>(null);

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [showSetup, setShowSetup] = useState(false);
  const [isPantryVisible, setIsPantryVisible] = useState(true);
  const [error, setError] = useState("");

  // 1. INITIAL MOUNT: Fetch Pantries & Check AI Status
  useEffect(() => {
    async function init() {
      const { data, error } = await supabase
        .from("pantry")
        .select("pantry_id, pantry_name")
        .order("pantry_name", { ascending: true });
        
      if (data && data.length > 0) {
        setPantries(data);
        setSelectedPantryId(data[0].pantry_id); // Auto-select the first pantry
      }
      checkOllama();
    }
    init();
  }, [supabase]);

  // 2. PANTRY CHANGE: Fetch Ingredients when selectedPantryId changes
  useEffect(() => {
    async function fetchIngredientsForPantry() {
      if (!selectedPantryId) return;

      // Relational query: Get pantry_items and their joined ingredient names
      const { data, error } = await supabase
        .from("pantry_item")
        .select(`
          ingredient:ingredient_id (
            name
          )
        `)
        .eq("pantry_id", selectedPantryId);

      if (data) {
        // Extract the names from the nested relational object
        // Supabase returns an array of objects like { ingredient: { name: 'Salt' } }
        const names = data
          .map((row: any) => row.ingredient?.name)
          .filter(Boolean) // Remove nulls/undefined
          .sort();
          
        setIngredients(names);
        setSelectedIngredients(names); // Auto-select all ingredients for the new pantry
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
        if (data.models?.length > 0) setSelectedModel(prev => prev || data.models[0].name);
        setOllamaStatus("connected");
      } else { setOllamaStatus("disconnected"); }
    } catch { setOllamaStatus("disconnected"); }
  };

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ing) 
        ? prev.filter(item => item !== ing) 
        : [...prev, ing]
    );
  };

  const generateMeal = async () => {
    if (!selectedModel || selectedIngredients.length === 0) {
      setError("Please select at least one ingredient from the pantry.");
      return;
    }
    
    setIsGenerating(true);
    setError("");
    setRecipes([]); 
    setSelectedRecipe(null);
    setIsPantryVisible(true);

    const prompt = `
      [ROLE] Michelin-Star Executive Chef and Culinary Architect.
      
      [GOAL] Generate 1-3 high-concept gourmet recipes using: ${selectedIngredients.join(", ")}.
      
      [EXECUTION STRATEGY: MICRO-STEPS]
      - Break the cooking process into MANY distinct, highly specific micro-steps. Aim for 8 to 12 steps per recipe.
      - Do NOT clump actions together. 
      - Keep each step punchy and readable (maximum 2 sentences per step), but include sensory cues (e.g., "sear until mahogany").
      - NO safety warnings or common-sense alerts.
      
      [SCHEMA (STRICT JSON)] Return an array of objects EXACTLY matching this structure: 
      [
        {
          "id": 1, 
          "title": "Name", 
          "description": "Hook", 
          "prepTime": "XX mins", 
          "ingredients": ["Ingredient 1 (Quantity)", "Ingredient 2 (Quantity)"], 
          "instructions": ["Step 1 (max 2 sentences)", "Step 2...", "Step 3...", "Step 4..."]
        }
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
          options: {
            num_predict: 8192,
            temperature: 0.8,
            top_p: 0.9
          }
        }),
      });

      const data = await res.json();
      const parsed = JSON.parse(data.response.trim().replace(/^```json/, "").replace(/```$/, ""));
      
      let finalArray: Recipe[] = Array.isArray(parsed) ? parsed : 
                       (Object.values(parsed).find(val => Array.isArray(val)) as Recipe[] || [parsed]);

      setRecipes(finalArray);
    } catch (err) {
      setError("Chef's handwriting was illegible. Ensure Ollama is running properly.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 font-sans antialiased text-zinc-900 flex flex-col lg:flex-row gap-8 items-start">
      
      {/* =========================================
          LEFT SIDEBAR: ACTIVE PANTRY
          ========================================= */}
      {isPantryVisible && (
        <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-10 animate-in slide-in-from-left-4 fade-in duration-300 z-10">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/40">
            
            {/* NEW: Pantry Selector Dropdown */}
            <div className="mb-6 pb-6 border-b border-zinc-100">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 block">
                Active Location
              </label>
              <select 
                value={selectedPantryId || ""} 
                onChange={(e) => setSelectedPantryId(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-bold text-zinc-700 outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none"
              >
                {pantries.length === 0 ? (
                  <option value="" disabled>No Pantries Found</option>
                ) : (
                  pantries.map(p => (
                    <option key={p.pantry_id} value={p.pantry_id}>{p.pantry_name}</option>
                  ))
                )}
              </select>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-zinc-900 uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${selectedIngredients.length > 0 ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"}`} />
                Pantry Filter
              </h4>
              <button 
                onClick={() => setSelectedIngredients(selectedIngredients.length === ingredients.length ? [] : ingredients)}
                className="text-[9px] font-black uppercase text-zinc-400 hover:text-emerald-500 transition-colors"
              >
                {selectedIngredients.length === ingredients.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            
            <div className="max-h-[350px] lg:max-h-[500px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
              {ingredients.length > 0 ? (
                ingredients.map((ing, i) => {
                  const isSelected = selectedIngredients.includes(ing);
                  return (
                    <div 
                      key={i} 
                      onClick={() => toggleIngredient(ing)}
                      className={`group flex items-center gap-3 text-[13px] font-bold px-3 py-2.5 rounded-xl border transition-all cursor-pointer select-none
                        ${isSelected 
                          ? "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100" 
                          : "bg-white border-dashed border-zinc-200 text-zinc-400 opacity-60 hover:opacity-100 hover:border-emerald-300"
                        }`}
                    >
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors
                        ${isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-300 bg-zinc-50"}`}>
                        {isSelected && (
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="truncate">{ing}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                   <p className="text-xs text-zinc-400 font-medium">No items in this pantry.</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-100 flex justify-between items-center">
              <span className="text-[9px] font-black uppercase text-zinc-400">Selected Context</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${selectedIngredients.length === 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                {selectedIngredients.length} / {ingredients.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          RIGHT MAIN CONTENT: APP LOGIC 
          ========================================= */}
      <div className="flex-1 space-y-8 min-w-0 transition-all duration-300">
        
        <div className="flex flex-col md:flex-row items-center justify-between rounded-3xl bg-white border border-zinc-200 p-5 shadow-sm gap-4">
          <div className="flex items-center gap-5">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kitchen Link</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`h-2 w-2 rounded-full ${ollamaStatus === "connected" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-400"}`} />
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight">{ollamaStatus === "connected" ? "Chef Ready" : "Chef Offline"}</span>
              </div>
            </div>
            {ollamaStatus === "connected" && (
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-600 outline-none hover:border-emerald-400 transition-colors cursor-pointer">
                {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-4">
            <button onClick={() => setIsPantryVisible(!isPantryVisible)} className="text-[10px] font-black text-zinc-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">
              {isPantryVisible ? "Hide Pantry" : "Show Pantry"}
            </button>
            <button onClick={() => setShowSetup(!showSetup)} className="text-[10px] font-black text-zinc-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">
              {showSetup ? "Close Setup" : "Setup Info"}
            </button>
            <button onClick={generateMeal} disabled={isGenerating || ollamaStatus !== "connected" || selectedIngredients.length === 0} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.1em] hover:bg-emerald-600 disabled:opacity-20 transition-all active:scale-95 shadow-lg shadow-zinc-200">
              {isGenerating ? "CRAFTING..." : "DRAFT GOURMET MENU"}
            </button>
          </div>
        </div>

        {showSetup && (
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/30 p-8 text-sm text-zinc-600 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-black text-zinc-900 uppercase tracking-widest text-xs mb-1">Local AI Configuration</h4>
                <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-tighter">Optimized for Gemma 4</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="font-black text-zinc-800 text-[10px] uppercase tracking-widest">1. Installation</h5>
                <p className="leading-relaxed">Download and install <a href="https://ollama.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-bold">Ollama</a>.</p>
              </div>
              <div className="space-y-4">
                <h5 className="font-black text-zinc-800 text-[10px] uppercase tracking-widest">2. Model Deployment</h5>
                <code className="block bg-zinc-900 text-emerald-400 p-4 rounded-xl font-mono text-xs shadow-lg">ollama run hf.co/unsloth/gemma-4-E4B-it-GGUF:IQ4_XS</code>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-center text-red-500 text-xs font-bold bg-red-50 py-3 rounded-xl border border-red-100">{error}</p>}

        <div className="min-h-[500px]">
          {isGenerating && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white border border-zinc-100 rounded-3xl animate-pulse shadow-sm" />)}
            </div>
          )}

          {!isGenerating && !selectedRecipe && recipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {recipes.map((r, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    setSelectedRecipe(r);
                    setIsPantryVisible(false);
                  }} 
                  className="group cursor-pointer rounded-3xl border border-zinc-200 bg-white p-7 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all h-full flex flex-col justify-between border-t-4 border-t-transparent hover:border-t-emerald-500"
                >
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
            </div>
          )}

          {selectedRecipe && !isGenerating && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-12 shadow-2xl shadow-zinc-200/50 animate-in zoom-in-95 duration-300 border-t-[12px] border-t-emerald-500">
              <button 
                onClick={() => {
                  setSelectedRecipe(null);
                  setIsPantryVisible(true);
                }} 
                className="group mb-8 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-zinc-400 hover:text-emerald-600 transition-colors uppercase"
              >
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
                <div className="lg:col-span-4 space-y-8">
                  <div>
                    <h5 className="font-black uppercase text-emerald-600 text-[10px] tracking-[0.3em] mb-6 flex items-center gap-2">
                      <span className="h-px w-4 bg-emerald-500" /> Mise En Place
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(selectedRecipe.ingredients) ? selectedRecipe.ingredients : typeof selectedRecipe.ingredients === 'string' ? (selectedRecipe.ingredients as string).split('\n') : []).filter(i => typeof i === 'string' && i.trim()).map((item, idx) => (
                        <div key={idx} className="rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-2.5 hover:bg-white hover:border-emerald-200 transition-all hover:shadow-sm">
                          <p className="text-[12px] font-bold text-zinc-700 leading-tight">
                            {item.replace(/^[*-]\s*/, '').trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                  <h5 className="font-black uppercase text-emerald-600 text-[10px] tracking-[0.3em] flex items-center gap-2">
                    <span className="h-px w-4 bg-emerald-500" /> Execution
                  </h5>
                  <ol className="space-y-8">
                    {selectedRecipe.instructions.map((step, index) => (
                      <li key={index} className="flex gap-6 group">
                        <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-black text-white shadow-lg group-hover:bg-emerald-600 transition-all group-hover:scale-110">{index + 1}</span>
                        <div className="prose prose-zinc max-w-none">
                          <p className="text-[16px] leading-relaxed text-zinc-700 font-medium group-hover:text-zinc-950 transition-colors">{step}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {!isGenerating && !selectedRecipe && recipes.length === 0 && (
            <div className="text-center py-32 border-2 border-dashed border-zinc-200 rounded-3xl bg-white shadow-sm">
              <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[10px]">Awaiting Culinary Input</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}