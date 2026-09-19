import { categories, UNKNOWN_CATEGORY } from "../../backend/lib/categories";

export default function CategoryGrid({ onSelect }) {
  const tiles = [...categories, UNKNOWN_CATEGORY];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="mb-4 text-center text-sm font-medium text-slate-500">
        Tap a category, or describe your situation in your own words
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {tiles.map((tile) => (
          <button
            key={tile.key}
            type="button"
            onClick={() => onSelect(tile.key)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center shadow-sm transition hover:border-brand-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <span className="text-3xl" aria-hidden="true">
              {tile.icon}
            </span>
            <span className="text-sm font-medium text-slate-700">{tile.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
