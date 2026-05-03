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
export const MOOD_TOKENS = [
  "hungry",
  "protein",
  "diet",
  "sweet",
  "spicy",
  "hangover",
  "surprise",
  "strange",
];

export const TOKEN_TO_MOOD = {
  hungry: "Very hungry something high in calories",
  protein: "I need protein",
  diet: "On a diet give me something low in calories",
  sweet: "I want something sweet",
  spicy: "I want something spicy",
  hangover: "I'm on a hangover",
  surprise: "Surprise me",
  strange: "Something strange",
};
