"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import data from "../../../data/dishes.json";
import { useI18n } from "../../ui/LangProvider";

function slugify(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export default function DishPage() {
  const t = useI18n();
  const { id } = useParams(); // matches [id] in the folder name

  // Try to resolve the dish by multiple keys so /dish/shawarma-vake works:
  const dish =
    (Array.isArray(data) && data.find((d) => String(d.id) === String(id))) ||
    (Array.isArray(data) && data.find((d) => String(d.slug) === String(id))) ||
    (Array.isArray(data) && data.find((d) => slugify(d.name) === String(id))) ||
    null;

  if (!dish) {
    return (
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="card">
          <h1 className="text-xl font-bold mb-2">{t("notFound") || "Not found"}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t("dishNotFound") || "We couldn't find this dish."}
          </p>
          <Link href="/" className="kahoot-btn kahoot-purple inline-block">
            {t("goHome") || "Go home"}
          </Link>
        </div>
      </main>
    );
  }

  const districtToken = dish?.restaurant?.district;
  const districtLabel =
    districtToken ? t(`districts.${districtToken}`) ?? districtToken : "";

  const distText =
    typeof dish?.dist === "number" ? `${dish.dist.toFixed(1)} km` : null;

  return (
    <main className="max-w-md mx-auto px-4 py-6 space-y-4">
      <img
        src={dish.image}
        alt={dish.name || "Dish photo"}
        className="w-full h-48 object-cover rounded-2xl border"
      />

      <div className="card">
        <h1 className="text-2xl font-bold">{dish.name}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {dish.restaurant?.name}
          {districtLabel ? ` • ${districtLabel}` : ""}
        </p>
        <p className="mt-2 text-sm">
          ₾{dish.price}
          {distText ? ` • ${distText} ${t("away") || "away"}` : ""}
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {(dish.tags || []).map((tag) => (
            <span key={tag} className="tag">
              {t(`tags.${tag}`) ?? tag}
            </span>
          ))}
        </div>

        {dish.description && (
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            {dish.description}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Link href="/results" className="kahoot-btn kahoot-gray">
            {t("backToResults") || "Back to results"}
          </Link>
          <Link href="/" className="kahoot-btn kahoot-mint">
            {t("goHome") || "Home"}
          </Link>
        </div>
      </div>
    </main>
  );
}
