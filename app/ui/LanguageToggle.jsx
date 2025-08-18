"use client";

import { useLang } from "./LangProvider";

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  const btnBase =
    "px-2.5 py-1.5 text-sm rounded-lg border transition " +
    "bg-white border-gray-200 text-gray-800 " +
    "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100";

  const active =
    "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 border-gray-900";

  return (
    <div className="inline-flex gap-1">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`${btnBase} ${lang === "en" ? active : ""}`}
        aria-pressed={lang === "en"}
      >
        🇺🇸 EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ka")}
        className={`${btnBase} ${lang === "ka" ? active : ""}`}
        aria-pressed={lang === "ka"}
      >
        🇬🇪 KA
      </button>
    </div>
  );
}
