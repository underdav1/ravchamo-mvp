import { TOKEN_TO_CATEGORY, TOKEN_TO_MOOD } from "./taxonomy";
import { supabase } from "./supabase";

const SEEN_KEY = "ravchamo:seen";
const SEEN_CAP = 150;

function readSeen() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter((x) => Number.isFinite(x)) : [];
  } catch {
    return [];
  }
}

function writeSeen(ids) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  } catch {
    // quota / private mode — silently ignore
  }
}

/**
 * user = {
 *   loc: {lat, lon} | null,
 *   price: "low" | "med" | "high",
 *   tag: string         // craving UI token (single-select), e.g. "georgian"
 *   moods: string[]     // vibe UI tokens (multi-select, max 2), e.g. ["protein","spicy"]
 *   randomness?: number // score jitter amplitude 0..1 (default 0.625 server-side;
 *                       // pass 0.9 for "feeling lucky")
 * }
 *
 * Returns top 10 dishes from the Supabase recommend_dishes RPC.
 * Two sources of variety on top of deterministic scoring:
 *   - server-side uniform jitter (±randomness, computed per-row)
 *   - session-level seen-dish exclude list (localStorage)
 */
export async function recommend(user) {
  const wantedCategories = user.tag
    ? [TOKEN_TO_CATEGORY[user.tag]].filter(Boolean)
    : [];

  const wantedMoods = (user.moods || [])
    .map((m) => TOKEN_TO_MOOD[m])
    .filter(Boolean);

  const lat = user.loc?.lat ?? 41.71;
  const lon = user.loc?.lon ?? 44.77;

  const seen = readSeen();

  const rpcParams = {
    user_lat: lat,
    user_lon: lon,
    price_band: user.price || "med",
    craving_categories: wantedCategories,
    vibe_moods: wantedMoods,
    exclude_dish_ids: seen,
  };

  // Only forward randomness when the caller explicitly set it, so the
  // Postgres-side default (0.625) keeps applying for normal searches.
  if (typeof user.randomness === "number") {
    rpcParams.randomness = user.randomness;
  }

  const { data, error } = await supabase.rpc("recommend_dishes", rpcParams);

  if (error) {
    console.error("recommend_dishes RPC failed:", error);
    return [];
  }

  const rows = data || [];

  // Append the just-returned ids to the seen list, dedupe (most-recent-first), cap at 150.
  const returnedIds = rows.map((r) => r.dish_id).filter((x) => Number.isFinite(x));
  if (returnedIds.length > 0) {
    const newSeen = [...new Set([...returnedIds, ...seen])].slice(0, SEEN_CAP);
    writeSeen(newSeen);
  }

  // Reshape the flat RPC rows into the dish object shape the UI expects
  return rows.map((row) => ({
    id: row.dish_id,
    name: row.dish_name,
    name_en: row.dish_name_en,
    description: row.dish_desc,
    description_en: row.dish_desc_en,
    price: row.price,
    image: row.image_url,
    category: row.category,
    mood1: row.mood1,
    mood2: row.mood2,
    rating: row.rating,
    dist: row.dist_km,
    score: row.score,
    restaurant: {
      id: row.restaurant_id,
      name: row.restaurant_name,
      lat: row.lat,
      lon: row.lon,
    },
  }));
}
