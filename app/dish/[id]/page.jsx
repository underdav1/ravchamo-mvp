"use client";

import Link from "next/link";
import { useI18n } from "../../ui/LangProvider";
import data from "../../../data/dishes.json"; // adjust path if your data lives elsewhere

export default function DishPage({ params }) {
  const t = useI18n();
  const id = params.id;

  // find by id or slug
  const dish =
    data.find((d) => d.id === id || d.slug === id) ||
    null;

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

  // helpers for translations
  const tagLabel = (token) => t(`tags.${token}`) ?? token;
  const districtKey = (dish.restaurant?.district || "")
    .toLowerCase()
    .replace(/\s+/g, "_"); // "Old Tbilisi" -> "old_tbilisi"
  const districtLabel =
    t(`districts.${districtKey}`) ?? dish.restaurant?.district ?? "";

  const imageUrl = dish.image_url || dish.image || "";

  return (
    <main className="max-w-md mx-auto px-4 py-6">
      {/* image (with graceful fallback) */}
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

        <div className="text-lg font-semibold mb-3">
          ₾{dish.price}
        </div>

        {/* tags */}
        {Array.isArray(dish.tags) && dish.tags.length > 0 && (
          <div className="mt-1 mb-3 flex flex-wrap gap-2">
            {dish.tags.slice(0, 6).map((tk) => (
              <span key={tk} className="tag">
                {tagLabel(tk)}
              </span>
            ))}
          </div>
        )}

        {/* description */}
        {dish.description && (
          <p className="mb-4">{dish.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link href="/results" className="kahoot-gray text-center py-3 rounded-2xl">
            {t("backToResults")}
          </Link>
          <Link href="/" className="kahoot-mint text-center py-3 rounded-2xl">
            {t("goHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
