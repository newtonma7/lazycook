"use client";

import Link from "next/link";
import {
  User,
  Mail,
  ShieldCheck,
  Trash2,
  LogOut,
  KeyRound,
  Fingerprint,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/animation";
import {
  deleteCurrentAccount,
  signOutAccount,
  updateCurrentAccount,
} from "./actions";
import { getRoleLabel } from "./auth/auth-shared";

type Props = {
  message?: string;
  error?: string;
  currentAccount: any;
};

export function AccountPanel({ currentAccount }: Props) {
  return (
    <div className="max-w-6xl mx-auto space-y-8 font-[family-name:var(--font-body)]">
      {currentAccount && (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* IDENTITY */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="relative rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 overflow-hidden shadow-sm"
          >
            {/* subtle ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[var(--color-peach)]/5 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between mb-8">
              <div>
                <span className="text-[15px] italic text-[var(--color-ink-muted)] block mb-1">
                  the chef's details
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)] tracking-tight">
                  Kitchen Identity
                </h3>
              </div>

              <span className="text-[11px] px-3 py-1.5 rounded-full bg-[var(--color-tomato)]/10 text-[var(--color-tomato)] font-bold tracking-wide uppercase">
                {getRoleLabel(currentAccount.role)}
              </span>
            </div>

            <div className="relative z-10 grid sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Email",
                  value: currentAccount.email,
                  icon: Mail,
                },
                {
                  label: "Handle",
                  value: currentAccount.username ?? "Not set",
                  icon: User,
                },
                {
                  label: "ID",
                  value: `#${currentAccount.userId}`,
                  icon: Fingerprint,
                },
                {
                  label: "Status",
                  value: currentAccount.status ?? "Active",
                  icon: ShieldCheck,
                },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -2, backgroundColor: "var(--color-linen)" }}
                  transition={spring}
                  className="group relative rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-cream)] p-5 overflow-hidden transition-colors"
                >
                  {/* macro accent stripe */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-[var(--color-turmeric)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-center gap-2 text-[var(--color-ink-muted)] text-xs mb-2">
                    <f.icon className="w-4 h-4 text-[var(--color-tomato)]/80" />
                    {f.label}
                  </div>

                  <p className="text-base text-[var(--color-ink)] font-medium">
                    {f.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {currentAccount.createdAt && (
              <div className="relative z-10 mt-8 pt-5 border-t border-[var(--color-border-light)] text-xs text-[var(--color-ink-muted)] flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined{" "}
                <span className="font-medium">
                  {new Date(currentAccount.createdAt).toLocaleDateString(
                    undefined,
                    { month: "short", year: "numeric", day: "numeric" }
                  )}
                </span>
              </div>
            )}
          </motion.section>

          {/* FORM */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.1 }}
              className="relative rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 overflow-hidden shadow-sm"
            >
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)] mb-6">
                Update Profile
              </h3>

              <form action={updateCurrentAccount} className="space-y-4">
                {[
                  {
                    name: "username",
                    value: currentAccount.username ?? "",
                    placeholder: "Username",
                    icon: User,
                  },
                  {
                    name: "email",
                    value: currentAccount.email,
                    placeholder: "Email address",
                    icon: Mail,
                  },
                ].map((i, idx) => (
                  <div key={idx} className="relative group">
                    <i.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)] group-focus-within:text-[var(--color-tomato)] transition-colors" />
                    <input
                      name={i.name}
                      defaultValue={i.value}
                      placeholder={i.placeholder}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-transparent border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:border-[var(--color-tomato)] focus:bg-[var(--color-cream)] outline-none transition-all"
                    />
                  </div>
                ))}

                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)] group-focus-within:text-[var(--color-tomato)] transition-colors" />
                  <input
                    name="password"
                    type="password"
                    placeholder="New password"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-transparent border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:border-[var(--color-tomato)] focus:bg-[var(--color-cream)] outline-none transition-all"
                  />
                </div>

                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                  className="w-full mt-2 py-3.5 rounded-xl bg-[var(--color-tomato)] text-white text-sm font-medium hover:opacity-90 hover:shadow-[0_4px_12px_rgba(193,68,14,0.15)] transition-all cursor-pointer"
                >
                  Save Changes
                </motion.button>
              </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.15 }}
              className="flex gap-3"
            >
              <form action={signOutAccount} className="flex-1">
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                  className="w-full py-3.5 rounded-xl bg-transparent border border-[var(--color-border)] text-[var(--color-ink-light)] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-border-light)] hover:text-[var(--color-ink)] transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </motion.button>
              </form>

              <form action={deleteCurrentAccount}>
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                  className="h-full px-5 rounded-xl bg-transparent border border-[var(--color-border)] text-[var(--color-ink-muted)] flex items-center justify-center hover:bg-[var(--color-tomato)]/10 hover:border-[var(--color-tomato)]/30 hover:text-[var(--color-tomato)] transition-all cursor-pointer"
                  title="Delete Account"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}