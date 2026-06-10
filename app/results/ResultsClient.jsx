"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DishCard from "../../components/DishCard";
import SearchingLoader from "../../components/SearchingLoader";
import BigButton from "../../components/BigButton";
import { recommend } from "../../lib/recommend";
import { useI18n } from "../ui/LangProvider";
import { track } from "../../lib/posthog";

// sessionStorage history for /results. Keyed by stringified filter set so
// two different filter combinations don't collide.
//
// Data shape stored under each key:
//   { history: [[dish, dish, ...], [dish, dish, ...], ...], cursor: 0 }
//
//   - `history` is an array of batches (each batch is an array of dish
//     objects, normally 10). Index 0 is the first batch the user saw,
//     index N is the latest.
//   - `cursor` is the index of the batch currently rendered.
//
// Why sessionStorage and not localStorage: history clears when the tab
// closes, so a fresh visit gets fresh recommendations. In-session, the
// user can flip back and forth freely.
//
// Hard cap on history length so storage doesn't grow forever during long
// sessions. 10 batches = 100 dishes; plenty for any realistic flow.
const CACHE_PREFIX = "ravchamo:results:";
const HISTORY_CAP = 10;

function cacheKey(user) {
  // Stable key derived from the filter state. We intentionally include
  // `lucky` (via randomness) so "feeling lucky" results cache separately
  // from regular search. We exclude lat/lon because tiny GPS drift between
  // mount cycles would break the cache for the same logical query.
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

function readState(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      !Array.isArray(parsed.history) ||
      typeof parsed.cursor !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeState(key, state) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    // quota exceeded / private mode — silently ignore
  }
}

export default function ResultsClient() {
  const t = useI18n();
  const params = useSearchParams();

  // Single state object so cursor and history move together — avoids
  // out-of-sync renders where, say, the cursor advances before the history
  // array is updated.
  const [state, setState] = useState({ history: [], cursor: 0 });
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

  // Items currently rendered = the batch at the cursor position. Memoize
  // so we don't recreate the array on every render.
  const items = useMemo(() => {
    return state.history[state.cursor] || [];
  }, [state]);

  // Fetch a new batch from the recommender and append it to history.
  // lib/recommend.js automatically appends just-returned dish ids to a
  // localStorage seen-list and forwards them as exclude_dish_ids on the
  // next call — so each call returns a different batch without any extra
  // plumbing here.
  const fetchAndAppend = useCallback(
    (signal) => {
      setLoading(true);
      setError(null);
      return recommend(user)
        .then((recs) => {
          if (signal?.aborted) return;
          setState((prev) => {
            // Drop oldest batches if we'd exceed the cap. We slice from the
            // front because the most recent batches are the ones the user
            // is likely to flip back to; ancient ones are safe to forget.
            const nextHistory = [...prev.history, recs].slice(-HISTORY_CAP);
            const nextState = {
              history: nextHistory,
              cursor: nextHistory.length - 1,
            };
            writeState(cacheKey(user), nextState);
            return nextState;
          });
          setLoading(false);
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

  // Initial mount / filter change. Restore from sessionStorage if we have
  // a history for this exact filter set; otherwise fetch the first batch.
  useEffect(() => {
    const ctrl = new AbortController();
    const cached = readState(cacheKey(user));
    if (cached && cached.history.length > 0) {
      setState(cached);
      setLoading(false);
      return () => ctrl.abort();
    }
    fetchAndAppend(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchAndAppend, user]);

  // "Next page" — if we already have a batch ahead in history, step into
  // it instantly (no fetch). If we're at the end, fetch a fresh batch.
  function handleNext() {
    track("recommend_see_other", {
      price: user.price,
      tag: user.tag || null,
      moods: user.moods,
      direction: "next",
      cursor: state.cursor,
      history_len: state.history.length,
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (state.cursor < state.history.length - 1) {
      // Replay a batch we already have. No fetch, no loader.
      setState((prev) => {
        const nextState = { ...prev, cursor: prev.cursor + 1 };
        writeState(cacheKey(user), nextState);
        return nextState;
      });
    } else {
      fetchAndAppend();
    }
  }

  // "Previous page" — step backwards through history. Pure local state
  // change, never fetches. Hidden when we're already at cursor 0.
  function handlePrev() {
    if (state.cursor === 0) return;
    track("recommend_see_other", {
      price: user.price,
      tag: user.tag || null,
      moods: user.moods,
      direction: "prev",
      cursor: state.cursor,
      history_len: state.history.length,
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setState((prev) => {
      const nextState = { ...prev, cursor: prev.cursor - 1 };
      writeState(cacheKey(user), nextState);
      return nextState;
    });
  }

  const canGoPrev = state.cursor > 0;
  const showNav = !loading && !error && items.length > 0;

  return (
    <main>
      <h1 className="text-xl font-bold mb-1">{t("resultsTop")}</h1>
      {/* Subtitle exists primarily to teach users that the dish cards are
          tappable. PostHog showed 75% of search-doers never clicked a card,
          which we suspect is "didn't realize they could." Small font + muted
          color so it informs without competing with the actual results. */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {t("resultsSubtitle")}
      </p>
      {loading && <SearchingLoader />}
      {!loading && error && (
        <div className="text-red-600 dark:text-red-400">
          {t("loadError") || "Could not load recommendations. Please try again."}
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="text-gray-600 dark:text-gray-400">{t("noMatches")}</div>
      )}
      {!loading &&
        items.map((d, i) => <DishCard key={d.id} dish={d} position={i + 1} />)}

      {/* Two-button nav. Previous only shows once we've moved past the first
          batch, so the empty state and very first batch don't get visual
          noise. Next is always shown when results exist. The buttons stay
          equal-width via grid even when prev is hidden — we render a spacer
          div on the left for layout stability. */}
      {showNav && (
        <div className="mt-4 mb-2 grid grid-cols-2 gap-3">
          {canGoPrev ? (
            <BigButton className="kahoot-gray" onClick={handlePrev}>
              ← {t("prevPage")}
            </BigButton>
          ) : (
            <div /> /* spacer keeps next button right-aligned */
          )}
          <BigButton className="kahoot-mint" onClick={handleNext}>
            {t("nextPage")} →
          </BigButton>
        </div>
      )}
    </main>
  );
}
