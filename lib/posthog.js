// PostHog client — initialized once at app start via PostHogProvider.
//
// The project key is intentionally public — same role as the Supabase
// publishable key. Anyone reading the page source can see it; the security
// model is "this key can write events but never read them."
//
// Posture:
//   - EU hosting (matches our user base; data stays in EU jurisdiction)
//   - IP anonymization on (we don't need precise IPs for behavior analysis)
//   - Session replay OFF (privacy + payload size)
//   - Pageview tracking handled manually via PostHogPageView so SPA route
//     changes are captured correctly (App Router doesn't trigger PostHog's
//     default `$pageview` autocapture on client-side nav)

import posthog from "posthog-js";

const PH_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  "phc_snBrDQ9jJfotdFuCmir92HgjRZDBqTj29GyjYjiJApAx";

const PH_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ||
  "https://eu.i.posthog.com";

let initialized = false;

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (initialized) return;
  initialized = true;

  posthog.init(PH_KEY, {
    api_host: PH_HOST,
    // Auto-capture is fine for misc clicks (e.g. our hidden taps), but we do
    // pageviews manually below for App Router SPA navigation correctness.
    capture_pageview: false,
    capture_pageleave: true,
    // Privacy
    ip: false,                  // server-side: anonymize IP
    disable_session_recording: true,
    persistence: "localStorage", // simpler than cookies; we already use lS
    autocapture: true,           // captures incidental clicks; useful for funnel discovery
    respect_dnt: true,
    // EU compliance niceties
    opt_out_capturing_by_default: false,
    // Less noise in console during development
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.debug(false);
      }
    },
  });
}

/**
 * Thin wrapper so call sites don't have to import posthog directly and we get
 * a single place to add cross-cutting properties later (e.g. lang, theme).
 * Silently no-ops on the server or before init — safe to call from anywhere.
 */
export function track(event, properties) {
  if (typeof window === "undefined") return;
  if (!initialized) return;
  try {
    posthog.capture(event, properties);
  } catch (err) {
    // Tracking should NEVER break the app. Swallow errors silently.
    if (process.env.NODE_ENV === "development") {
      console.warn("[track] failed:", err);
    }
  }
}

/**
 * Send-immediately variant for outbound link clicks (target="_blank" etc).
 * PostHog batches events with a ~100ms delay, which means a regular
 * `capture()` on a link that navigates away can be lost before the request
 * leaves the browser. `send_instantly: true` flushes the event through
 * `navigator.sendBeacon()` (or a sync XHR fallback) so it ships even if
 * the user immediately switches tabs or closes the page.
 *
 * Use this for: wolt_clicked, directions_clicked, any other anchor with
 * target="_blank" or rel that triggers navigation.
 */
export function trackOutbound(event, properties) {
  if (typeof window === "undefined") return;
  if (!initialized) return;
  try {
    posthog.capture(event, properties, { send_instantly: true });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[trackOutbound] failed:", err);
    }
  }
}

export { posthog };
