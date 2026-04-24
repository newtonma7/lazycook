// src/app/recipes/components/RecipeDetail.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pen, Play, Globe, Lock, Trash2 } from "lucide-react";
import type { Recipe } from "../types";

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

type Props = {
  recipe: Recipe;
  isAdmin: boolean;
  isOwner: boolean;
  onBack: () => void;
  onStartCooking: (recipe: Recipe) => void;
  onSaveToMyKitchen: (recipe: Recipe) => Promise<void>;
  onToggleVisibility: (recipe: Recipe) => Promise<Recipe | undefined>;
  onSaveEdit: (draft: Recipe) => Promise<void>;
  onDelete: (recipeId: number) => Promise<void>;
  consumerId: number | null;
};

function formatInstructions(text: string | null) {
  return !text ? [] : text.split('\n').filter(s => s.trim().length > 0);
}

export function RecipeDetail({
  recipe,
  isAdmin,
  isOwner,
  onBack,
  onStartCooking,
  onSaveToMyKitchen,
  onToggleVisibility,
  onSaveEdit,
  onDelete,
  consumerId,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Recipe | null>(null);

  const displayRecipe = isEditing && draft ? draft : recipe;

  const startEditing = () => {
    setDraft(JSON.parse(JSON.stringify(recipe)));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(null);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!draft) return;
    await onSaveEdit(draft);
    setIsEditing(false);
  };

  const handleToggle = async () => {
    if (!consumerId) return;
    await onToggleVisibility(displayRecipe);
  };

  return (
    <motion.div key="detail" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-6">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Archive
        </button>

        <div className="flex items-center gap-2">
          {isOwner && !isEditing && (
            <>
              {/* ── Visibility Toggle ── */}
              <button
                onClick={handleToggle}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                style={{
                  backgroundColor: displayRecipe.is_public ? 'var(--color-sage-soft)' : 'var(--color-warm-surface-2)',
                  color: displayRecipe.is_public ? 'var(--color-sage)' : 'var(--color-ink-muted)',
                  borderColor: displayRecipe.is_public ? 'var(--color-sage)' : 'var(--color-border)',
                }}
              >
                {displayRecipe.is_public ? (
                  <>
                    <Globe className="w-3 h-3" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" /> Private
                  </>
                )}
              </button>

              {/* ── Edit ── */}
              <button onClick={startEditing} className="px-5 py-2 rounded-full border border-[var(--color-border)] text-[9px] font-bold uppercase tracking-widest hover:border-[var(--color-ink)] transition-all cursor-pointer">
                <Pen className="w-2.5 h-2.5 inline mr-1" /> Edit
              </button>

              {/* ── Start Cooking (primary) ── */}
              <button onClick={() => onStartCooking(displayRecipe)} className="px-6 py-2 rounded-full bg-[var(--color-ink)] text-[var(--color-cream)] text-[9px] font-bold uppercase tracking-widest hover:bg-[var(--color-tomato)] transition-all cursor-pointer flex items-center gap-1.5">
                <Play className="w-2.5 h-2.5 fill-current" /> Start Cooking
              </button>

              {/* ── Divider ── */}
              <span className="text-[var(--color-border-light)] mx-1 opacity-40 select-none">|</span>

              {/* ── Delete (danger, subtly placed) ── */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete this recipe? This cannot be undone.")) {
                    onDelete(displayRecipe.recipe_id);
                  }
                }}
                className="px-3 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] hover:text-[var(--color-tomato)] hover:bg-[var(--color-tomato)]/5 transition-all cursor-pointer"
                title="Delete recipe"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {isEditing && (
            <>
              <button onClick={cancelEditing} className="px-5 py-2 text-[9px] font-bold uppercase tracking-widest text-[var(--color-tomato)] cursor-pointer">Cancel</button>
              <button onClick={handleSaveEdit} className="px-6 py-2 rounded-full bg-[var(--color-sage)] text-white text-[9px] font-bold uppercase tracking-widest hover:shadow-md transition-all cursor-pointer">
                Save Changes
              </button>
            </>
          )}

          {!isOwner && consumerId && (
            <button
              onClick={() => onSaveToMyKitchen(displayRecipe)}
              className="px-6 py-2 rounded-full bg-[var(--color-ink)] text-[var(--color-cream)] text-[9px] font-bold uppercase tracking-widest hover:bg-[var(--color-sage)] transition-all cursor-pointer"
            >
              Save to My Kitchen
            </button>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-12 relative z-10 pb-8">
        {/* Ingredients panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--color-surface)] rounded-[2rem] p-6 border border-[var(--color-border)] relative overflow-hidden">
            <FloatingEmoticon emoji="🌿" x="80%" y="10%" delay={1} />
            <h4 className="font-[family-name:var(--font-display)] text-2xl italic text-[var(--color-tomato)] mb-6">
              mise en place
            </h4>
            <ul className="space-y-4">
              {displayRecipe.recipe_ingredient.map((ing, idx) => (
                <li key={idx} className="flex justify-between items-baseline border-b border-[var(--color-border-light)] pb-3 last:border-0 group">
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-[14px] text-[var(--color-ink)] capitalize">{ing.ingredient?.name}</span>
                    {isEditing ? (
                      <input
                        value={ing.preparation_note || ""}
                        onChange={(e) => {
                          if (!draft) return;
                          const newIngs = [...draft.recipe_ingredient];
                          newIngs[idx] = { ...newIngs[idx], preparation_note: e.target.value };
                          setDraft({ ...draft, recipe_ingredient: newIngs });
                        }}
                        className="text-[10px] italic bg-transparent border-b border-dashed border-[var(--color-border)] outline-none focus:border-[var(--color-tomato)] mt-0.5"
                      />
                    ) : (
                      <span className="text-[11px] text-[var(--color-ink-muted)] italic">{ing.preparation_note}</span>
                    )}
                  </div>
                  <span className="text-[12px] font-[family-name:var(--font-mono)] font-medium text-[var(--color-ink-muted)]">
                    {ing.required_quantity} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Title, description, instructions */}
        <div className="lg:col-span-8 space-y-8">
          <div>
            {isEditing ? (
              <input
                value={draft?.title}
                onChange={(e) => setDraft({ ...draft!, title: e.target.value })}
                className="text-4xl md:text-5xl font-[family-name:var(--font-display)] font-bold bg-transparent border-b border-[var(--color-border)] w-full outline-none focus:border-[var(--color-tomato)] mb-4 py-1.5"
              />
            ) : (
              <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-display)] font-bold tracking-tight mb-4 leading-tight">
                {displayRecipe.title}
              </h2>
            )}
            {isEditing ? (
              <textarea
                value={draft?.description || ""}
                onChange={(e) => setDraft({ ...draft!, description: e.target.value })}
                className="text-xl italic text-[var(--color-ink-muted)] bg-transparent border-b border-[var(--color-border)] w-full outline-none focus:border-[var(--color-tomato)] py-1.5 min-h-[80px]"
              />
            ) : (
              <p className="text-xl italic text-[var(--color-ink-light)] leading-relaxed">
                "{displayRecipe.description}"
              </p>
            )}
          </div>

          <div className="space-y-8 border-t border-[var(--color-border-light)] pt-8">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-ink-muted)] mb-6">
              Method
            </h4>
            {isEditing ? (
              <textarea
                value={draft?.instructions || ""}
                onChange={(e) => setDraft({ ...draft!, instructions: e.target.value })}
                className="w-full min-h-[300px] text-lg leading-relaxed bg-transparent border-l-2 border-dashed border-[var(--color-border)] pl-6 outline-none focus:border-[var(--color-tomato)]"
              />
            ) : (
              <div className="space-y-8">
                {formatInstructions(displayRecipe.instructions).map((step, i) => (
                  <div key={i} className="flex gap-6 group">
                    <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-border)] italic shrink-0 w-8 text-right group-hover:text-[var(--color-tomato)] transition-colors select-none">
                      {i + 1}.
                    </span>
                    <p className="text-lg leading-[1.7] text-[var(--color-ink)] pt-1.5 font-medium">
                      {step.replace(/^[\d\.\)]+\s*/, '')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}