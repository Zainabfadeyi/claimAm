import { useState } from "react";

const EXAMPLE_PROMPTS = [
  "I have a 3.6 GPA in Computer Science, I'm Nigerian, and I want a fully funded Masters in the UK",
  "I'm 2 years into my PhD in Chemistry at a Nigerian university and I'm a lecturer looking for research funding",
  "I just finished my first degree with a 2:1 in Economics and want a fully funded Masters abroad",
];

export default function GradIntakeForm({ onSubmit, loading }) {
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) {
      setValidationError("Please describe your academic situation before submitting.");
      return;
    }
    setValidationError("");
    onSubmit(value);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-1 text-xl font-semibold text-brand-700 sm:text-2xl">
        Tell us about your academic situation
      </h2>
      <p className="mb-4 text-sm text-slate-600 sm:text-base">
        Field of study, degree level (Masters or PhD), your GPA or degree class, nationality,
        and whether you need full funding — English or Pidgin, whichever is easier.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((example) => (
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
          placeholder="E.g. I have a 2:1 in Mechanical Engineering from a Nigerian university, I want a fully funded Masters abroad, and I can't afford it myself."
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
          {loading ? "Checking your profile…" : "Find my scholarships"}
        </button>
      </form>
    </div>
  );
}
