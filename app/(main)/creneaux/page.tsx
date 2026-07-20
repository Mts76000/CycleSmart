"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ClockIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
} from "@/components/icons";
import { useCycle } from "@/lib/cycle-store";

function slotCountLabel(count: number) {
  return `${count} creneau${count > 1 ? "x" : ""}`;
}


function getSlotIcon(startTime: string) {
  const hour = Number(startTime.split(":")[0]);

  if (hour < 6 || hour >= 21) {
    return MoonIcon;
  }

  if (hour >= 7 && hour < 18) {
    return SunIcon;
  }

  return ClockIcon;
}


export default function CreneauxPage() {
  const [showSlotForm, setShowSlotForm] = useState(false);
  const {
    addSlot,
    calculationMode,
    newSlot,
    removeSlot,
    setNewSlot,
    slots,
    syncStatus,
    updateSlot,
  } = useCycle();

  const modeLabel = calculationMode === "last" ? "Fin dans le creneau" : "Depart dans le creneau";

  const syncLabel = {
    local: "Sur cet appareil",
    loading: "Verification...",
    saving: "Enregistrement...",
    saved: "Enregistre",
    error: "Sur cet appareil",
  }[syncStatus];
  const isSyncedWithAccount = syncStatus === "saved" || syncStatus === "saving";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-[24px] bg-emerald-700 p-4 text-white shadow-xl shadow-emerald-200/50 sm:p-5 md:p-6 md:rounded-[30px] md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65 sm:text-sm">
          Reglages
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-normal sm:mt-3 sm:text-3xl md:text-5xl">
          Tes heures creuses
        </h2>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-xl shadow-slate-200/70 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-green-50 text-emerald-700">
              <ClockIcon className="size-5" />
            </span>
            <div>
              <p className="text-xl font-bold text-slate-950">Heures creuses</p>
              <p className="text-sm text-slate-500">{slotCountLabel(slots.length)} enregistre</p>
            </div>
          </div>
          <p className="max-w-full rounded-full bg-green-50 px-4 py-2 text-sm font-bold leading-snug text-emerald-800">
            {modeLabel}
          </p>
        </div>

        <button
          className="mt-5 h-12 w-full rounded-2xl border border-emerald-200 bg-green-50 font-bold text-emerald-800"
          type="button"
          onClick={() => setShowSlotForm((visible) => !visible)}
        >
          {showSlotForm ? "Fermer" : "Ajouter une plage"}
        </button>

        {showSlotForm && (
          <div className="mt-3 rounded-3xl border border-dashed border-emerald-200 bg-green-50/50 p-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_140px_auto]">
              <input
                className="h-12 rounded-2xl bg-white px-4 outline-none ring-emerald-300 focus:ring-4"
                placeholder="Nom automatique si vide"
                value={newSlot.name}
                onChange={(event) => setNewSlot((slot) => ({ ...slot, name: event.target.value }))}
              />
              <input
                className="h-12 rounded-2xl bg-white px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
                type="time"
                value={newSlot.start}
                onChange={(event) => setNewSlot((slot) => ({ ...slot, start: event.target.value }))}
              />
              <input
                className="h-12 rounded-2xl bg-white px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
                type="time"
                value={newSlot.end}
                onChange={(event) => setNewSlot((slot) => ({ ...slot, end: event.target.value }))}
              />
              <button
                className="h-12 rounded-2xl bg-emerald-500 px-5 font-bold text-white transition active:scale-[0.99]"
                type="button"
                onClick={() => {
                  addSlot();
                  setShowSlotForm(false);
                }}
              >
                Valider
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {slots.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">
              Ajoute tes plages d&apos;heures creuses. Exemple : 01:06 - 07:06 et 14:36 - 16:36.
            </div>
          )}

          {slots.map((slot, index) => (
            (() => {
              const SlotIcon = getSlotIcon(slot.start);

              return (
                <article
                  className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[minmax(180px,1fr)_140px_140px_44px] md:items-end"
                  key={slot.id}
                >
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Plage {index + 1}
                    </span>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white">
                        <SlotIcon className="size-5" />
                      </span>
                      <input
                        className="min-w-0 flex-1 bg-transparent text-lg font-bold text-slate-950 outline-none"
                        aria-label={`Nom du creneau ${index + 1}`}
                        value={slot.name}
                        onChange={(event) => updateSlot(slot.id, { name: event.target.value })}
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Debut
                    </span>
                    <input
                      className="mt-1 h-12 w-full rounded-2xl bg-white px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
                      type="time"
                      value={slot.start}
                      onChange={(event) => updateSlot(slot.id, { start: event.target.value })}
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Fin
                    </span>
                    <input
                      className="mt-1 h-12 w-full rounded-2xl bg-white px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
                      type="time"
                      value={slot.end}
                      onChange={(event) => updateSlot(slot.id, { end: event.target.value })}
                    />
                  </label>

                  <button
                    className="grid h-12 place-items-center rounded-2xl bg-white text-slate-400 hover:text-red-600"
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    aria-label={`Supprimer ${slot.name}`}
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </article>
              );
            })()
          ))}
        </div>
      </section>


      <Link
        className="block rounded-2xl border border-emerald-100 bg-green-50 px-4 py-3 text-center text-xs font-bold text-emerald-800 sm:text-sm"
        href="/machines"
      >
        Gerer les machines et programmes
      </Link>
    </div>
  );
}
