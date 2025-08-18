"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BigButton from "../components/BigButton";
import TagToggle from "../components/TagToggle";
import { useLang } from "./ui/LangProvider";

export default function Home() {
  const router = useRouter();
  const { STR } = useLang();

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
        () => {
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

  // keys we render as chips (we translate their labels via STR.tags[key] ?? key)
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
        <h1 className="text-3xl font-extrabold">🍽️ {STR.appName}</h1>
        <p className="text-gray-600 dark:text-gray-300">{STR.tagline}</p>
      </div>

      <div className="card mb-4">
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          {STR.location}
        </div>
        <div className="flex gap-2 items-center">
          <span
            className={`text-xs ${
              loc ? "text-green-700" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {loc ? STR.loc.ready : STR.loc.getting}
          </span>
          {locDenied && (
            <span className="text-xs text-orange-600">{STR.loc.deniedVake}</span>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="font-semibold mb-2">{STR.budget}</div>
        <div className="grid grid-cols-3 gap-2">
          <BigButton
            className={`kahoot-gray ${
              price === "low" ? "outline outline-2 outline-black" : ""
            }`}
            onClick={() => setPrice("low")}
          >
            {STR.low}
          </BigButton>
          <BigButton
            className={`kahoot-gray ${
              price === "med" ? "outline outline-2 outline-black" : ""
            }`}
            onClick={() => setPrice("med")}
          >
            {STR.medium}
          </BigButton>
          <BigButton
            className={`kahoot-gray ${
              price === "high" ? "outline outline-2 outline-black" : ""
            }`}
            onClick={() => setPrice("high")}
          >
            {STR.high}
          </BigButton>
        </div>
      </div>

      <div className="card mb-4">
        <div className="font-semibold mb-2">{STR.cravings}</div>
        <div className="flex flex-wrap gap-2">
          {cravingOptions.map((opt) => (
            <TagToggle
              key={opt}
              label={STR.tags?.[opt] ?? opt}
              selected={tags.includes(opt)}
              onClick={() => {
                setTags((prev) =>
                  prev.includes(opt)
                    ? prev.filter((x) => x !== opt)
                    : [...prev, opt]
                );
              }}
            />
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <div className="font-semibold mb-2">{STR.dietary}</div>
        <div className="flex flex-wrap gap-2">
          {excludeOptions.map((opt) => (
            <TagToggle
              key={opt}
              label={STR.tags?.[opt] ?? opt}
              selected={exclude.includes(opt)}
              onClick={() => {
                setExclude((prev) =>
                  prev.includes(opt)
                    ? prev.filter((x) => x !== opt)
                    : [...prev, opt]
                );
              }}
            />
          ))}
        </div>
      </div>

      <div className="card mb-6">
        <div className="font-semibold mb-2">{STR.time}</div>
        <div className="grid grid-cols-2 gap-2">
          <BigButton
            className={`kahoot-mint ${
              time === "fast" ? "outline outline-2 outline-black" : ""
            }`}
            onClick={() => setTime("fast")}
          >
            {STR.fast}
          </BigButton>
          <BigButton
            className={`kahoot-orange ${
              time === "relaxed" ? "outline outline-2 outline-black" : ""
            }`}
            onClick={() => setTime("relaxed")}
          >
            {STR.relaxed}
          </BigButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <BigButton className="kahoot-purple" onClick={() => goResults(false)}>
          {STR.seeResults}
        </BigButton>
        <BigButton className="kahoot-mint" onClick={() => goResults(true)}>
          🎲 {STR.lucky}
        </BigButton>
      </div>
    </main>
  );
}
