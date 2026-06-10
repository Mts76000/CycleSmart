"use client";

import Link from "next/link";
import { Icon } from "../../../components/icon";
import { useCycle } from "../../../lib/cycle-store";

export default function CreneauxPage() {
  const { addSlot, best, newSlot, removeSlot, setNewSlot, slots, syncStatus } = useCycle();
  const syncLabel = {
    local: "Sauvegarde locale uniquement",
    loading: "Chargement PostgreSQL...",
    saving: "Sauvegarde PostgreSQL...",
    saved: "Sauvegarde PostgreSQL OK",
    error: "PostgreSQL indisponible",
  }[syncStatus];

  return (
    <div className="space-y-5">
      <section className="pt-4">
        <p className="text-3xl font-bold">Mes heures creuses</p>
        <p className="mt-2 leading-6 text-slate-500">
          Ajoute tes plages tarifaires. Le calculateur placera le cycle dedans, meme si un creneau
          traverse minuit.
        </p>
      </section>

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
          <Icon>◷</Icon>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Creneaux enregistres
          </p>
        </div>

        {slots.map((slot, index) => (
          <article className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm" key={slot.id}>
            <Icon active={index === 0}>{index === 0 ? "☾" : "☼"}</Icon>
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
              ×
            </button>
          </article>
        ))}
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

    </div>
  );
}
