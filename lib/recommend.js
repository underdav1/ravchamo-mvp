import { haversine } from "./distance";
import { TOKEN_TO_CATEGORY, TOKEN_TO_MOOD } from "./taxonomy";

/**
 * user = {
 *   loc: {lat, lon} | null,
 *   price: "low" | "med" | "high",
 *   tags: string[]   // craving UI tokens (multi-select), e.g. ["georgian","asian"]
 *   mood: string     // vibe UI token (single-select), e.g. "protein"
 * }
 *
 * dish (from data/dishes.json) = {
 *   id, name, description, price, image, rating,
 *   category,           // raw value, e.g. "georgian"
 *   mood1, mood2,       // raw values, e.g. "I need protein"
 *   restaurant: { name, address, district, lat, lon }
 * }
 */
export function recommend(user, dishes) {
  const priceBands = { low: [0, 15], med: [15, 30], high: [30, 9999] };
  const within = priceBands[user.price] ?? [0, 9999];

  const wantedCategories = (user.tags || [])
    .map((tk) => TOKEN_TO_CATEGORY[tk])
    .filter(Boolean);
  const wantedMood = TOKEN_TO_MOOD[user.mood] || null;

  const scored = dishes.map((d) => {
    // distance — fall back to 3km if no location
    const dist = user.loc
      ? haversine(user.loc.lat, user.loc.lon, d.restaurant.lat, d.restaurant.lon)
      : 3;

    const inPriceBand = d.price >= within[0] && d.price <= within[1];
    const priceScore = inPriceBand ? 1 : 0;
    const distanceScore = Math.max(0, 1 - dist / 5); // 1km ~ best, >5km ~ 0

    // Craving match: any selected category equals the dish's category
    const categoryMatch =
      wantedCategories.length === 0 || wantedCategories.includes(d.category);
    const cravingScore = wantedCategories.length === 0
      ? 0
      : wantedCategories.includes(d.category) ? 1 : 0;

    // Vibe match: dish has the selected mood as either Mood 1 or Mood 2
    const moodMatch =
      !wantedMood || d.mood1 === wantedMood || d.mood2 === wantedMood;
    const moodScore = !wantedMood
      ? 0
      : d.mood1 === wantedMood ? 1 : d.mood2 === wantedMood ? 0.7 : 0;

    // Wolt rating (0-10), normalized
    const ratingScore = typeof d.rating === "number" ? Math.max(0, (d.rating - 6) / 4) : 0;

    let score =
      0.5 * distanceScore +
      0.4 * priceScore +
      0.8 * cravingScore +
      1.0 * moodScore +
      0.3 * ratingScore;

    // Hard filters: drop dishes that miss the selected craving or vibe
    if (!categoryMatch) score -= 5;
    if (!moodMatch) score -= 5;

    return { ...d, dist, score, _matched: categoryMatch && moodMatch };
  });

  // Keep only matches; if nothing matches (filters too tight), fall back to top by score
  const matches = scored.filter((d) => d._matched);
  const pool = matches.length > 0 ? matches : scored;

  pool.sort((a, b) => b.score - a.score);

  // Diversify by restaurant so we don't show 5 dishes from the same place
  const seen = new Set();
  const out = [];
  for (const d of pool) {
    const k = d.restaurant?.name || d.id;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(d);
    if (out.length >= 10) break;
  }
  return out;
}
