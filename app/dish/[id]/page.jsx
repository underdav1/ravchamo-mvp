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
      .from("menu_items")
      .select(
        "id, item_name_en, item_name_ka, description_en, description_ka, price, image_url, category_label, vibe_label, mood_2, restaurant:restaurants(id, name, address, lat, lon)"
      )
      .eq("id", numId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setDish(null);
        } else {
          // Bilingual mapping (matches the RPC contract on the results page):
          // `name` carries the Georgian original, `name_en` the English. The
          // language toggle in DishCard / displayName below picks between them.
          // Empty-string KA fields get normalized to null so the lang === "en"
          // && dish.name_en fallback works as expected.
          const nameKa = data.item_name_ka || null;
          const descKa = data.description_ka || null;
          setDish({
            id: data.id,
            name: nameKa || data.item_name_en,
            name_en: data.item_name_en,
            description: descKa || data.description_en,
            description_en: data.description_en,
            price: data.price,
            image: data.image_url,
            category: data.category_label,
            mood1: data.vibe_label,
            mood2: data.mood_2,
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

  const displayName =
    lang === "en" && dish.name_en ? dish.name_en : dish.name;
  const displayDesc =
    lang === "en" && dish.description_en ? dish.description_en : dish.description;

  const categoryToken = CATEGORY_TO_TOKEN[dish.category] || dish.category;
  const categoryLabel = t(`tags.${categoryToken}`) ?? dish.category;

  const imageUrl = dish.image || "";

  const woltLang = t("woltLangPath") || lang || "en";
  const woltSearch = `https://wolt.com/${woltLang}/geo/tbilisi/search?q=${encodeURIComponent(
    dish.restaurant?.name || displayName || ""
  )}`;

  const directionsUrl =
    dish.restaurant?.lat && dish.restaurant?.lon
      ? `https://www.google.com/maps/dir/?api=1&destination=${dish.restaurant.lat},${dish.restaurant.lon}`
      : dish.restaurant?.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dish.restaurant.address)}`
      : null;

  return (
    <main className="max-w-md mx-auto px-4 py-6">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={displayName}
          className="w-full h-52 object-cover rounded-2xl border mb-4"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : (
        <div className="w-full h-52 rounded-2xl border mb-4 bg-gray-100 dark:bg-gray-800" />
      )}

      <div className="card">
        <h1 className="text-3xl font-extrabold mb-1">{displayName}</h1>
        <div className="text-gray-600 dark:text-gray-400 mb-3">
          {dish.restaurant?.name}
        </div>

        <div className="text-lg font-semibold mb-3">₾{dish.price}</div>

        <div className="mt-1 mb-3 flex flex-wrap gap-2">
          {categoryLabel && <span className="tag">{categoryLabel}</span>}
          {dish.mood1 && <span className="tag">{dish.mood1}</span>}
          {dish.mood2 && dish.mood2 !== dish.mood1 && (
            <span className="tag">{dish.mood2}</span>
          )}
        </div>

        {displayDesc && <p className="mb-2">{displayDesc}</p>}
        {dish.restaurant?.address && (
          <p className="text-sm text-gray-500 mb-4">{dish.restaurant.address}</p>
        )}

        <div className="flex flex-col gap-3">
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="kahoot-gray text-center py-3 rounded-2xl"
            >
              {t("directions")}
            </a>
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
      </div>
    </main>
  );
}
