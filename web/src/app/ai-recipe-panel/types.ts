// components/ai-recipe-panel/types.ts
export interface Recipe {
  id: number;
  title: string;
  description: string;
  pantryIngredients: string[];
  additionalIngredients: string[];
  instructions: string[];
  prepTime: string;
}

export interface PantryOption {
  pantry_id: number;
  pantry_name: string;
}