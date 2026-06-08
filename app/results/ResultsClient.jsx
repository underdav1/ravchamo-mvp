"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DishCard from "../../components/DishCard";
import SearchingLoader from "../../components/SearchingLoader";
import BigButton from "../../components/BigButton";
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

  // Shared fetcher used by both the initial load and the "See other results"
  // button. lib/recommend.js automatically appends the just-returned dish ids
  // to a localStorage seen-list and forwards it as exclude_dish_ids on the
  // next call — so re-running with the same `user` reliably produces a
  // different batch without any extra state plumbing here.
  const fetchResults = useCallback(
    (signal) => {
      setLoading(true);
      setError(null);
      return recommend(user)
        .then((recs) => {
          if (signal?.aborted) return;
          setItems(recs);
          setLoading(false);
        })
        .catch((err) => {
          if (signal?.aborted) return;
          console.error("recommend failed:", err);
          setError(err?.message || "Something went wrong");
          setLoading(false);
        });
    },
    [user]
  );

  // Initial fetch on mount / filter change. AbortSignal pattern keeps us safe
  // from "set state on unmounted component" warnings if the user navigates
  // away mid-request.
  useEffect(() => {
    const ctrl = new AbortController();
    fetchResults(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchResults]);

  // "See other results" handler — re-fetch with the same filters, then jump
  // back to the top so the new top pick is the first thing the user sees.
  // smooth scroll feels more polished than a hard jump.
  function handleSeeOther() {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    fetchResults();
  }

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

      {/* Only show the "see other" button when we actually have results to
          come back from. No point offering it on an empty state — the user
          should adjust filters instead. */}
      {!loading && !error && items.length > 0 && (
        <div className="mt-4 mb-2">
          <BigButton className="kahoot-mint" onClick={handleSeeOther}>
            🔄 {t("seeOtherResults")}
          </BigButton>
        </div>
      )}
    </main>
  );
}
