import Link from "next/link";
import { categories } from "../../backend/lib/categories";

const LANDING_CATEGORY_KEYS = ["education", "business", "youth"];

const CATEGORY_DESCRIPTIONS = {
  education: "Tuition, scholarships, and bursaries for students at every level",
  business: "Grants and bank financing — including non-interest, Sharia-compliant options",
  youth: "Tech internships, graduate trainee programmes, and skills training across West Africa",
};

export default function CategoryGrid({ onSelect }) {
  const tiles = categories.filter((c) => LANDING_CATEGORY_KEYS.includes(c.key));

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-brand-600">
        What are you looking for?
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <button
            key={tile.key}
            type="button"
            onClick={() => onSelect(tile.key)}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl transition group-hover:bg-brand-100"
              aria-hidden="true"
            >
              {tile.icon}
            </span>
            <span className="text-base font-semibold text-slate-800">{tile.label}</span>
            <span className="text-sm leading-snug text-slate-500">
              {CATEGORY_DESCRIPTIONS[tile.key]}
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
              Get started
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Not sure which fits?{" "}
        <Link
          href="/finder"
          className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
        >
          Describe your situation in your own words
        </Link>
      </p>
    </div>
  );
}
