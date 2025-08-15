"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { en, ka } from "./langs";

const DICTS = { en, ka };

const LangContext = createContext({
  lang: "en",
  setLang: () => {},
  STR: en,
});

export function useLang() {
  return useContext(LangContext);
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState("en");

  // load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "ka") setLang(saved);
    } catch {}
  }, []);

  // persist + set <html lang="...">
  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const STR = useMemo(() => DICTS[lang] ?? en, [lang]);
  const value = useMemo(() => ({ lang, setLang, STR }), [lang, STR]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// keep default export too, so your current import still works
export default LangProvider;
