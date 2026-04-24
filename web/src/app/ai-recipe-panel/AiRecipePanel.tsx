// components/ai-recipe-panel/AiRecipePanel.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ChefHat,
  Settings2,
  Search,
  X,
  Save,
  ArrowLeft,
  Clock,
  Sparkles,
  Wand2,
  RefreshCw,
  Server,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  spring,
  easeOut,
  microEase,
} from "@/lib/animation";
import { cn } from "@/lib/utils";
import { AmbientBackground } from "../components/ambient-background/AmbientBackground";
import {
  BasilLoading,
  BasilEmpty,
} from "../components/mascot/BasilComponents";

/* -------------------------------------------------------------------------- */
/* Types                                                                     */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Microcopy                                                                 */
/* -------------------------------------------------------------------------- */

const rotatingPlaceholders = [
  "something cozy for tonight... 🍜",
  "quick lunch under 20 minutes ⚡",
  "impress someone special 🌹",
  "use my carrots before they go sad 🥕",
];

const moodChips = [
  { emoji: "⚡", label: "Quick", hint: "Make it under 30 mins" },
  { emoji: "🥗", label: "Healthy", hint: "Light and nourishing" },
  { emoji: "🫂", label: "Comfort", hint: "Classic comfort food" },
  { emoji: "✨", label: "Impress", hint: "Date‑night worthy" },
  { emoji: "🥕", label: "Use Expiring", hint: "Prioritise what’s fading" },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                 */
/* -------------------------------------------------------------------------- */

export function AiRecipePanel({
  supabaseUrl,
  supabaseAnonKey,
  consumerId,
  adminId,
}: {
  supabaseUrl: string;
  supabaseAnonKey: string;
  consumerId: number | null;
  adminId: number | null;
}) {
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );

  /* -------------------------- base states --------------------------------- */
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

  /* ------------------------- mood & controls ------------------------------ */
  const [flexibility, setFlexibility] = useState(2);
  const [creativeness, setCreativeness] = useState(2);
  const [quantity, setQuantity] = useState(1);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [excludeInput, setExcludeInput] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [activeMood, setActiveMood] = useState<string | null>(null);

  /* ------------------------- ollama & panel ------------------------------- */
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [ollamaStatus, setOllamaStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [showSetup, setShowSetup] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  /* ------------------------- rotating placeholder ------------------------- */
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % rotatingPlaceholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  /* ------------------------- labels --------------------------------------- */
  const creativenessLabels: Record<number, string> = {
    1: "Traditional",
    2: "Familiar",
    3: "Modern",
    4: "Fusion",
    5: "Avant-Garde",
  };

  const quantityLabels: Record<number, string> = {
    1: "Single Serving",
    2: "Dinner for Two",
    3: "Family Feast",
    4: "Bulk Meal Prep",
  };

  const flexibilityLabels: Record<number, string> = {
    1: "Strict (Pantry Only)",
    2: "Balanced (Staples + 1)",
    3: "Creative (Staples + 3)",
    4: "Enthusiast (Shop Trip)",
    5: "Gourmet (Quality First)",
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ------------------------- ollama poller -------------------------------- */
  const checkOllama = async () => {
    try {
      setOllamaStatus("checking");
      const res = await fetch("http://127.0.0.1:11434/api/tags");
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
        if (data.models?.length > 0 && !selectedModel) {
          setSelectedModel(data.models[0].name);
        }
        setOllamaStatus("connected");
      } else {
        setOllamaStatus("disconnected");
      }
    } catch {
      setOllamaStatus("disconnected");
    }
  };

  /* ------------------------- pantry init (filtered for consumer / all for admin) --- */
  useEffect(() => {
    async function init() {
      let query = supabase
        .from("pantry")
        .select("pantry_id, pantry_name")
        .order("pantry_name", { ascending: true });

      // Filter by consumer if we are a consumer (not admin)
      if (consumerId) {
        query = query.eq("consumer_id", consumerId);
      }

      const { data } = await query;

      if (data && data.length > 0) {
        setPantries(data as PantryOption[]);
        setSelectedPantryId(data[0].pantry_id);
      } else {
        setPantries([]);
        setSelectedPantryId(null);
      }
      checkOllama();
    }
    init();

    const interval = setInterval(checkOllama, 10000);
    return () => clearInterval(interval);
  }, [supabase, consumerId]); // re‑fetch if consumerId changes

  useEffect(() => {
    async function fetchIngredientsForPantry() {
      if (!selectedPantryId) {
        setIngredients([]);
        setSelectedIngredients([]);
        return;
      }
      const { data } = await supabase
        .from("pantry_item")
        .select(`ingredient:ingredient_id (name)`)
        .eq("pantry_id", selectedPantryId);

      if (data) {
        const names = data
          .map((row: any) => row.ingredient?.name)
          .filter(
            (name: unknown): name is string =>
              typeof name === "string" && !!name
          )
          .sort();
        setIngredients(names);
        setSelectedIngredients(names);
      }
    }
    fetchIngredientsForPantry();
  }, [supabase, selectedPantryId]);

  /* ------------------------- helpers -------------------------------------- */
  const activePantryName =
    pantries.find((p) => p.pantry_id === selectedPantryId)?.pantry_name ||
    "Select pantry";

  const parseIngredientString = (rawString: string) => {
    const match = rawString
      .trim()
      .match(/^([\d\.\/]+(?:[\s-][\d\.\/]+)?)\s*([a-zA-Z]+)?\s+(.*)$/);
    if (match) {
      let quantity = match[1].trim();
      let unit = match[2] ? match[2].toLowerCase() : null;
      let name = match[3].trim();
      const commonUnits = [
        "g", "kg", "ml", "l", "oz", "lb", "tsp", "tbsp", "cup", "cups",
        "pinch", "clove", "cloves", "slice", "slices", "sprig", "sprigs", "can",
      ];
      if (unit && !commonUnits.includes(unit)) {
        name = `${unit} ${name}`;
        unit = null;
      }
      return { quantity, unit, name };
    }
    return { quantity: null, unit: null, name: rawString };
  };

  const saveRecipeToDatabase = async (recipe: Recipe) => {
    // Allow saving if either consumerId or adminId exists
    if (!consumerId && !adminId) {
      setError("Please log in to save recipes. 🌿");
      return;
    }
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
          consumer_id: consumerId || null,
          admin_id: adminId || null,
          title: recipe.title,
          description: recipe.description,
          instructions: formattedInstructions,
          prep_time_min: prepTimeMin,
          cook_time_min: null,
          servings: quantity,
          is_public: false,
        })
        .select("recipe_id")
        .single();

      if (recipeError) throw recipeError;
      const createdRecipeId = newRecipe.recipe_id;

      const allAiIngredients = [
        ...(Array.isArray(recipe.pantryIngredients) ? recipe.pantryIngredients : []),
        ...(Array.isArray(recipe.additionalIngredients) ? recipe.additionalIngredients : []),
      ];

      const { data: dbIngredients } = await supabase
        .from("ingredient")
        .select("ingredient_id, name");
      const existingIngredients = dbIngredients || [];

      const recipeIngredientRows = [];

      for (const rawString of allAiIngredients) {
        if (!rawString.trim()) continue;
        const { quantity: parsedQty, unit: parsedUnit, name: parsedName } = parseIngredientString(rawString);

        let matchedIngredient = existingIngredients.find(
          (dbIng) =>
            parsedName.toLowerCase().includes(dbIng.name.toLowerCase()) ||
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
            existingIngredients.push({
              ingredient_id: ingredientId,
              name: parsedName,
            });
          }
        }

        if (ingredientId) {
          recipeIngredientRows.push({
            recipe_id: createdRecipeId,
            ingredient_id: ingredientId,
            required_quantity: parsedQty,
            unit: parsedUnit,
            is_optional: false,
            preparation_note: parsedName,
          });
        }
      }

      if (recipeIngredientRows.length > 0) {
        const { error: relationError } = await supabase
          .from("recipe_ingredient")
          .insert(recipeIngredientRows);
        if (relationError) throw relationError;
      }

      setError("");
      alert(`Saved to your cookbook 📖 yum!`);
    } catch (err: any) {
      console.error("DB Save Error:", err);
      setError(`Oops, Basil burnt something 🍳 ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const addExclusion = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && excludeInput.trim()) {
      e.preventDefault();
      if (!excludedIngredients.includes(excludeInput.trim())) {
        setExcludedIngredients([...excludedIngredients, excludeInput.trim()]);
      }
      setExcludeInput("");
    }
  };

  const removeExclusion = (item: string) => {
    setExcludedIngredients(excludedIngredients.filter((i) => i !== item));
  };

  const handleMoodChip = (mood: string) => {
    setActiveMood((prev) => (prev === mood ? null : mood));
    if (mood === "Quick")
      setCustomInstructions((p) =>
        p.includes("under 30") ? p : `${p} (under 30 min)`
      );
    else if (mood === "Healthy")
      setCustomInstructions((p) =>
        p.includes("healthy") ? p : `${p} (healthy)`
      );
    else if (mood === "Comfort")
      setCustomInstructions((p) =>
        p.includes("comfort") ? p : `${p} (comfort food)`
      );
    else if (mood === "Impress")
      setCustomInstructions((p) =>
        p.includes("impressive") ? p : `${p} (impressive, gourmet)`
      );
    else if (mood === "Use Expiring")
      setCustomInstructions((p) =>
        p.includes("expiring") ? p : `${p} (prioritise expiring ingredients)`
      );
  };

  /* ------------------------- generation ----------------------------------- */
  const generateMeal = async (isAppending: boolean = false) => {
    if (!selectedModel || selectedIngredients.length === 0) {
      setError("Please select at least one ingredient from the pantry. 🥕");
      return;
    }
    setError("");

    if (isAppending) setIsGeneratingMore(true);
    else {
      setIsGenerating(true);
      setRecipes([]);
      setSelectedRecipe(null);
      setCanLoadMore(true);
    }

    const avoidanceContext =
      isAppending && recipes.length > 0
        ? `\n[STRICT DUPLICATE PREVENTION] Do NOT repeat: ${recipes
            .map((r) => r.title)
            .join(", ")}.`
        : "";

    const flexibilityInstructions = [
      "Level 1 (Spartan): STRICTLY limit to the pantry list + Water/Salt/Pepper/Oil/Butter. NO EXCEPTIONS.",
      "Level 2 (Modest): Pantry + staples + EXACTLY ONE fresh aromatic or acid.",
      "Level 3 (Home Cook): Pantry + staples + specific dry spices, fresh herbs, and liquid condiments.",
      "Level 4 (Chef de Partie): Unrestricted access to standard groceries. Add complementary proteins, cheeses/creams, extra vegetables.",
      "Level 5 (Executive Chef): THE BLANK CHECK. Transform pantry items into a massive gourmet entree.",
    ][flexibility - 1];

    const creativenessInstructions = [
      "Level 1: Strictly Traditional. Classic, authentic flavour profiles.",
      "Level 2: Familiar. Standard, well-loved home-cooking pairings.",
      "Level 3: Modern. Contemporary restaurant-style pairings.",
      "Level 4: Bold Fusion. Creative combinations bridging cuisines.",
      "Level 5: Experimental Avant-Garde. Highly unconventional 'Chef-Lab' concepts.",
    ][creativeness - 1];

    const familiarGourmetBridge =
      flexibility >= 4 && creativeness <= 2
        ? "ELEVATED CLASSICS MANDATE: Create distinct, well-known classic flavour profiles."
        : "";

    const chefDirection = customInstructions.trim()
      ? `\n[MANDATORY THEMATIC OVERRIDE] Execute this exact vibe: "${customInstructions}". DIETARY STRICTNESS: Obey implied diets perfectly.`
      : "";

    const qualityRule =
      flexibility <= 2
        ? "ADHERENCE OVER TASTE: Honor strict ingredient limits even if dish is simplistic."
        : "STRUCTURAL OVERLOAD: Add substantial structural ingredients AND complex flavour layers.";

    const numRecipes = flexibility >= 4 ? 3 : 2;
    const schemaObjects = Array.from({ length: numRecipes })
      .map(
        (_, i) =>
          `{ "id": ${i + 1}, "title": "Distinct Recipe Name", "description": "3-sentence flavour deep-dive", "prepTime": "XX mins", "pantryIngredients": ["Qty + Item"], "additionalIngredients": ["Qty + Item"], "instructions": ["Clean step text without numbers"] }`
      )
      .join(", ");

    const spiceLexicon =
      flexibility >= 3
        ? `\n[ADAPTIVE FLAVOR MANDATE] 
      - BREAK THE DEFAULT BIAS: Never default to just "Salt and Black Pepper". 
      - CONTEXTUAL SEASONING: Curate the exact spices, herbs, acid, or sauces the dish NEEDS.`
        : "";

    const prompt = `
      [ROLE] Michelin-Star Chef & Precision Culinary Architect.
      [GOAL] Craft EXACTLY ${numRecipes} completely distinct recipes using: ${selectedIngredients.join(", ")}.${avoidanceContext}${chefDirection}
      
      [CREATIVITY & VIBE] 
      - BASE CREATIVITY: ${creativenessInstructions}
      - ${familiarGourmetBridge}
      ${spiceLexicon}
      
      [PRECISION MEASUREMENTS] 
      - Every item MUST have specific counts/volumes (e.g. '3 Carrots'). Scale for ${quantityLabels[quantity]}.
      - SEPARATE: '1 tsp Salt' and '1 tsp Black Pepper' as two items.
      - NO adjectives in ingredient names. Write '1 cup Onion', not 'Diced Red Onion'.
      
      [INGREDIENT RULES]
      - 'pantryIngredients' = items from: ${selectedIngredients.join(", ")}. 
      - 'additionalIngredients' = everything else.
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
          prompt,
          stream: false,
          format: "json",
          options: { num_predict: 8192, temperature: 0.8 },
        }),
      });

      const data = await res.json();
      let parsed = JSON.parse(
        data.response.trim().replace(/^```json/, "").replace(/```$/, "")
      );

      let finalArray: Recipe[] = [];
      if (Array.isArray(parsed)) finalArray = parsed;
      else if (parsed && typeof parsed === "object" && parsed.title)
        finalArray = [parsed];
      else if (parsed && typeof parsed === "object") {
        const nestedArray = Object.values(parsed).find((val) =>
          Array.isArray(val)
        );
        finalArray = (nestedArray as Recipe[]) || [parsed];
      }

      if (finalArray.length < numRecipes) setCanLoadMore(false);
      if (isAppending) setRecipes((prev) => [...prev, ...finalArray]);
      else setRecipes(finalArray);
    } catch (err) {
      setError("Hmm, even Basil's stumped 🤔 Check that Ollama is running.");
    } finally {
      setIsGenerating(false);
      setIsGeneratingMore(false);
    }
  };

  /* ------------------------- render --------------------------------------- */
  return (
    <div className="relative min-h-screen bg-[var(--color-parchment)] font-[family-name:var(--font-body)]">
      {/* Ambient floating emojis */}
      <AmbientBackground elements={["✨", "🔥", "🍴", "⭐", "🫧", "💫", "🌿"]} />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* ---------- Header bar ---------- */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-sage-soft)]">
              <ChefHat className="h-5 w-5 text-[var(--color-sage)]" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-handwritten)] text-3xl text-[var(--color-text-primary)]">
                Basil’s Kitchen ✨
              </h1>
              <div className="mt-0.5 flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    ollamaStatus === "connected"
                      ? "bg-[var(--color-sage)]"
                      : ollamaStatus === "checking"
                      ? "bg-[var(--color-butter)] animate-pulse"
                      : "bg-[var(--color-terracotta)]"
                  )}
                />
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
                  {ollamaStatus === "connected"
                    ? "Chef Ready"
                    : ollamaStatus === "checking"
                    ? "Waking Chef..."
                    : "Chef Offline"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Visible Pantry Switcher */}
            <div className="relative">
              <select
                value={selectedPantryId ?? ""}
                onChange={(e) => setSelectedPantryId(Number(e.target.value))}
                className="appearance-none rounded-xl border border-[var(--color-warm-border)] bg-[var(--color-warm-surface-2)] px-4 py-2 pr-8 text-xs font-semibold text-[var(--color-text-primary)] outline-none transition-colors hover:border-[var(--color-sage)]"
              >
                {pantries.length === 0 ? (
                  <option value="" disabled>
                    No pantries found
                  </option>
                ) : (
                  pantries.map((p) => (
                    <option key={p.pantry_id} value={p.pantry_id}>
                      {p.pantry_name}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[var(--color-text-ghost)]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <button
              onClick={() => setShowSetup(!showSetup)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all",
                showSetup
                  ? "bg-[var(--color-butter-soft)] text-[var(--color-butter)] border border-[var(--color-butter)]/20"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-surface-2)]"
              )}
            >
              <Settings2 className="h-4 w-4" />
              Setup
            </button>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all",
                showAdvanced
                  ? "bg-[var(--color-sage-soft)] text-[var(--color-sage)] border border-[var(--color-sage)]/20"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-surface-2)]"
              )}
            >
              <Wand2 className="h-4 w-4" />
              Tune
            </button>
          </div>
        </div>

        {/* ---------- Usable Setup Panel ---------- */}
        <AnimatePresence>
          {showSetup && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-3xl border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] p-6 shadow-sm md:p-8">
                <div className="mb-6 flex items-start justify-between border-b border-[var(--color-warm-border-soft)] pb-6">
                  <div>
                    <h2 className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-text-primary)]">
                      kitchen brain ✨
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      Manage Basil's local AI connection.
                    </p>
                  </div>
                  <button
                    onClick={checkOllama}
                    disabled={ollamaStatus === "checking"}
                    className="flex items-center gap-2 rounded-full border border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface-2)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-warm-border)] disabled:opacity-50"
                  >
                    <RefreshCw
                      className={cn(
                        "h-3.5 w-3.5",
                        ollamaStatus === "checking" && "animate-spin"
                      )}
                    />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                      <Server className="h-4 w-4 text-[var(--color-sage)]" /> Connection Status
                    </label>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border p-4",
                        ollamaStatus === "connected"
                          ? "border-[var(--color-sage)]/20 bg-[var(--color-sage-soft)]"
                          : "border-[var(--color-terracotta)]/20 bg-[var(--color-terracotta-soft)]"
                      )}
                    >
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full",
                          ollamaStatus === "connected"
                            ? "bg-[var(--color-sage)]"
                            : "bg-[var(--color-terracotta)]"
                        )}
                      />
                      <div>
                        <p
                          className={cn(
                            "text-sm font-bold",
                            ollamaStatus === "connected"
                              ? "text-[var(--color-sage)]"
                              : "text-[var(--color-terracotta)]"
                          )}
                        >
                          {ollamaStatus === "connected"
                            ? "Connected to Local Ollama"
                            : "Ollama is not responding"}
                        </p>
                        {ollamaStatus !== "connected" && (
                          <p className="mt-1 text-xs text-[var(--color-text-secondary)] opacity-80">
                            Run <code className="bg-white/50 px-1 rounded">ollama serve</code> in your terminal.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                      <Database className="h-4 w-4 text-[var(--color-butter)]" /> Select Model
                    </label>
                    {models.length > 0 ? (
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full rounded-2xl border border-[var(--color-warm-border)] bg-[var(--color-warm-surface-2)] p-4 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-colors hover:border-[var(--color-sage)] focus:border-[var(--color-sage)]"
                      >
                        {models.map((m: any) => (
                          <option key={m.name} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center justify-center rounded-2xl border border-dashed border-[var(--color-warm-border)] bg-[var(--color-warm-surface-2)] p-4">
                        <p className="text-xs font-medium text-[var(--color-text-ghost)]">
                          No models found. Try pulling one via terminal.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- Main pill input & Context ---------- */}
        <div className="mb-8">
          <div className="relative mx-auto max-w-3xl">
            <div className="flex items-center overflow-hidden rounded-[2.5rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] shadow-sm transition-shadow focus-within:shadow-md">
              <div className="flex w-full items-center px-5 py-5">
                <Search className="mr-3 h-5 w-5 text-[var(--color-text-ghost)]" />
                <motion.input
                  key="chef-input"
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder={rotatingPlaceholders[placeholderIndex]}
                  className="w-full bg-transparent text-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-ghost)] outline-none transition-all font-[family-name:var(--font-handwritten)]"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => generateMeal(false)}
                disabled={
                  !mounted ||
                  isGenerating ||
                  ollamaStatus !== "connected" ||
                  selectedIngredients.length === 0
                }
                className="mr-2 shrink-0 rounded-full bg-[var(--color-terracotta)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-[0_4px_14px_rgba(196,103,58,0.2)] transition-opacity hover:opacity-90 disabled:opacity-30 disabled:shadow-none"
              >
                {isGenerating && !isGeneratingMore ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse" /> Cooking…
                  </span>
                ) : (
                  "✨ Inspire Me"
                )}
              </motion.button>
            </div>

            {/* Pantry & Ingredient Context Bar (Directly visible UI) */}
            <div className="mt-6 mb-4 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface)] px-4 py-1.5 shadow-sm">
                <span className="text-[var(--color-text-primary)]">🪴</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                  {activePantryName}
                </span>
              </div>
              <span className="text-[var(--color-warm-border)]">—</span>
              <div className="flex items-center gap-2 rounded-full border border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface)] px-4 py-1.5 shadow-sm">
                <span className="text-[var(--color-text-primary)]">🥕</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                  <strong className="text-[var(--color-text-primary)]">{selectedIngredients.length}</strong> / {ingredients.length} Ready
                </span>
              </div>
              <button
                onClick={() => setShowAdvanced(true)}
                className="ml-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-sage)] transition-colors hover:bg-[var(--color-sage-soft)]"
              >
                <Settings2 className="h-3.5 w-3.5" /> Adjust
              </button>
            </div>

            {/* Mood chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {moodChips.map((chip) => (
                <motion.button
                  key={chip.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleMoodChip(chip.label)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                    activeMood === chip.label
                      ? "border-[var(--color-sage)] bg-[var(--color-sage-soft)] text-[var(--color-sage)]"
                      : "border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-warm-border)]"
                  )}
                >
                  <span>{chip.emoji}</span> {chip.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- Error banner ---------- */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-8 max-w-3xl rounded-2xl border border-[var(--color-terracotta)]/20 bg-[var(--color-terracotta-soft)] px-6 py-3 text-center text-sm font-medium text-[var(--color-terracotta)]"
          >
            {error}
          </motion.div>
        )}

        {/* ---------- Recipe results area ---------- */}
        <div className="relative mt-12 min-h-[500px]">
          {/* Loading state */}
          {isGenerating && !isGeneratingMore && (
            <div className="flex flex-col items-center justify-center py-20">
              <BasilLoading />
              <p className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-text-primary)] mt-6">
                Basil’s cooking something up ✨
              </p>
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[280px] animate-pulse rounded-[2rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state (no recipes yet) */}
          {!isGenerating && !selectedRecipe && recipes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <BasilEmpty />
              <h3 className="font-[family-name:var(--font-handwritten)] text-3xl text-[var(--color-text-primary)] mt-6">
                The kitchen is a blank canvas. 🌿
              </h3>
              <p className="mt-2 max-w-sm text-center text-base text-[var(--color-text-secondary)]">
                Tell Basil what you’re craving or adjust your pantry above —
                he’ll whip up something delicious.
              </p>
            </motion.div>
          )}

          {/* Recipe cards grid */}
          {!isGenerating && !selectedRecipe && recipes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={easeOut}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {recipes.map((r, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ ...spring, delay: i * 0.06 }}
                      whileHover={{
                        y: -4,
                        boxShadow: "0 12px 32px rgba(44,32,22,0.12)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedRecipe(r);
                      }}
                      className="group cursor-pointer overflow-hidden rounded-[2rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] p-8 transition-colors"
                    >
                      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-blush)] opacity-0 transition-opacity group-hover:opacity-100" />
                      <div>
                        <h4 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--color-text-primary)]">
                          {r.title}
                        </h4>
                        <p className="mt-3 line-clamp-3 text-sm italic leading-relaxed text-[var(--color-text-secondary)]">
                          “{r.description}”
                        </p>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-[var(--color-warm-border-soft)] pt-5">
                        <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-ghost)]">
                          {r.prepTime}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-terracotta)] transition-transform group-hover:translate-x-1">
                          View →
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isGeneratingMore &&
                  [1, 2, 3].map((i) => (
                    <div
                      key={`skel-${i}`}
                      className="h-[280px] animate-pulse rounded-[2rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)]"
                    />
                  ))}
              </div>

              {!isGeneratingMore && canLoadMore && recipes.length >= 1 && (
                <div className="flex justify-center pt-4">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => generateMeal(true)}
                    disabled={ollamaStatus !== "connected"}
                    className="rounded-full border border-[var(--color-warm-border)] bg-[var(--color-warm-surface-2)] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] transition-all hover:border-[var(--color-text-primary)] hover:bg-[var(--color-warm-surface)]"
                  >
                    More Inspirations ✨
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* Recipe detail */}
          {selectedRecipe && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
              className="relative overflow-hidden rounded-[2rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] p-8 shadow-sm md:p-12"
            >
              <div className="absolute left-0 top-0 h-2 w-full bg-[var(--color-sage)]" />
              <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />{" "}
                  Back to Menu
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => saveRecipeToDatabase(selectedRecipe)}
                  disabled={isSaving || (!consumerId && !adminId)}
                  className="flex items-center gap-2 rounded-full border border-[var(--color-warm-border)] px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all hover:bg-[var(--color-text-primary)] hover:text-[var(--color-parchment)] disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? "Saving…" : "Save to Cookbook 📖"}
                </motion.button>
              </div>

              <div className="mb-12 border-b border-[var(--color-warm-border-soft)] pb-10">
                <h2 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--color-text-primary)] md:text-6xl">
                  {selectedRecipe.title}
                </h2>
                <div className="mt-6 flex flex-wrap items-center gap-6">
                  <p className="max-w-2xl text-lg italic leading-relaxed text-[var(--color-text-secondary)]">
                    “{selectedRecipe.description}”
                  </p>
                  <div className="flex items-center gap-2 rounded-full border border-[var(--color-sage)]/20 bg-[var(--color-sage-soft)] px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[var(--color-sage)]">
                    <Clock className="h-3.5 w-3.5" />
                    {selectedRecipe.prepTime}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <h5 className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
                    🌿 Ingredients
                  </h5>
                  <div className="max-h-[500px] overflow-y-auto pr-4 scrollbar-thin">
                    <ul className="space-y-3">
                      {(Array.isArray(selectedRecipe.pantryIngredients)
                        ? selectedRecipe.pantryIngredients
                        : []
                      )
                        .filter(
                          (i: unknown): i is string =>
                            typeof i === "string" && i.trim().length > 0
                        )
                        .map((item: string, idx: number) => (
                          <li
                            key={`pantry-${idx}`}
                            className="flex items-start gap-3 border-b border-[var(--color-warm-border-soft)] pb-3 last:border-0"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-sage)]" />
                            <span className="text-sm leading-snug text-[var(--color-text-primary)]">
                              {item.replace(/^[*-]\s*/, "").trim()}
                            </span>
                          </li>
                        ))}
                    </ul>

                    {Array.isArray(selectedRecipe.additionalIngredients) &&
                      selectedRecipe.additionalIngredients.length > 0 && (
                        <div className="mt-8 border-t border-[var(--color-warm-border-soft)] pt-6">
                          <h5 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                            + Pantry Additions
                          </h5>
                          <ul className="space-y-3 opacity-80">
                            {selectedRecipe.additionalIngredients
                              .filter(
                                (i: unknown): i is string =>
                                  typeof i === "string" && i.trim().length > 0
                              )
                              .map((item: string, idx: number) => (
                                <li
                                  key={`extra-${idx}`}
                                  className="flex items-start gap-3"
                                >
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-text-secondary)]" />
                                  <span className="text-sm leading-snug text-[var(--color-text-secondary)]">
                                    {item.replace(/^[*-]\s*/, "").trim()}
                                  </span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <h5 className="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
                    👩‍🍳 Preparation
                  </h5>
                  <ol className="space-y-10">
                    {(
                      Array.isArray(selectedRecipe.instructions)
                        ? selectedRecipe.instructions
                        : []
                    ).map((step: string, index: number) => (
                      <li key={index} className="group flex gap-6">
                        <span className="shrink-0 font-[family-name:var(--font-handwritten)] text-3xl italic text-[var(--color-blush)]">
                          {index + 1}.
                        </span>
                        <p className="pt-1 text-lg leading-relaxed text-[var(--color-text-secondary)]">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ---------- Advanced Tuning panel (slide from right) ---------- */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={spring}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] p-6 shadow-lg"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-text-primary)]">
                tune your kitchen 🌿
              </h2>
              <button
                onClick={() => setShowAdvanced(false)}
                className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-warm-surface-2)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Sliders */}
              {[
                {
                  label: "Flexibility",
                  value: flexibility,
                  setter: setFlexibility,
                  max: 5,
                  valueLabel: flexibilityLabels[flexibility],
                },
                {
                  label: "Portion Size",
                  value: quantity,
                  setter: setQuantity,
                  max: 4,
                  valueLabel: quantityLabels[quantity],
                },
                {
                  label: "Creativeness",
                  value: creativeness,
                  setter: setCreativeness,
                  max: 5,
                  valueLabel: creativenessLabels[creativeness],
                },
              ].map((slider, idx) => (
                <div
                  key={idx}
                  className="border-b border-[var(--color-warm-border-soft)] pb-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                      {slider.label}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-sage)]">
                      {slider.valueLabel}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={slider.max}
                    step="1"
                    value={slider.value}
                    onChange={(e) => slider.setter(parseInt(e.target.value))}
                    className="h-1.5 w-full cursor-pointer rounded-lg bg-[var(--color-warm-border-soft)] accent-[var(--color-sage)] hover:accent-[var(--color-terracotta)]"
                  />
                </div>
              ))}

              {/* Negative ingredients */}
              <div className="border-b border-[var(--color-warm-border-soft)] pb-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                    Kitchen Bans
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-terracotta)]">
                    {excludedIngredients.length} Active
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Ban ingredients (Press Enter)…"
                  value={excludeInput}
                  onChange={(e) => setExcludeInput(e.target.value)}
                  onKeyDown={addExclusion}
                  className="w-full rounded-xl border border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface-2)] px-4 py-2.5 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-ghost)] outline-none transition-colors focus:border-[var(--color-terracotta)]"
                />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {excludedIngredients.map((item) => (
                      <motion.button
                        key={item}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={microEase}
                        onClick={() => removeExclusion(item)}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--color-terracotta)]/20 bg-[var(--color-terracotta-soft)] px-2.5 py-1 text-xs font-bold uppercase tracking-tight text-[var(--color-terracotta)] transition-colors hover:bg-[var(--color-terracotta)]/10"
                      >
                        {item} <X className="h-3 w-3" />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Ingredient selection */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                    Pantry Filter
                  </h4>
                  <button
                    onClick={() =>
                      setSelectedIngredients(
                        selectedIngredients.length === ingredients.length
                          ? []
                          : ingredients
                      )
                    }
                    className="text-xs font-bold uppercase text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    {selectedIngredients.length === ingredients.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="max-h-[300px] space-y-2 overflow-y-auto pr-2">
                  {ingredients.length > 0 ? (
                    ingredients.map((ing) => {
                      const isSelected = selectedIngredients.includes(ing);
                      return (
                        <motion.div
                          key={ing}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleIngredient(ing)}
                          className={cn(
                            "flex cursor-pointer select-none items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors",
                            isSelected
                              ? "border-[var(--color-sage)] bg-[var(--color-sage-soft)] text-[var(--color-text-primary)]"
                              : "border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-warm-border)]"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                              isSelected
                                ? "border-[var(--color-sage)] bg-[var(--color-sage)] text-white"
                                : "border-[var(--color-warm-border)] bg-[var(--color-warm-surface-2)]"
                            )}
                          >
                            {isSelected && (
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="truncate">{ing}</span>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface-2)] py-8 text-center">
                      <p className="text-xs font-medium text-[var(--color-text-ghost)]">
                        No items found.
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[var(--color-warm-border-soft)] pt-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                    Inventory Ratio
                  </span>
                  <span className="rounded-md bg-[var(--color-warm-border-soft)] px-2 py-0.5 text-xs font-bold text-[var(--color-text-primary)]">
                    {selectedIngredients.length} / {ingredients.length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}