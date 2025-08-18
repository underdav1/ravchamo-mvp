"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BigButton from "../components/BigButton";
import TagToggle from "../components/TagToggle";
import { useI18n } from "./ui/LangProvider";

export default function Home() {
  const t = useI18n();
  const router = useRouter();

  const [loc, setLoc] = useState(null);
  const [locDenied, setLocDenied] = useState(false);
  const [price, setPrice] = useState("med");
  const [tags, setTags] = useState([]);
  const [exclude, setExclude] = useState([]);

  // ask for location (with Vake fallback)
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {
          setLocDenied(true);
          setLoc({ lat: 41.71, lon: 44.77 });
        },
        { enableHighAccuracy: true, timeout: 3000 }
      );
    } else {
      setLoc({ lat: 41.71, lon: 44.77 });
    }
  }, []);

  // tokens (used for filters); we render translated labels for them
  const cravingOptions = useMemo(
    () => ["georgian", "grill", "wrap", "sushi", "pizza", "salad", "soup", "vegan", "healthy", "cheesy", "spicy"],
    []
  );
  const excludeOptions = useMemo(
    () => ["pork", "beef", "chicken", "fish", "gluten", "dairy", "halal", "vegan", "vegetarian"],
    []
  );
  const labelFor = (token) => t(`tags.${token}`) ?? token;

  function goResults(lucky = false) {
    const query = new URLSearchParams({
      lat: loc?.lat ?? "",
      lon: loc?.lon ?? "",
      price,
      tags: tags.join(","),
      exclude: exclude.join(","),
    });
    if (lucky) query.set("lucky", "1");
    router.push(`/results?${query.toString()}`);
  }

  return (
    <main>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold">🍽️ {t("appName")}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t("tagline")}</p>
      </div>

      <div className="card mb-4">
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">{t("location") ?? "Location"}</div>
        <div className="flex gap-2 items-center">
          <span className={`text-xs ${loc ? "text-green-700" : "text-gray-500"}`}>
            {loc ? t("loc.ready") : t("loc.getting")}
          </span>
          {locDenied && <span className="text-xs text-orange-600">{t("loc.deniedVake")}</span>}
        </div>
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
          {cravingOptions.map((opt) => (
            <TagToggle
              key={opt}
              label={labelFor(opt)}
              selected={tags.includes(opt)}
              onClick={() =>
                setTags((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]))
              }
            />
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <div className="font-semibold mb-2">{t("dietary")}</div>
        <div className="flex flex-wrap gap-2">
          {excludeOptions.map((opt) => (
            <TagToggle
              key={opt}
              label={labelFor(opt)}
              selected={exclude.includes(opt)}
              onClick={() =>
                setExclude((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]))
              }
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <BigButton className="kahoot-purple" onClick={() => goResults(false)}>
          {t("seeResults")}
        </BigButton>
        <BigButton className="kahoot-mint" onClick={() => goResults(true)}>
          🎲 {t("feelingLucky")}
        </BigButton>
      </div>
    </main>
  );
}
