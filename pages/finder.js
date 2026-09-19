import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../frontend/components/Layout";
import IntakeForm from "../frontend/components/IntakeForm";
import ResultCard from "../frontend/components/ResultCard";
import { readFinderState, saveFinderState } from "../frontend/lib/finderSession";

export default function Finder() {
  const router = useRouter();
  const category = typeof router.query.category === "string" ? router.query.category : "unknown";

  const [lastInput, setLastInput] = useState("");
  const [matches, setMatches] = useState(null);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Restores the last results for this category — covers hitting Back from a program
  // detail page, so the user can pick a different match without resubmitting.
  useEffect(() => {
    const saved = readFinderState(category);
    if (saved) {
      setLastInput(saved.input || "");
      setMatches(saved.matches || null);
      setDetectedLanguage(saved.detected_language || null);
    }
  }, [category]);

  async function handleSubmit(input) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, input }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong on our end — please try again.");
        setMatches(null);
        return;
      }

      setLastInput(input);
      setMatches(data.matches || []);
      setDetectedLanguage(data.detected_language || null);
      saveFinderState(category, {
        input,
        matches: data.matches || [],
        detected_language: data.detected_language || null,
      });
    } catch (err) {
      setError("Something went wrong on our end — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Eligibility Finder — ClaimAm</title>
        <meta
          name="description"
          content="Describe your situation and see which of ClaimAm's 12 verified programs you may qualify for."
        />
      </Head>

      <Layout>
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="mb-4 inline-block text-sm text-slate-500 hover:text-brand-600">
            &larr; Back to categories
          </Link>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <IntakeForm
                category={category}
                onSubmit={handleSubmit}
                loading={loading}
                initialValue={lastInput}
              />

              {error && (
                <p className="mt-4 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              {matches !== null && (
                <div className="mt-6">
                  <h2 className="mb-1 text-lg font-semibold text-brand-700">
                    {matches.length > 0 ? "Here's what you may qualify for" : "No clear match yet"}
                  </h2>
                  {detectedLanguage === "pidgin" && (
                    <p className="mb-3 text-xs text-slate-400">
                      Responding in Pidgin, as you wrote it.
                    </p>
                  )}

                  {matches.length === 0 && (
                    <p className="text-slate-600">
                      No clear match yet — try describing your situation with a bit more detail
                      (your age, what you do, and any documents you already have).
                    </p>
                  )}

                  <div className="space-y-4">
                    {matches.map((match) => (
                      <ResultCard key={match.program_id} match={match} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <SidebarCard title="How this works">
                Your description is sent to Google&apos;s Gemini API to generate matches. ClaimAm
                itself doesn&apos;t store it beyond this session — avoid including anything
                sensitive, since Google&apos;s free tier may use submitted text to improve their
                models. ClaimAm never asks for your NIN, BVN, or bank details.
              </SidebarCard>
              <SidebarCard title="What we check against">
                ClaimAm compares your situation against 12 verified, self-service programs across
                education, employment, business funding, and agriculture — see the full list on
                the{" "}
                <Link href="/programs" className="text-brand-700 underline">
                  Programs
                </Link>{" "}
                page.
              </SidebarCard>
              <SidebarCard title="Before you apply">
                ClaimAm doesn&apos;t submit anything for you. Every match links straight to the
                program&apos;s own official website, where you complete the real application.
              </SidebarCard>
            </aside>
          </div>
        </div>
      </Layout>
    </>
  );
}

function SidebarCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}
