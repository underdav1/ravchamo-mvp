// Source-of-truth mapping between UI tokens and the raw values that live in the
// scraped dataset (Wolt items enriched by an AI tagging pass). Keep this in sync
// with the values present in data/dishes.json (Category, Mood 1, Mood 2).

// UI token -> raw `category` value as it appears in the data
export const CATEGORY_TOKENS = [
  "georgian",
  "asian",
  "pizza_pasta",
  "fast_food",
  "healthy",
  "vegetarian_vegan",
  "breakfast",
  "dessert",
];

export const TOKEN_TO_CATEGORY = {
  georgian: "georgian",
  asian: "asian",
  pizza_pasta: "pizza-pasta",
  fast_food: "fast food",
  healthy: "healthy",
  vegetarian_vegan: "vegetarian-vegan",
  breakfast: "breakfast",
  dessert: "dessert",
};

// UI token -> raw `mood1` / `mood2` value as it appears in the data
// Order matters — this is the on-screen order. "surprise" goes last because it
// overlaps in spirit with the "I'm feeling lucky" button below the form.
export const MOOD_TOKENS = [
  "hungry",
  "protein",
  "diet",
  "sweet",
  "spicy",
  "hangover",
  "strange",
  "surprise",
];

export const TOKEN_TO_MOOD = {
  hungry: "hungry",
  protein: "protein",
  diet: "diet",
  sweet: "sweet",
  spicy: "spicy",
  hangover: "hangover",
  surprise: "surprise",
  strange: "strange",
};
