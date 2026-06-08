"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DishCard from "../../components/DishCard";
import SearchingLoader from "../../components/SearchingLoader";
import BigButton from "../../components/BigButton";
import { recommend } from "../../lib/recommend";
import { useI18n } from "../ui/LangProvider";
import { track } from "../../lib/posthog";

// sessionStorage cache for /results. Keyed by stringified filter set so two
// different filter combinations don't collide. Cleared automatically when the
// tab closes — so a fresh visit gets fresh recommendations, but in-session
// back-navigation (dish detail → back) restores the exact same 10 dishes.
const CACHE_PREFIX = "ravchamo:results:";

function cacheKey(user) {
  // Stable key derived from the filter state. We intentionally include `lucky`
  // (via randomness) so "feeling lucky" results cache separately from regular
  // search. We exclude lat/lon because tiny GPS drift between mount cycles
  // would break the cache for the same logical query.
  return (
    CACHE_PREFIX +
    JSON.stringify({
      price: user.price,
      tag: user.tag,
      moods: user.moods,
      lucky: typeof user.randomness === "number",
    })
  );
}

function readCache(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(key, items) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(items));
  } catch {
    // quota exceeded / private mode — silently ignore, the page still works
  }
}

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
  //
  // Every successful fetch writes the result to sessionStorage under the
  // filter-derived cache key, so back-navigation can hydrate from cache.
  const fetchResults = useCallback(
    (signal) => {
      setLoading(true);
      setError(null);
      return recommend(user)
        .then((recs) => {
          if (signal?.aborted) return;
          setItems(recs);
          setLoading(false);
          writeCache(cacheKey(user), recs);
          // Empty results = a filter combination that found nothing. This is
          // gold for finding broken filter combos and category gaps in the
          // data — surface them as a distinct event.
          if (recs.length === 0) {
            track("empty_results", {
              price: user.price,
              tag: user.tag || null,
              moods: user.moods,
              lucky: typeof user.randomness === "number",
            });
          }
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

  // Initial mount / filter change. Check the session cache FIRST — if the
  // user is returning to the same filter set within this tab, restore the
  // exact dishes they saw last time instead of generating a fresh batch.
  // Only call the recommender if no cache exists.
  useEffect(() => {
    const ctrl = new AbortController();
    const cached = readCache(cacheKey(user));
    if (cached) {
      setItems(cached);
      setLoading(false);
      return () => ctrl.abort();
    }
    fetchResults(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchResults, user]);

  // "See other results" handler — explicitly bypasses the cache by calling
  // fetchResults directly. The new batch overwrites the cache, so subsequent
  // back-navigation restores the new dishes (the most recent set the user
  // actually saw), not the old ones. Smooth scroll to top first so the new
  // top pick is the first thing they see.
  function handleSeeOther() {
    track("recommend_see_other", {
      price: user.price,
      tag: user.tag || null,
      moods: user.moods,
    });
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
      {!loading && items.map((d, i) => <DishCard key={d.id} dish={d} position={i + 1} />)}

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
