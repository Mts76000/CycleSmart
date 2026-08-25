"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen bg-[var(--background)] p-4 font-sans text-[var(--foreground)] antialiased">
        <main className="grid min-h-screen place-items-center">
          <div className="max-w-md text-center">
            <p className="text-6xl font-black text-emerald-500">Oups</p>
            <h1 className="mt-4 text-2xl font-bold text-stone-900">Erreur critique</h1>
            <p className="mt-2 text-stone-500">
              L&apos;application a rencontré un problème inattendu. Réessaie ou recharge la page.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.98]"
                onClick={() => reset()}
                type="button"
              >
                Réessayer
              </button>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-200 bg-white px-6 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
                href="/"
              >
                Accueil
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
