"use client";

import { useEffect } from "react";
import { useLang } from "../app/ui/LangProvider";

export default function HtmlLang() {
  const { lang } = useLang();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
