"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "../../ui/LangProvider";
import { supabase } from "../../../lib/supabase";

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

  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const numId = Number(id);
    if (!Number.isFinite(numId)) {
      setLoading(false);
      return;
    }
    supabase
      .from("dishes")
      .select(
        "id, name, description, price, image_url, category, mood1, mood2, restaurant:restaurants(id, name, address, district, lat, lon, rating)"
      )
      .eq("id", numId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setDish(null);
        } else {
          // Reshape to match the old object the page was built around
          setDish({
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
            image: data.image_url,
            category: data.category,
            mood1: data.mood1,
            mood2: data.mood2,
            restaurant: data.restaurant,
          });
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-gray-500">…</div>
      </main>
    );
  }

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
