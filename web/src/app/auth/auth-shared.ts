// src/app/auth-shared.ts

export type AccountRole = "consumer" | "admin";

/**
 * Maps raw roles to user-friendly "Atelier" labels.
 * Safe for both Client and Server components.
 */
export function getRoleLabel(role: AccountRole | string): string {
    if (role === "admin") return "Head Chef (Admin)";
    if (role === "consumer") return "Home Cook";
    return "Guest";
}