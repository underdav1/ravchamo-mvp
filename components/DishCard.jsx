"use client";

import Link from "next/link";
import { useI18n } from "../app/ui/LangProvider";

export default function DishCard({ dish }) {
  const t = useI18n();

  const tagLabel = (token) => t(`tags.${token}`) ?? token;

  // Localize district if it's a known token (e.g., "vake", "vera", …)
  const districtToken = dish?.restaurant?.district;
  const districtLabel =
    typeof districtToken === "string"
      ? t(`districts.${districtToken}`) ?? districtToken
      : districtToken ?? "";

  // Nicely format distance to one decimal if available
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
            {(dish.tags || []).slice(0, 4).map((tk) => (
              <span key={tk} className="tag">
                {tagLabel(tk)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
