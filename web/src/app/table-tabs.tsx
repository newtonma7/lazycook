import Link from "next/link";

export type Tab = "account" | "ingredient" | "recipe" | "pantry" | "meal_plan" | "ai-recipe";

type Props = {
  active: Tab;
};

const tabs: { key: Tab; label: string }[] = [
  { key: "account", label: "Account" },
  { key: "ingredient", label: "Ingredients" },
  { key: "recipe", label: "Recipe" },
  { key: "pantry", label: "Pantry" },
  { key: "meal_plan", label: "Meal Plan" },
  { key: "ai-recipe", label: "AI Chef" },
];

export function TableTabs({ active }: Props) {
  const base =
    "inline-flex items-center rounded-t-md border border-b-0 px-4 py-2.5 font-body text-sm tracking-wide transition-all duration-200";
  const activeCls = "border-border bg-surface text-ink shadow-sm";
  const inactiveCls =
    "border-transparent bg-linen/60 text-ink-muted hover:bg-linen hover:text-ink";

  return (
    <nav className="flex flex-wrap gap-0.5 border-b border-border" aria-label="Data tables">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/dashboard?tab=${tab.key}`}
          className={`${base} ${active === tab.key ? activeCls : inactiveCls}`}
          aria-current={active === tab.key ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}