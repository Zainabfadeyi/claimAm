import { useState } from "react";

export default function FollowUpModal({ questions, missingInfoSummary, onSubmit, onSkip, loading }) {
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(""));

  function handleChange(i, value) {
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const followUps = questions.map((question, i) => ({ question, answer: answers[i].trim() }));
    onSubmit(followUps);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-800">Just a couple more details</h2>
        {missingInfoSummary && <p className="mt-1 text-sm text-slate-500">{missingInfoSummary}</p>}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {questions.map((question, i) => (
            <div key={i}>
              <label className="mb-1 block text-sm font-medium text-slate-700">{question}</label>
              <input
                type="text"
                value={answers[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                disabled={loading}
              />
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Matching…" : "Continue"}
            </button>
            <button
              type="button"
              onClick={onSkip}
              disabled={loading}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-60"
            >
              Skip — match with what I&apos;ve given
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
