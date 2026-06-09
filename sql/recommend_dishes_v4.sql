-- =============================================================================
-- recommend_dishes v4 — current production recommender (live in Supabase)
-- Project ref: mmyxzagdcwnjjoowufiu
-- =============================================================================
--
-- This is the SQL definition for the recommend_dishes RPC currently running
-- in production. It's committed here so the ranking algorithm doesn't live
-- exclusively inside Supabase (where it would be lost if the project is paused,
-- deleted, or migrated).
--
-- ── How ranking works (matches the FAQ) ──────────────────────────────────────
--
-- Layer 1: Quality cut
--   Every restaurant gets a single "R10" quality score (0–10) combining
--   Google + Wolt ratings with Bayesian shrinkage (so low-review-count places
--   don't get artificially boosted). Restaurants below 7.5 are dropped from
--   the candidate pool entirely.
--
-- Layer 2: Mood match (~75% of the deterministic score)
--   - 0 moods → mood_score = 1.0 (pure rating mode)
--   - 1 mood  → soft preference (1.0 match, 0.5 non-match, both kept)
--   - 2 moods → at least one must match; first mood weighted 0.70, second 0.30,
--               small bonus if both match the dish's mood1+mood2 in order
--
-- Layer 3: Restaurant rating (~25% of the deterministic score)
--   Same R10 from Layer 1, normalized to 0–1 range.
--
-- Layer 4: Distance (~15% of the deterministic score)
--   Exponential decay with sigma=3km. Restaurants with no coordinates get 0.5
--   (neutral — no penalty, no boost). Distance is a soft preference, not a
--   filter — a 6km dish can still win if rating + mood are great.
--
-- Layer 5: Restaurant variety cap
--   ROW_NUMBER over (PARTITION BY restaurant_id) keeps only the top 2 dishes
--   per restaurant. Applied AFTER the deterministic score but BEFORE jitter,
--   so the cap is stable and doesn't flicker between requests.
--
-- Layer 6: Randomness
--   Final score = det_score + (uniform jitter in ±randomness range).
--   Default randomness = 0.625. "I'm feeling lucky" passes 0.9 from the
--   frontend (see app/results/ResultsClient.jsx).
--
-- ── Inputs ───────────────────────────────────────────────────────────────────
--
--   user_lat, user_lon            User location (or Vake fallback 41.71,44.77)
--   price_band                    'low' | 'med' | 'high' (maps to Low/Mid/Premium
--                                 in menu_items.price_bucket)
--   craving_categories text[]     Empty array = no category filter
--   vibe_moods text[]             0 / 1 / 2 elements (UI caps at 2)
--   exclude_dish_ids bigint[]     Recently-shown dish ids (session-level
--                                 anti-repeat, managed in lib/recommend.js)
--   randomness                    Jitter amplitude. 0 = deterministic,
--                                 1 = chaotic. Default 0.625.
--
-- ── Returns ──────────────────────────────────────────────────────────────────
--
--   TABLE of up to 10 rows. Column names match what lib/recommend.js expects.
--
-- ── Notes ────────────────────────────────────────────────────────────────────
--
--   - menu_items columns: item_name_en / item_name_ka, description_en /
--     description_ka, category_label, vibe_label, mood_2, price_bucket.
--     Georgian names + descriptions were loaded via scripts/load-ka-translations.mjs.
--   - district is currently returned as NULL — the new restaurants table
--     doesn't have a district column. Safe to drop from RETURNS in a follow-up.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.recommend_dishes(
  user_lat double precision,
  user_lon double precision,
  price_band text DEFAULT 'med'::text,
  craving_categories text[] DEFAULT '{}'::text[],
  vibe_moods text[] DEFAULT '{}'::text[],
  exclude_dish_ids bigint[] DEFAULT '{}'::bigint[],
  randomness double precision DEFAULT 0.625
)
RETURNS TABLE(
  dish_id bigint,
  dish_name text,
  dish_name_en text,
  dish_desc text,
  dish_desc_en text,
  price text,
  price_numeric numeric,
  image_url text,
  category text,
  mood1 text,
  mood2 text,
  rating double precision,
  dist_km double precision,
  score double precision,
  restaurant_id bigint,
  restaurant_name text,
  district text,
  lat double precision,
  lon double precision
)
LANGUAGE sql
AS $function$
WITH

-- ── 1. Wolt mean (prior for Wolt-only restaurants) ───────────────────────────
wolt_prior AS (
  SELECT COALESCE(AVG(wolt_rating), 8.4) AS v
  FROM   restaurants
  WHERE  wolt_rating IS NOT NULL
),

