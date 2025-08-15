"use client";

import { useEffect, useState } from "react";
import BigButton from "../components/BigButton";
import TagToggle from "../components/TagToggle";
import { useRouter } from "next/navigation";
import { useI18n } from "./ui/LangProvider";

export default function Home() {
  const router = useRouter();
  const { t, tt } = useI18n();

  const [loc, setLoc] = useState(null);
  const [locDenied, setLocDenied] = useState(false);
  const [price, setPrice] = useState("med");
  const [tags, setTags] = useState([]);
  const [exclude, setExclude] = useState([]);
  const [time, setTime] = useState(null);

  // ask for location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => {
          console.log(err);
          setLocDenied(true);
          // fallback: Vake center
          setLoc({ lat: 41.71, lon: 44.77 });
        },
        { enableHighAccuracy: true, timeout: 3000 }
      );
    } else {
      // fallback
      setLoc({ lat: 41.71, lon: 44.77 });
    }
  }, []);

  // keys we display (we translate their labels with tt())
  const cravingOptions = [
    "georgian",
    "grill",
    "wrap",
    "sushi",
    "pizza",
    "salad",
    "soup",
    "vegan",
    "healthy",
    "cheesy",
    "spicy",
  ];
  const excludeOptions = [
    "pork",
    "beef",
    "chicken",
    "fish",
    "gluten",
    "dairy",
    "halal",
    "vegan",
    "vegetarian",
  ];

  function goResults(lucky = false) {
    const query = new URLSearchParams({
      lat: loc?.lat ?? "",
      lon: loc?.lon ?? "",
      price,
      tags: tags.join(","),
      exclude: exclude.join(","),
      time: time ?? "",
    });
    if (lucky) query.set("lucky", "1");
    router.push(`/results?${query.toString()}`);
  }

  return (
    <main>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold">🍽️ {t("appName")}</h1>
        <p className="text-gray-600">{t("tagline")}</p>
      </div>

      <div className="card mb-4">
        <div className="text-sm text-gray-700 mb-2">{t("location")}</div>
        <div className="flex gap-2 items-center">
          <span
            className={`text-xs ${loc ? "text-green-700" : "text-gray-500"}`}
          >
            {loc ? t("loc.ready") : t("loc.getting")}
          </span>
          {locDenied && (
            <span className="text-xs text-orange-600">{t("loc.deniedVake")}</span>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="font-semibold mb-2">{t("budget")}</div>
        <div className="grid grid-cols-3 gap-2">
          <BigButton
            className={`kahoot-gray ${
              price === "low" ? "outline outline-2 outline-black" : ""
            }`}
            onClick={() => setPrice("low")}
          >
            {t("low")}
          </BigButton>
          <BigButton
            className={`kahoot-gray ${
              price === "med" ? "outline outline-2 outline-black" : ""
            }`}
            onClick={() => setPrice("med")}
          >
            {t("medium")}
          </BigButton>
          <BigButton
            className={`kahoot-gray ${
              price === "high" ? "outline outline-2 outline-black" : ""
            }`}
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
              label={tt(opt)}
              selected={tags.includes(opt)}
              onClick={() => {
                setTags((prev) =>
                  prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
                );
              }}
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
              label={tt(opt)}
              selected={exclude.includes(opt)}
              onClick={() => {
                setExclude((prev) =>
                  prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
                );
              }}
            />
          ))}
        </div>
      </div>

      <div className="card mb-6">
        <div className="font-semibold mb-2">{t("time")}</div>
        <div className="grid grid-cols-2 gap-2">
          <BigButton
            className={`kahoot-mint ${
              time === "fast" ? "outline outline-2 outline-black" : ""
            }`}
            onClick={() => setTime("fast")}
          >
            {t("fast")}
          </BigButton>
          <BigButton
            className={`kahoot-orange ${
              time === "relaxed" ? "outline outline-2 outline-black" : ""
            }`}
            onClick={() => setTime("relaxed")}
          >
            {t("relaxed")}
          </BigButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <BigButton className="kahoot-purple" onClick={() => goResults(false)}>
          {t("seeResults")}
        </BigButton>
        <BigButton className="kahoot-mint" onClick={() => goResults(true)}>
          🎲 {t("lucky")}
        </BigButton>
      </div>
    </main>
  );
}
