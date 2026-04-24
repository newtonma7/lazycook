// components/dashboard/DashboardNav.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  User, 
  ChefHat, 
  Layout, 
  Refrigerator, 
  Sparkles, 
  Carrot 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NavItem {
  label: string;
  value: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Account", value: "account", icon: User },
  { label: "Pantry", value: "pantry", icon: Refrigerator },
  { label: "Recipes", value: "recipe", icon: ChefHat },
  { label: "Meal Plan", value: "meal_plan", icon: Layout },
  { label: "Ingredients", value: "ingredient", icon: Carrot, adminOnly: true },
  { label: "AI Chef", value: "ai-recipe", icon: Sparkles }
];

interface DashboardNavProps {
  isAdmin: boolean;
  activeTab?: string;
}

export function DashboardNav({ isAdmin, activeTab: propActiveTab }: DashboardNavProps) {
  const searchParams = useSearchParams();
  
  // Priority: Prop value (from Server Component) > URL Search Param > Default
  const activeTab = propActiveTab || searchParams.get("tab") || "account";

  return (
    <ul className="flex items-center gap-1 bg-mist/30 p-1 rounded-full border border-mist relative">
      {NAV_ITEMS.map((item) => {
        if (item.adminOnly && !isAdmin) return null;

        const isActive = activeTab === item.value;
        const Icon = item.icon;

        return (
          <li key={item.value} className="relative">
            <Link
              href={`/dashboard?tab=${item.value}`}
              className={cn(
                "relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300",
                isActive 
                  ? "text-terracotta" 
                  : "text-stone hover:text-charcoal"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-terracotta" : "text-stone")} />
              <span>{item.label}</span>
            </Link>

            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-warm-white rounded-full shadow-sm ring-1 ring-ink z-0"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}