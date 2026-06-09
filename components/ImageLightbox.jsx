"use client";

import { useEffect } from "react";

/**
 * Modal image viewer. Opens when `src` is non-null; closes via `onClose`.
 *
 * UX notes:
 *   - Backdrop click closes (the user's instinct), but clicks on the image
 *     itself do NOT propagate — so accidentally tapping the photo while
 *     viewing it doesn't dismiss it.
 *   - ESC key closes (desktop power-user nicety, costs nothing on mobile).
 *   - Body scroll is locked while open, otherwise iOS scrolls the page
 *     behind the modal which feels broken.
 *   - The image is sized to fit the viewport, never larger. We avoid a
 *     true "zoom in further" gesture; native pinch-zoom on the modal works
 *     because the underlying <img> is fixed-size and the browser handles it.
 *   - We use an explicit X button (top-right) because a tap-anywhere model
 *     hides the dismiss affordance from less technical users.
 */
export default function ImageLightbox({ src, alt, onClose }) {
  // Lock background scroll while open. Cleanup restores prior overflow so we
  // don't permanently lock the page if multiple modals stack (none do today,
  // but good practice).
  useEffect(() => {
    if (!src) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [src]);

  // ESC to close
  useEffect(() => {
    if (!src) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Dish photo"}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/85 backdrop-blur-sm p-4
                 animate-[fadeIn_120ms_ease-out]"
    >
      {/* Close button — fixed top-right of viewport, not the image, so it's
          always reachable even on tall portrait photos. aria-label so screen
          readers announce it correctly. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 w-10 h-10 rounded-full
                   bg-white/15 hover:bg-white/25 active:bg-white/35
                   text-white text-2xl leading-none
                   flex items-center justify-center
                   transition-colors"
      >
        ×
      </button>

      {/* Image — stopPropagation prevents the backdrop's onClick from firing
          when the user taps the image itself. Sized to fit the viewport
          via max-w/max-h; object-contain preserves aspect ratio. */}
      <img
        src={src}
        alt={alt || ""}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-2xl
                   shadow-2xl"
      />

      {/* Lightweight keyframes — defined inline so we don't pollute globals.css
          for a one-off animation. */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
