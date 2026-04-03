"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import {
  buildInsertPayload,
  clearAccountSession,
  createSupabaseBrowserKeyClient,
  findAccountByEmail,
  findAccountByUsername,
  getRoleConfig,
  getSupabaseEnv,
  hashPassword,
  normalizeEmail,
  normalizePassword,
  normalizeUsername,
  readAccountSession,
  setAccountSession,
  verifyPassword,
  type AccountRole,
} from "./account-auth";
import { redirect, unstable_rethrow } from "next/navigation";

function buildAccountRedirect(params: Record<string, string>) {
  const search = new URLSearchParams({ tab: "account", ...params });
  return `/?${search.toString()}`;
}

function parseRole(raw: FormDataEntryValue | null): AccountRole | null {
  return raw === "admin" || raw === "consumer" ? raw : null;
}

function getAccountMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

async function requireSession() {
  const session = await readAccountSession();

  if (!session) {
    redirect(buildAccountRedirect({ error: "Please sign in first." }));
  }

  return session;
}

export async function signUpAccount(formData: FormData) {
  const role = parseRole(formData.get("role"));
  const username = normalizeUsername(formData.get("username"));
  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));

  if (!role || !username || !email || password.length < 8) {
    redirect(buildAccountRedirect({ error: "Use a username, a valid email, and a password with at least 8 characters." }));
  }

  try {
    const [existingEmailAccount, existingUsernameAccount] = await Promise.all([
      findAccountByEmail(role, email),
      findAccountByUsername(role, username),
    ]);

    if (existingEmailAccount) {
      redirect(buildAccountRedirect({ error: `${getRoleConfig(role).label} account already exists for that email.` }));
    }

    if (existingUsernameAccount) {
      redirect(buildAccountRedirect({ error: `${getRoleConfig(role).label} username is already taken.` }));
    }

    const supabase = createSupabaseBrowserKeyClient();
    const passwordHash = hashPassword(password);
    const insertPayload = await buildInsertPayload(role, username, email, passwordHash);
    const config = getRoleConfig(role);

    const { data, error } = await supabase
      .from(config.table)
      .insert([insertPayload])
      .select(`email, username, ${config.idColumn}`)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to create account.");
    }

    const insertedRow = data as Record<string, unknown>;
    const userId = insertedRow[config.idColumn];

    if (typeof userId !== "number") {
      throw new Error("Account was created, but the returned id was invalid.");
    }

    await setAccountSession({ role, userId, email });
    revalidatePath("/");
    redirect(buildAccountRedirect({ message: `${getRoleConfig(role).label} account created.` }));
  } catch (error) {
    unstable_rethrow(error);
    redirect(buildAccountRedirect({ error: getAccountMessage(error) }));
  }
}

export async function signInAccount(formData: FormData) {
  const role = parseRole(formData.get("role"));
  const username = normalizeUsername(formData.get("username"));
  const password = normalizePassword(formData.get("password"));

  if (!role || !username || !password) {
    redirect(buildAccountRedirect({ error: "Enter your username, password, and account type." }));
  }

  try {
    const row = await findAccountByUsername(role, username);

    if (!row || typeof row.password_hash !== "string") {
      redirect(buildAccountRedirect({ error: "No matching account was found." }));
    }

    if (!verifyPassword(password, row.password_hash)) {
      redirect(buildAccountRedirect({ error: "Incorrect password." }));
    }

    const config = getRoleConfig(role);
    const userId = row[config.idColumn];

    if (typeof userId !== "number") {
      throw new Error("The account record is missing its primary key.");
    }

    const sessionEmail = typeof row.email === "string" ? row.email : "";

    await setAccountSession({ role, userId, email: sessionEmail });
    revalidatePath("/");
    redirect(buildAccountRedirect({ message: `Signed in as ${getRoleConfig(role).label.toLowerCase()}.` }));
  } catch (error) {
    unstable_rethrow(error);
    redirect(buildAccountRedirect({ error: getAccountMessage(error) }));
  }
}

export async function updateCurrentAccount(formData: FormData) {
  const session = await requireSession();
  const nextUsername = normalizeUsername(formData.get("username"));
  const nextEmail = normalizeEmail(formData.get("email"));
  const nextPassword = normalizePassword(formData.get("password"));

  if (!nextUsername || !nextEmail) {
    redirect(buildAccountRedirect({ error: "Username and email are required." }));
  }

  try {
    const supabase = createSupabaseBrowserKeyClient();
    const config = getRoleConfig(session.role);
    const [existingUsernameAccount, existingEmailAccount] = await Promise.all([
      findAccountByUsername(session.role, nextUsername),
      findAccountByEmail(session.role, nextEmail),
    ]);

    const usernameOwnerId = (existingUsernameAccount as Record<string, unknown> | null)?.[config.idColumn];
    const emailOwnerId = (existingEmailAccount as Record<string, unknown> | null)?.[config.idColumn];

    if (existingUsernameAccount && usernameOwnerId !== session.userId) {
      redirect(buildAccountRedirect({ error: "That username is already taken." }));
    }

    if (existingEmailAccount && emailOwnerId !== session.userId) {
      redirect(buildAccountRedirect({ error: "That email is already in use." }));
    }

    const payload: Record<string, string> = {
      username: nextUsername,
      email: nextEmail,
    };

    if (nextPassword) {
      if (nextPassword.length < 8) {
        redirect(buildAccountRedirect({ error: "New passwords must be at least 8 characters long." }));
      }

      payload.password_hash = hashPassword(nextPassword);
    }

    const { error } = await supabase.from(config.table).update(payload).eq(config.idColumn, session.userId);

    if (error) {
      throw new Error(error.message);
    }

    await setAccountSession({ ...session, email: nextEmail });
    revalidatePath("/");
    redirect(buildAccountRedirect({ message: "Account details updated." }));
  } catch (error) {
    unstable_rethrow(error);
    redirect(buildAccountRedirect({ error: getAccountMessage(error) }));
  }
}

export async function deleteCurrentAccount() {
  const session = await requireSession();

  try {
    const supabase = createSupabaseBrowserKeyClient();
    const config = getRoleConfig(session.role);
    const { error } = await supabase.from(config.table).delete().eq(config.idColumn, session.userId);

    if (error) {
      throw new Error(error.message);
    }

    await clearAccountSession();
    revalidatePath("/");
    redirect(buildAccountRedirect({ message: "Account deleted." }));
  } catch (error) {
    unstable_rethrow(error);
    redirect(buildAccountRedirect({ error: getAccountMessage(error) }));
  }
}

export async function signOutAccount() {
  await clearAccountSession();
  revalidatePath("/");
  redirect(buildAccountRedirect({ message: "Signed out." }));
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
