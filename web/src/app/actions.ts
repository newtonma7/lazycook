"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import {
  clearAccountSession,
  createSupabaseServerAuthClient,
  getSupabaseEnv,
  normalizeEmail,
  normalizePassword,
  normalizeUsername,
  readAccountSession,
  setAccountSession,
  type AccountRole,
} from "./account-auth";
import { redirect, unstable_rethrow } from "next/navigation";

function buildAccountRedirect(params: Record<string, string>) {
  const search = new URLSearchParams({ tab: "account", ...params });
  return `/dashboard?${search.toString()}`;
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
    const supabase = createSupabaseServerAuthClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role,
        },
      },
    });

    if (error) {
      throw new Error(error?.message ?? "Unable to create account.");
    }
    if (data.session) {
      await setAccountSession({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      });
    }
    revalidatePath("/dashboard");
    if (data.session) {
      redirect(buildAccountRedirect({ message: "Account created. You're signed in." }));
    }
    redirect(buildAccountRedirect({ message: "Account created. Check your email to confirm sign-in." }));
  } catch (error) {
    unstable_rethrow(error);
    redirect(buildAccountRedirect({ error: getAccountMessage(error) }));
  }
}

export async function signInAccount(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));

  if (!email || !password) {
    redirect(buildAccountRedirect({ error: "Enter your email and password." }));
  }

  try {
    const supabase = createSupabaseServerAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      redirect(buildAccountRedirect({ error: "Invalid email or password." }));
    }
    await setAccountSession({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });
    revalidatePath("/dashboard");
    redirect(buildAccountRedirect({ message: "Signed in." }));
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
    const supabase = createSupabaseServerAuthClient();
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });
    if (setSessionError) {
      throw new Error(setSessionError.message);
    }
    const payload: {
      email: string;
      password?: string;
      data: {
        username: string;
      };
    } = {
      email: nextEmail,
      data: {
        username: nextUsername,
      },
    };

    if (nextPassword) {
      if (nextPassword.length < 8) {
        redirect(buildAccountRedirect({ error: "New passwords must be at least 8 characters long." }));
      }

      payload.password = nextPassword;
    }

    const { data, error } = await supabase.auth.updateUser(payload);

    if (error) {
      throw new Error(error.message);
    }
    const nextSession = (await supabase.auth.getSession()).data.session;
    if (nextSession) {
      await setAccountSession({
        accessToken: nextSession.access_token,
        refreshToken: nextSession.refresh_token,
      });
    }
    revalidatePath("/dashboard");
    const requiresConfirmation = data.user?.new_email && data.user?.new_email !== data.user?.email;
    redirect(buildAccountRedirect({ message: requiresConfirmation ? "Profile updated. Confirm your new email from your inbox." : "Account details updated." }));
  } catch (error) {
    unstable_rethrow(error);
    redirect(buildAccountRedirect({ error: getAccountMessage(error) }));
  }
}

export async function deleteCurrentAccount() {
  redirect(buildAccountRedirect({ error: "Account deletion requires an admin API path and is not enabled yet." }));
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

  redirect("/dashboard?tab=consumer");
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

  redirect("/dashboard?tab=consumer");
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

  redirect("/dashboard?tab=consumer");
}

function parseAllergen(raw: FormDataEntryValue | null): boolean {
  const s = typeof raw === "string" ? raw : "";
  return s === "true" || s === "on";
}

