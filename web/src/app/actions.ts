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

  redirect("/");
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

  redirect("/");
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

  redirect("/");
}
