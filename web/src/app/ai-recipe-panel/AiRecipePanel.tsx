// components/ai-recipe-panel/AiRecipePanel.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { spring, easeOut } from "@/lib/animation";
import { AmbientBackground } from "../components/ambient-background/AmbientBackground";
import { BasilLoading, BasilEmpty, BasilError } from "../components/mascot/BasilComponents";
import { usePantry } from "./hooks/usePantry";
import { useOllama } from "./hooks/useOllama";
import { useRecipeGeneration } from "./hooks/useRecipeGeneration";
import { Header } from "./components/Header";
import { SetupPanel } from "./components/SetupPanel";
import { TuningPanel } from "./components/TuningPanel";
import { MainInput } from "./components/MainInput";
import { RecipeResults } from "./components/RecipeResults";
import { RecipeDetail } from "../recipes/components/RecipeDetail";
import type { Recipe } from "./types";
import { AiRecipeDetail } from "./components/AiRecipeDetail";

const flexibilityLabels: Record<number, string> = {
  1: "Strict (Pantry Only)",
  2: "Balanced (Staples + 1)",
  3: "Creative (Staples + 3)",
  4: "Enthusiast (Shop Trip)",
  5: "Gourmet (Quality First)",
};
const quantityLabels: Record<number, string> = {
  1: "Single Serving",
  2: "Dinner for Two",
  3: "Family Feast",
  4: "Bulk Meal Prep",
};
const creativenessLabels: Record<number, string> = {
  1: "Traditional",
  2: "Familiar",
  3: "Modern",
  4: "Fusion",
  5: "Avant-Garde",
};

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
  const [showSetup, setShowSetup] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [flexibility, setFlexibility] = useState(2);
  const [creativeness, setCreativeness] = useState(2);
  const [quantity, setQuantity] = useState(1);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [excludeInput, setExcludeInput] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const {
    pantries,
    selectedPantryId,
    setSelectedPantryId,
    ingredients,
    selectedIngredients,
    setSelectedIngredients,
    toggleIngredient,
    activePantryName,
  } = usePantry(supabaseUrl, supabaseAnonKey, consumerId);

  const {
    models,
    selectedModel,
    setSelectedModel,
    ollamaStatus,
    checkOllama,
  } = useOllama();

  const {
    recipes,
    isGenerating,
    isGeneratingMore,
    canLoadMore,
    error,
    setError,
    generate,
    saveRecipe,
  } = useRecipeGeneration(supabaseUrl, supabaseAnonKey, consumerId, adminId);

  // Rotating placeholder
  const rotatingPlaceholders = [
    "something cozy for tonight... 🍜",
    "quick lunch under 20 minutes ⚡",
    "impress someone special 🌹",
    "use my carrots before they go sad 🥕",
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % rotatingPlaceholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Generate handler
  const handleGenerate = (isAppend: boolean = false) => {
    generate(
      isAppend,
      selectedIngredients,
      excludedIngredients,
      customInstructions,
      flexibility,
      creativeness,
      quantity,
      quantityLabels,
      selectedModel
    );
  };

  // Mood chip handler
  const handleMoodChip = (mood: string) => {
    setActiveMood((prev) => (prev === mood ? null : mood));
    if (mood === "Quick") setCustomInstructions((p) => p.includes("under 30") ? p : `${p} (under 30 min)`);
    else if (mood === "Healthy") setCustomInstructions((p) => p.includes("healthy") ? p : `${p} (healthy)`);
    else if (mood === "Comfort") setCustomInstructions((p) => p.includes("comfort") ? p : `${p} (comfort food)`);
    else if (mood === "Impress") setCustomInstructions((p) => p.includes("impressive") ? p : `${p} (impressive, gourmet)`);
    else if (mood === "Use Expiring") setCustomInstructions((p) => p.includes("expiring") ? p : `${p} (prioritise expiring ingredients)`);
  };

  // Exclusions
  const addExclusion = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && excludeInput.trim()) {
      e.preventDefault();
      if (!excludedIngredients.includes(excludeInput.trim())) {
        setExcludedIngredients([...excludedIngredients, excludeInput.trim()]);
      }
      setExcludeInput("");
    }
  };
  const removeExclusion = (item: string) => setExcludedIngredients(excludedIngredients.filter((i) => i !== item));

  // Save recipe
  const onSaveRecipe = async (recipe: Recipe) => {
    const success = await saveRecipe(recipe, quantity);
    if (success) alert("Saved to your cookbook 📖 yum!");
    else setError("Oops, Basil burnt something 🍳");
  };

  return (
    <div className="relative min-h-screen bg-[var(--color-parchment)] font-[family-name:var(--font-body)]">
      <AmbientBackground elements={["✨", "🔥", "🍴", "⭐", "🫧", "💫", "🌿"]} />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Header
          ollamaStatus={ollamaStatus}
          pantries={pantries}
          selectedPantryId={selectedPantryId}
          onPantryChange={setSelectedPantryId}
          showSetup={showSetup}
          onToggleSetup={() => setShowSetup(!showSetup)}
          showAdvanced={showAdvanced}
          onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        />
        <SetupPanel
          show={showSetup}
          ollamaStatus={ollamaStatus}
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onRefresh={checkOllama}
        />
        <MainInput
          placeholderIndex={placeholderIndex}
          customInstructions={customInstructions}
          onInstructionsChange={setCustomInstructions}
          onGenerate={() => handleGenerate(false)}
          canGenerate={ollamaStatus === "connected" && selectedIngredients.length > 0}
          isGenerating={isGenerating && !isGeneratingMore}
          activeMood={activeMood}
          onMoodClick={handleMoodChip}
          activePantryName={activePantryName}
          selectedIngredientCount={selectedIngredients.length}
          totalIngredients={ingredients.length}
          onOpenTuning={() => setShowAdvanced(true)}
        />
        <TuningPanel
          show={showAdvanced}
          onClose={() => setShowAdvanced(false)}
          sliders={[
            { label: "Flexibility", value: flexibility, setter: setFlexibility, max: 5, valueLabel: flexibilityLabels[flexibility] },
            { label: "Portion Size", value: quantity, setter: setQuantity, max: 4, valueLabel: quantityLabels[quantity] },
            { label: "Creativeness", value: creativeness, setter: setCreativeness, max: 5, valueLabel: creativenessLabels[creativeness] },
          ]}
          excludedIngredients={excludedIngredients}
          excludeInput={excludeInput}
          onExcludeInputChange={setExcludeInput}
          onAddExclusion={addExclusion}
          onRemoveExclusion={removeExclusion}
          ingredients={ingredients}
          selectedIngredients={selectedIngredients}
          toggleIngredient={toggleIngredient}
          setSelectedIngredients={setSelectedIngredients}
        />

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mb-8 max-w-3xl rounded-2xl border border-[var(--color-terracotta)]/20 bg-[var(--color-terracotta-soft)] px-6 py-3 text-center text-sm font-medium text-[var(--color-terracotta)]">
            <BasilError size={40} />
            <p className="text-sm text-[var(--color-terracotta)]">{error}</p>
          </motion.div>
        )}

        <div className="relative mt-12 min-h-[500px]">
          {/* Loading */}
          {isGenerating && !isGeneratingMore && (
            <div className="flex flex-col items-center justify-center py-20">
              <BasilLoading />
              <p className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-text-primary)] mt-6">Basil’s cooking something up ✨</p>
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-[280px] animate-pulse rounded-[2rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)]" />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isGenerating && !selectedRecipe && recipes.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
              <BasilEmpty />
              <h3 className="font-[family-name:var(--font-handwritten)] text-3xl text-[var(--color-text-primary)] mt-6">The kitchen is a blank canvas. 🌿</h3>
              <p className="mt-2 max-w-sm text-center text-base text-[var(--color-text-secondary)]">
                Tell Basil what you’re craving or adjust your pantry above — he’ll whip up something delicious.
              </p>
            </motion.div>
          )}

          {/* Recipe cards grid */}
          {!isGenerating && !selectedRecipe && recipes.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={easeOut} className="space-y-8">
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
                      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(44,32,22,0.12)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRecipe(r)}
                      className="group cursor-pointer overflow-hidden rounded-[2rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] p-8 transition-colors"
                    >
                      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-blush)] opacity-0 group-hover:opacity-100" />
                      <div>
                        <h4 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--color-text-primary)]">{r.title}</h4>
                        <p className="mt-3 line-clamp-3 text-sm italic leading-relaxed text-[var(--color-text-secondary)]">“{r.description}”</p>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-[var(--color-warm-border-soft)] pt-5">
                        <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-ghost)]">{r.prepTime}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-terracotta)] transition-transform group-hover:translate-x-1">View →</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isGeneratingMore && [1,2,3].map((i) => (
                  <div key={`skel-${i}`} className="h-[280px] animate-pulse rounded-[2rem] border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)]" />
                ))}
              </div>
              {!isGeneratingMore && canLoadMore && recipes.length >= 1 && (
                <div className="flex justify-center pt-4">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleGenerate(true)}
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
            <AiRecipeDetail
              recipe={selectedRecipe}
              onBack={() => setSelectedRecipe(null)}
              onSave={() => onSaveRecipe(selectedRecipe)}
              isSaving={false} // you could track a saving state
              canSave={!!(consumerId || adminId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}