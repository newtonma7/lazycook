// ============================================================
// Lazy Cook — Ingredient Seed Script
// Fetches ~1000 ingredients from Spoonacular and upserts them
// into your Supabase `ingredient` table.
//
// HOW TO RUN:
//   1. Fill in YOUR_SPOONACULAR_API_KEY and YOUR_SERVICE_ROLE_KEY_HERE below
//   2. Open your terminal in the same folder as this file
//   3. Run: node seed-ingredients.js
//
// REQUIREMENTS:
//   Node.js >= 18 (uses built-in fetch — no npm install needed)
// ============================================================

// ── CONFIG ───────────────────────────────────────────────────
const SPOONACULAR_API_KEY  = "7955d45bfeab42b19cd1b7d2fbcdbefa";
const SUPABASE_URL         = "https://cdryuormeavbyxxceylo.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcnl1b3JtZWF2Ynl4eGNleWxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzk2MjM4MCwiZXhwIjoyMDg5NTM4MzgwfQ.bxV-g2MgM626-AWxqyBqHc8fTd3eph5v_YaT29nlpuk";
// ─────────────────────────────────────────────────────────────

const PAGE_SIZE   = 100;  // Spoonacular max results per request
const TARGET      = 1000; // Total ingredients to seed
const DELAY_MS    = 500;  // Delay between API calls (avoid rate limiting)

// ── Spoonacular aisle → your category column ─────────────────
const AISLE_TO_CATEGORY = {
"Produce": "Vegetables",
  "Fruits": "Fruits",
  "Vegetables": "Vegetables",
  "Meat": "Meat",
  "Poultry": "Poultry",
  "Seafood": "Seafood",
  "Dairy": "Dairy",
  "Cheese": "Dairy",
  "Eggs": "Dairy",
  "Milk, Eggs, Other Dairy": "Dairy",
  "Refrigerated": "Dairy",
  "Bakery/Bread": "Bakery",
  "Bread": "Bakery",
  "Pasta and Rice": "Grains",
  "Pasta": "Grains",
  "Rice": "Grains",
  "Grains": "Grains",
  "Spices and Seasonings": "Spices",
  "Canned and Jarred": "Pantry",
  "Oil, Vinegar, Salad Dressing": "Pantry",
  "Condiments": "Pantry",
  "Baking": "Pantry",
  "Legumes": "Legumes",
  "Nuts & Seeds": "Nuts & Seeds",
  "Beverages": "Beverages",
  "Water": "Beverages", // Explicitly catch Water
  "Tea and Coffee": "Beverages",
  "Frozen": "Frozen",
  "Snacks": "Snacks"
};

// ── Category → default_unit ───────────────────────────────────
const CATEGORY_DEFAULT_UNIT = { //continue populating ingredients table with food (since cap on daily limit to use api)
  "Fruits":        "lbs",
  "Vegetables":    "lbs", //good
  "Produce":       "lbs", //good
  "Meat":          "lbs", //good
  "Poultry":       "lbs",
  "Seafood":       "lbs", //good
  "Dairy":         "cups", //good
  "Bakery":        "oz", //good
  "Grains":        "cups", //good
  "Pantry":        "tbsp", //good
  "Spices":        "tsp", //good
  "Nuts & Seeds":  "cups",
  "Frozen":        "oz", //good
  "Beverages":     "cups", //good
  "Snacks":        "oz", //good
  "Health Foods":  "oz", //good
  "Legumes":       "cups",
};

// ── Allergen detection ────────────────────────────────────────
const ALLERGEN_KEYWORDS = [
  "milk", "egg", "peanut", "almond", "cashew", "walnut", "pecan",
  "pistachio", "hazelnut", "wheat", "gluten", "soy", "soybean",
  "shrimp", "crab", "lobster", "salmon", "tuna", "cod", "fish",
  "sesame", "mustard", "celery", "lactose", "cheese", "butter",
  "cream", "yogurt", "flour", "shellfish",
];

function isAllergen(name) {
  const lower = name.toLowerCase();
  return ALLERGEN_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── Search queries to cover all major food categories ─────────
// Each fetches up to PAGE_SIZE=100 results → 11 queries = ~1000 ingredients
const SEARCH_QUERIES = [
// Vegetables
  "root vegetable", "leafy green", "squash", "pepper", "onion", "mushroom",
  // Fruits
  "citrus", "berry", "stone fruit", "tropical fruit", "apple",
  // Proteins
  "beef", "pork", "chicken", "turkey", "lamb", "shrimp", "salmon", "white fish",
  // Pantry & Grains
  "flour", "sugar", "oil", "vinegar", "rice", "pasta", "noodle", "canned bean",
  // Dairy
  "hard cheese", "soft cheese", "milk", "yogurt", "butter",
  // Flavor
  "dried herb", "ground spice", "extract", "sauce", "syrup"
];

// ── Helpers ───────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(str) {
  return str.trim().toLowerCase();
}

