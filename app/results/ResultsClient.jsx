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
  const [error, setError] = useState(null);

  const user = useMemo(() => {
    const lat = parseFloat(params.get("lat") || "0");
    const lon = parseFloat(params.get("lon") || "0");
    const price = params.get("price") || "med";
    const tag = params.get("tag") || "";
    const moods = (params.get("moods") || "").split(",").filter(Boolean);
    const lucky = params.get("lucky") === "1";

    return {
      loc: lat && lon ? { lat, lon } : null,
      price,
      tag,
      moods,
      // "I'm feeling lucky" uses higher jitter (0.9 vs default 0.625) so
      // the result feels genuinely unpredictable rather than just varied.
      ...(lucky ? { randomness: 0.9 } : {}),
    };
  }, [params]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    recommend(user)
      .then((recs) => {
        if (cancelled) return;
        setItems(recs);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("recommend failed:", err);
        setError(err?.message || "Something went wrong");
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
      {!loading && error && (
        <div className="text-red-600 dark:text-red-400">
          {t("loadError") || "Could not load recommendations. Please try again."}
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="text-gray-600 dark:text-gray-400">{t("noMatches")}</div>
      )}
      {!loading && items.map((d) => <DishCard key={d.id} dish={d} />)}
    </main>
  );
}
