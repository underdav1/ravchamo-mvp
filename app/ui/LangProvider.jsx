"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { en, ka } from "./langs";

const LangCtx = createContext({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function useLang() {
  return useContext(LangCtx); // { lang, setLang, t }
}

// IMPORTANT: this returns a FUNCTION you can call: const t = useI18n(); t("appName")
export function useI18n() {
  return useContext(LangCtx).t;
}

export default function LangProvider({ children }) {
  const [lang, setLang] = useState("en");

  // load saved lang
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("lang");
    if (saved === "ka" || saved === "en") setLang(saved);
  }, []);

  // persist lang
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("lang", lang);
  }, [lang]);

  const dict = lang === "ka" ? ka : en;

  // t("a.b.c") path lookup
  const t = useMemo(
    () => (key) =>
      key.split(".").reduce((acc, part) => {
        if (acc && acc[part] !== undefined && acc[part] !== null) return acc[part];
        return key; // fallback to key if missing (prevents crashes)
      }, dict),
    [dict]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}
