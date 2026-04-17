export interface NodeChild {
  id: string;
  label: string;
  detail?: string;
}

export const NODE_CHILDREN: Record<string, NodeChild[]> = {
  pantry: [
    { id: "pantry-1", label: "Main Fridge", detail: "12 items" },
    { id: "pantry-2", label: "Spice Rack", detail: "8 items" },
    { id: "pantry-3", label: "Freezer", detail: "4 items" },
  ],
  recipes: [
    { id: "recipe-1", label: "Pasta Aglio e Olio", detail: "25 min" },
    { id: "recipe-2", label: "Thai Green Curry", detail: "40 min" },
  ],
  mealplan: [
    { id: "plan-1", label: "This Week", detail: "5 meals" },
    { id: "plan-2", label: "Next Week", detail: "3 meals" },
  ],
};
