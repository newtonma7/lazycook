"use server";

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

function getSupabaseEnv() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^"|"$/g, "");
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^"|"$/g, "");
  return { supabaseUrl, supabaseAnonKey };
}

export async function addConsumer(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!username || !email || !password) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { error } = await supabase.from("consumer").insert([
    {
      username,
      email,
      password_hash: password,
      status: "active",
    },
  ]);

  if (error) {
    console.error("Insertion Error:", error.message);
    return;
  }

  redirect("/?tab=consumer");
}

export async function deleteConsumer(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const raw = formData.get("consumer_id");
  const consumer_id = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isFinite(consumer_id)) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from("consumer").delete().eq("consumer_id", consumer_id);

  if (error) {
    console.error("Delete Error:", error.message);
    return;
  }

  redirect("/?tab=consumer");
}

export async function updateConsumer(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const raw = formData.get("consumer_id");
  const consumer_id = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
  const username = (formData.get("username") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const status = formData.get("status") as string;

  if (!Number.isFinite(consumer_id) || !username || !email || !status) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase
    .from("consumer")
    .update({
      username,
      email,
      password_hash: password ?? "",
      status,
    })
    .eq("consumer_id", consumer_id);

  if (error) {
    console.error("Update Error:", error.message);
    return;
  }

  redirect("/?tab=consumer");
}

function parseAllergen(raw: FormDataEntryValue | null): boolean {
  const s = typeof raw === "string" ? raw : "";
  return s === "true" || s === "on";
}

export async function addIngredient(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const default_unit = (formData.get("default_unit") as string)?.trim();
  if (!name || !category || !default_unit) return;

  const is_allergen = parseAllergen(formData.get("is_allergen"));

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from("ingredient").insert([
    {
      name,
      category,
      default_unit,
      is_allergen,
    },
  ]);

  if (error) {
    console.error("Ingredient insert error:", error.message);
    return;
  }

  redirect("/?tab=ingredient");
}

export async function updateIngredient(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const raw = formData.get("ingredient_id");
  const ingredient_id = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const default_unit = (formData.get("default_unit") as string)?.trim();
  if (!Number.isFinite(ingredient_id) || !name || !category || !default_unit) return;

  const is_allergen = parseAllergen(formData.get("is_allergen"));

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase
    .from("ingredient")
    .update({
      name,
      category,
      default_unit,
      is_allergen,
    })
    .eq("ingredient_id", ingredient_id);

  if (error) {
    console.error("Ingredient update error:", error.message);
    return;
  }

  redirect("/?tab=ingredient");
}

export async function deleteIngredient(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const raw = formData.get("ingredient_id");
  const ingredient_id = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isFinite(ingredient_id)) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from("ingredient").delete().eq("ingredient_id", ingredient_id);

  if (error) {
    console.error("Ingredient delete error:", error.message);
    return;
  }

  redirect("/?tab=ingredient");
}
