"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../app/ui/LangProvider";

// Food emoji rotation. Kept short and varied so it feels playful, not random.
const EMOJIS = ["🍔", "🍕", "🥗", "🍜", "🍣", "🌮", "🥟", "🍰", "🍳", "🌶"];

/**
 * Animated "searching" loader shown while the recommend RPC is in flight.
 *
 * Design notes:
 *   - The actual RPC usually returns in 200–800ms, so a real determinate
 *     progress bar would just flash. We fake a smooth animation that grows
 *     toward ~92% over ~1.5s and stalls there. When `loading` flips false
 *     the parent simply unmounts us — the user never sees 100% explicitly,
 *     they just see results appear. This is the same pattern YouTube,
 *     GitHub, and most "indeterminate but feels real" loaders use.
 *   - The food emoji on top of the bar cycles every 350ms. Position is
 *     tied to the same progress value so it visually rides the bar.
 *   - Color uses the same blue as the "Show results" button (`.loader-fill`
 *     defined in globals.css with a dark-mode variant) so the transition
 *     from button → loader feels continuous.
 */
export default function SearchingLoader() {
  const t = useI18n();
  const [progress, setProgress] = useState(8); // start a bit in so it's visible
  const [emojiIdx, setEmojiIdx] = useState(0);

  // Progress: ease toward ~92% asymptotically. Each tick adds ~6% of the
  // remaining gap, so growth is fast at first and slows as it approaches
  // the cap — feels organic and never finishes on its own.
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p;
        const next = p + (92 - p) * 0.06;
        return Math.min(next, 92);
      });
    }, 60);
    return () => clearInterval(id);
  }, []);

  // Emoji rotation — every 350ms feels lively without being twitchy.
  useEffect(() => {
    const id = setInterval(() => {
      setEmojiIdx((i) => (i + 1) % EMOJIS.length);
    }, 350);
    return () => clearInterval(id);
  }, []);

  const label = t("fetchingFood") || "Fetching your food...";
  const currentEmoji = EMOJIS[emojiIdx];

  return (
    <div className="card flex flex-col items-center py-8" aria-live="polite">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {label}
      </div>

      {/* The progress bar track. The emoji sits absolutely positioned above
          the filled portion and rides it as progress grows. */}
      <div className="relative w-full max-w-xs">
        {/* Emoji marker — translates so the emoji center sits on the
            progress edge. transition-all keeps the slide smooth between
            both progress steps and emoji swaps. */}
        <div
          className="absolute -top-7 text-2xl transition-all duration-300 ease-out"
          style={{
            left: `${progress}%`,
            transform: "translateX(-50%)",
          }}
          aria-hidden="true"
        >
          {currentEmoji}
        </div>

        {/* Track */}
        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          {/* Fill — uses .loader-fill from globals.css, which has a
              dark-mode variant baked in. */}
          <div
            className="loader-fill h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
