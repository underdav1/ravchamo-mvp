"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { en, ka } from "./langs";

// Provide a safe default so SSR doesn't explode if used above the provider
const LangContext = createContext({
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
  STR: en,
});

function LangProvider({ children }) {
  const [lang, setLang] = useState("en");

  // hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "ka") setLang(saved);
    } catch {}
  }, []);

  // persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {}
  }, [lang]);

  const STR = useMemo(() => (lang === "ka" ? ka : en), [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang((p) => (p === "en" ? "ka" : "en")),
      STR,
    }),
    [lang, STR]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// Named hook export (this is what you must import)
export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within <LangProvider>");
  return ctx;
}

export default LangProvider;
