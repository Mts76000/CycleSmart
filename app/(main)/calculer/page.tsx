"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ClockIcon,
  DeviceIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  TrashIcon,
} from "@/components/icons";
import {
  dayMinutes,
  delayStepOptions,
  formatDuration,
  minutesToTime,
  timeToMinutes,
  type Suggestion,
  useCycle,
} from "@/lib/cycle-store";

const durationMin = 30;
const durationMax = 480;

function formatWait(wait: number) {
  return wait === 0 ? "0 h" : formatDuration(wait);
}

function getTickPosition(value: number) {
  return `${((value - durationMin) / (durationMax - durationMin)) * 100}%`;
}

function DurationTicks() {
  return (
    <div className="relative mt-2 h-5 text-xs font-semibold text-slate-400">
      <span className="absolute left-0">30 min</span>
      <span className="absolute -translate-x-1/2" style={{ left: getTickPosition(240) }}>
        4 h
      </span>
      <span className="absolute right-0">8 h</span>
    </div>
  );
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

function ModeToggle({
  mode,
  onChange,
}: {
  mode: "soon" | "last";
  onChange: (mode: "soon" | "last") => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 rounded-2xl bg-slate-100 p-1 sm:grid-cols-2">
      <button
        className={`rounded-xl px-3 py-3 text-sm font-bold leading-snug transition ${
          mode === "soon" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
        }`}
        type="button"
        onClick={() => onChange("soon")}
      >
        Plus tot possible
      </button>
      <button
        className={`rounded-xl px-3 py-3 text-sm font-bold leading-snug transition ${
          mode === "last" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
        }`}
        type="button"
        onClick={() => onChange("last")}
      >
        Plus tard possible
      </button>
    </div>
  );
}

function DelayModeToggle({
  mode,
  onChange,
}: {
  mode: "depart" | "fin";
  onChange: (mode: "depart" | "fin") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
      <button
        className={`rounded-xl px-3 py-2 text-xs font-bold leading-snug transition sm:text-sm ${
          mode === "depart" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
        }`}
        type="button"
        onClick={() => onChange("depart")}
      >
        Départ dans
      </button>
      <button
        className={`rounded-xl px-3 py-2 text-xs font-bold leading-snug transition sm:text-sm ${
          mode === "fin" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
        }`}
        type="button"
        onClick={() => onChange("fin")}
      >
        Fin à
      </button>
    </div>
  );
}

function TimeDial({ minutes, label }: { minutes: number | null; label: string }) {
  const referenceMax = 480;
  const progress = minutes === null ? 0 : Math.min(1, Math.max(0, minutes) / referenceMax);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative grid size-32 shrink-0 place-items-center sm:size-36 md:size-40">
      <svg className="size-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} strokeWidth="9" fill="none" className="stroke-white/15" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
          className="stroke-white transition-[stroke-dashoffset] duration-700 ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center px-2 text-center">
        <div>
          <p className="font-display text-xl font-black leading-none sm:text-2xl md:text-3xl">
            {minutes !== null ? formatWait(minutes) : "--"}
          </p>
          <p className="mt-1.5 text-[9px] font-bold uppercase leading-tight tracking-wide text-white/60 sm:text-[10px] md:mt-2 md:text-xs">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function getSlotBoundsForSuggestion(suggestion: Suggestion) {
  let slotStart = timeToMinutes(suggestion.slot.start);
  const rawEnd = timeToMinutes(suggestion.slot.end);
  let slotEnd = rawEnd <= slotStart ? rawEnd + dayMinutes : rawEnd;

  while (slotEnd < suggestion.start) {
    slotStart += dayMinutes;
    slotEnd += dayMinutes;
  }

  return { slotStart, slotEnd };
}

export default function CalculerPage() {
  const [showSlotForm, setShowSlotForm] = useState(false);
  const {
    addSlot,
    calculationMode,
    currentTime,
    duration,
    isAuthenticated,
    machines,
    newSlot,
    removeSlot,
    selectedProgramId,
    selectProgram,
    setCalculationMode,
    setDuration,
    setNewSlot,
    slots,
    suggestions,
    syncStatus,
    updateProgram,
    updateSlot,
  } = useCycle();
  const recommended = suggestions[0];
  const allPrograms = machines.flatMap((machine) => machine.programs);
  const selectedProgram = allPrograms.find((program) => program.id === selectedProgramId);
  const delayStep = selectedProgram?.delayStep || 30;
  const selectedDelayStepIndex = Math.max(0, delayStepOptions.indexOf(delayStep));
  const endsOutsideSlot = recommended
    ? recommended.end > getSlotBoundsForSuggestion(recommended).slotEnd
    : false;
  const isFinMode = selectedProgram?.delayMode === "fin";
  const dialWait = recommended
    ? isFinMode
      ? recommended.end - timeToMinutes(currentTime)
      : recommended.wait
    : null;
  const isSynced = syncStatus === "saved" || syncStatus === "saving";
  const resultCard = (
    <section className="rounded-[32px] bg-emerald-700 p-4 text-white shadow-hero sm:p-6 md:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70 md:text-center">
        {isFinMode ? "A regler sur \"fin dans\"" : "Prochain lancement"}
      </p>

      <div className="mt-4 flex items-center gap-4 sm:mt-5 sm:gap-5 md:mt-6 md:flex-col md:gap-5 md:text-center">
        <TimeDial minutes={dialWait} label={isFinMode ? "avant la fin" : "avant depart"} />
        <div className="min-w-0 flex-1 space-y-2 md:w-full">
          <p className="break-words text-sm font-bold leading-5 text-white/85 md:text-base">
            {recommended
              ? `${recommended.slot.name} · ${minutesToTime(recommended.start)} → ${minutesToTime(recommended.end)}`
              : "Ajoute un creneau pour obtenir une recommandation."}
          </p>
          {endsOutsideSlot && recommended && (
            <p className="rounded-xl bg-white/12 px-2.5 py-2 text-xs font-semibold leading-5 text-white/85">
              Fin hors heures creuses, mais depart bien dans {recommended.slot.name}.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-2 border-t border-white/15 pt-4 sm:grid-cols-2 sm:gap-3 md:mt-6 md:pt-5">
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/10 px-3 py-2.5 sm:block sm:rounded-3xl sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55 sm:text-xs">Programme</p>
          <p className="text-sm font-black sm:mt-2 sm:text-lg">{selectedProgram?.name || "Programme"}</p>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/10 px-3 py-2.5 sm:block sm:rounded-3xl sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55 sm:text-xs">Cycle</p>
          <p className="text-sm font-black sm:mt-2 sm:text-lg">{formatDuration(duration)}</p>
        </div>
      </div>
    </section>
  );

  const upcomingSlotsCard = slots.length > 0 && (
    <section className="hidden rounded-[28px] bg-white p-5 shadow-card md:block">
      <p className="text-sm font-bold text-slate-950">Tes heures creuses</p>
      <div className="mt-3 space-y-2">
        {slots.map((slot) => {
          const SlotIcon = getSlotIcon(slot.start);

          return (
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5" key={slot.id}>
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-emerald-700">
                <SlotIcon className="size-4" />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{slot.name}</p>
              <p className="shrink-0 text-xs font-bold text-slate-400">
                {slot.start} - {slot.end}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );

  const controlsCard = (
    <section className="rounded-[24px] bg-white p-4 shadow-card sm:p-5 md:p-7">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold text-slate-950 sm:text-2xl md:text-3xl">
            Calculateur de cycle
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600 sm:mt-2 sm:text-base sm:leading-6">
            Choisis ton appareil, ajuste la duree si besoin.
          </p>
        </div>
        {isSynced && (
            <span className="hidden shrink-0 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:inline-flex">
              Enregistre
          </span>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-3 sm:mt-6 sm:rounded-3xl sm:p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 sm:size-10">
            <DeviceIcon className="size-4 sm:size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-slate-950 text-sm sm:text-base">Machine</p>
            <p className="text-xs leading-4 text-slate-500 sm:text-sm sm:leading-5">
              {isAuthenticated
                ? "Tes reglages sont gardes avec ton compte."
                : "Choisis un appareil pour tester sans compte."}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
          {machines.map((machine) => (
            <div key={machine.id}>
              <p className="text-xs font-bold text-slate-700 sm:text-sm">{machine.name}</p>
              <div className="mt-2 grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {machine.programs.map((program) => {
                  const active = selectedProgramId === program.id;

                  return (
                    <button
                      className={`relative min-h-20 rounded-2xl border px-3 py-3 text-left text-slate-700 transition sm:min-h-24 sm:px-4 sm:py-4 ${
                        active
                          ? "border-emerald-300 bg-emerald-50/60 shadow-sm"
                          : "border-transparent bg-white hover:border-emerald-100 hover:text-emerald-800"
                      }`}
                      key={program.id}
                      type="button"
                      onClick={() => selectProgram(program.id)}
                    >
                      {active && (
                        <span className="absolute right-2 top-2 size-2 rounded-full bg-emerald-500 sm:right-3 sm:top-3" />
                      )}
                      <span className="block pr-6 text-base font-bold leading-5 sm:pr-4 sm:text-lg sm:leading-6">{program.name}</span>
                      <span className="mt-1 block text-xs text-slate-500 sm:mt-2 sm:text-sm">
                        {formatDuration(program.duration)} · pas {formatDuration(program.delayStep)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Link
          className="mt-3 block rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 sm:mt-4 sm:text-sm"
          href="/machines"
        >
          Gérer les programmes
        </Link>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-3 sm:mt-4 sm:rounded-3xl sm:p-4">
        <p className="text-xs font-bold text-slate-700 sm:text-sm">Mode de calcul</p>
        <div className="mt-2 sm:mt-3">
          <ModeToggle mode={calculationMode} onChange={setCalculationMode} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 sm:mt-5 sm:gap-3">
          <label className="text-xs font-bold text-slate-700 sm:text-sm" htmlFor="duration">
            Duree du programme
          </label>
          <span className="rounded-full bg-slate-50 px-3 py-2 text-sm font-black text-emerald-700 sm:px-4 sm:py-2 sm:text-base">
            {formatDuration(duration)}
          </span>
        </div>
        <input
          id="duration"
          className="mt-4 w-full accent-emerald-700"
          type="range"
          min={durationMin}
          max={durationMax}
          step="5"
          value={duration}
          onChange={(event) => setDuration(Number(event.target.value))}
        />
        <DurationTicks />

        <div className="mt-4 flex items-center justify-between gap-2 sm:mt-5">
          <span className="text-xs font-bold text-slate-700 sm:text-sm">Mode depart differe</span>
          <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-black text-emerald-700 sm:px-4 sm:py-2 sm:text-sm">
            {selectedProgram?.delayMode === "fin" ? "Fin à" : "Départ dans"}
          </span>
        </div>
      </div>
    </section>
  );

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-5xl md:grid md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] md:items-start md:gap-6">
        <div className="space-y-4 md:sticky md:top-5">
          {resultCard}
          {upcomingSlotsCard}
        </div>

        <div className="mt-4 space-y-4 md:mt-0">
          <section className="rounded-[28px] bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-bold text-slate-950">Heures creuses</p>
              {!showSlotForm && (
                <button
                  className="flex h-9 items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 active:scale-[0.97]"
                  type="button"
                  onClick={() => setShowSlotForm(true)}
                >
                  <PlusIcon className="size-3.5" />
                  Ajouter
                </button>
              )}
            </div>

            {showSlotForm && (
              <div className="mt-3 grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_120px_120px_auto]">
                <input
                  className="h-12 rounded-2xl bg-white px-4 outline-none ring-emerald-300 focus:ring-4"
                  placeholder="Nom optionnel"
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
                  className="h-12 rounded-2xl bg-emerald-500 px-4 font-bold text-white transition hover:bg-emerald-600 active:scale-[0.98]"
                  type="button"
                  onClick={() => {
                    addSlot();
                    setShowSlotForm(false);
                  }}
                >
                  Valider
                </button>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {slots.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                  Exemple : 01:06 - 07:06 ou 14:36 - 16:36.
                </p>
              )}
              {slots.map((slot, index) => {
                const SlotIcon = getSlotIcon(slot.start);

                return (
                  <article
                    className="grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_112px_112px_40px] sm:items-center"
                    key={slot.id}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white">
                        <SlotIcon className="size-5" />
                      </span>
                      <input
                        className="min-w-0 flex-1 bg-transparent font-bold text-slate-950 outline-none"
                        aria-label={`Nom du creneau ${index + 1}`}
                        value={slot.name}
                        onChange={(event) => updateSlot(slot.id, { name: event.target.value })}
                      />
                    </div>
                    <input
                      className="h-11 rounded-2xl bg-white px-3 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
                      type="time"
                      value={slot.start}
                      onChange={(event) => updateSlot(slot.id, { start: event.target.value })}
                    />
                    <input
                      className="h-11 rounded-2xl bg-white px-3 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
                      type="time"
                      value={slot.end}
                      onChange={(event) => updateSlot(slot.id, { end: event.target.value })}
                    />
                    <button
                      className="grid h-11 place-items-center rounded-2xl bg-white text-slate-400 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.96]"
                      type="button"
                      onClick={() => removeSlot(slot.id)}
                      aria-label={`Supprimer ${slot.name}`}
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-5 shadow-card">
            <p className="text-lg font-bold text-slate-950">Reglages du cycle</p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <p className="text-sm font-bold text-slate-700">Mode de calcul</p>
              <div className="mt-3">
                <ModeToggle mode={calculationMode} onChange={setCalculationMode} />
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm font-bold text-slate-700" htmlFor="duration">
                  Duree du programme
                </label>
                <span className="rounded-full bg-white px-4 py-2 text-base font-black text-emerald-700">
                  {formatDuration(duration)}
                </span>
              </div>
              <input
                id="duration"
                className="mt-4 w-full accent-emerald-700"
                type="range"
                min={durationMin}
                max={durationMax}
                step="5"
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
              />
              <DurationTicks />
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-bold text-slate-700" htmlFor="guest-delay-step">
                  Pas du depart differe
                </label>
                <select
                  id="guest-delay-step"
                  className="rounded-full border-none bg-white px-4 py-2 text-base font-black text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
                  value={delayStep}
                  onChange={(event) => {
                    if (selectedProgram) {
                      updateProgram(selectedProgram.id, { delayStep: Number(event.target.value) });
                    }
                  }}
                  disabled={!selectedProgram}
                >
                  {delayStepOptions.map((step) => (
                    <option key={step} value={step}>
                      {formatDuration(step)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <span className="text-sm font-bold text-slate-700">Mode depart differe</span>
              <div className="mt-3">
                <DelayModeToggle
                  mode={selectedProgram?.delayMode === "fin" ? "fin" : "depart"}
                  onChange={(delayMode) => {
                    if (selectedProgram) {
                      updateProgram(selectedProgram.id, { delayMode });
                    }
                  }}
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col items-start gap-3 rounded-[24px] border border-emerald-100 bg-emerald-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold leading-6 text-emerald-950">
              Cree un compte pour garder tes heures creuses et tes appareils.
            </p>
            <div className="flex shrink-0 gap-2">
              <Link
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.98]"
                href="/inscription"
              >
                Creer un compte
              </Link>
              <Link
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-[0.98]"
                href="/connexion"
              >
                Connexion
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl md:grid md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] md:items-start md:gap-6">
      <div className="space-y-4 md:sticky md:top-5">
          {resultCard}
          {upcomingSlotsCard}
        </div>

      <div className="mt-4 space-y-4 md:mt-0">
        {controlsCard}

        <Link
          className="block rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
          href="/creneaux"
        >
          Modifier les heures creuses
        </Link>
      </div>
    </div>
  );
}
