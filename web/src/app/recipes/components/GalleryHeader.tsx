// components/recipes/components/GalleryHeader.tsx
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { BasilPeeking } from "../../components/mascot/BasilComponents";

type Props = {
  isAdmin: boolean;
  viewMode: "personal" | "public";
  onViewModeChange: (mode: "personal" | "public") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: "all" | "quick" | "simple";
  onFilterChange: (f: "all" | "quick" | "simple") => void;
};

const FloatingEmoticon = ({ emoji, delay = 0, x = "0%", y = "0%" }: any) => (
  <motion.span
    initial={{ y: 0 }}
    animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
    className="absolute text-xl pointer-events-none select-none opacity-30 z-0"
    style={{ left: x, top: y }}
  >
    {emoji}
  </motion.span>
);

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
<header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
  {/* Title section */}
  <div className="relative flex items-center gap-2">
    <FloatingEmoticon emoji="🍎" x="-40px" y="-15px" delay={0} />
    <div>
      <span className="font-[family-name:var(--font-display)] text-xl italic text-[var(--color-tomato)] block mb-[-4px] ml-0.5">
        the kitchen archive
      </span>
      <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold tracking-tight">
        Recipe Gallery
      </h1>
    </div>
  </div>

  {/* Tabs */}
  <div className="flex gap-6 items-center text-[10px] font-bold uppercase tracking-[0.2em]">
    {/* ... unchanged ... */}
  </div>

  {/* Basil peeking over the border line — anchored to the bottom */}
  <div className="absolute top-full left-0 w-full flex justify-center pointer-events-none">
    <div className="w-[100px] -mt-[30px]">
      <BasilPeeking size={100} />
    </div>
  </div>

  {/* Border line stays visible behind Basil */}
  <div className="absolute bottom-0 left-0 w-full h-px bg-[var(--color-border-light)] -z-10" />
    </header>

      {/* Search and filter bar  */}
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