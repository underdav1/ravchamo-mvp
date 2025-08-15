"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { en, ka } from "./langs";

// 1) Language dictionaries map
const DICTS = { en, ka };

// 2) Context + safe default
const LangContext = createContext({
  lang: "en",
  setLang: () => {},
  STR: en,
});

// 3) Hook used by components (e.g., LanguageToggle)
export function useLang() {
  return useContext(LangContext);
}

// 4) Provider component
export function LangProvider({ children }) {
  const [lang, setLang] = useState("en");

  // hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "ka") setLang(saved);
    } catch {}
  }, []);

  // persist + set <html lang="xx">
  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  // memoize the dictionary for current lang
  const STR = useMemo(() => DICTS[lang] ?? en, [lang]);

  const value = useMemo(() => ({ lang, setLang, STR }), [lang, STR]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// (optional) default export for compatibility if something imports default
export default LangProvider;
