import Head from "next/head";
import { useState } from "react";
import Layout from "../frontend/components/Layout";
import GradIntakeForm from "../frontend/components/GradIntakeForm";
import FollowUpModal from "../frontend/components/FollowUpModal";
import GradResultCard from "../frontend/components/GradResultCard";

export default function GradScholarships() {
  const [step, setStep] = useState("intake"); // "intake" | "followup" | "results"
  const [description, setDescription] = useState("");
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [missingInfoSummary, setMissingInfoSummary] = useState("");
  const [matches, setMatches] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState([]);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleIntakeSubmit(value) {
    setDescription(value);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/grad-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      if (data.is_complete) {
        await runMatch(value, []);
      } else {
        setFollowUpQuestions(data.follow_up_questions);
        setMissingInfoSummary(data.missing_info_summary);
        setStep("followup");
        setLoading(false);
      }
    } catch (err) {
      setError("Something went wrong on our end — please try again.");
      setLoading(false);
    }
  }

  async function handleFollowUpSubmit(followUps) {
    await runMatch(description, followUps);
  }

  async function handleSkip() {
    await runMatch(description, []);
  }

  async function runMatch(desc, followUps) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/grad-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc, followUps }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setMatches(data.matches || []);
      setGapAnalysis(data.gap_analysis || []);
      setDetectedLanguage(data.detected_language || null);
      setStep("results");
    } catch (err) {
      setError("Something went wrong on our end — please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleStartOver() {
    setStep("intake");
    setDescription("");
    setFollowUpQuestions([]);
    setMissingInfoSummary("");
    setMatches(null);
    setGapAnalysis([]);
    setError("");
  }

  const topMatches = (matches || []).filter((m) => m.tier === "top_match");
  const strongPotentials = (matches || []).filter((m) => m.tier === "strong_potential");

  return (
    <>
      <Head>
        <title>Grad Scholarship Matcher — ClaimAm</title>
        <meta
          name="description"
          content="Describe your Masters or PhD situation and get matched to global and Nigerian scholarships, with a step-by-step application roadmap."
        />
      </Head>

      <Layout>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-brand-700 sm:text-3xl">
            🎓 Grad Scholarship Matcher
          </h1>
          <p className="mt-2 text-slate-600">
            For Masters and PhD students. Describe your academic situation and get matched to
            global and Nigerian scholarships, ranked by how well you actually fit — with a
            checklist and likely essay questions for each.
          </p>

          {error && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {step === "intake" && (
            <div className="mt-6">
              <GradIntakeForm onSubmit={handleIntakeSubmit} loading={loading} />
            </div>
          )}

          {step === "followup" && (
            <FollowUpModal
              questions={followUpQuestions}
              missingInfoSummary={missingInfoSummary}
              onSubmit={handleFollowUpSubmit}
              onSkip={handleSkip}
              loading={loading}
            />
          )}

          {step === "results" && matches && (
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
                These matches are ClaimAm&apos;s AI-generated assessment based on your description
                and each scholarship&apos;s publicly available criteria. They&apos;re informational
                only, not a guarantee of eligibility or funding — always complete your official
                application directly on each scholarship&apos;s own portal, and confirm current
                deadlines and requirements there before applying.
              </div>

              {detectedLanguage === "pidgin" && (
                <p className="text-xs text-slate-400">Responding in Pidgin, as you wrote it.</p>
              )}

              {gapAnalysis.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-slate-800">
                    💡 What could unlock more/better matches
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {gapAnalysis.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-brand-600">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {matches.length === 0 && (
                <p className="text-slate-600">
                  No clear match yet among the scholarships ClaimAm currently checks — see the gap
                  analysis above for what could change that.
                </p>
              )}

              {topMatches.length > 0 && (
                <div>
                  <h2 className="mb-3 text-lg font-semibold text-brand-700">
                    Tier 1 — Top Matches (90%+)
                  </h2>
                  <div className="space-y-4">
                    {topMatches.map((match) => (
                      <GradResultCard key={match.scholarship_id} match={match} />
                    ))}
                  </div>
                </div>
              )}

              {strongPotentials.length > 0 && (
                <div>
                  <h2 className="mb-3 text-lg font-semibold text-brand-700">
                    Tier 2 — Strong Potentials
                  </h2>
                  <div className="space-y-4">
                    {strongPotentials.map((match) => (
                      <GradResultCard key={match.scholarship_id} match={match} />
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleStartOver}
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                ← Start over with a new description
              </button>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
