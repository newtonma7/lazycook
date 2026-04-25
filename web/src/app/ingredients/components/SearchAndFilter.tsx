import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  search: string;
  onSearchChange: (val: string) => void;
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
};

export function SearchAndFilter({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search row */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-muted)]" />
        <input
          type="text"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/50 focus:border-[var(--color-sage)] outline-none transition-all"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
            !selectedCategory
              ? "bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]"
              : "bg-[var(--color-cream)] text-[var(--color-ink-muted)] border-[var(--color-border)] hover:border-[var(--color-ink)]"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
              selectedCategory === cat
                ? "bg-[var(--color-sage)] text-white border-[var(--color-sage)]"
                : "bg-[var(--color-cream)] text-[var(--color-ink-muted)] border-[var(--color-border)] hover:border-[var(--color-ink)]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}