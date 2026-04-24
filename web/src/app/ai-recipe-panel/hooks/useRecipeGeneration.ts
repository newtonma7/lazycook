// hooks/useRecipeGeneration.ts
"use client";
import { useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Recipe } from "../types";

// helpers
function parseIngredientString(rawString: string) {
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
}

function parseFractionToFloat(value: string | null): number | null {
  if (!value) return null;
  const num = Number(value);
  if (!isNaN(num)) return num;
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) {
    const [numStr, denomStr] = parts[0].split('/');
    const n = Number(numStr), d = Number(denomStr);
    if (!isNaN(n) && !isNaN(d) && d !== 0) return n / d;
  } else if (parts.length === 2) {
    const whole = Number(parts[0]);
    if (isNaN(whole)) return null;
    const [numStr, denomStr] = parts[1].split('/');
    const n = Number(numStr), d = Number(denomStr);
    if (!isNaN(n) && !isNaN(d) && d !== 0) return whole + n / d;
  }
  return null;
}

export function useRecipeGeneration(
  supabaseUrl: string,
  supabaseAnonKey: string,
  consumerId: number | null,
  adminId: number | null
) {
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [error, setError] = useState("");

  const generateMeals = async (
    prompt: string,
    numRecipes: number,
    selectedModel: string
  ): Promise<Recipe[]> => {
    const schemaObjects = Array.from({ length: numRecipes })
      .map(
        (_, i) =>
          `{ "id": ${i + 1}, "title": "Distinct Recipe Name", "description": "3-sentence flavour deep-dive", "prepTime": "XX mins", "pantryIngredients": ["Qty + Item"], "additionalIngredients": ["Qty + Item"], "instructions": ["Clean step text without numbers"] }`
      )
      .join(", ");

    const fullPrompt = `${prompt}\n\nReturn exactly ${numRecipes} objects in a JSON array:\n[${schemaObjects}]`;

    const res = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,
        prompt: fullPrompt,
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
      const nested = Object.values(parsed).find((val) => Array.isArray(val));
      finalArray = (nested as Recipe[]) || [parsed];
    }
    return finalArray;
  };

  const generate = async (
    isAppending: boolean,
    selectedIngredients: string[],
    excludedIngredients: string[],
    customInstructions: string,
    flexibility: number,
    creativeness: number,
    quantity: number,
    quantityLabels: Record<number, string>,
    selectedModel: string
  ) => {
    if (!selectedModel || selectedIngredients.length === 0) {
      setError("Please select at least one ingredient from the pantry. 🥕");
      return;
    }
    setError("");

    if (isAppending) setIsGeneratingMore(true);
    else {
      setIsGenerating(true);
      setRecipes([]);
      setCanLoadMore(true);
    }

    const avoidance =
      isAppending && recipes.length > 0
        ? `\n[STRICT DUPLICATE PREVENTION] Do NOT repeat: ${recipes.map(r => r.title).join(", ")}.`
        : "";

    // Build prompt (same as original)
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
    const gourmetBridge =
      flexibility >= 4 && creativeness <= 2
        ? "ELEVATED CLASSICS MANDATE: Create distinct, well-known classic flavour profiles."
        : "";
    const chefDir = customInstructions.trim()
      ? `\n[MANDATORY THEMATIC OVERRIDE] Execute this exact vibe: "${customInstructions}". DIETARY STRICTNESS: Obey implied diets perfectly.`
      : "";
    const quality =
      flexibility <= 2
        ? "ADHERENCE OVER TASTE: Honor strict ingredient limits even if dish is simplistic."
        : "STRUCTURAL OVERLOAD: Add substantial structural ingredients AND complex flavour layers.";
    const spice =
      flexibility >= 3
        ? `\n[ADAPTIVE FLAVOR MANDATE] NEVER default to just Salt and Black Pepper. Curate exact spices, herbs, acid.`
        : "";

    const num = flexibility >= 4 ? 3 : 2;
    const prompt = `
[ROLE] Michelin-Star Chef & Precision Culinary Architect.
[GOAL] Craft EXACTLY ${num} completely distinct recipes using: ${selectedIngredients.join(", ")}.${avoidance}${chefDir}

[CREATIVITY & VIBE]
- BASE CREATIVITY: ${creativenessInstructions}
- ${gourmetBridge}
${spice}

[PRECISION MEASUREMENTS]
- Every item MUST have specific counts/volumes (e.g. '3 Carrots'). Scale for ${quantityLabels[quantity]}.
- SEPARATE salt and pepper items.
- NO adjectives in ingredient names. Write '1 cup Onion', not 'Diced Red Onion'.

[INGREDIENT RULES]
- 'pantryIngredients' = items from: ${selectedIngredients.join(", ")}.
- 'additionalIngredients' = everything else.
- NEGATIVE LIST: NEVER use: ${excludedIngredients.join(", ") || "None"}.
- FLEXIBILITY RULE: ${flexibilityInstructions}

[CULINARY MANDATE] ${quality}

[EXECUTION] 8-12 micro-steps of technique. DO NOT NUMBER THE STEPS.
`;

    try {
      const results = await generateMeals(prompt, num, selectedModel);
      if (results.length < num) setCanLoadMore(false);
      if (isAppending) setRecipes((prev) => [...prev, ...results]);
      else setRecipes(results);
    } catch (err) {
      setError("Hmm, even Basil's stumped 🤔 Check that Ollama is running.");
    } finally {
      setIsGenerating(false);
      setIsGeneratingMore(false);
    }
  };

  const saveRecipe = async (recipe: Recipe, quantity: number) => {
    if (!consumerId && !adminId) {
      setError("Please log in to save recipes. 🌿");
      return;
    }
    try {
      const prepTimeMin = recipe.prepTime.match(/\d+/)
        ? parseInt(recipe.prepTime.match(/\d+/)![0], 10)
        : null;

      const formattedInstructions = recipe.instructions
        .map((step, idx) => `${idx + 1}. ${step}`)
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
      const createdId = newRecipe.recipe_id;

      const allIngredients = [
        ...(Array.isArray(recipe.pantryIngredients) ? recipe.pantryIngredients : []),
        ...(Array.isArray(recipe.additionalIngredients) ? recipe.additionalIngredients : []),
      ];

      const { data: dbIngs } = await supabase.from("ingredient").select("ingredient_id, name");
      const existing = dbIngs || [];

      const recipeIngRows = [];

      for (const raw of allIngredients) {
        if (!raw.trim()) continue;
        const { quantity: parsedQty, unit: parsedUnit, name: parsedName } = parseIngredientString(raw);
        let matched = existing.find(
          (db: any) => parsedName.toLowerCase().includes(db.name.toLowerCase()) ||
                       db.name.toLowerCase().includes(parsedName.toLowerCase())
        );
        let ingId = matched?.ingredient_id;
        if (!ingId) {
          const { data: newIng, error: ingErr } = await supabase.from("ingredient").insert({ name: parsedName }).select("ingredient_id").single();
          if (!ingErr && newIng) {
            ingId = newIng.ingredient_id;
            existing.push({ ingredient_id: ingId, name: parsedName });
          }
        }
        if (ingId) {
          recipeIngRows.push({
            recipe_id: createdId,
            ingredient_id: ingId,
            required_quantity: parseFractionToFloat(parsedQty),
            unit: parsedUnit,
            is_optional: false,
            preparation_note: parsedName,
          });
        }
      }

      if (recipeIngRows.length > 0) {
        await supabase.from("recipe_ingredient").insert(recipeIngRows);
      }
      return true;
    } catch (err: any) {
      setError(`Oops, Basil burnt something 🍳 ${err.message}`);
      return false;
    }
  };

  return {
    recipes,
    setRecipes,
    isGenerating,
    isGeneratingMore,
    canLoadMore,
    error,
    setError,
    generate,
    saveRecipe,
  };
}