import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable - CycleSmart",
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-5">
        <section className="surface-hero p-6 text-center text-white sm:p-7">
          <p className="text-[10rem] font-display font-black leading-none tracking-tighter text-white/30" aria-hidden="true">
            404
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Page introuvable</h1>
          <p className="mt-2 text-sm leading-6 text-emerald-50">
            Cette page n&apos;existe pas ou a été déplacée.
          </p>
        </section>

        <section className="surface-card p-6 text-center">
          <p className="text-stone-600">
            Retourne au calculateur pour continuer.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-700 px-6 text-sm font-bold text-white shadow-cta transition hover:bg-emerald-800 active:scale-[0.98] sm:w-auto"
              href="/calculer"
            >
              Calculer un cycle
            </Link>
            <Link
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-emerald-200 bg-white px-6 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 active:scale-[0.98] sm:w-auto"
              href="/"
            >
              Accueil
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
