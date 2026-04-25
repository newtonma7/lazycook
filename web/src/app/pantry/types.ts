export type PantryRow = {
  pantry_id: number;
  consumer_id: number | null;
  pantry_name: string;
};

export type PantryItemRow = {
  pantry_item_id: number;
  pantry_id: number;
  ingredient_id: number;
  purchase_date: string | null;
  quantity_on_hand: string | number | null;
  unit: string | null;
  expiration_date: string | null;
};

export type IngredientOption = {
  ingredient_id: number;
  name: string;
};

export type ConsumerInfo = {
  consumer_id: number;
  email: string;
  username: string | null;
};