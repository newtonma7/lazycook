"use client";

import { useEffect } from "react";
import type { NodeChild } from "./node-children";

interface Props {
  nodeLabel: string;
  nodeColor: string;
  children: NodeChild[];
  onClose: () => void;
  onSelectChild: (child: NodeChild) => void;
}

export function NodeSidebar({ nodeLabel, nodeColor, children, onClose, onSelectChild }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink/8"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className="fixed top-0 right-0 z-50 flex h-full w-80 flex-col border-l border-border bg-cream/95 backdrop-blur-md shadow-xl shadow-ink/5 animate-slide-in-right">
        {/* Color accent bar */}
        <div className="h-1 w-full" style={{ background: nodeColor }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="font-display text-2xl tracking-tight" style={{ color: nodeColor }}>
            {nodeLabel}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border-light text-ink-muted transition-all duration-200 hover:bg-ink hover:text-cream hover:border-ink"
            aria-label="Close panel"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-border-light" />

        {/* Children list */}
        <ul className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {children.map((child) => (
            <li key={child.id}>
              <button
                onClick={() => onSelectChild(child)}
                className="w-full text-left rounded-xl border border-border-light bg-surface/60 px-4 py-3.5 transition-all duration-200 hover:bg-linen hover:border-border hover:shadow-sm group"
              >
                <span className="font-body text-sm font-medium text-ink group-hover:text-ink tracking-wide">
                  {child.label}
                </span>
                {child.detail && (
                  <span className="mt-0.5 block font-body text-xs text-ink-muted">
                    {child.detail}
                  </span>
                )}
              </button>
            </li>
          ))}
          {children.length === 0 && (
            <li className="py-8 text-center font-body text-sm text-ink-muted">
              No items yet
            </li>
          )}
        </ul>

        {/* Footer hint */}
        <div className="border-t border-border-light px-6 py-3">
          <p className="font-body text-[0.7rem] text-ink-muted tracking-wide text-center">
            Press <kbd className="rounded border border-border-light px-1.5 py-0.5 font-mono text-[0.65rem]">Esc</kbd> to close
          </p>
        </div>
      </aside>
    </>
  );
}
