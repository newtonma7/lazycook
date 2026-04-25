// components/recipes/components/GalleryHeader.tsx
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  isAdmin: boolean;
  viewMode: "personal" | "public";
  onViewModeChange: (mode: "personal" | "public") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: "all" | "quick" | "simple";
  onFilterChange: (f: "all" | "quick" | "simple") => void;
};

export function GalleryHeader({
  isAdmin,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: Props) {
  return (
    <>
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--color-border-light)] pb-6 relative">
        <div className="relative flex items-center gap-2">
          {/* decorative floating emoji (optional) */}
          <div>
            <span className="font-[family-name:var(--font-display)] text-xl italic text-[var(--color-tomato)] block mb-[-4px] ml-0.5">
              the kitchen archive
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold tracking-tight">
              Recipe Gallery
            </h1>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-6 items-center text-[10px] font-bold uppercase tracking-[0.2em]">
          {!isAdmin && (
            <button
              onClick={() => onViewModeChange("personal")}
              className={cn(
                "transition-all cursor-pointer",
                viewMode === "personal"
                  ? "text-[var(--color-tomato)] border-b-2 border-[var(--color-tomato)] pb-1"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              )}
            >
              My Kitchen
            </button>
          )}
          <button
            onClick={() => onViewModeChange("public")}
            className={cn(
              "transition-all cursor-pointer",
              viewMode === "public"
                ? "text-[var(--color-tomato)] border-b-2 border-[var(--color-tomato)] pb-1"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            )}
          >
            {isAdmin ? "All Recipes" : "Community"}
          </button>
        </div>
      </header>

      {/* Search & Filter bar */}
      <div className="mb-8 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-0 bottom-2.5 w-3.5 h-3.5 text-[var(--color-ink-muted)] group-focus-within:text-[var(--color-tomato)] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search recipes..."
            className="w-full bg-transparent border-b border-[var(--color-border-light)] pl-6 pb-1.5 text-base focus:border-[var(--color-tomato)] outline-none transition-all placeholder:text-[var(--color-ink-muted)]/40 italic"
          />
        </div>
        <div className="flex gap-3 scrollbar-none overflow-x-auto w-full md:w-auto pb-1">
          {(["all", "quick", "simple"] as const).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all cursor-pointer whitespace-nowrap",
                activeFilter === f
                  ? "bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]"
                  : "border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink)]"
              )}
            >
              {f === "all" ? "All" : f === "quick" ? "< 30 Min" : "5 Ingredients"}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}