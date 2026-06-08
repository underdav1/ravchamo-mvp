"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, posthog } from "../lib/posthog";

/**
 * Initializes PostHog on mount and emits a $pageview on every App Router
 * navigation. We can't rely on PostHog's built-in pageview autocapture
 * because Next.js App Router does client-side navigation without a full
 * page reload, so the default heuristic misses route changes.
 *
 * Why two components: useSearchParams() requires a Suspense boundary in App
 * Router, otherwise every page that uses this provider opts out of static
 * generation at build time. Splitting the search-param-using logic into a
 * child wrapped in <Suspense> keeps the outer provider statically rendered
 * and the rest of the layout unaffected.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Emit a pageview on every route change (including ?query changes)
  useEffect(() => {
    if (!pathname) return;
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    try {
      posthog.capture("$pageview", {
        $current_url: typeof window !== "undefined" ? window.location.href : url,
        path: url,
      });
    } catch {
      // posthog may not be initialized yet on the very first paint — fine
    }
  }, [pathname, searchParams]);

  return null;
}

export default function PostHogProvider({ children }) {
  // Initialize once on mount. This runs at the static layout level so it
  // doesn't pin the layout to a dynamic render.
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
