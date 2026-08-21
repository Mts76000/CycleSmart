"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ClockIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
} from "@/components/icons";
import { dayMinutes, timeToMinutes, useCycle, type Slot } from "@/lib/cycle-store";

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

const hourMarks = [0, 3, 6, 9, 12, 15, 18, 21, 24];

function pct(minutes: number) {
  return (minutes / dayMinutes) * 100;
}

function SlotsTimeline({ slots, currentTime }: { slots: Slot[]; currentTime: string }) {
  const nowMinutes = timeToMinutes(currentTime);
  const nowPct = pct(nowMinutes);

  const segments = slots.flatMap((slot) => {
    const start = timeToMinutes(slot.start);
    const rawEnd = timeToMinutes(slot.end);

    if (rawEnd > start) {
      return [{ id: slot.id, left: start, width: rawEnd - start, name: slot.name }];
    }

    return [
      { id: `${slot.id}-a`, left: start, width: dayMinutes - start, name: slot.name },
      { id: `${slot.id}-b`, left: 0, width: rawEnd, name: slot.name },
    ];
  });

  const isInSlot = segments.some(
    (segment) => nowMinutes >= segment.left && nowMinutes <= segment.left + segment.width,
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/55">Journee (24h)</p>
        <p className={`rounded-full px-2.5 py-1 text-xs font-bold ${isInSlot ? "bg-white text-emerald-800" : "bg-white/12 text-white/80"}`}>
          {isInSlot ? "Heure creuse en cours" : "Heure pleine en cours"}
        </p>
      </div>

      <div className="relative mt-4 h-8">
        {/* hour gridlines */}
        {hourMarks.map((hour) => (
          <span
            key={hour}
            className="absolute top-0 h-3 w-px bg-white/15"
            style={{ left: `${pct(hour * 60)}%` }}
            aria-hidden="true"
          />
        ))}

        {/* track */}
        <div className="absolute top-0 h-3 w-full overflow-hidden rounded-full bg-white/12">
          {segments.map((segment) => (
            <span
              key={segment.id}
              className="absolute inset-y-0 bg-white"
              style={{
                left: `${pct(segment.left)}%`,
                width: `${Math.max(pct(segment.width), 0.6)}%`,
              }}
              title={segment.name}
            />
          ))}
        </div>

        {/* now marker */}
        <div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${nowPct}%` }}
        >
          <span className="size-3 rounded-full bg-emerald-300 ring-4 ring-emerald-300/30" aria-hidden="true" />
          <span className="mt-1 whitespace-nowrap rounded-full bg-emerald-900 px-1.5 py-0.5 text-[9px] font-bold text-white">
            {currentTime}
          </span>
        </div>
      </div>

      <div className="relative mt-3 h-4 text-[10px] font-bold text-white/45">
        {hourMarks.map((hour, index) => {
          const isFirst = index === 0;
          const isLast = index === hourMarks.length - 1;

          return (
            <span
              key={hour}
              className={`absolute top-0 ${isFirst ? "" : isLast ? "-translate-x-full" : "-translate-x-1/2"}`}
              style={{ left: `${pct(hour * 60)}%` }}
            >
              {hour}h
            </span>
          );
        })}
      </div>
    </div>
  );
}


export default function CreneauxPage() {
  const [showSlotForm, setShowSlotForm] = useState(false);
  const {
    addSlot,
    calculationMode,
    currentTime,
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
      <section className="rounded-[24px] bg-emerald-700 p-4 text-white shadow-hero sm:p-5 md:p-6 md:rounded-[30px] md:p-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65 sm:text-sm">
              Reglages
            </p>
            <h2 className="mt-2 text-2xl font-display font-black tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
              Tes heures creuses
            </h2>
          </div>
          <p className="hidden shrink-0 text-right text-sm font-bold text-white/70 sm:block">
            {slotCountLabel(slots.length)}
          </p>
        </div>

        <div className="mt-6 md:mt-8">
          <SlotsTimeline currentTime={currentTime} slots={slots} />
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-card md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ClockIcon className="size-5" />
            </span>
            <div>
              <p className="text-xl font-bold text-slate-950">Heures creuses</p>
              <p className="text-sm text-slate-500">{slotCountLabel(slots.length)} enregistre</p>
            </div>
          </div>
          <p className="max-w-full rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold leading-snug text-emerald-800">
            {modeLabel}
          </p>
        </div>

        <button
          className="mt-5 h-12 w-full rounded-2xl border border-emerald-200 bg-emerald-50 font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-[0.99]"
          type="button"
          onClick={() => setShowSlotForm((visible) => !visible)}
        >
          {showSlotForm ? "Fermer" : "Ajouter une plage"}
        </button>

        {showSlotForm && (
          <div className="mt-3 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4">
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
                    className="grid h-12 place-items-center rounded-2xl bg-white text-slate-400 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.96]"
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
        className="block rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 sm:text-sm"
        href="/machines"
      >
        Gerer les programmes
      </Link>
    </div>
  );
}
