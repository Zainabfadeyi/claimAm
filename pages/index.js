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
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-brand-700 sm:text-4xl">
            Find the support you&apos;re owed — explained in plain language
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Millions of Nigerians qualify for education, business, and employment support but
            never claim it. Tell ClaimAm your situation and see what you likely qualify for, and
            exactly what to do next.
          </p>
        </div>

        <div className="mt-10">
          <CategoryGrid onSelect={handleSelectCategory} />
        </div>
      </Layout>
    </>
  );
}
