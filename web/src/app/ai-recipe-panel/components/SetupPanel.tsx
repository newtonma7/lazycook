// components/SetupPanel.tsx
import { motion } from "framer-motion";
import { RefreshCw, Server, Database } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  show: boolean;
  ollamaStatus: "checking" | "connected" | "disconnected";
  models: any[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onRefresh: () => void;
};

export function SetupPanel({ show, ollamaStatus, models, selectedModel, onSelectModel, onRefresh }: Props) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="overflow-hidden"
    >
      <div className="rounded-3xl border border-[var(--color-warm-border)] bg-[var(--color-warm-surface)] p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-start justify-between border-b border-[var(--color-warm-border-soft)] pb-6">
          <div>
            <h2 className="font-[family-name:var(--font-handwritten)] text-2xl text-[var(--color-text-primary)]">kitchen brain ✨</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Manage Basil’s local AI connection.</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={ollamaStatus === "checking"}
            className="flex items-center gap-2 rounded-full border border-[var(--color-warm-border-soft)] bg-[var(--color-warm-surface-2)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-warm-border)] disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", ollamaStatus === "checking" && "animate-spin")} /> Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
              <Server className="h-4 w-4 text-[var(--color-sage)]" /> Connection Status
            </label>
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-4",
                ollamaStatus === "connected"
                  ? "border-[var(--color-sage)]/20 bg-[var(--color-sage-soft)]"
                  : "border-[var(--color-terracotta)]/20 bg-[var(--color-terracotta-soft)]"
              )}
            >
              <div className={cn("h-3 w-3 rounded-full", ollamaStatus === "connected" ? "bg-[var(--color-sage)]" : "bg-[var(--color-terracotta)]")} />
              <div>
                <p className={cn("text-sm font-bold", ollamaStatus === "connected" ? "text-[var(--color-sage)]" : "text-[var(--color-terracotta)]")}>
                  {ollamaStatus === "connected" ? "Connected to Local Ollama" : "Ollama is not responding"}
                </p>
                {ollamaStatus !== "connected" && (
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)] opacity-80">
                    Run <code className="bg-white/50 px-1 rounded">ollama serve</code> in your terminal.
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
              <Database className="h-4 w-4 text-[var(--color-butter)]" /> Select Model
            </label>
            {models.length > 0 ? (
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-warm-border)] bg-[var(--color-warm-surface-2)] p-4 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-colors hover:border-[var(--color-sage)] focus:border-[var(--color-sage)]"
              >
                {models.map((m: any) => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-[var(--color-warm-border)] bg-[var(--color-warm-surface-2)] p-4">
                <p className="text-xs font-medium text-[var(--color-text-ghost)]">No models found. Try pulling one via terminal.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}