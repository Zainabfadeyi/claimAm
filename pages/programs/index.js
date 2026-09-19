import Head from "next/head";
import Link from "next/link";
import Layout from "../../frontend/components/Layout";
import { getAllPrograms } from "../../backend/lib/programs";

export default function ProgramsIndex({ programs }) {
  return (
    <>
      <Head>
        <title>Verified Programs — ClaimAm</title>
        <meta
          name="description"
          content="Browse all 12 verified, self-service support programs ClaimAm checks your situation against."
        />
      </Head>

      <Layout>
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-brand-700 sm:text-3xl">Verified Programs</h1>
          <p className="mt-2 text-slate-600">
            These are the {programs.length} self-service programs ClaimAm currently checks your
            situation against. Each one has its own official application — ClaimAm only helps you
            find and prepare for it.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {programs.map((program) => (
              <Link
                key={program.id}
                href={`/programs/${program.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md"
              >
                <h2 className="text-base font-semibold text-slate-800">{program.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{program.who_its_for}</p>
                <p className="mt-3 text-sm font-medium text-brand-700">{program.benefit}</p>
                {program.status && (
                  <p className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {program.status}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const programs = getAllPrograms().map(
    ({ id, name, benefit, who_its_for, status, category }) => ({
      id,
      name,
      benefit,
      who_its_for,
      status: status || null,
      category,
    })
  );

  return { props: { programs } };
}
