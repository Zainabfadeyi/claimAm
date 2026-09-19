import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../../frontend/components/Layout";
import BackLink from "../../frontend/components/BackLink";
import { getAllPrograms, getProgramById } from "../../backend/lib/programs";
import { readMatch } from "../../frontend/lib/matchSession";

const CONFIDENCE_LABEL = {
  high: "Likely qualifies",
  needs_verification: "May qualify — needs verification",
};

export default function ProgramDetail({ program }) {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    setMatch(readMatch(program.id));
  }, [program.id]);

  return (
    <>
      <Head>
        <title>{`${program.name} — ClaimAm`}</title>
        <meta name="description" content={program.benefit} />
      </Head>

      <Layout>
        <div className="mx-auto max-w-5xl">
          <BackLink
            fallbackHref="/programs"
            className="mb-4 inline-block text-sm text-slate-500 hover:text-brand-600"
          >
            &larr; Back
          </BackLink>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {program.category.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                >
                  {c}
                </span>
              ))}
              {match && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    match.confidence === "high"
                      ? "bg-brand-100 text-brand-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {CONFIDENCE_LABEL[match.confidence] || match.confidence}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-bold text-slate-800 sm:text-3xl">{program.name}</h1>
            <p className="mt-2 text-slate-600">{program.who_its_for}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FactCard label="Benefit" value={program.benefit} />
              <FactCard label="Who it's for" value={program.who_its_for} />
              <FactCard label="Status" value={program.status || "See official site for current status"} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800">Why you may qualify</h2>
                {match ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{match.reason}</p>
                ) : (
                  <>
                    <p className="mt-1 text-xs text-slate-400">
                      Typical eligibility for this program — describe your own situation in the{" "}
                      <Link href="/finder" className="text-brand-700 underline">
                        Eligibility Finder
                      </Link>{" "}
                      for a personalized answer.
                    </p>
                    <ul className="mt-3 space-y-2">
                      {program.eligibility.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-0.5 text-brand-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">Documents you&apos;ll need</h2>
                  <Link
                    href={`/programs/${program.id}/checklist`}
                    className="text-sm font-medium text-brand-700 hover:underline"
                  >
                    Open full checklist &rarr;
                  </Link>
                </div>
                <ul className="mt-3 space-y-2">
                  {program.required_documents.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 text-brand-600">☐</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {match && match.next_steps && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-800">Your next steps</h2>
                  <ul className="mt-3 space-y-2">
                    {match.next_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-brand-600">☐</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">Ready to apply?</h3>
                <p className="mt-1 text-xs text-slate-500">
                  ClaimAm doesn&apos;t submit this for you — you&apos;ll complete the real
                  application on the official site.
                </p>
                <a
                  href={program.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-brand-700"
                >
                  Apply on official site ↗
                </a>
                <Link
                  href={`/programs/${program.id}/checklist`}
                  className="mt-2 block rounded-xl border border-brand-600 px-4 py-3 text-center text-sm font-medium text-brand-700 transition hover:bg-brand-50"
                >
                  Open preparation checklist
                </Link>
              </div>

              <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                <h3 className="text-sm font-semibold text-red-700">Stay safe</h3>
                <p className="mt-1 text-xs leading-relaxed text-red-700">
                  {program.name} is free to apply for. Never pay anyone — including a cybercafé
                  attendant or "agent" — to submit or speed up your application, and never share
                  your NIN, BVN, or bank PIN with anyone claiming to do this for you.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </Layout>
    </>
  );
}

function FactCard({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
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

  const {
    id,
    name,
    category,
    benefit,
    who_its_for,
    eligibility,
    required_documents,
    application_process,
    apply_url,
    status,
  } = program;

  return {
    props: {
      program: {
        id,
        name,
        category,
        benefit,
        who_its_for,
        eligibility,
        required_documents,
        application_process,
        apply_url,
        status: status || null,
      },
    },
  };
}
