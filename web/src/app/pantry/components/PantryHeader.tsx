// components/PantryHeader.tsx
import { BasilEmpty } from "../../components/mascot/BasilComponents";
import { Plus } from "lucide-react";

type Props = {
  isAdmin: boolean;
  pantryCount: number;
  selectedName?: string;
  onNewPantry: () => void;
};

export function PantryHeader({ isAdmin, pantryCount, selectedName, onNewPantry }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <BasilEmpty size={60} />
        <div>
          <h1 className="font-[family-name:var(--font-handwritten)] text-4xl text-[var(--color-ink)]">
            {isAdmin ? "All Pantries 👥" : selectedName ? selectedName : "Your Pantry 🥕"}
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            {isAdmin ? "Manage every kitchen." : "Keep track of what's in your kitchen."}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!isAdmin && pantryCount === 1 && (
          <button onClick={onNewPantry}
            className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-border-light)] px-3 py-1.5 rounded-full transition-colors"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" /> Create another pantry
          </button>
        )}
      </div>
    </div>
  );
}