"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import data from "../../data/dishes.json";
import DishCard from "../../components/DishCard";
import { recommend } from "../../lib/recommend";
import { useI18n } from "../ui/LangProvider";

export default function ResultsClient() {
  const t = useI18n();
  const params = useSearchParams();
  const [items, setItems] = useState([]);

  const user = useMemo(() => {
    const lat = parseFloat(params.get("lat") || "0");
    const lon = parseFloat(params.get("lon") || "0");
    const price = params.get("price") || "med";
    const tags = (params.get("tags") || "").split(",").filter(Boolean);
    const mood = params.get("mood") || "";

    return {
      loc: lat && lon ? { lat, lon } : null,
      price,
      tags,
      mood,
    };
  }, [params]);

  useEffect(() => {
    let pool = [...data];
    if (params.get("lucky") === "1") {
      // Shuffle for variety, then let recommend() do its work
      pool.sort(() => Math.random() - 0.5);
    }
    const recs = recommend(user, pool);
    setItems(recs);
  }, [user, params]);

  return (
    <main>
      <h1 className="text-xl font-bold mb-3">{t("resultsTop")}</h1>
      {items.length === 0 && (
        <div className="text-gray-600 dark:text-gray-400">{t("noMatches")}</div>
      )}
      {items.map((d) => (
        <DishCard key={d.id} dish={d} />
      ))}
    </main>
  );
}
