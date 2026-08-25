"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
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
    <main className="grid min-h-screen place-items-center p-4">
      <div className="max-w-md text-center">
        <p className="text-6xl font-black text-emerald-500">Oups</p>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">Un problème est survenu</h1>
        <p className="mt-2 text-stone-600">
          Quelque chose s&apos;est mal passé. Réessaie ou recharge la page.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-bold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
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
  );
}
