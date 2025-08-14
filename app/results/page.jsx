"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import data from "../../data/dishes.json";
import DishCard from "../../components/DishCard";
import { recommend } from "../../lib/recommend";

export default function ResultsPage() {
  const params = useSearchParams();
  const [items, setItems] = useState([]);

  const user = useMemo(()=>{
    const lat = parseFloat(params.get("lat") || "0");
    const lon = parseFloat(params.get("lon") || "0");
    const price = params.get("price") || "med";
    const tags = (params.get("tags") || "").split(",").filter(Boolean);
    const exclude = (params.get("exclude") || "").split(",").filter(Boolean);
    const time = params.get("time") || null;
    return { loc: (lat && lon) ? {lat, lon} : null, price, tags, exclude, time };
  }, [params]);

  useEffect(()=>{
    let d = [...data];
    // basic exclude filter
    if (user.exclude?.length) {
      d = d.filter(x => !user.exclude.some(e => x.tags.includes(e)));
    }
    if (params.get("lucky") === "1") {
      // random among top 5 by distance
      d.sort((a,b)=> a.price - b.price);
    }
    const recs = recommend(user, d);
    setItems(recs);
  }, [user, params]);

  return (
    <main>
      <h1 className="text-xl font-bold mb-3">Top picks</h1>
      {items.length === 0 && <div className="text-gray-600">No matches yet. Try fewer filters.</div>}
      {items.map(d => (
        <DishCard key={d.id} dish={d} />
      ))}
    </main>
  );
}
