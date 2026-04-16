"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";

interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string;
  instructions: string[];
  prepTime: string;
}

export function AiRecipePanel({ supabaseUrl, supabaseAnonKey }: { supabaseUrl: string; supabaseAnonKey: string }) {
  const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [showSetup, setShowSetup] = useState(false); // Re-added state
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      const { data } = await supabase.from("ingredient").select("name");
      if (data) setIngredients(data.map(i => i.name));
      checkOllama();
    }
    init();
  }, [supabase]);

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

  const generateMeal = async () => {
    if (!selectedModel || ingredients.length === 0) return;
    setIsGenerating(true);
    setError("");
    setRecipes([]); 
    setSelectedRecipe(null);

    const prompt = `
      [ROLE] Michelin-Star Executive Chef.
      [GOAL] Generate 1-3 high-concept gourmet recipes using: ${ingredients.join(", ")}.
      [INSTRUCTIONS]
      - Use technique-driven, sensory language.
      - NO safety warnings or common-sense alerts.
      - Each step in the "instructions" array must be a single technical action.
      - Use "Ingredient (Quantity)" format for the ingredients string.
      [SCHEMA] Return a JSON array: [{"id": 1, "title": "Name", "description": "Hook", "prepTime": "XX mins", "ingredients": "Markdown list", "instructions": ["Step 1", "Step 2"]}]
    `;

    try {
      const res = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedModel, prompt, stream: false, format: "json" }),
      });

      const data = await res.json();
      const parsed = JSON.parse(data.response.trim().replace(/^```json/, "").replace(/```$/, ""));
      
      // DEEP SCAN FIX: Ensures we find the array regardless of wrapping
      let finalArray: Recipe[] = Array.isArray(parsed) ? parsed : 
                       (Object.values(parsed).find(val => Array.isArray(val)) as Recipe[] || [parsed]);

      setRecipes(finalArray);
    } catch (err) {
      setError("Chef's handwriting was illegible. Ensure Ollama is running Gemma 4.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10 px-4 font-sans antialiased text-zinc-900">
      
      {/* 1. STATUS HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm gap-4">
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
        <div className="flex items-center gap-4">
          <button onClick={() => setShowSetup(!showSetup)} className="text-[10px] font-black text-zinc-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">
            {showSetup ? "Close Setup" : "Setup Instructions"}
          </button>
          <button onClick={generateMeal} disabled={isGenerating || ollamaStatus !== "connected"} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.1em] hover:bg-emerald-600 disabled:opacity-20 transition-all active:scale-95 shadow-lg shadow-zinc-200">
            {isGenerating ? "CRAFTING..." : "DRAFT GOURMET MENU"}
          </button>
        </div>
      </div>

      {/* 2. SETUP INSTRUCTIONS (Llama 4 Optimized) */}
      {showSetup && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-8 text-sm text-zinc-600 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="font-black text-zinc-900 uppercase tracking-widest text-xs mb-1">Local AI Configuration</h4>
              <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-tighter">Optimized for Gemma 4 Architecture</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="font-black text-zinc-800 text-[10px] uppercase tracking-widest">1. Installation</h5>
              <p className="leading-relaxed">Download and install <a href="https://ollama.com" target="_blank" className="text-emerald-600 underline font-bold">Ollama</a>.</p>
            </div>
            <div className="space-y-4">
              <h5 className="font-black text-zinc-800 text-[10px] uppercase tracking-widest">2. Model Deployment</h5>
              <code className="block bg-zinc-900 text-emerald-400 p-4 rounded-xl font-mono text-xs shadow-lg">ollama run hf.co/unsloth/gemma-4-26B-A4B-it-GGUF:UD-IQ4_XS</code>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-100/50 flex justify-between items-center">
             <p className="text-[10px] font-medium text-zinc-500">Laptop with 8GB RAM? Try <code className="text-emerald-600 font-bold">gemma-3</code></p>
             <button onClick={checkOllama} className="flex items-center gap-2 bg-white border border-emerald-200 px-5 py-2 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                Verify Connection
             </button>
          </div>
        </div>
      )}

      {error && <p className="text-center text-red-500 text-xs font-bold bg-red-50 py-3 rounded-lg border border-red-100">{error}</p>}

      <div className="min-h-[500px]">
        {/* 3. LOADING SKELETONS */}
        {isGenerating && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white border border-zinc-100 rounded-2xl animate-pulse shadow-sm" />)}
          </div>
        )}

        {/* 4. GALLERY VIEW */}
        {!isGenerating && !selectedRecipe && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {recipes.map((r, i) => (
              <div key={i} onClick={() => setSelectedRecipe(r)} className="group cursor-pointer rounded-2xl border border-zinc-200 bg-white p-7 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all h-full flex flex-col justify-between border-t-4 border-t-transparent hover:border-t-emerald-500">
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

        {/* 5. COMPACT LIGHT DETAIL VIEW */}
        {selectedRecipe && !isGenerating && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-12 shadow-2xl shadow-zinc-200/50 animate-in zoom-in-95 duration-300 border-t-[12px] border-t-emerald-500">
            <button onClick={() => setSelectedRecipe(null)} className="group mb-8 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-zinc-400 hover:text-emerald-600 transition-colors uppercase">
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
                    {selectedRecipe.ingredients.split('\n').filter(i => i.trim()).map((item, idx) => (
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

        {/* 6. EMPTY STATE */}
        {!isGenerating && !selectedRecipe && recipes.length === 0 && (
          <div className="text-center py-32 border-2 border-dashed border-zinc-100 rounded-3xl bg-zinc-50/30">
            <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[10px]">Awaiting Culinary Input</p>
          </div>
        )}
      </div>
    </div>
  );
}