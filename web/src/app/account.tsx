"use client";

import { useState } from "react";
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
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/animation";
import {
  deleteCurrentAccount,
  signOutAccount,
  updateCurrentAccount,
  signInAccount, // Ensure this matches your actions.ts export!
  signUpAccount, // Ensure this matches your actions.ts export!
} from "./actions";
import { getRoleLabel } from "./auth/auth-shared";

type Props = {
  message?: string;
  error?: string;
  currentAccount: any;
};

export function AccountPanel({ message, error, currentAccount }: Props) {
  const [isLogin, setIsLogin] = useState(true);

  // --- AUTHENTICATION STATE (LOGGED OUT) ---
  if (!currentAccount) {
    return (
      <div className="max-w-md mx-auto space-y-6 font-[family-name:var(--font-body)] animate-in fade-in duration-500 pt-8 pb-16">
        
        {/* Notifications */}
        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="rounded-[1.5rem] border border-[var(--color-tomato)]/30 bg-[var(--color-tomato)]/10 p-4 flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-[var(--color-tomato)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-tomato)] font-medium leading-relaxed">{error}</p>
            </motion.div>
          )}
          {message && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="rounded-[1.5rem] border border-[var(--color-sage)]/30 bg-[var(--color-sage)]/10 p-4 flex items-start gap-3 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-sage)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-sage)] font-medium leading-relaxed">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Card */}
        <motion.div 
          layout
          transition={spring}
          className="relative rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 md:p-10 shadow-[0_8px_30px_rgba(44,36,32,0.04)] overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--color-tomato)]" />

          <div className="mb-8">
            <span className="font-[family-name:var(--font-handwritten)] text-3xl text-[var(--color-tomato)] mb-1 block">
              {isLogin ? "welcome back" : "join the kitchen"}
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-5xl font-bold text-[var(--color-ink)] tracking-tight">
              {isLogin ? "Sign In" : "Sign Up"}
            </h2>
          </div>

          <form action={isLogin ? signInAccount : signUpAccount} className="space-y-4 relative z-10">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }}
                  transition={spring}
                  className="relative group"
                >
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-ink-muted)] group-focus-within:text-[var(--color-tomato)] transition-colors" />
                  <input
                    name="username"
                    type="text"
                    placeholder="Chef Handle"
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--color-cream)] border border-[var(--color-border)] text-[15px] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/60 focus:border-[var(--color-tomato)] focus:bg-[var(--color-cream)] outline-none transition-all shadow-inner"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-ink-muted)] group-focus-within:text-[var(--color-tomato)] transition-colors" />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                required
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--color-cream)] border border-[var(--color-border)] text-[15px] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/60 focus:border-[var(--color-tomato)] focus:bg-[var(--color-cream)] outline-none transition-all shadow-inner"
              />
            </div>

            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-ink-muted)] group-focus-within:text-[var(--color-tomato)] transition-colors" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--color-cream)] border border-[var(--color-border)] text-[15px] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/60 focus:border-[var(--color-tomato)] focus:bg-[var(--color-cream)] outline-none transition-all shadow-inner"
              />
            </div>

            <motion.button 
              whileTap={{ scale: 0.97 }}
              transition={spring}
              className="w-full mt-4 py-4 rounded-xl bg-[var(--color-tomato)] text-white text-[13px] font-bold uppercase tracking-widest hover:bg-[#a83b0c] hover:shadow-[0_8px_20px_rgba(193,68,14,0.25)] transition-all cursor-pointer"
            >
              {isLogin ? "Enter Kitchen" : "Create Account"}
            </motion.button>
          </form>

          <div className="mt-8 text-center border-t border-[var(--color-border-light)] pt-6">
            <p className="text-sm text-[var(--color-ink-muted)]">
              {isLogin ? "Don't have an account?" : "Already a member?"}
            </p>
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="mt-2 text-sm font-bold text-[var(--color-ink)] hover:text-[var(--color-tomato)] transition-colors cursor-pointer"
            >
              {isLogin ? "Create one now" : "Sign in instead"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD STATE (LOGGED IN) ---
  return (
    <div className="max-w-6xl mx-auto space-y-8 font-[family-name:var(--font-body)] animate-in fade-in duration-500">
      
      {/* Notifications */}
      <AnimatePresence mode="popLayout">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="rounded-[1.5rem] border border-[var(--color-tomato)]/30 bg-[var(--color-tomato)]/10 p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-[var(--color-tomato)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--color-tomato)] font-medium leading-relaxed">{error}</p>
          </motion.div>
        )}
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="rounded-[1.5rem] border border-[var(--color-sage)]/30 bg-[var(--color-sage)]/10 p-4 flex items-start gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-[var(--color-sage)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--color-sage)] font-medium leading-relaxed">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* IDENTITY */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="relative rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 md:p-10 overflow-hidden shadow-[0_4px_20px_rgba(44,36,32,0.02)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[var(--color-peach)]/5 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between mb-10">
            <div>
              <span className="font-[family-name:var(--font-handwritten)] text-[28px] text-[var(--color-tomato)] block mb-0 leading-none">
                the chef's details
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-5xl text-[var(--color-ink)] tracking-tight font-bold">
                Identity
              </h3>
            </div>

            <span className="text-[10px] px-3 py-1.5 rounded-md bg-[var(--color-tomato)]/10 text-[var(--color-tomato)] font-bold tracking-widest uppercase border border-[var(--color-tomato)]/20 mt-2">
              {getRoleLabel(currentAccount.role)}
            </span>
          </div>

          <div className="relative z-10 grid sm:grid-cols-2 gap-5">
            {[
              { label: "Email", value: currentAccount.email, icon: Mail },
              { label: "Handle", value: currentAccount.username ?? "Not set", icon: User },
              { label: "ID", value: `#${currentAccount.userId}`, icon: Fingerprint },
              { label: "Status", value: currentAccount.status ?? "Active", icon: ShieldCheck },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2, backgroundColor: "var(--color-linen)" }}
                transition={spring}
                className="group relative rounded-[1.5rem] border border-[var(--color-border-light)] bg-[var(--color-cream)] p-6 overflow-hidden transition-colors"
              >
                <div className="absolute left-0 top-0 h-full w-1.5 bg-[var(--color-turmeric)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-center gap-2 text-[var(--color-ink-muted)] text-[11px] font-bold uppercase tracking-widest mb-2">
                  <f.icon className="w-4 h-4 text-[var(--color-tomato)]/80" />
                  {f.label}
                </div>
                <p className="text-lg text-[var(--color-ink)] font-medium truncate">
                  {f.value}
                </p>
              </motion.div>
            ))}
          </div>

          {currentAccount.createdAt && (
            <div className="relative z-10 mt-10 pt-6 border-t border-[var(--color-border-light)] text-[13px] text-[var(--color-ink-muted)] flex items-center gap-2 font-[family-name:var(--font-mono)]">
              <Calendar className="w-4 h-4" />
              Joined{" "}
              <span className="font-bold text-[var(--color-ink)]">
                {new Date(currentAccount.createdAt).toLocaleDateString(
                  undefined,
                  { month: "short", year: "numeric", day: "numeric" }
                )}
              </span>
            </div>
          )}
        </motion.section>

        {/* FORM */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="relative rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 md:p-10 overflow-hidden shadow-[0_4px_20px_rgba(44,36,32,0.02)]"
          >
            <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)] mb-8">
              Update Profile
            </h3>

            <form action={updateCurrentAccount} className="space-y-5">
              {[
                { name: "username", value: currentAccount.username ?? "", placeholder: "Username", icon: User },
                { name: "email", value: currentAccount.email, placeholder: "Email address", icon: Mail },
              ].map((i, idx) => (
                <div key={idx} className="relative group">
                  <i.icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-ink-muted)] group-focus-within:text-[var(--color-tomato)] transition-colors" />
                  <input
                    name={i.name}
                    defaultValue={i.value}
                    placeholder={i.placeholder}
                    className="w-full pl-12 pr-5 py-4 rounded-xl bg-transparent border border-[var(--color-border)] text-[15px] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:border-[var(--color-tomato)] focus:bg-[var(--color-cream)] outline-none transition-all"
                  />
                </div>
              ))}

              <div className="relative group">
                <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-ink-muted)] group-focus-within:text-[var(--color-tomato)] transition-colors" />
                <input
                  name="password"
                  type="password"
                  placeholder="New password"
                  className="w-full pl-12 pr-5 py-4 rounded-xl bg-transparent border border-[var(--color-border)] text-[15px] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:border-[var(--color-tomato)] focus:bg-[var(--color-cream)] outline-none transition-all"
                />
              </div>

              <motion.button 
                whileTap={{ scale: 0.97 }}
                transition={spring}
                className="w-full mt-4 py-4 rounded-xl bg-[var(--color-tomato)] text-white text-[11px] font-bold uppercase tracking-widest hover:opacity-90 hover:shadow-[0_8px_20px_rgba(193,68,14,0.15)] transition-all cursor-pointer"
              >
                Save Changes
              </motion.button>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            className="flex gap-4"
          >
            <form action={signOutAccount} className="flex-1">
              <motion.button 
                whileTap={{ scale: 0.97 }}
                transition={spring}
                className="w-full py-4 rounded-xl bg-transparent border border-[var(--color-border)] text-[var(--color-ink-light)] text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--color-border-light)] hover:text-[var(--color-ink)] transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </motion.button>
            </form>

            <form action={deleteCurrentAccount}>
              <motion.button 
                whileTap={{ scale: 0.97 }}
                transition={spring}
                className="h-full px-6 rounded-xl bg-transparent border border-[var(--color-border)] text-[var(--color-ink-muted)] flex items-center justify-center hover:bg-[var(--color-tomato)]/10 hover:border-[var(--color-tomato)]/30 hover:text-[var(--color-tomato)] transition-all cursor-pointer"
                title="Delete Account"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}