-- ── 2. R10 per restaurant ────────────────────────────────────────────────────
rated AS (
  SELECT
    r.id, r.name, r.address, r.lat, r.lon,
    CASE
      WHEN r.google_rating IS NOT NULL AND r.wolt_rating IS NOT NULL THEN
        0.70 * 2.0 * (
            (GREATEST(COALESCE(r.google_reviews, 0)::float, 0.0)
             / (GREATEST(COALESCE(r.google_reviews, 0)::float, 0.0) + 100.0))
            * r.google_rating
          + (100.0 / (GREATEST(COALESCE(r.google_reviews, 0)::float, 0.0) + 100.0))
            * 4.2
        )
        + 0.30 * r.wolt_rating

      WHEN r.google_rating IS NOT NULL THEN
        2.0 * (
            (GREATEST(COALESCE(r.google_reviews, 0)::float, 0.0)
             / (GREATEST(COALESCE(r.google_reviews, 0)::float, 0.0) + 100.0))
            * r.google_rating
          + (100.0 / (GREATEST(COALESCE(r.google_reviews, 0)::float, 0.0) + 100.0))
            * 4.2
        )

      WHEN r.wolt_rating IS NOT NULL THEN
        0.70 * r.wolt_rating + 0.30 * wp.v

      ELSE 8.4
    END AS r10
  FROM restaurants r
  CROSS JOIN wolt_prior wp
),

-- ── 3. Quality gate ───────────────────────────────────────────────────────────
qualified AS (
  SELECT * FROM rated WHERE r10 >= 7.5
),

-- ── 4. Dishes: filter + distance + mood score ─────────────────────────────────
--
--  Distance haversine (km) is computed here so dist_boost can reference it
--  in the next CTE without repeating the formula.
--
filtered AS (
  SELECT
    mi.id              AS dish_id,
    -- Bilingual: dish_name serves the Georgian original, dish_name_en the
    -- English translation. Frontend picks via `lang === "en" && dish.name_en`.
    -- NULLIF turns the ~20k empty-string ka rows into NULL so COALESCE actually
    -- falls back to English; otherwise KA mode would show blanks.
    COALESCE(NULLIF(mi.item_name_ka, ''),   mi.item_name_en)   AS dish_name,
    mi.item_name_en                                            AS dish_name_en,
    COALESCE(NULLIF(mi.description_ka, ''), mi.description_en) AS dish_desc,
    mi.description_en                                          AS dish_desc_en,
    mi.price,
    mi.price_numeric,
    mi.image_url,
    mi.category_label  AS category,
    mi.vibe_label      AS mood1,
    mi.mood_2          AS mood2,
    q.id               AS restaurant_id,
    q.name             AS restaurant_name,
    q.lat,
    q.lon,
    q.r10,

    6371.0 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(user_lat)) * cos(radians(q.lat))
        * cos(radians(q.lon) - radians(user_lon))
        + sin(radians(user_lat)) * sin(radians(q.lat))
      ))
    ) AS dist_km,

    -- Mood score
    --   0 moods → 1.0 (pure rating mode)
    --   1 mood  → soft: match=1.0, non-match=0.50 (mood preferred, not required)
    --   2 moods → weighted primary + secondary, filter already applied in WHERE
    CASE
      WHEN COALESCE(cardinality(vibe_moods), 0) = 0 THEN
        1.0

      WHEN COALESCE(cardinality(vibe_moods), 0) = 1 THEN
        CASE
          WHEN mi.vibe_label = vibe_moods[1] OR mi.mood_2 = vibe_moods[1] THEN 1.0
          ELSE 0.50
        END

      ELSE  -- 2 moods
        0.70 * CASE WHEN mi.vibe_label = vibe_moods[1] OR mi.mood_2 = vibe_moods[1]
                    THEN 1.0 ELSE 0.0 END
        + 0.30 * CASE WHEN mi.vibe_label = vibe_moods[2] OR mi.mood_2 = vibe_moods[2]
                      THEN 0.60 ELSE 0.0 END
        + CASE
            WHEN mi.vibe_label = vibe_moods[1] AND mi.mood_2 = vibe_moods[2] THEN 0.05
            WHEN mi.vibe_label = vibe_moods[2] AND mi.mood_2 = vibe_moods[1] THEN 0.02
            ELSE 0.0
          END
    END AS mood_score

  FROM menu_items mi
  JOIN qualified q ON mi.restaurant_id = q.id
  WHERE
    -- Strict numeric price filter — matches the UI labels exactly:
    -- "low" = under 20 GEL, "med" = 20 to under 40, "high" = 40 or more.
    -- Rows without a parseable numeric price are excluded so the budget
    -- filter is contractual ("20-40" really means 20-40, no 45-49 sneak-ins).
    -- The legacy `price_bucket` text column ('Low'/'Mid'/'Premium') is
    -- intentionally NOT used here — it allowed dishes up to 50 GEL into
    -- the Mid bucket, which broke the UI contract.
    mi.price_numeric IS NOT NULL
    AND (
      price_band IS NULL
      OR (price_band = 'low'  AND mi.price_numeric < 20)
      OR (price_band = 'med'  AND mi.price_numeric >= 20 AND mi.price_numeric < 40)
      OR (price_band = 'high' AND mi.price_numeric >= 40)
    )
    AND (COALESCE(cardinality(craving_categories), 0) = 0
         OR mi.category_label = ANY(craving_categories))
    -- Allow-list of categories the UI actually exposes. Excludes 'drink'
    -- (12k+ rows) and 'sauces' (3k+ rows) which were leaking into results
    -- when the user didn't pick a category. Using an allow-list instead
    -- of a deny-list is intentional: any future categories Bara adds via
    -- a re-scrape stay invisible until we explicitly opt them in.
    AND mi.category_label IN (
      'georgian', 'asian', 'pizza-pasta', 'fast food', 'healthy',
      'vegetarian-vegan', 'breakfast', 'dessert'
    )
    AND (
      COALESCE(cardinality(vibe_moods), 0) < 2
      OR mi.vibe_label = ANY(vibe_moods)
      OR mi.mood_2     = ANY(vibe_moods)
    )
    AND (COALESCE(cardinality(exclude_dish_ids), 0) = 0
         OR mi.id != ALL(exclude_dish_ids))
    AND mi.item_name_en IS NOT NULL
    AND mi.item_name_en <> ''
    -- Never recommend dishes without a photo — they look broken in the card UI.
    AND mi.image_url IS NOT NULL
    AND mi.image_url <> ''
    -- Exclude dishes whose names contain Cyrillic (Russian) characters. The
    -- app only displays Georgian + English; Russian leakage looks broken to
    -- users. Affects ~110 dishes (most from Sushi Rolls Vazha Pshavela whose
    -- entire menu was scraped in Russian).
    AND mi.item_name_en !~ '[Ѐ-ӿ]'
    AND (mi.item_name_ka IS NULL OR mi.item_name_ka !~ '[Ѐ-ӿ]')
),

