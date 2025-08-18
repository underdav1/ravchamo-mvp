"use client";

import { useLang } from "./LangProvider";

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  const base =
    "px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none";
  const inactive =
    "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200";
  const active =
    "bg-gray-900 text-white dark:bg-white dark:text-gray-900";

  return (
    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        aria-label="Switch to English"
        className={`${base} ${lang === "en" ? active : inactive}`}
      >
        <span role="img" aria-label="US flag">🇺🇸</span>
        <span className="ml-1">EN</span>
      </button>
      <button
        type="button"
        onClick={() => setLang("ka")}
        aria-pressed={lang === "ka"}
        aria-label="Switch to Georgian"
        className={`${base} border-l border-gray-200 dark:border-gray-700 ${
          lang === "ka" ? active : inactive
        }`}
      >
        <span role="img" aria-label="Georgian flag">🇬🇪</span>
        <span className="ml-1">KA</span>
      </button>
    </div>
  );
}
