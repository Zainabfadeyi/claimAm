import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../../../frontend/components/Layout";
import RemindMeCard from "../../../frontend/components/RemindMeCard";
import { getAllPrograms, getProgramById } from "../../../backend/lib/programs";
import { buildChecklistSteps } from "../../../frontend/lib/checklistSteps";

export default function ProgramChecklist({ program }) {
  const steps = buildChecklistSteps(program);
  const storageKey = `claimam:checklist:${program.id}`;

  const [checked, setChecked] = useState(() => Array(steps.length).fill(false));

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved) && saved.length === steps.length) {
          setChecked(saved);
        }
      }
    } catch {
      // sessionStorage unavailable — checklist just won't persist across reloads.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  function toggleStep(index) {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      try {
        window.sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const completedCount = checked.filter(Boolean).length;
  const percent = Math.round((completedCount / steps.length) * 100);
  const allDone = completedCount === steps.length;

  return (
    <>
      <Head>
        <title>{`Preparation checklist — ${program.name} — ClaimAm`}</title>
      </Head>

      <Layout>
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/programs/${program.id}`}
            className="mb-4 inline-block text-sm text-slate-500 hover:text-brand-600"
          >
            &larr; Back to {program.name}
          </Link>

          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Preparation checklist for {program.name}
          </h1>
          <p className="mt-2 text-slate-600">
            Work through these before you open the official application — it&apos;s the same
            information the program itself will ask for.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
                {completedCount} of {steps.length} steps completed
              </span>
              <span className="font-medium text-brand-700">{percent}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {steps.map((step, i) => (
              <label
                key={i}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 shadow-sm transition ${
                  checked[i] ? "border-brand-300 bg-brand-50" : "border-slate-200 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={() => toggleStep(i)}
                  className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">{step.title}</p>
                  {step.description && (
                    <p className="mt-1 text-xs text-slate-500">{step.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>

          <RemindMeCard
            programId={program.id}
            programName={program.name}
            applyUrl={program.apply_url}
            statusNote={program.status_detail || program.status}
          />

          {allDone ? (
            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-6">
              <h2 className="text-lg font-semibold text-brand-700">
                You&apos;re ready — here&apos;s what happens next
              </h2>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-brand-800">
                <li>Go to the official site and complete the real application there.</li>
                <li>ClaimAm doesn&apos;t submit anything on your behalf — only you can do this.</li>
                <li>
                  Track your status directly with {program.name} after you apply — ClaimAm has no
                  visibility into your application once it&apos;s submitted.
                </li>
              </ol>
              <a
                href={program.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                Continue to official portal ↗
              </a>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <a
                href={program.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                Or skip ahead to the official portal now ↗
              </a>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <h3 className="text-sm font-semibold text-red-700">Stay safe</h3>
            <p className="mt-1 text-xs leading-relaxed text-red-700">
              This checklist is free. Nobody — including ClaimAm — should ever ask you to pay to
              check your eligibility or to speed up an application, or ask for your NIN/BVN PIN.
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getStaticPaths() {
  const programs = getAllPrograms();
  return {
    paths: programs.map((p) => ({ params: { id: p.id } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const program = getProgramById(params.id);
  if (!program) {
    return { notFound: true };
  }

  const { id, name, required_documents, application_process, apply_url, status, status_detail } =
    program;

  return {
    props: {
      program: {
        id,
        name,
        required_documents,
        application_process,
        apply_url,
        status: status || null,
        status_detail: status_detail || null,
      },
    },
  };
}
