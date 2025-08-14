import { haversine } from "./distance";
import { openNow } from "./open";

/**
 * user = {
 *   loc: {lat, lon},
 *   price: "low" | "med" | "high",
 *   tags: string[] (desired),
 *   exclude: string[] (dont want),
 *   time: "fast" | "relaxed" | null
 * }
 */
export function recommend(user, dishes, now=new Date()) {
  const priceBands = { low: [0, 12], med: [12, 20], high: [20, 999] };

  // score each dish
  let scored = dishes.map(d => {
    // distance in km
    const dist = user.loc ? haversine(user.loc.lat, user.loc.lon, d.restaurant.lat, d.restaurant.lon) : 3;
    const within = priceBands[user.price] ?? [0, 999];
    const priceScore = (d.price >= within[0] && d.price <= within[1]) ? 1 : 0;
    const distanceScore = Math.max(0, 1 - (dist / 5)); // 1km ~ best, >5km ~ 0
    const tagMatches = user.tags && user.tags.length ?
      d.tags.filter(t => user.tags.includes(t)).length : 0;
    const excludeHit = user.exclude && user.exclude.some(x => d.tags.includes(x));
    const open = openNow(d.open, now) ? 1 : 0.4; // prefer open, but allow closed in dummy

    // "fast" bias
    const fastBias = user.time === "fast" ? (d.tags.includes("fast") ? 0.2 : 0) : 0;

    // final score
    let score = 0.5*distanceScore + 0.6*priceScore + 0.4*tagMatches + 0.3*open + fastBias;
    if (excludeHit) score -= 2; // hard penalty

    return { ...d, dist, score };
  });

  // diversity: avoid repeating same primary tag/cuisine
  const seen = new Set();
  const pickKey = d => (d.tags.find(t => ["georgian","wrap","sushi","pizza","salad","soup","grill","vegan"].includes(t)) || d.tags[0] || "other");
  scored.sort((a,b)=> b.score - a.score);
  const diversified = [];
  for (const d of scored) {
    const k = pickKey(d);
    if (!seen.has(k)) {
      diversified.push(d);
      seen.add(k);
    }
    if (diversified.length >= 10) break;
  }
  return diversified;
}
