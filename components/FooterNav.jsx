"use client";

import Link from "next/link";
import { useI18n } from "../app/ui/LangProvider";

/**
 * Footer link row — extracted from layout.jsx so the "Send feedback" link can
 * be i18n-aware (layout.jsx is a server component, so it can't call hooks).
 * Reviews and FAQ are kept as English-only labels because they're brand-stable.
 */
export default function FooterNav() {
  const t = useI18n();
  return (
    <div className="mt-2 flex gap-4 flex-wrap">
      <Link
        href="/blog"
        className="inline-block underline-offset-2 hover:underline"
      >
        Reviews
      </Link>
      <Link
        href="/faq"
        className="inline-block underline-offset-2 hover:underline"
      >
        FAQ
      </Link>
      <Link
        href="/feedback"
        className="inline-block underline-offset-2 hover:underline"
      >
        {t("feedback.nav")}
      </Link>
    </div>
  );
}
