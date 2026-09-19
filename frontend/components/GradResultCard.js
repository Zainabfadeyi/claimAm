import { useState } from "react";

const TIER_LABEL = {
  top_match: "Top Match",
  strong_potential: "Strong Potential",
};

const TIER_STYLE = {
  top_match: "bg-brand-100 text-brand-700",
  strong_potential: "bg-amber-100 text-amber-800",
};

export default function GradResultCard({ match }) {
  const [showChecklist, setShowChecklist] = useState(false);
  const [showEssays, setShowEssays] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-800">{match.name}</h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            TIER_STYLE[match.tier] || "bg-slate-100 text-slate-600"
          }`}
        >
          {TIER_LABEL[match.tier] || match.tier} · {match.relevance_score}%
        </span>
      </div>

      {match.status && (
        <p className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
          {match.status}
        </p>
      )}

      <p className="mt-3 text-sm font-medium text-brand-700">{match.benefit}</p>
      {match.deadline_note && (
        <p className="mt-1 text-xs text-slate-500">Deadline: {match.deadline_note}</p>
      )}
      <p className="mt-2 text-sm text-slate-600">{match.reason}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowChecklist((s) => !s)}
          className="rounded-lg border border-brand-600 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
        >
          {showChecklist ? "Hide checklist" : "What to prepare"}
        </button>
        {match.essay_predictions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowEssays((s) => !s)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            {showEssays ? "Hide" : "Likely essay/interview prompts"}
          </button>
        )}
        <a
          href={match.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Official site ↗
        </a>
      </div>

      {showChecklist && (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {match.checklist.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 text-brand-600">☐</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      )}

      {showEssays && (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {match.essay_predictions.map((prompt, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 text-brand-600">✎</span>
              <span>{prompt}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
