"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, posthog } from "../lib/posthog";

/**
 * Initializes PostHog on mount and emits a $pageview on every App Router
 * navigation. We can't rely on PostHog's built-in pageview autocapture
 * because Next.js App Router does client-side navigation without a full
 * page reload, so the default heuristic misses route changes.
 *
 * Mounted once in the root layout. Children pass through unchanged.
 */
export default function PostHogProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize once on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Emit a pageview on every route change (including ?query changes)
  useEffect(() => {
    if (!pathname) return;
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    try {
      posthog.capture("$pageview", { $current_url: window.location.href, path: url });
    } catch {
      // posthog may not be initialized yet on the very first paint — fine
    }
  }, [pathname, searchParams]);

  return children;
}
