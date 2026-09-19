import { useState } from "react";
import Link from "next/link";
import { saveMatch } from "../lib/matchSession";

const CONFIDENCE_LABEL = {
  high: "Likely qualifies",
  needs_verification: "May qualify — needs verification",
};

export default function ResultCard({ match }) {
  const [showSteps, setShowSteps] = useState(false);
  const isHighConfidence = match.confidence === "high";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-800">{match.name}</h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            isHighConfidence
              ? "bg-brand-100 text-brand-700"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {CONFIDENCE_LABEL[match.confidence] || match.confidence}
        </span>
      </div>

      {match.status && (
        <p className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
          {match.status}
        </p>
      )}

      <p className="mt-3 text-sm font-medium text-brand-700">{match.benefit}</p>
      <p className="mt-2 text-sm text-slate-600">{match.reason}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowSteps((s) => !s)}
          className="rounded-lg border border-brand-600 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
        >
          {showSteps ? "Hide steps" : "Show me what to do"}
        </button>
        <Link
          href={`/programs/${match.program_id}`}
          onClick={() => saveMatch(match)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 underline-offset-2 transition hover:text-brand-700 hover:underline"
        >
          View full details
        </Link>
        <a
          href={match.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Apply now
        </a>
      </div>

      {showSteps && (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {match.next_steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 text-brand-600">☐</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
