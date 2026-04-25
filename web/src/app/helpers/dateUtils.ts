// src/app/helpers/dateUtils.ts

/**
 * Calculate days left until the given expiration date.
 * Returns null if no date is provided.
 */
export function daysLeft(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const exp = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Return a CSS variable name for the urgency color based on expiration date.
 * - Fresh (7+ days) or no date → sage
 * - Soon (2–6 days) → butter
 * - Urgent (0–1 days) → terracotta
 */
export function urgencyColor(expiryDate: string | null): string {
  if (!expiryDate) return "var(--color-sage)";
  const days = daysLeft(expiryDate);
  if (days === null || days > 6) return "var(--color-sage)";
  if (days >= 2) return "var(--color-butter)";
  return "var(--color-terracotta)";
}

/**
 * Return a human‑readable urgency label, or null.
 */
export function urgencyLabel(expiryDate: string | null): string | null {
  if (!expiryDate) return null;
  const days = daysLeft(expiryDate);
  if (days === null || days > 6) return null;
  if (days >= 2) return "Use me soon! 🧡";
  return "Use me now! 🔥";
}