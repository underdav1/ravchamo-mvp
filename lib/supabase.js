// Supabase client.
// The publishable key is intentionally public — it's safe to ship in client code
// when RLS is enabled with the right policies. We rely on RLS to restrict writes.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mmyxzagdcwnjjoowufiu.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_PbvLA3S33BZQAnqFxKWArQ_UD1YlOMG";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
