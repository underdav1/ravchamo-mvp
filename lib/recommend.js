import { TOKEN_TO_CATEGORY, TOKEN_TO_MOOD } from "./taxonomy";
import { supabase } from "./supabase";

/**
 * user = {
 *   loc: {lat, lon} | null,
 *   price: "low" | "med" | "high",
 *   tags: string[]   // craving UI tokens (multi-select), e.g. ["georgian","asian"]
 *   mood: string     // vibe UI token (single-select), e.g. "protein"
 * }
 *
 * Returns top 10 dishes from the Supabase recommend_dishes RPC.
 * The RPC mirrors the old in-memory scoring: distance + price band + craving +
 * vibe + Wolt rating, diversified by restaurant.
 */
export async function recommend(user) {
  const wantedCategories = (user.tags || [])
    .map((tk) => TOKEN_TO_CATEGORY[tk])
    .filter(Boolean);
  const wantedMood = TOKEN_TO_MOOD[user.mood] || null;

  const lat = user.loc?.lat ?? 41.71;
  const lon = user.loc?.lon ?? 44.77;

  const { data, error } = await supabase.rpc("recommend_dishes", {
    user_lat: lat,
    user_lon: lon,
    price_band: user.price || "med",
    craving_categories: wantedCategories,
    vibe_mood: wantedMood,
  });

  if (error) {
    console.error("recommend_dishes RPC failed:", error);
    return [];
  }

  // Reshape the flat RPC rows into the dish object shape the UI expects
  return (data || []).map((row) => ({
    id: row.dish_id,
    name: row.dish_name,
    description: row.dish_desc,
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
      district: row.district,
      lat: row.lat,
      lon: row.lon,
    },
  }));
}
