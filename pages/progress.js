import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../frontend/components/Layout";
import { getAllPrograms } from "../backend/lib/programs";
import { getChecklistStepCount } from "../frontend/lib/checklistSteps";

export default function MyProgress({ programs }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const withProgress = programs
      .map((program) => {
        let checked = null;
        try {
          const raw = window.sessionStorage.getItem(`claimam:checklist:${program.id}`);
          if (raw) checked = JSON.parse(raw);
        } catch {
          checked = null;
        }
        if (!Array.isArray(checked) || checked.length !== program.stepCount) return null;

        const completedCount = checked.filter(Boolean).length;
        if (completedCount === 0) return null;

        return {
          id: program.id,
          name: program.name,
          completedCount,
          totalSteps: program.stepCount,
          percent: Math.round((completedCount / program.stepCount) * 100),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name));

    // sessionStorage is only readable client-side, so this can't be done in initial state
    // without a server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(withProgress);
  }, [programs]);

  return (
    <>
      <Head>
        <title>My Progress — ClaimAm</title>
        <meta
          name="description"
          content="See your checklist progress across every ClaimAm program you've started preparing for."
        />
      </Head>

      <Layout>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-brand-700 sm:text-3xl">My Progress</h1>
          <p className="mt-2 text-slate-600">
            Your checklist progress across every program you&apos;ve started preparing for.
          </p>

          {rows === null && <p className="mt-6 text-sm text-slate-400">Loading…</p>}

          {rows && rows.length === 0 && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <p className="text-slate-600">You haven&apos;t started any checklists yet.</p>
              <Link
                href="/programs"
                className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline"
              >
                Browse programs to get started →
              </Link>
            </div>
          )}

          {rows && rows.length > 0 && (
            <div className="mt-6 space-y-4">
              {rows.map((row) => (
                <Link
                  key={row.id}
                  href={`/programs/${row.id}/checklist`}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-slate-800">{row.name}</h2>
                    <span className="shrink-0 text-sm font-medium text-brand-700">
                      {row.percent}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {row.completedCount} of {row.totalSteps} steps completed
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <p className="mt-6 text-xs text-slate-400">
            Progress is saved only in this browser tab&apos;s session — it clears when you close
            the tab. Nothing is sent to ClaimAm or stored on a server.
          </p>
        </div>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const programs = getAllPrograms().map((p) => ({
    id: p.id,
    name: p.name,
    stepCount: getChecklistStepCount(p),
  }));

  return { props: { programs } };
}