function parseInteger(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string") return null;

  const value = raw.trim();
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalInteger(raw: FormDataEntryValue | null): number | null {
  return parseInteger(raw);
}

function parseOptionalText(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string") return null;

  const value = raw.trim();
  return value ? value : null;
}

function parseOptionalNumeric(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string") return null;

  const value = raw.trim();
  return value ? value : null;
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

  redirect("/dashboard?tab=ingredient");
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

  redirect("/dashboard?tab=ingredient");
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

  redirect("/dashboard?tab=ingredient");
}

export async function addRecipe(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const consumer_id = parseInteger(formData.get("consumer_id"));
  const admin_id = parseInteger(formData.get("admin_id"));
  const title = (formData.get("title") as string)?.trim();
  const description = parseOptionalText(formData.get("description"));
  const instructions = parseOptionalText(formData.get("instructions"));
  const prep_time_min = parseOptionalInteger(formData.get("prep_time_min"));
  const cook_time_min = parseOptionalInteger(formData.get("cook_time_min"));
  const servings = parseOptionalInteger(formData.get("servings"));
  const is_public = parseAllergen(formData.get("is_public"));

  if (!consumer_id || !admin_id || !title) return;

  const timestamp = new Date().toISOString();
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from("recipe").insert([
    {
      consumer_id,
      admin_id,
      title,
      description,
      instructions,
      prep_time_min,
      cook_time_min,
      servings,
      is_public,
      created_at: timestamp,
      updated_at: timestamp,
    },
  ]);

  if (error) {
    console.error("Recipe insert error:", error.message);
    return;
  }

  redirect("/dashboard?tab=recipe");
}

export async function updateRecipe(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const recipe_id = parseInteger(formData.get("recipe_id"));
  const consumer_id = parseInteger(formData.get("consumer_id"));
  const admin_id = parseInteger(formData.get("admin_id"));
  const title = (formData.get("title") as string)?.trim();
  const description = parseOptionalText(formData.get("description"));
  const instructions = parseOptionalText(formData.get("instructions"));
  const prep_time_min = parseOptionalInteger(formData.get("prep_time_min"));
  const cook_time_min = parseOptionalInteger(formData.get("cook_time_min"));
  const servings = parseOptionalInteger(formData.get("servings"));
  const is_public = parseAllergen(formData.get("is_public"));

  if (!recipe_id || !consumer_id || !admin_id || !title) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase
    .from("recipe")
    .update({
      consumer_id,
      admin_id,
      title,
      description,
      instructions,
      prep_time_min,
      cook_time_min,
      servings,
      is_public,
      updated_at: new Date().toISOString(),
    })
    .eq("recipe_id", recipe_id);

  if (error) {
    console.error("Recipe update error:", error.message);
    return;
  }

  redirect("/dashboard?tab=recipe");
}

export async function deleteRecipe(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const recipe_id = parseInteger(formData.get("recipe_id"));
  if (!recipe_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { error: ingredientError } = await supabase.from("recipe_ingredient").delete().eq("recipe_id", recipe_id);

  if (ingredientError) {
    console.error("Recipe ingredient delete error:", ingredientError.message);
    return;
  }

  const { error } = await supabase.from("recipe").delete().eq("recipe_id", recipe_id);

  if (error) {
    console.error("Recipe delete error:", error.message);
    return;
  }

  redirect("/dashboard?tab=recipe");
}

export async function addRecipeIngredient(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const recipe_id = parseInteger(formData.get("recipe_id"));
  const ingredient_id = parseInteger(formData.get("ingredient_id"));
  const required_quantity = parseOptionalNumeric(formData.get("required_quantity"));
  const unit = parseOptionalText(formData.get("unit"));
  const is_optional = parseAllergen(formData.get("is_optional"));
  const preparation_note = parseOptionalText(formData.get("preparation_note"));

  if (!recipe_id || !ingredient_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from("recipe_ingredient").insert([
    {
      recipe_id,
      ingredient_id,
      required_quantity,
      unit,
      is_optional,
      preparation_note,
    },
  ]);

  if (error) {
    console.error("Recipe ingredient insert error:", error.message);
    return;
  }

  redirect("/dashboard?tab=recipe");
}

export async function updateRecipeIngredient(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const recipe_id = parseInteger(formData.get("recipe_id"));
  const original_ingredient_id = parseInteger(formData.get("original_ingredient_id"));
  const ingredient_id = parseInteger(formData.get("ingredient_id"));
  const required_quantity = parseOptionalNumeric(formData.get("required_quantity"));
  const unit = parseOptionalText(formData.get("unit"));
  const is_optional = parseAllergen(formData.get("is_optional"));
  const preparation_note = parseOptionalText(formData.get("preparation_note"));

  if (!recipe_id || !original_ingredient_id || !ingredient_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase
    .from("recipe_ingredient")
    .update({
      ingredient_id,
      required_quantity,
      unit,
      is_optional,
      preparation_note,
    })
    .eq("recipe_id", recipe_id)
    .eq("ingredient_id", original_ingredient_id);

  if (error) {
    console.error("Recipe ingredient update error:", error.message);
    return;
  }

  redirect("/dashboard?tab=recipe");
}

export async function deleteRecipeIngredient(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const recipe_id = parseInteger(formData.get("recipe_id"));
  const ingredient_id = parseInteger(formData.get("ingredient_id"));
  if (!recipe_id || !ingredient_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase
    .from("recipe_ingredient")
    .delete()
    .eq("recipe_id", recipe_id)
    .eq("ingredient_id", ingredient_id);

  if (error) {
    console.error("Recipe ingredient delete error:", error.message);
    return;
  }

  redirect("/dashboard?tab=recipe");
}

/* ───────── Pantry CRUD ───────── */

export async function addPantry(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const pantry_name = (formData.get("pantry_name") as string)?.trim();
  const consumer_id = parseOptionalInteger(formData.get("consumer_id"));
  if (!pantry_name) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from("pantry").insert([
    { pantry_name, consumer_id },
  ]);

  if (error) {
    console.error("Pantry insert error:", error.message);
    return;
  }

  redirect("/dashboard?tab=pantry");
}

export async function updatePantry(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const pantry_id = parseInteger(formData.get("pantry_id"));
  const pantry_name = (formData.get("pantry_name") as string)?.trim();
  const consumer_id = parseOptionalInteger(formData.get("consumer_id"));
  if (!pantry_id || !pantry_name) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase
    .from("pantry")
    .update({ pantry_name, consumer_id })
    .eq("pantry_id", pantry_id);

  if (error) {
    console.error("Pantry update error:", error.message);
    return;
  }

  redirect("/dashboard?tab=pantry");
}

export async function deletePantry(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const pantry_id = parseInteger(formData.get("pantry_id"));
  if (!pantry_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { error: itemError } = await supabase.from("pantry_item").delete().eq("pantry_id", pantry_id);
  if (itemError) {
    console.error("Pantry item delete error:", itemError.message);
    return;
  }

  const { error } = await supabase.from("pantry").delete().eq("pantry_id", pantry_id);
  if (error) {
    console.error("Pantry delete error:", error.message);
    return;
  }

  redirect("/dashboard?tab=pantry");
}

/* ───────── Pantry Item CRUD ───────── */

export async function addPantryItem(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const pantry_id = parseInteger(formData.get("pantry_id"));
  const ingredient_id = parseInteger(formData.get("ingredient_id"));
  const purchase_date = parseOptionalText(formData.get("purchase_date"));
  const quantity_on_hand = parseOptionalNumeric(formData.get("quantity_on_hand"));
  const unit = parseOptionalText(formData.get("unit"));
  const expiration_date = parseOptionalText(formData.get("expiration_date"));

  if (!pantry_id || !ingredient_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from("pantry_item").insert([
    { pantry_id, ingredient_id, purchase_date, quantity_on_hand, unit, expiration_date },
  ]);

  if (error) {
    console.error("Pantry item insert error:", error.message);
    return;
  }

  redirect("/dashboard?tab=pantry");
}

export async function updatePantryItem(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const pantry_item_id = parseInteger(formData.get("pantry_item_id"));
  const ingredient_id = parseInteger(formData.get("ingredient_id"));
  const purchase_date = parseOptionalText(formData.get("purchase_date"));
  const quantity_on_hand = parseOptionalNumeric(formData.get("quantity_on_hand"));
  const unit = parseOptionalText(formData.get("unit"));
  const expiration_date = parseOptionalText(formData.get("expiration_date"));

  if (!pantry_item_id || !ingredient_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase
    .from("pantry_item")
    .update({ ingredient_id, purchase_date, quantity_on_hand, unit, expiration_date })
    .eq("pantry_item_id", pantry_item_id);

  if (error) {
    console.error("Pantry item update error:", error.message);
    return;
  }

  redirect("/dashboard?tab=pantry");
}

export async function deletePantryItem(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const pantry_item_id = parseInteger(formData.get("pantry_item_id"));
  if (!pantry_item_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from("pantry_item").delete().eq("pantry_item_id", pantry_item_id);

  if (error) {
    console.error("Pantry item delete error:", error.message);
    return;
  }

  redirect("/dashboard?tab=pantry");
}

/* ───────── Meal Plan CRUD ───────── */

export async function addMealPlan(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const plan_name = (formData.get("plan_name") as string)?.trim();
  const consumer_id = parseInteger(formData.get("consumer_id"));
  const start_date = parseOptionalText(formData.get("start_date"));
  const end_date = parseOptionalText(formData.get("end_date"));
  if (!plan_name || !consumer_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from("meal_plan").insert([
    { plan_name, consumer_id, start_date, end_date },
  ]);

  if (error) {
    console.error("Meal plan insert error:", error.message);
    return;
  }

  redirect("/dashboard?tab=meal_plan");
}

export async function updateMealPlan(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const meal_plan_id = parseInteger(formData.get("meal_plan_id"));
  const plan_name = (formData.get("plan_name") as string)?.trim();
  const consumer_id = parseInteger(formData.get("consumer_id"));
  const start_date = parseOptionalText(formData.get("start_date"));
  const end_date = parseOptionalText(formData.get("end_date"));
  if (!meal_plan_id || !plan_name || !consumer_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase
    .from("meal_plan")
    .update({ plan_name, consumer_id, start_date, end_date })
    .eq("meal_plan_id", meal_plan_id);

  if (error) {
    console.error("Meal plan update error:", error.message);
    return;
  }

  redirect("/dashboard?tab=meal_plan");
}

export async function deleteMealPlan(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const meal_plan_id = parseInteger(formData.get("meal_plan_id"));
  if (!meal_plan_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { error: itemError } = await supabase.from("meal_plan_item").delete().eq("meal_plan_id", meal_plan_id);
  if (itemError) {
    console.error("Meal plan item delete error:", itemError.message);
    return;
  }

  const { error } = await supabase.from("meal_plan").delete().eq("meal_plan_id", meal_plan_id);
  if (error) {
    console.error("Meal plan delete error:", error.message);
    return;
  }

  redirect("/dashboard?tab=meal_plan");
}

/* ───────── Meal Plan Item CRUD ───────── */

export async function addMealPlanItem(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const meal_plan_id = parseInteger(formData.get("meal_plan_id"));
  const recipe_id = parseInteger(formData.get("recipe_id"));
  const scheduled_for = parseOptionalText(formData.get("scheduled_for"));
  const meal_type = parseOptionalText(formData.get("meal_type"));
  const servings = parseOptionalInteger(formData.get("servings"));

  if (!meal_plan_id || !recipe_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from("meal_plan_item").insert([
    { meal_plan_id, recipe_id, scheduled_for, meal_type, servings },
  ]);

  if (error) {
    console.error("Meal plan item insert error:", error.message);
    return;
  }

  redirect("/dashboard?tab=meal_plan");
}

export async function updateMealPlanItem(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const meal_plan_item_id = parseInteger(formData.get("meal_plan_item_id"));
  const recipe_id = parseInteger(formData.get("recipe_id"));
  const scheduled_for = parseOptionalText(formData.get("scheduled_for"));
  const meal_type = parseOptionalText(formData.get("meal_type"));
  const servings = parseOptionalInteger(formData.get("servings"));

  if (!meal_plan_item_id || !recipe_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase
    .from("meal_plan_item")
    .update({ recipe_id, scheduled_for, meal_type, servings })
    .eq("meal_plan_item_id", meal_plan_item_id);

  if (error) {
    console.error("Meal plan item update error:", error.message);
    return;
  }

  redirect("/dashboard?tab=meal_plan");
}

export async function deleteMealPlanItem(formData: FormData) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const meal_plan_item_id = parseInteger(formData.get("meal_plan_item_id"));
  if (!meal_plan_item_id) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from("meal_plan_item").delete().eq("meal_plan_item_id", meal_plan_item_id);

  if (error) {
    console.error("Meal plan item delete error:", error.message);
    return;
  }

  redirect("/dashboard?tab=meal_plan");
}
