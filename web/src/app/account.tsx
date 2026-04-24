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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* HERO — softened, human scale */}

      {currentAccount && (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* IDENTITY */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[2rem] border border-[var(--color-mist)] bg-[var(--color-warm-white)] p-8 overflow-hidden"
          >
            {/* subtle paper depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[var(--color-saffron)]/5" />

            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl text-[var(--color-charcoal)]">
                Kitchen Identity
              </h3>

              <span className="text-[10px] px-3 py-1 rounded-full bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)] font-semibold tracking-wide">
                {getRoleLabel(currentAccount.role)}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
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
                <div
                  key={i}
                  className="group relative rounded-xl border border-[var(--color-mist)] bg-[var(--color-cream)] p-4 transition-all hover:shadow-md"
                >
                  {/* micro accent stripe */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-[var(--color-saffron)] opacity-0 group-hover:opacity-100 transition" />

                  <div className="flex items-center gap-2 text-[var(--color-stone)] text-xs mb-1">
                    <f.icon className="w-3 h-3" />
                    {f.label}
                  </div>

                  <p className="text-sm font-medium text-[var(--color-charcoal)]">
                    {f.value}
                  </p>
                </div>
              ))}
            </div>

            {currentAccount.createdAt && (
              <div className="mt-6 pt-4 border-t border-[var(--color-mist)] text-xs text-[var(--color-stone)] flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Joined{" "}
                {new Date(currentAccount.createdAt).toLocaleDateString(
                  undefined,
                  { month: "short", year: "numeric" }
                )}
              </div>
            )}
          </motion.section>

          {/* FORM */}
          <div className="space-y-5">
            <div className="relative rounded-[2rem] border border-[var(--color-mist)] bg-[var(--color-warm-white)] p-6 overflow-hidden">
              {/* texture wash */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[var(--color-terracotta)]/5" />

              <h3 className="font-serif text-xl text-[var(--color-charcoal)] mb-4">
                Update Profile
              </h3>

              <form action={updateCurrentAccount} className="space-y-4">
                {[
                  {
                    name: "username",
                    value: currentAccount.username ?? "",
                    placeholder: "Username",
                  },
                  {
                    name: "email",
                    value: currentAccount.email,
                    placeholder: "Email",
                  },
                ].map((i, idx) => (
                  <input
                    key={idx}
                    name={i.name}
                    defaultValue={i.value}
                    placeholder={i.placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-cream)] border border-[var(--color-mist)] text-sm focus:border-[var(--color-terracotta)] outline-none transition"
                  />
                ))}

                <input
                  name="password"
                  type="password"
                  placeholder="New password"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-cream)] border border-[var(--color-mist)] text-sm focus:border-[var(--color-terracotta)] outline-none transition"
                />

                <button className="w-full py-3 rounded-xl bg-[var(--color-terracotta)] text-white text-xs tracking-widest font-semibold hover:shadow-md hover:-translate-y-[1px] transition">
                  Save Changes
                </button>
              </form>
            </div>

            <div className="flex gap-3">
              <form action={signOutAccount} className="flex-1">
                <button className="w-full py-2.5 rounded-xl bg-[var(--color-charcoal)] text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>

              <form action={deleteCurrentAccount}>
                <button className="px-4 rounded-xl bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)] hover:bg-[var(--color-terracotta)] hover:text-white transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}