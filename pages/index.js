import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../frontend/components/Layout";
import CategoryGrid from "../frontend/components/CategoryGrid";

export default function Home() {
  const router = useRouter();

  function handleSelectCategory(key) {
    router.push(`/finder?category=${encodeURIComponent(key)}`);
  }

  return (
    <>
      <Head>
        <title>ClaimAm — Find the support you qualify for</title>
        <meta
          name="description"
          content="Describe your situation in plain language and find out which Nigerian support programs you qualify for."
        />
      </Head>

      <Layout>
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-8 -z-10 flex justify-center overflow-hidden"
          >
            <div className="h-72 w-72 rounded-full bg-brand-100 opacity-70 blur-3xl sm:h-96 sm:w-[32rem]" />
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
              23 verified programs · Always free
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Find the support <span className="text-brand-600">you deserve</span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Millions of Nigerians qualify for education, business, and career support but never
              claim it. Describe your situation in plain language — English or Pidgin — and see
              exactly what you qualify for, and what to do next.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
              <span>✓ No NIN/BVN required</span>
              <span>✓ Official links only</span>
              <span>✓ Never a fee</span>
            </div>
          </div>

          <div className="mt-12">
            <CategoryGrid onSelect={handleSelectCategory} />
          </div>
        </div>
      </Layout>
    </>
  );
}
