import { useEffect, useState } from "react";
import { findCategory } from "../../backend/lib/categories";

const EXAMPLE_PROMPTS_BY_CATEGORY = {
  education: [
    "I'm a 300L student at a federal university and can't cover this semester's fees",
    "I want to apply for a scholarship to help fund my master's degree",
  ],
  employment: [
    "I just graduated, I'm unemployed, and I'm looking for tech skills training",
    "I'm 24, unemployed, and looking for a paid job placement",
  ],
  business: [
    "I run a small trading business and need capital to restock",
    "I'm an artisan and need a loan to grow my shop",
  ],
  women_family: [
    "I'm a woman trading in my local market and need capital to grow my stall",
    "I sell food items in the market and want to join a women's trading loan program",
  ],
  agriculture: [
    "I'm a smallholder farmer and need funds to expand my farm",
    "I farm cassava and need capital for the next planting season",
  ],
  youth: [
    "I'm 22, unemployed, and want free tech skills training",
    "I just finished NYSC and I'm looking for a paid job placement",
  ],
  unknown: [
    "I'm a 300L student at a federal university and can't cover this semester's fees",
    "I run a small trading business and need capital to restock",
    "I just graduated, I'm unemployed, and I'm looking for tech skills training",
  ],
};

export default function IntakeForm({ category, onSubmit, loading, initialValue }) {
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState("");

  const categoryInfo = findCategory(category);
  const isUnknown = !category || category === "unknown";
  const examplePrompts = EXAMPLE_PROMPTS_BY_CATEGORY[category] || EXAMPLE_PROMPTS_BY_CATEGORY.unknown;

  // initialValue arrives asynchronously (restored from sessionStorage after mount, e.g.
  // when returning via the browser Back button) — sync it in once it shows up. Storage is
  // only readable client-side, so this can't be done in initial state without a
  // server/client hydration mismatch.
  useEffect(() => {
    if (initialValue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(initialValue);
    }
  }, [initialValue]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) {
      setValidationError("Please describe your situation before submitting.");
      return;
    }
    setValidationError("");
    onSubmit(value);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-1 text-xl font-semibold text-brand-700 sm:text-2xl">
        {isUnknown ? "Tell us about your situation" : `${categoryInfo.icon} ${categoryInfo.label}`}
      </h2>
      <p className="mb-4 text-sm text-slate-600 sm:text-base">
        Describe it in your own words — English or Pidgin, whichever is easier. No need for
        official terms.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {examplePrompts.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setValue(example)}
            disabled={loading}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition hover:border-brand-400 hover:text-brand-700 disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          placeholder="E.g. I'm 20, I study Computer Science at LASU, my parents can't cover full fees this semester, I have my NIN."
          className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          disabled={loading}
        />
        {validationError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {validationError}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-brand-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading ? "Checking what you qualify for…" : "Show me what I qualify for"}
        </button>
      </form>
    </div>
  );
}
