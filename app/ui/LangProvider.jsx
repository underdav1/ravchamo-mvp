"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { en, ka } from "./langs";

const LangContext = createContext(null);

export default function LangProvider({ children }) {
  const [lang, setLang] = useState("ka"); // default to Georgian

  // load saved language from localStorage (if any)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "ka" || saved === "en") {
        setLang(saved);
      } else if (navigator.language?.toLowerCase().startsWith("ka")) {
        setLang("ka");
      }
    } catch {}
  }, []);

  // persist on change
  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {}
  }, [lang]);

  const dict = lang === "en" ? en : ka;

  const value = useMemo(
    () => ({
      lang,
      setLang,
      // t("resultsTop") -> "საუკეთესო ვარიანტები" etc.
      t: (key, fallback = "") =>
        key
          .split(".")
          .reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), dict) ??
        (fallback || key),
      // translate tag keys like "khinkali", "bbq"
      tt: (tagKey) => dict.tags?.[tagKey] ?? tagKey,
    }),
    [lang, dict]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useI18n must be used inside <LangProvider />");
  return ctx;
}
