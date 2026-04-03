import Link from "next/link";

type Tab = "account" | "ingredient";

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
    </nav>
  );
}
