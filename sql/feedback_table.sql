-- =============================================================================
-- feedback table — stores user-submitted feedback from /feedback page
-- =============================================================================
--
-- Stores anonymous (or self-identified) feedback from website visitors:
-- restaurant suggestions, feature requests, bug reports, general notes.
--
-- Design notes:
--   - `type` is a constrained text column rather than an enum so we can add
--     new categories later without a migration.
--   - `email` is optional. If filled, David can reply directly.
--   - `lang` captures whether the user was viewing EN or KA when they wrote
--     the feedback — useful for prioritizing translation effort or replying
--     in the right language.
--   - RLS policy allows the anon (publishable) key to INSERT only — no SELECT,
--     UPDATE, or DELETE. Browser code can submit but can't read other users'
--     submissions.
--   - The owner role can SELECT freely from the Supabase dashboard.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id          bigserial PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  type        text NOT NULL CHECK (type IN ('restaurant', 'feature', 'bug', 'other')),
  message     text NOT NULL CHECK (length(message) BETWEEN 1 AND 5000),
  email       text CHECK (email IS NULL OR length(email) BETWEEN 3 AND 200),
  lang        text NOT NULL DEFAULT 'en' CHECK (lang IN ('en', 'ka')),
  user_agent  text,    -- captured from the request for spam triage if needed
  resolved    boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_unresolved ON public.feedback(resolved) WHERE resolved = false;

-- RLS: publish key can INSERT, never SELECT/UPDATE/DELETE
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon can insert feedback" ON public.feedback;
CREATE POLICY "anon can insert feedback"
  ON public.feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Nobody can read via the API. The owner (you) can read via Supabase dashboard.
DROP POLICY IF EXISTS "no public select" ON public.feedback;
CREATE POLICY "no public select"
  ON public.feedback
  FOR SELECT
  TO anon, authenticated
  USING (false);

GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.feedback_id_seq TO anon, authenticated;
