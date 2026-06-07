"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BigButton from "../components/BigButton";
import TagToggle from "../components/TagToggle";
import { useI18n } from "./ui/LangProvider";
import { CATEGORY_TOKENS, MOOD_TOKENS } from "../lib/taxonomy";

const FX_KEY = "ravchamo:fx";
// NBG publishes rates once per business day, so a 24-hour cache is plenty
// and saves us ~96% of unnecessary requests vs the old 1-hour TTL.
const FX_TTL = 24 * 3600 * 1000;

export default function Home() {
  const t = useI18n();
  const router = useRouter();

  const [loc, setLoc] = useState(null);
  const [locDenied, setLocDenied] = useState(false);
  const [price, setPrice] = useState("med");
  const [tag, setTag] = useState("");      // single-select craving (UI token)
  const [moods, setMoods] = useState([]); // multi-select vibe (UI tokens, max 2)
  const [fx, setFx] = useState(null);     // { usd, eur, ts }

  function requestLoc() {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocDenied(false);
        },
        () => {
          setLocDenied(true);
          setLoc({ lat: 41.71, lon: 44.77 });
        },
        { enableHighAccuracy: true, timeout: 3000 }
      );
    } else {
      setLoc({ lat: 41.71, lon: 44.77 });
    }
  }

  useEffect(() => { requestLoc(); }, []);

  // Fetch NBG exchange rates (USD/EUR → GEL), cache 1 hr in localStorage
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(FX_KEY) || "null");
      if (cached && Date.now() - cached.ts < FX_TTL) { setFx(cached); return; }
    } catch {}
    // ?currencies=USD,EUR cuts the payload from ~50 currencies to 2.
    fetch("https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json?currencies=USD,EUR")
      .then((r) => r.json())
      .then((data) => {
        const list = data?.[0]?.currencies || [];
        const usd = list.find((c) => c.code === "USD")?.rate;
        const eur = list.find((c) => c.code === "EUR")?.rate;
        if (usd && eur) {
          const entry = { usd, eur, ts: Date.now() };
          setFx(entry);
          try { localStorage.setItem(FX_KEY, JSON.stringify(entry)); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Cravings are optional — budget + at least one vibe is enough to search.
  const canSearch = Boolean(price) && moods.length > 0;

  const labelFor = (token) => t(`tags.${token}`) ?? token;
  const moodLabel = (token) => t(`moods.${token}`) ?? token;

  function toggleMood(opt) {
    setMoods((prev) => {
      if (prev.includes(opt)) return prev.filter((x) => x !== opt);
      if (prev.length >= 2) return prev; // cap at 2, ignore the tap
      return [...prev, opt];
    });
  }

  function goResults(lucky = false) {
    const query = new URLSearchParams({
      lat: loc?.lat ?? "",
      lon: loc?.lon ?? "",
      price,
      tag: tag || "",
      moods: moods.join(","),
    });
    if (lucky) query.set("lucky", "1");
    router.push(`/results?${query.toString()}`);
  }

  return (
    <main>
      <div className="text-center mb-6">
        {/* Theme-aware logo: dark variant on light bg, white variant on dark bg.
            logo-dark.svg has more internal padding so it's rendered taller (h-40
            vs h-32) to visually match the dark-mode logo. */}
        <img
          src="/logo-dark.svg"
          alt={t("appName")}
          className="block dark:hidden h-40 mx-auto mb-2"
        />
        <img
          src="/logo-light.svg"
          alt={t("appName")}
          className="hidden dark:block h-32 mx-auto mb-2"
        />
        <p className="text-gray-600 dark:text-gray-400">{t("tagline")}</p>
      </div>

      <div className="card mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm text-gray-700 dark:text-gray-300">{t("location") ?? "Location"}</div>
          <button
            onClick={requestLoc}
            className="text-lg leading-none"
            aria-label={t("requestLocation")}
            title={t("requestLocation")}
          >
            📍
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`text-xs ${loc ? "text-green-700" : "text-gray-500"}`}>
            {loc ? t("loc.ready") : t("loc.getting")}
          </span>
          {locDenied && <span className="text-xs text-orange-600">{t("loc.deniedVake")}</span>}
        </div>
        {fx && (
          <div className="mt-1 text-xs text-gray-400">
            1 USD = {fx.usd}₾ &nbsp;·&nbsp; 1 EUR = {fx.eur}₾
          </div>
        )}
      </div>

      <div className="card mb-4">
        <div className="font-semibold mb-2">{t("budget")}</div>
        <div className="grid grid-cols-3 gap-2">
          <BigButton
            className={`kahoot-gray ${price === "low" ? "outline outline-2 outline-black dark:outline-white" : ""}`}
            onClick={() => setPrice("low")}
          >
            {t("low")}
          </BigButton>
          <BigButton
            className={`kahoot-gray ${price === "med" ? "outline outline-2 outline-black dark:outline-white" : ""}`}
            onClick={() => setPrice("med")}
          >
            {t("medium")}
          </BigButton>
          <BigButton
            className={`kahoot-gray ${price === "high" ? "outline outline-2 outline-black dark:outline-white" : ""}`}
            onClick={() => setPrice("high")}
          >
            {t("high")}
          </BigButton>
        </div>
      </div>

      <div className="card mb-4">
        <div className="font-semibold mb-2">{t("cravings")}</div>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TOKENS.map((opt) => (
            <TagToggle
              key={opt}
              label={labelFor(opt)}
              selected={tag === opt}
              onClick={() => setTag((prev) => (prev === opt ? "" : opt))}
            />
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <div className="font-semibold mb-2">{t("moodTitle")}</div>
        <div className="flex flex-wrap gap-2">
          {MOOD_TOKENS.map((opt) => (
            <TagToggle
              key={opt}
              label={moodLabel(opt)}
              selected={moods.includes(opt)}
              onClick={() => toggleMood(opt)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <BigButton
          className={`kahoot-purple ${!canSearch ? "opacity-40 cursor-not-allowed" : ""}`}
          onClick={() => goResults(false)}
          disabled={!canSearch}
        >
          {t("seeResults")}
        </BigButton>
        <BigButton className="kahoot-mint" onClick={() => goResults(true)}>
          🎲 {t("feelingLucky")}
        </BigButton>
      </div>
    </main>
  );
}