-- ── 5. Deterministic score (no jitter) ───────────────────────────────────────
--
--  dist_score: exponential decay with sigma=3km (0→1.0, 3km→0.37, 10km→0.05).
--  Restaurants missing coordinates get 0.5 (neutral — no penalty, no boost).
--  det_score is computed here so the restaurant cap (step 6) ranks dishes
--  within each restaurant fairly, before random jitter is added in step 7.
--
scored AS (
  SELECT *,
    CASE
      WHEN lat IS NOT NULL AND lon IS NOT NULL
        THEN exp(-dist_km / 3.0)
      ELSE 0.5
    END AS dist_score,
    0.75 * mood_score
      + 0.25 * LEAST(r10 / 10.0, 1.0)
      + 0.15 * CASE
                 WHEN lat IS NOT NULL AND lon IS NOT NULL
                   THEN exp(-dist_km / 3.0)
                 ELSE 0.5
               END
    AS det_score
  FROM filtered
),

-- ── 6. Restaurant cap: keep the best 2 dishes per restaurant ─────────────────
--
--  Ranked by det_score (no jitter yet) so the cap is stable and fair.
--  Jitter is added below, after the cap, so top-2 per restaurant can still
--  land anywhere in the final top-10.
--
capped AS (
  SELECT *
  FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY det_score DESC) AS rn
    FROM scored
  ) ranked
  WHERE rn <= 2
)

-- ── 7. Add jitter and return top 10 ──────────────────────────────────────────
SELECT
  dish_id,
  dish_name,
  dish_name_en,
  dish_desc,
  dish_desc_en,
  price,
  price_numeric,
  image_url,
  category,
  mood1,
  mood2,
  r10                                                     AS rating,
  dist_km,
  det_score + (random() * 2.0 - 1.0) * randomness        AS score,
  restaurant_id,
  restaurant_name,
  NULL::text                                              AS district,
  lat,
  lon
FROM capped
ORDER BY score DESC
LIMIT 10;
$function$;

GRANT EXECUTE ON FUNCTION public.recommend_dishes(
  double precision, double precision, text, text[], text[], bigint[], double precision
) TO anon, authenticated;
