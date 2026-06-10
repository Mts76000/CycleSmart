"use client";

import Link from "next/link";
import { ClockIcon, MoonIcon, SunIcon, TrashIcon } from "../../../components/icons";
import { useCycle } from "../../../lib/cycle-store";

export default function CreneauxPage() {
  const { addSlot, best, newSlot, removeSlot, setNewSlot, slots, syncStatus } = useCycle();
  const syncLabel = {
    local: "Sauvegarde locale uniquement",
    loading: "Chargement de tes creneaux...",
    saving: "Sauvegarde en cours...",
    saved: "Creneaux sauvegardes sur ton compte",
    error: "Connexion au compte indisponible",
  }[syncStatus];

  return (
    <div className="space-y-5 md:grid md:grid-cols-[minmax(0,1fr)_360px] md:items-start md:gap-6 md:space-y-0">
      <div className="space-y-5">
        <section className="pt-4 md:pt-0">
          <p className="text-3xl font-bold">Mes heures creuses</p>
          <p className="mt-2 leading-6 text-slate-500">
            Ajoute tes plages tarifaires. Le calculateur placera le cycle dedans, meme si un creneau
            traverse minuit.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Creneaux enregistres
            </p>
          </div>

          {slots.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm leading-6 text-slate-500">
              Aucun creneau enregistre pour le moment. Ajoute ta premiere plage depuis le panneau a
              droite.
            </div>
          )}

          {slots.map((slot, index) => (
            <article className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm" key={slot.id}>
              <span
                className={`grid size-10 place-items-center rounded-2xl ${
                  index === 0 ? "bg-cyan-400 text-slate-950" : "bg-white/80 text-teal-700"
                }`}
                aria-hidden="true"
              >
                {index === 0 ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">
                  {slot.start} - {slot.end}
                </p>
                <p className="text-sm text-slate-500">{slot.name} · Quotidien</p>
              </div>
              <button
                className="grid size-9 place-items-center rounded-full text-slate-500"
                type="button"
                onClick={() => removeSlot(slot.id)}
                aria-label={`Supprimer ${slot.name}`}
              >
                <TrashIcon className="size-4" />
              </button>
            </article>
          ))}
        </section>
      </div>

      <aside className="space-y-5 md:sticky md:top-6">
        <section className="rounded-[24px] border border-cyan-200 bg-cyan-50 p-5">
          <p className="text-lg font-bold text-teal-900">Sauvegarde des creneaux</p>
          <p className="mt-2 text-sm leading-6 text-teal-900/75">
            Pour retrouver tes heures creuses sur tous tes appareils, cree un compte ou connecte-toi.
            Sans compte, les changements restent seulement sur ce navigateur.
          </p>
          <p className="mt-3 rounded-2xl bg-white/80 px-3 py-2 text-sm font-bold text-teal-800">
            {syncLabel}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              className="flex h-11 items-center justify-center rounded-2xl bg-cyan-400 text-sm font-bold text-teal-950"
              href="/inscription"
            >
              Creer un compte
            </Link>
            <Link
              className="flex h-11 items-center justify-center rounded-2xl bg-white text-sm font-bold text-teal-700"
              href="/connexion"
            >
              Connexion
            </Link>
          </div>
        </section>

        <section className="rounded-[24px] bg-white p-6 shadow-xl shadow-slate-200/70">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Prochain creneau
          </p>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-lg font-bold">{best?.slot.name || "Aucun creneau"}</p>
              <p className="mt-5 text-4xl font-black text-teal-700">
                {best ? `${best.slot.start} - ${best.slot.end}` : "--:--"}
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-2xl bg-white/80 text-teal-700">
              <ClockIcon className="size-5" />
            </span>
          </div>
        </section>

        <section className="rounded-[24px] border border-dashed border-teal-200 bg-white/70 p-4">
          <input
            className="h-12 w-full rounded-2xl bg-slate-100 px-4 outline-none ring-cyan-300 focus:ring-4"
            placeholder="Nom du creneau"
            value={newSlot.name}
            onChange={(event) => setNewSlot((slot) => ({ ...slot, name: event.target.value }))}
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input
              className="h-12 rounded-2xl bg-slate-100 px-4 font-bold text-teal-700 outline-none ring-cyan-300 focus:ring-4"
              type="time"
              value={newSlot.start}
              onChange={(event) => setNewSlot((slot) => ({ ...slot, start: event.target.value }))}
            />
            <input
              className="h-12 rounded-2xl bg-slate-100 px-4 font-bold text-teal-700 outline-none ring-cyan-300 focus:ring-4"
              type="time"
              value={newSlot.end}
              onChange={(event) => setNewSlot((slot) => ({ ...slot, end: event.target.value }))}
            />
          </div>
          <button
            className="mt-3 h-14 w-full rounded-2xl bg-cyan-400 px-4 font-bold text-teal-950 transition active:scale-[0.99]"
            type="button"
            onClick={addSlot}
          >
            Ajouter un creneau
          </button>
        </section>
      </aside>
    </div>
  );
}
