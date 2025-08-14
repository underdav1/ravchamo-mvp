import data from "../../../data/dishes.json";
import Link from "next/link";

export default function DishDetail({ params }) {
  const dish = data.find(d => d.id === params.id);
  if (!dish) return <div className="p-6">Not found.</div>;

  return (
    <main>
      <Link href="/results" className="text-sm text-blue-700">← Back to results</Link>
      <div className="mt-3 card">
        <img src={dish.image} alt={dish.name} className="w-full h-56 object-cover rounded-xl border mb-3" />
        <h1 className="text-2xl font-bold mb-1">{dish.name}</h1>
        <div className="text-sm text-gray-600 mb-2">{dish.restaurant.name} • {dish.restaurant.district}</div>
        <div className="text-lg font-semibold mb-2">₾{dish.price}</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {dish.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
        <p className="text-sm mb-3">{dish.description}</p>

        <div className="grid grid-cols-2 gap-2">
          <a href={`tel:${dish.restaurant.phone}`} className="kahoot-btn kahoot-mint text-center">Call</a>
          <a target="_blank" rel="noreferrer"
             href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dish.restaurant.address)}`}
             className="kahoot-btn kahoot-purple text-center">Open in Maps</a>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-3">
        Menu data may be inaccurate. Always check with the restaurant about allergens and availability.
      </div>
    </main>
  );
}
