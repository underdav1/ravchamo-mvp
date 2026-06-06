// Supabase client.
// The publishable key is intentionally public — it's safe to ship in client code
// when RLS is enabled with the right policies. We rely on RLS to restrict writes.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mmyxzagdcwnjjoowufiu.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teXh6YWdkY3duampvb3d1Zml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTQ2NDUsImV4cCI6MjA5MzM5MDY0NX0.wWPZJCl_wzgxSt0VRAZkmgQhGx6E7rxygOEORhiVBCE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
