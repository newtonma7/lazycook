// components/EnrichButton.tsx
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { BasilThinking } from "../../components/mascot/BasilComponents";

type Props = {
  onEnrich: () => Promise<boolean>;
};

export function EnrichButton({ onEnrich }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    await onEnrich();
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="p-1.5 rounded-lg hover:bg-[var(--color-butter-soft)] text-[var(--color-butter)] transition-colors"
      title="Auto‑fill missing info"
    >
      {loading ? (
        <BasilThinking size={18} />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
    </button>
  );
}