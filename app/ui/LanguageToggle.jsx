"use client";

import { useI18n } from "./LangProvider";

const LABELS = {
  en: { short: "EN", long: "English", flag: "🇺🇸" },
  ka: { short: "KA", long: "Georgian", flag: "🇬🇪" },
};

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="inline-flex rounded-md border overflow-hidden bg-white">
      {["en", "ka"].map((code) => {
        const active = lang === code;
        const L = LABELS[code];

        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            title={`${L.flag} ${L.long}`}
            className={`px-2 sm:px-3 py-1 text-sm flex items-center gap-1
              ${active ? "bg-black text-white" : "hover:bg-gray-50"}`}
          >
            <span aria-hidden>{L.flag}</span>
            <span className="font-medium">{L.short}</span>
            <span className="hidden sm:inline">• {L.long}</span>
          </button>
        );
      })}
    </div>
  );
}
