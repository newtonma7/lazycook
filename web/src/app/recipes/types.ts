// src/app/recipes/types.ts
export type IngredientOption = { ingredient_id: number; name: string };

export type Ingredient = { name: string };

export type RecipeIngredient = {
  ingredient_id: number;
  required_quantity: string | null;
  unit: string | null;
  preparation_note: string | null;
  is_optional: boolean;
  ingredient: Ingredient | null;
};

export type Recipe = {
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

export type ConsumerInfo = {
  consumer_id: number;
  email: string;
  username: string | null;
};