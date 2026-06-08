"use client";

import Link from "next/link";
import { useI18n, useLang } from "../app/ui/LangProvider";
import { track } from "../lib/posthog";

export default function DishCard({ dish, position }) {
  const t = useI18n();
  const { lang } = useLang();

  // When the UI is in English, prefer the translated name if we have one.
  // Falls back to the original Georgian/source name if translation is missing.
  const displayName =
    lang === "en" && dish.name_en ? dish.name_en : dish.name;

  // Map raw category back to UI token so we can translate via tags.{token}
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
  const categoryToken = CATEGORY_TO_TOKEN[dish.category] || dish.category;
  const categoryLabel = t(`tags.${categoryToken}`) ?? dish.category;

  // Distance display
  const distText =
    typeof dish?.dist === "number"
      ? `${new Intl.NumberFormat(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(dish.dist)} km`
      : null;

  function handleClick() {
    track("dish_clicked", {
      dish_id: dish.id,
      restaurant_id: dish.restaurant?.id,
      restaurant_name: dish.restaurant?.name,
      category: dish.category,
      position,
    });
  }

  return (
    <Link
      href={`/dish/${dish.id}`}
      onClick={handleClick}
      className="block card mb-4"
    >
      <div className="flex gap-3">
        <img
          src={dish.image}
          alt={displayName || "Dish photo"}
          className="w-24 h-24 object-cover rounded-xl border"
          onError={(e) => (e.currentTarget.style.visibility = "hidden")}
        />
        <div className="flex-1">
          <div className="font-semibold">{displayName}</div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {dish.restaurant?.name}
          </div>

          <div className="text-sm mt-1">
            ₾{dish.price}
            {distText ? ` • ${distText} away` : ""}
          </div>

          <div className="mt-1 flex flex-wrap gap-2">
            {categoryLabel && <span className="tag">{categoryLabel}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
