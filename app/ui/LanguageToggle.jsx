"use client";

import { useI18n } from "./LangProvider";

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();

  // show the OTHER language as the action
  const next = lang === "en" ? "ka" : "en";
  const label = lang === "en" ? "🇬🇪 KA • Georgian" : "🇺🇸 EN • English";

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label="Switch language"
      title="Switch language"
      className="px-3 py-1 text-sm rounded-md border bg-white hover:bg-gray-50"
    >
      {label}
    </button>
  );
}
