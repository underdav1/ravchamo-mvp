"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DishCard from "../../components/DishCard";
import SearchingLoader from "../../components/SearchingLoader";
import { recommend } from "../../lib/recommend";
import { useI18n } from "../ui/LangProvider";

export default function ResultsClient() {
  const t = useI18n();
  const params = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    const lat = parseFloat(params.get("lat") || "0");
    const lon = parseFloat(params.get("lon") || "0");
    const price = params.get("price") || "med";
    const tags = (params.get("tags") || "").split(",").filter(Boolean);
    const mood = params.get("mood") || "";
    const lucky = params.get("lucky") === "1";

    return {
      loc: lat && lon ? { lat, lon } : null,
      price,
      tags,
      mood,
      // "I'm feeling lucky" should feel meaningfully more chaotic than
      // "Show results" — bump score jitter from the server default (0.35) to 0.6.
      ...(lucky ? { randomness: 0.6 } : {}),
    };
  }, [params]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    recommend(user).then((recs) => {
      if (cancelled) return;
      setItems(recs);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <main>
      <h1 className="text-xl font-bold mb-3">{t("resultsTop")}</h1>
      {loading && <SearchingLoader />}
      {!loading && items.length === 0 && (
        <div className="text-gray-600 dark:text-gray-400">{t("noMatches")}</div>
      )}
      {!loading && items.map((d) => <DishCard key={d.id} dish={d} />)}
    </main>
  );
}
