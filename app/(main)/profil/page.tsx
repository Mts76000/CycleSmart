"use client";

import Link from "next/link";
import { useLocalUser } from "../../../lib/auth-store";
import { useCycle } from "../../../lib/cycle-store";

export default function ProfilPage() {
  const { signOut, user } = useLocalUser();
  const { clearSlots } = useCycle();

  function handleSignOut() {
    signOut();
    clearSlots();
  }

  if (!user) {
    return (
      <div className="space-y-5 pt-6">
        <section className="rounded-[28px] bg-white p-6 text-center shadow-xl shadow-slate-200/70">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-cyan-100 text-3xl font-black text-teal-700">
            CS
          </div>
          <p className="mt-5 text-3xl font-bold">Aucun compte connecte</p>
          <p className="mt-2 leading-6 text-slate-500">
            Connecte-toi pour sauvegarder tes heures creuses et les retrouver plus tard.
          </p>
        </section>

        <section className="grid gap-3">
          <Link
            className="flex h-14 items-center justify-center rounded-2xl bg-cyan-400 px-4 font-bold text-teal-950 shadow-lg shadow-cyan-300/40"
            href="/connexion"
          >
            Connexion
          </Link>
          <Link
            className="flex h-14 items-center justify-center rounded-2xl border border-teal-200 bg-white px-4 font-bold text-teal-700"
            href="/inscription"
          >
            Creer un compte
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-6">
      <section className="rounded-[28px] bg-white p-6 text-center shadow-xl shadow-slate-200/70">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-cyan-400 text-2xl font-black text-teal-950">
          {user.name.slice(0, 2).toUpperCase()}
        </div>
        <p className="mt-5 text-3xl font-bold">{user.name}</p>
        <p className="mt-1 text-slate-500">{user.email}</p>
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-sm">
        <p className="text-lg font-bold">Synchronisation</p>
        <p className="mt-2 leading-6 text-slate-500">
          Ton compte est actif localement. La synchronisation PostgreSQL sera branchee quand la
          connexion base de donnees sera complete.
        </p>
      </section>

      <button
        className="h-14 w-full rounded-2xl border border-red-200 bg-white px-4 font-bold text-red-600"
        type="button"
        onClick={handleSignOut}
      >
        Deconnexion
      </button>
    </div>
  );
}
