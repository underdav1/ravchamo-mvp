"use client";

import Link from "next/link";
import { useI18n } from "../app/ui/LangProvider";

export default function DishCard({ dish }) {
  const t = useI18n();

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

  // District: data stores tokens like "vake", "old_town"
  const districtToken = dish?.restaurant?.district;
  const districtLabel =
    typeof districtToken === "string"
      ? t(`districts.${districtToken}`) ?? districtToken
      : districtToken ?? "";

  // Distance display
  const distText =
    typeof dish?.dist === "number"
      ? `${new Intl.NumberFormat(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(dish.dist)} km`
      : null;

  return (
    <Link href={`/dish/${dish.id}`} className="block card mb-4">
      <div className="flex gap-3">
        <img
          src={dish.image}
          alt={dish.name || "Dish photo"}
          className="w-24 h-24 object-cover rounded-xl border"
          onError={(e) => (e.currentTarget.style.visibility = "hidden")}
        />
        <div className="flex-1">
          <div className="font-semibold">{dish.name}</div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {dish.restaurant?.name}
            {districtLabel ? ` • ${districtLabel}` : ""}
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
