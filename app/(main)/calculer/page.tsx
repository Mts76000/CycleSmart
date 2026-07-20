"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ClockIcon,
  DeviceIcon,
  MoonIcon,
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
    <section className="rounded-[24px] bg-emerald-700 p-4 text-white shadow-xl shadow-emerald-300/30 sm:p-5 md:p-7">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
            {isFinMode ? "A regler sur \"fin dans\"" : "Prochain lancement"}
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-normal sm:text-5xl md:text-7xl">
            {dialWait !== null ? formatWait(dialWait) : "--"}
          </h2>
          <p className="mt-2 break-words text-sm font-bold leading-5 text-white/80">
            {recommended
              ? `${recommended.slot.name} · ${minutesToTime(recommended.start)} · fin ${minutesToTime(recommended.end)}`
              : "Ajoute un creneau pour obtenir une recommandation."}
          </p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/15 sm:size-12">
          <ClockIcon className="size-5 sm:size-6" />
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/12 p-3 sm:rounded-3xl sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55 sm:text-xs">Programme</p>
          <p className="mt-1 text-base font-black sm:mt-2 sm:text-lg">{selectedProgram?.name || "Programme"}</p>
        </div>
        <div className="rounded-2xl bg-white/12 p-3 sm:rounded-3xl sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55 sm:text-xs">Cycle</p>
          <p className="mt-1 text-base font-black sm:mt-2 sm:text-lg">{formatDuration(duration)}</p>
        </div>
      </div>

      {endsOutsideSlot && recommended && (
        <div className="mt-3 rounded-2xl bg-white/12 p-3 text-xs font-semibold leading-5 text-white/85 sm:mt-4 sm:rounded-3xl sm:p-4 sm:text-sm">
          <p>
            Fin hors heures creuses, mais depart bien dans {recommended.slot.name}.
          </p>
        </div>
      )}
    </section>
  );

  const controlsCard = (
    <section className="rounded-[24px] bg-white p-4 shadow-xl shadow-slate-200/70 sm:p-5 md:p-7">
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
            <span className="hidden shrink-0 rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:inline-flex">
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
                      className={`relative min-h-20 rounded-2xl border bg-white px-3 py-3 text-left text-slate-700 transition sm:min-h-24 sm:px-4 sm:py-4 ${
                        active
                          ? "border-emerald-300 shadow-sm"
                          : "border-transparent hover:border-emerald-100 hover:text-emerald-800"
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
          className="mt-3 block rounded-2xl border border-emerald-100 bg-green-50 px-4 py-3 text-center text-xs font-bold text-emerald-800 sm:mt-4 sm:text-sm"
          href="/machines"
        >
          Gérer les machines et programmes
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
      <div className="space-y-4">
        {resultCard}

        <section className="rounded-[28px] bg-white p-5 shadow-xl shadow-slate-200/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-black tracking-normal text-slate-950">Calcul simple</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Fais un calcul simple, sans creer de compte.
              </p>
            </div>
            {!showSlotForm && (
              <button
                className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white"
                type="button"
                onClick={() => setShowSlotForm(true)}
              >
                Ajouter
              </button>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-green-50 text-emerald-700">
              <ClockIcon className="size-5" />
            </span>
            <div>
              <p className="font-bold text-slate-950">Heures creuses</p>
              <p className="text-sm text-slate-500">Ajoute une plage pour calculer.</p>
            </div>
          </div>

          {showSlotForm && (
            <div className="mt-3 grid gap-3 rounded-3xl bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_120px_120px_auto]">
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
                className="h-12 rounded-2xl bg-emerald-500 px-4 font-bold text-white"
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
                    className="grid h-11 place-items-center rounded-2xl bg-white text-slate-400 hover:text-red-600"
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

          <div className="mt-6 flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-green-50 text-emerald-700">
              <DeviceIcon className="size-5" />
            </span>
            <div>
              <p className="font-bold text-slate-950">Cycle</p>
              <p className="text-sm text-slate-500">Entre juste la duree et le pas du depart differe.</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-700">Mode de calcul</p>
            <div className="mt-3">
              <ModeToggle mode={calculationMode} onChange={setCalculationMode} />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <label className="text-sm font-bold text-slate-700" htmlFor="duration">
              Duree du programme
            </label>
            <span className="rounded-full bg-slate-50 px-4 py-2 text-base font-black text-emerald-700">
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

          <div className="mt-5 flex items-center justify-between gap-4">
            <label className="text-sm font-bold text-slate-700" htmlFor="guest-delay-step">
              Pas du depart differe
            </label>
            <span className="rounded-full bg-slate-50 px-4 py-2 text-base font-black text-emerald-700">
              {formatDuration(delayStep)}
            </span>
          </div>

          <div className="mt-5">
            <span className="text-sm font-bold text-slate-700">Mode depart differe</span>
            <div className="mt-2">
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

        <section className="rounded-2xl border border-emerald-100 bg-green-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-950">
          <p>
            Tu peux utiliser le calculateur sans compte. Cree un compte seulement si tu veux garder
            tes heures creuses et tes appareils.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="rounded-xl bg-emerald-500 px-4 py-2 text-white" href="/inscription">
              Creer un compte
            </Link>
            <Link className="rounded-xl bg-white px-4 py-2 text-emerald-800" href="/connexion">
              Connexion
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 md:space-y-5">
      {resultCard}
      {controlsCard}

      <Link
        className="block rounded-2xl border border-emerald-100 bg-green-50 px-4 py-3 text-center text-sm font-bold text-emerald-800"
        href="/creneaux"
      >
        Modifier les heures creuses
      </Link>
    </div>
  );
}
