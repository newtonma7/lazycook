import Link from "next/link";

// 1. Added "ai-recipe" to the union and EXPORTED it
export type Tab = "account" | "ingredient" | "recipe" | "pantry" | "meal_plan" | "ai-recipe";

type Props = {
  active: Tab;
};

export function TableTabs({ active }: Props) {
  const base =
    "inline-flex items-center rounded-t-md border border-b-0 px-4 py-2.5 text-sm font-medium transition-colors";
  const activeCls = "border-zinc-200 bg-white text-zinc-900 shadow-sm";
  const inactiveCls =
    "border-transparent bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900";

  return (
    <nav className="flex gap-0.5 border-b border-zinc-200" aria-label="Data tables">
      <Link
        href="/?tab=account"
        className={`${base} ${active === "account" ? activeCls : inactiveCls}`}
        aria-current={active === "account" ? "page" : undefined}
      >
        Account
      </Link>
      <Link
        href="/?tab=ingredient"
        className={`${base} ${active === "ingredient" ? activeCls : inactiveCls}`}
        aria-current={active === "ingredient" ? "page" : undefined}
      >
        Ingredients
      </Link>
      <Link
        href="/?tab=recipe"
        className={`${base} ${active === "recipe" ? activeCls : inactiveCls}`}
        aria-current={active === "recipe" ? "page" : undefined}
      >
        Recipe
      </Link>
      <Link
        href="/?tab=pantry"
        className={`${base} ${active === "pantry" ? activeCls : inactiveCls}`}
        aria-current={active === "pantry" ? "page" : undefined}
      >
        Pantry
      </Link>
      <Link
        href="/?tab=meal_plan"
        className={`${base} ${active === "meal_plan" ? activeCls : inactiveCls}`}
        aria-current={active === "meal_plan" ? "page" : undefined}
      >
        Meal Plan
      </Link>
      <Link
        href="/?tab=ai-recipe"
        // 2. This comparison now works because "ai-recipe" is part of the Tab type
        className={`${base} ${active === "ai-recipe" ? activeCls : inactiveCls}`}
        aria-current={active === "ai-recipe" ? "page" : undefined}
      >
        AI Chef
      </Link>
    </nav>
  );
}