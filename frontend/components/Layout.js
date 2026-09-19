import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/finder", label: "Eligibility Finder" },
  { href: "/grad-scholarships", label: "Grad Scholarships" },
  { href: "/programs", label: "Programs" },
  { href: "/progress", label: "My Progress" },
];

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="bg-brand-900 px-4 py-2 text-center text-xs text-brand-50">
        Free to use · Not a government service · We never charge a fee or ask for your NIN/BVN PIN
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-brand-700">ClaimAm</span>
            <span className="text-[11px] text-slate-500">
              Plain-language guide to Nigerian support programs
            </span>
          </Link>

          <nav className="hidden items-center gap-6 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  router.pathname === link.href
                    ? "text-brand-700"
                    : "text-slate-600 hover:text-brand-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 sm:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="text-xl leading-none text-slate-700">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {menuOpen && (
          <nav className="flex flex-col border-t border-slate-200 bg-white px-4 py-2 sm:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-md px-2 py-2 text-sm font-medium ${
                  router.pathname === link.href
                    ? "text-brand-700"
                    : "text-slate-600 hover:text-brand-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
          <strong className="text-slate-600">ClaimAm</strong> helps you find support programs you
          may qualify for and explains them in plain language. It is not a government service,
          does not verify your NIN or BVN, and does not submit applications on your behalf —
          always apply directly on the program&apos;s official website. ClaimAm is free; nobody
          should ever ask you to pay to use it or to speed up an application.
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} ClaimAm. Independent, informational project — not
          affiliated with the Nigerian government.
        </p>
      </div>
    </footer>
  );
}
