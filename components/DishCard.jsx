"use client";

import Link from "next/link";
import { useI18n } from "../app/ui/LangProvider";

export default function DishCard({ dish }) {
  const t = useI18n();
  const tagLabel = (token) => t(`tags.${token}`) ?? token;

  return (
    <Link href={`/dish/${dish.id}`} className="block card mb-4">
      <div className="flex gap-3">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-24 h-24 object-cover rounded-xl border"
        />
        <div className="flex-1">
          <div className="font-semibold">{dish.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {dish.restaurant.name} • {dish.restaurant.district}
          </div>
          <div className="text-sm mt-1">
            ₾{dish.price} • {dish.dist?.toFixed(1)} km away
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {dish.tags.slice(0, 4).map((tk) => (
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