// ── Spoonacular: search ingredients ───────────────────────────
async function fetchIngredients(query, offset = 0) {
  const url = new URL("https://api.spoonacular.com/food/ingredients/search");
  url.searchParams.set("apiKey",      SPOONACULAR_API_KEY);
  url.searchParams.set("query",       query);
  url.searchParams.set("number",      String(PAGE_SIZE));
  url.searchParams.set("offset",      String(offset));
  //url.searchParams.set("sort",        "popularity");
  //url.searchParams.set("sortDirection","desc");
  url.searchParams.set("metaInformation", "true"); // includes aisle

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spoonacular error (${res.status}): ${text}`);
  }
  return res.json();
}

// ── Supabase: get existing ingredient names ───────────────────
async function fetchExistingNames() {
  const url = `${SUPABASE_URL}/rest/v1/ingredient?select=name`;
  const res = await fetch(url, {
    headers: {
      apikey:        SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase fetch error: ${await res.text()}`);
  const rows = await res.json();
  return new Set(rows.map((r) => normalize(r.name)));
}

// ── Supabase: batch insert ────────────────────────────────────
async function insertIngredients(rows) {
  const url = `${SUPABASE_URL}/rest/v1/ingredient`;
  const res = await fetch(url, {
    method:  "POST",
    headers: {
      apikey:          SUPABASE_SERVICE_KEY,
      Authorization:   `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type":  "application/json",
      Prefer:          "resolution=ignore-duplicates", // skip if name already exists
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`Supabase insert error: ${await res.text()}`);
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log("🥬  Lazy Cook — Ingredient Seeder");
  console.log("──────────────────────────────────");

  // 1. Load existing ingredient names so we don't duplicate
  console.log("📦  Loading existing ingredients from Supabase...");
  const existingNames = await fetchExistingNames();
  console.log(`    Found ${existingNames.size} existing ingredient(s). These will be skipped.\n`);

  const seen    = new Set(existingNames); // track names added this run too
  const toInsert = [];

  // 2. Loop through search queries
  for (const query of SEARCH_QUERIES) {
    if (toInsert.length + existingNames.size >= TARGET) break;

    console.log(`🔍  Searching: "${query}"...`);
    let data;
    try {
      data = await fetchIngredients(query);
    } catch (err) {
      console.error(`    ⚠️  Failed to fetch "${query}": ${err.message}`);
      await sleep(DELAY_MS);
      continue;
    }

    const results = data.results ?? [];
    console.log(`    Got ${results.length} results from Spoonacular.`);

    let addedThisQuery = 0;
    for (const item of results) {
      if (toInsert.length + existingNames.size >= TARGET) break;

      const name = item.name?.trim();
      if (!name) continue;

      // Skip duplicates (case-insensitive)
      if (seen.has(normalize(name))) continue;
      seen.add(normalize(name));

      // Map aisle → category
      const aisle    = item.aisle ?? "";
      // Spoonacular sometimes returns multiple aisles separated by ";"
      const firstAisle = aisle.split(";")[0].trim();
      const category   = AISLE_TO_CATEGORY[firstAisle] ?? "Pantry";

      const default_unit  = CATEGORY_DEFAULT_UNIT[category] ?? "oz";
      const is_allergen   = isAllergen(name);

      toInsert.push({ name, category, default_unit, is_allergen });
      addedThisQuery++;
    }

    console.log(`    ✅  ${addedThisQuery} new ingredient(s) queued from "${query}".`);
    console.log(`    📊  Total queued so far: ${toInsert.length}\n`);

    await sleep(DELAY_MS); // be polite to the API
  }

  // 3. Insert in batches of 100
  if (toInsert.length === 0) {
    console.log("✨  Nothing new to insert — your table is already up to date!");
    return;
  }

  console.log(`\n💾  Inserting ${toInsert.length} ingredients into Supabase...`);
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    await insertIngredients(batch);
    inserted += batch.length;
    console.log(`    Inserted ${inserted} / ${toInsert.length}...`);
    await sleep(200);
  }

  console.log(`\n🎉  Done! ${inserted} new ingredients added to your Supabase ingredient table.`);
  console.log(`    Your table now has ~${existingNames.size + inserted} ingredients total.`);
}

main().catch((err) => {
  console.error("\n❌  Seed failed:", err.message);
  process.exit(1);
});
