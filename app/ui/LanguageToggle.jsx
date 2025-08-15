"use client";
import { useLang } from "./LangProvider";

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  const base =
    "px-2.5 py-1 text-xs font-medium leading-none transition-colors";
  const on =
    "bg-black text-white dark:bg-white dark:text-black";
  const off =
    "bg-transparent text-gray-700 dark:text-gray-200";

  return (
    <div className="inline-flex shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`${base} ${lang === "en" ? on : off}`}
        title="Switch to English"
        aria-label="Switch to English"
      >
        🇺🇸 EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ka")}
        className={`${base} ${lang === "ka" ? on : off}`}
        title="გადადით ქართულზე"
        aria-label="გადადით ქართულზე"
      >
        🇬🇪 KA
      </button>
    </div>
  );
}
