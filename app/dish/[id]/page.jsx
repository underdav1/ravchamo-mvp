"use client";

import Link from "next/link";
import { useLang } from "../../ui/LangProvider";
import data from "../../../data/dishes.json";

const CATEGORY_TO_TOKEN = {
  "georgian": "georgian",
  "asian": "asian",
  "pizza-pasta": "pizza_pasta",
  "fast food": "fast_food",
  "healthy": "healthy",
  "vegetarian-vegan": "vegetarian_vegan",
  "breakfast": "breakfast",
  "dessert": "dessert",
};

export default function DishPage({ params }) {
  const { lang, t } = useLang();
  const id = params.id;

  const dish = data.find((d) => d.id === id) || null;

  if (!dish) {
    return (
      <main className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-4">{t("noMatches")}</h1>
        <Link href="/" className="kahoot-mint inline-block px-4 py-3 rounded-xl">
          {t("goHome")}
        </Link>
      </main>
    );
  }

  const categoryToken = CATEGORY_TO_TOKEN[dish.category] || dish.category;
  const categoryLabel = t(`tags.${categoryToken}`) ?? dish.category;

  const districtToken = dish.restaurant?.district || "";
  const districtLabel = t(`districts.${districtToken}`) ?? districtToken;

  const imageUrl = dish.image || "";

  // Build a Wolt search URL so the user can act on the recommendation.
  // URL format: https://wolt.com/{lang}/geo/tbilisi/search?q={restaurant_name}
  // Always returns the restaurant as the top result. Locale-aware via woltLangPath.
  const woltLang = t("woltLangPath") || lang || "en";
  const woltSearch = `https://wolt.com/${woltLang}/geo/tbilisi/search?q=${encodeURIComponent(
    dish.restaurant?.name || dish.name || ""
  )}`;

  return (
    <main className="max-w-md mx-auto px-4 py-6">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={dish.name}
          className="w-full h-52 object-cover rounded-2xl border mb-4"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : (
        <div className="w-full h-52 rounded-2xl border mb-4 bg-gray-100 dark:bg-gray-800" />
      )}

      <div className="card">
        <h1 className="text-3xl font-extrabold mb-1">{dish.name}</h1>
        <div className="text-gray-600 dark:text-gray-400 mb-3">
          {dish.restaurant?.name}
          {districtLabel && <> • {districtLabel}</>}
        </div>

        <div className="text-lg font-semibold mb-3">₾{dish.price}</div>

        <div className="mt-1 mb-3 flex flex-wrap gap-2">
          {categoryLabel && <span className="tag">{categoryLabel}</span>}
          {dish.mood1 && <span className="tag">{dish.mood1}</span>}
          {dish.mood2 && dish.mood2 !== dish.mood1 && (
            <span className="tag">{dish.mood2}</span>
          )}
        </div>

        {dish.description && <p className="mb-2">{dish.description}</p>}
        {dish.restaurant?.address && (
          <p className="text-sm text-gray-500 mb-4">{dish.restaurant.address}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <a
            href={woltSearch}
            target="_blank"
            rel="noopener noreferrer"
            className="kahoot-purple text-center py-3 rounded-2xl"
          >
            {t("openOnWolt")}
          </a>
          <Link href="/" className="kahoot-mint text-center py-3 rounded-2xl">
            {t("goHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
