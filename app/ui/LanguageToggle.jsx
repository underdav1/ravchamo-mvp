"use client";

import { useI18n } from "./LangProvider";

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <button
      aria-label="Change language"
      onClick={() => setLang(lang === "ka" ? "en" : "ka")}
      className="px-3 py-1 rounded-md border text-sm"
      style={{ opacity: 0.9 }}
      title={lang === "ka" ? "Switch to English" : "გადართე ქართულზე"}
    >
      {lang === "ka" ? "KA • ქართული" : "EN • English"}
    </button>
  );
}
