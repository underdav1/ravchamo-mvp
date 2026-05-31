-- =============================================================================
-- recommend_dishes v2 — add jitter + session exclude list
-- Apply via Supabase SQL Editor. Project ref: mmyxzagdcwnjjoowufiu
-- =============================================================================
--
-- Three surgical changes to the existing function:
--
--   1. Add two new optional params at the END of the signature:
--        randomness        numeric default 0.35
--        exclude_dish_ids  int[]   default '{}'
--
--   2. Inside the `scored` CTE, multiply the final score expression by:
--        (1 + randomness * (2 * random() - 1))
--      This jitters the score by ±randomness (±35% by default).
--
--   3. Add to the WHERE clause inside `scored`:
--        and (array_length(exclude_dish_ids, 1) is null
--             or not (d.id = any(exclude_dish_ids)))
--
-- Everything else stays identical (CTE structure, diversification by
-- restaurant, LIMIT 10, return columns). Re-grant EXECUTE to anon and
-- authenticated at the bottom.
--
-- ── How to apply ─────────────────────────────────────────────────────────────
-- Option A (preferred): in the Supabase SQL Editor, run:
--
--     select pg_get_functiondef(p.oid)
--     from pg_proc p
--     join pg_namespace n on n.oid = p.pronamespace
--     where n.nspname = 'public' and p.proname = 'recommend_dishes';
--
-- Copy the output, apply the three changes above, then run the modified
-- CREATE OR REPLACE FUNCTION ... statement.
--
-- Option B: use the template below — replace the marked sections to match
-- your existing scoring expression and join structure.
-- ── Smoke test ───────────────────────────────────────────────────────────────
-- Run twice and confirm the ordering changes between calls:
--
--     SELECT * FROM recommend_dishes(
--       41.71, 44.77, 'med', ARRAY['georgian'], 'I''m on a hangover'
--     );
-- =============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- Template (Option B). Replace `<<EXISTING_SCORE_EXPRESSION>>`, the FROM/JOIN
-- block, and any other scoring details with whatever is currently in your
-- function. The points that MUST match the spec above are marked with [v2].
-- ──────────────────────────────────────────────────────────────────────────────

create or replace function public.recommend_dishes(
  user_lat            double precision,
  user_lon            double precision,
  price_band          text,
  craving_categories  text[],
  vibe_mood           text,
  randomness          numeric default 0.35,   -- [v2] new param
  exclude_dish_ids    int[]   default '{}'    -- [v2] new param
)
returns table (
  dish_id          int,
  dish_name        text,
  dish_desc        text,
  price            numeric,
  image_url        text,
  category         text,
  mood1            text,
  mood2            text,
  rating           numeric,
  dist_km          numeric,
  score            numeric,
  restaurant_id    int,
  restaurant_name  text,
  district         text,
  lat              double precision,
  lon              double precision
)
language sql
stable
as $$
  with scored as (
    select
      d.id              as dish_id,
      d.name            as dish_name,
      d.description     as dish_desc,
      d.price           as price,
      d.image_url       as image_url,
      d.category        as category,
      d.mood1           as mood1,
      d.mood2           as mood2,
      r.rating          as rating,
      -- existing distance calc (haversine or earthdistance) goes here
      <<EXISTING_DISTANCE_EXPRESSION>>           as dist_km,

      -- [v2] multiply existing score expression by jitter factor
      (<<EXISTING_SCORE_EXPRESSION>>)
        * (1 + randomness * (2 * random() - 1)) as score,

      r.id              as restaurant_id,
      r.name            as restaurant_name,
      r.district        as district,
      r.lat             as lat,
      r.lon             as lon
    from dishes d
    join restaurants r on r.id = d.restaurant_id
    where
      -- existing filters (price band, craving categories, vibe_mood, etc.)
      <<EXISTING_WHERE_CLAUSE>>
      -- [v2] session exclude
      and (array_length(exclude_dish_ids, 1) is null
           or not (d.id = any(exclude_dish_ids)))
  ),
  diversified as (
    -- existing per-restaurant diversification: rank within each restaurant
    -- by jittered score and keep only the top-N per restaurant
    select *,
           row_number() over (
             partition by restaurant_id
             order by score desc
           ) as rn
    from scored
  )
  select
    dish_id, dish_name, dish_desc, price, image_url, category,
    mood1, mood2, rating, dist_km, score,
    restaurant_id, restaurant_name, district, lat, lon
  from diversified
  where rn = 1                       -- or whatever cap the original used
  order by score desc
  limit 10;
$$;

-- [v2] re-grant execute (CREATE OR REPLACE preserves grants, but be explicit)
grant execute on function public.recommend_dishes(
  double precision, double precision, text, text[], text, numeric, int[]
) to anon, authenticated;
