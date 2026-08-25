"use client";

import { useState } from "react";
import { ActionLink } from "@/components/action-link";
import { GuestBanner } from "@/components/guest-banner";
import {
  ClockIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
} from "@/components/icons";
import { SlotsTimeline } from "@/components/slots-timeline";
import { useCycle } from "@/lib/cycle-store";

function slotCountLabel(count: number) {
  return `${count} créneau${count > 1 ? "x" : ""}`;
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
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);
  const {
    addSlot,
    calculationMode,
    currentTime,
    isAuthenticated,
    newSlot,
    removeSlot,
    setNewSlot,
    slots,
    updateSlot,
  } = useCycle();

  const modeLabel = calculationMode === "last" ? "Fin dans le créneau" : "Départ dans le créneau";

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="surface-hero p-4 text-white sm:p-5 md:p-6 lg:p-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65 sm:text-sm">
              Réglages
            </p>
            <h2 className="mt-2 text-2xl font-display font-black tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
              Tes heures creuses
            </h2>
          </div>
          <p className="hidden shrink-0 text-right text-sm font-bold text-white/70 sm:block font-numeric">
            {slotCountLabel(slots.length)}
          </p>
        </div>

        <div className="mt-6 md:mt-8">
          <SlotsTimeline
            currentTime={currentTime}
            slots={slots}
            highlightId={hoveredSlotId}
            onHoverSegment={setHoveredSlotId}
          />
        </div>
      </section>

      {!isAuthenticated && <GuestBanner />}

      <section className="surface-card p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ClockIcon className="size-5" />
            </span>
            <div>
              <p className="text-xl font-bold text-stone-950">Heures creuses</p>
              <p className="text-sm text-stone-500">{slotCountLabel(slots.length)} enregistré</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="max-w-full rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold leading-snug text-emerald-800">
              {modeLabel}
            </p>
            <button
              className="hidden h-10 shrink-0 items-center gap-1.5 rounded-full bg-emerald-500 px-4 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.98] sm:inline-flex"
              type="button"
              onClick={() => setShowSlotForm((visible) => !visible)}
            >
              {showSlotForm ? "Fermer" : "Ajouter une plage"}
            </button>
          </div>
        </div>

        <button
          className="mt-4 h-12 w-full rounded-2xl border border-emerald-200 bg-emerald-50 font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-[0.99] sm:hidden"
          type="button"
          onClick={() => setShowSlotForm((visible) => !visible)}
        >
          {showSlotForm ? "Fermer" : "Ajouter une plage"}
        </button>

        {showSlotForm && (
          <div className="mt-4 rounded-[var(--radius-md)] border border-dashed border-emerald-200 bg-emerald-50/40 p-4">
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

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {slots.length === 0 && (
            <div className="rounded-[var(--radius-md)] border border-dashed border-stone-200 p-5 text-sm leading-6 text-stone-500 md:col-span-2">
              Ajoute tes plages d&apos;heures creuses. Exemple : 01:06 - 07:06 et 14:36 - 16:36.
            </div>
          )}

          {slots.map((slot, index) => {
            const SlotIcon = getSlotIcon(slot.start);
            const isHovered = hoveredSlotId === slot.id;

            return (
              <article
                className={`space-y-3 rounded-[var(--radius-md)] border p-4 transition ${
                  isHovered ? "border-emerald-300 bg-emerald-50/40" : "border-stone-100 bg-white"
                }`}
                key={slot.id}
                onMouseEnter={() => setHoveredSlotId(slot.id)}
                onMouseLeave={() => setHoveredSlotId(null)}
              >
                <div className="flex items-center justify-between gap-3">
                  <label className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white">
                      <SlotIcon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
                        Plage {index + 1}
                      </span>
                      <input
                        className="min-w-0 w-full bg-transparent text-lg font-bold text-stone-950 outline-none"
                        aria-label={`Nom du créneau ${index + 1}`}
                        value={slot.name}
                        onChange={(event) => updateSlot(slot.id, { name: event.target.value })}
                      />
                    </span>
                  </label>
                  <button
                    className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--surface-1)] text-stone-400 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.96]"
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    aria-label={`Supprimer ${slot.name}`}
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">Début</span>
                    <input
                      className="mt-1 h-12 w-full rounded-2xl bg-[var(--surface-1)] px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
                      type="time"
                      value={slot.start}
                      onChange={(event) => updateSlot(slot.id, { start: event.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">Fin</span>
                    <input
                      className="mt-1 h-12 w-full rounded-2xl bg-[var(--surface-1)] px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
                      type="time"
                      value={slot.end}
                      onChange={(event) => updateSlot(slot.id, { end: event.target.value })}
                    />
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <ActionLink href="/machines" block>
        Gérer les programmes
      </ActionLink>
    </div>
  );
}
