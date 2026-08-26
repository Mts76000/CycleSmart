"use client";

import { useState } from "react";
import { ActionLink } from "@/components/action-link";
import { ClockIcon, MoonIcon, PlusIcon, SunIcon, TrashIcon } from "@/components/icons";
import { SegmentedControl } from "@/components/segmented-control";
import { Slider } from "@/components/slider";
import { TimeDial } from "@/components/time-dial";
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

function getTickPosition(value: number) {
  return `${((value - durationMin) / (durationMax - durationMin)) * 100}%`;
}

function DurationTicks() {
  return (
    <div className="font-numeric relative mt-2 h-5 text-xs font-semibold text-stone-600">
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
    <section className="surface-hero p-4 text-white sm:p-6 md:p-8 lg:p-9">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold tracking-[0.14em] text-emerald-50 uppercase">
          {isFinMode ? "À régler sur \u201cfin dans\u201d" : "Prochain lancement"}
        </p>
        {isSynced && (
          <span className="hidden shrink-0 rounded-full bg-emerald-800 px-3 py-1.5 text-[11px] font-bold text-emerald-50 lg:inline-flex">
            Enregistré
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center gap-4 sm:mt-6 sm:flex-row sm:gap-5 lg:mt-8 lg:justify-center lg:gap-10">
        <TimeDial
          minutes={dialWait}
          label={isFinMode ? "avant la fin" : "avant départ"}
          size="lg"
        />
        <div className="min-w-0 space-y-2 text-center sm:flex-1 sm:text-left lg:max-w-sm lg:flex-none">
          <p className="text-base leading-6 font-bold text-white lg:text-lg">
            {recommended
              ? `${recommended.slot.name} · ${minutesToTime(recommended.start)} → ${minutesToTime(recommended.end)}`
              : "Ajoute un créneau pour obtenir une recommandation."}
          </p>
        </div>
      </div>

      {endsOutsideSlot && recommended && (
        <p className="mx-auto mt-4 max-w-md rounded-xl bg-emerald-800 px-3 py-2 text-center text-xs leading-5 font-semibold text-white">
          Fin hors heures creuses, mais départ bien dans le créneau : {recommended.slot.name}.
        </p>
      )}

      {isAuthenticated && selectedProgram && duration === selectedProgram.duration ? (
        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-2 border-t border-white/15 pt-4 sm:gap-3 sm:pt-5">
          <div className="rounded-2xl bg-emerald-800 px-3 py-2.5 sm:rounded-3xl sm:p-4">
            <p className="text-[10px] font-bold tracking-[0.12em] text-emerald-50 uppercase sm:text-xs">
              Programme
            </p>
            <p className="mt-1 truncate text-sm font-black sm:mt-2 sm:text-lg">
              {selectedProgram.name}
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-800 px-3 py-2.5 sm:rounded-3xl sm:p-4">
            <p className="text-[10px] font-bold tracking-[0.12em] text-emerald-50 uppercase sm:text-xs">
              Cycle
            </p>
            <p className="font-numeric mt-1 text-sm font-black sm:mt-2 sm:text-lg">
              {formatDuration(duration)}
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-6 max-w-md border-t border-white/15 pt-4 sm:pt-5">
          <div className="rounded-2xl bg-emerald-800 px-3 py-2.5 sm:rounded-3xl sm:p-4">
            <p className="text-[10px] font-bold tracking-[0.12em] text-emerald-50 uppercase sm:text-xs">
              Personnalisé
            </p>
            <p className="font-numeric mt-1 text-sm font-black sm:mt-2 sm:text-lg">
              {formatDuration(duration)}
            </p>
          </div>
        </div>
      )}
    </section>
  );

  const machineSection = (
    <div className="space-y-5">
      {machines.map((machine) => (
        <div key={machine.id}>
          <p className="text-xs font-bold tracking-[0.1em] text-stone-600 uppercase">
            {machine.name}
          </p>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {machine.programs.map((program) => {
              const active = selectedProgramId === program.id && duration === program.duration;

              return (
                <button
                  className={`relative rounded-2xl px-4 py-3.5 text-left transition ${
                    active
                      ? "shadow-cta bg-emerald-700 text-white"
                      : "bg-[var(--cycle-surface-1)] text-stone-700 hover:bg-emerald-50"
                  }`}
                  key={program.id}
                  type="button"
                  onClick={() => selectProgram(program.id)}
                >
                  <span
                    className={`block text-[11px] font-bold tracking-[0.1em] uppercase ${
                      active ? "text-emerald-50" : "text-stone-600"
                    }`}
                  >
                    {program.name}
                  </span>
                  <span className="font-numeric mt-1 block text-2xl leading-tight font-black">
                    {formatDuration(program.duration)}
                  </span>
                  <span
                    className={`font-numeric mt-1 block text-xs ${active ? "text-emerald-50" : "text-stone-600"}`}
                  >
                    pas {formatDuration(program.delayStep)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {isAuthenticated && (
        <ActionLink className="mt-4" href="/machines" block>
          Gérer les programmes
        </ActionLink>
      )}
    </div>
  );

  function renderModeAndDuration() {
    return (
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold tracking-[0.1em] text-stone-600 uppercase">
            Mode de calcul
          </p>
          <div className="mt-3">
            <SegmentedControl
              value={calculationMode}
              onChange={setCalculationMode}
              options={[
                { value: "soon", label: "Plus tôt possible" },
                { value: "last", label: "Plus tard possible" },
              ]}
              columns={1}
              label="Mode de calcul"
            />
          </div>
        </div>

        <div>
          <label
            className="text-xs font-bold tracking-[0.1em] text-stone-600 uppercase"
            htmlFor="duration"
          >
            Durée du programme
          </label>
          <p className="font-display font-numeric mt-1 text-3xl leading-none font-black text-stone-950">
            {formatDuration(duration)}
          </p>
          <div className="mt-6">
            <Slider
              id="duration"
              min={durationMin}
              max={durationMax}
              step={5}
              value={duration}
              onChange={setDuration}
            />
          </div>
          <DurationTicks />
        </div>

        <div className="border-t border-stone-100 pt-4 sm:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="text-sm font-semibold text-stone-600">Mode départ différé</span>
              <div className="mt-2 w-full">
                <SegmentedControl
                  value={selectedProgram?.delayMode === "fin" ? "fin" : "depart"}
                  onChange={(delayMode) => {
                    if (selectedProgram) {
                      updateProgram(selectedProgram.id, { delayMode });
                    }
                  }}
                  options={[
                    { value: "depart", label: "Départ dans" },
                    { value: "fin", label: "Fin à" },
                  ]}
                  label="Mode départ différé"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-stone-600" htmlFor="delayStep">
                Pas
              </label>
              <select
                id="delayStep"
                className="field-select mt-2 h-11 w-full rounded-full border-none bg-emerald-50 px-4 text-sm font-black text-emerald-700 ring-emerald-300 outline-none focus:ring-4"
                value={selectedProgram?.delayStep}
                onChange={(event) => {
                  if (selectedProgram) {
                    updateProgram(selectedProgram.id, { delayStep: Number(event.target.value) });
                  }
                }}
              >
                {delayStepOptions.map((step) => (
                  <option key={step} value={step}>
                    {formatDuration(step)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const slotFormCard = (
    <section className="surface-card p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold text-stone-950">Heures creuses</p>
          <p className="text-xs text-stone-600">
            Mode invité : restent uniquement sur cet appareil.
          </p>
        </div>
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
        <div className="surface-sub mt-3 grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_120px_120px_auto] lg:grid-cols-[minmax(0,1fr)_160px_160px_auto]">
          <input
            className="h-12 rounded-2xl bg-white px-4 ring-emerald-300 outline-none focus:ring-4"
            placeholder="Nom optionnel"
            value={newSlot.name}
            onChange={(event) => setNewSlot((slot) => ({ ...slot, name: event.target.value }))}
          />
          <input
            aria-label="Début du créneau"
            className="h-12 rounded-2xl bg-white px-4 font-bold text-emerald-700 ring-emerald-300 outline-none focus:ring-4"
            type="time"
            value={newSlot.start}
            onChange={(event) => setNewSlot((slot) => ({ ...slot, start: event.target.value }))}
          />
          <input
            aria-label="Fin du créneau"
            className="h-12 rounded-2xl bg-white px-4 font-bold text-emerald-700 ring-emerald-300 outline-none focus:ring-4"
            type="time"
            value={newSlot.end}
            onChange={(event) => setNewSlot((slot) => ({ ...slot, end: event.target.value }))}
          />
          <button
            className="inline-flex h-10 w-full items-center justify-center rounded-full bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
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
          <p className="surface-sub p-4 text-sm leading-6 text-stone-600">
            Exemple : 01:06 - 07:06 ou 14:36 - 16:36.
          </p>
        )}
        {slots.map((slot, index) => {
          const SlotIcon = getSlotIcon(slot.start);

          return (
            <article
              className="surface-sub grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_112px_112px_40px] sm:items-center lg:grid-cols-[minmax(0,1fr)_150px_150px_52px]"
              key={slot.id}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-700 text-white">
                  <SlotIcon className="size-5" />
                </span>
                <input
                  className="min-w-0 flex-1 bg-transparent font-bold text-stone-950 outline-none"
                  aria-label={`Nom du créneau ${index + 1}`}
                  value={slot.name}
                  onChange={(event) => updateSlot(slot.id, { name: event.target.value })}
                />
              </div>
              <input
                aria-label={`Début de ${slot.name || "créneau"} ${index + 1}`}
                className="h-11 rounded-2xl bg-white px-3 font-bold text-emerald-700 ring-emerald-300 outline-none focus:ring-4"
                type="time"
                value={slot.start}
                onChange={(event) => updateSlot(slot.id, { start: event.target.value })}
              />
              <input
                aria-label={`Fin de ${slot.name || "créneau"} ${index + 1}`}
                className="h-11 rounded-2xl bg-white px-3 font-bold text-emerald-700 ring-emerald-300 outline-none focus:ring-4"
                type="time"
                value={slot.end}
                onChange={(event) => updateSlot(slot.id, { end: event.target.value })}
              />
              <button
                className="grid h-11 place-items-center rounded-2xl bg-white text-stone-600 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.96]"
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
  );

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl space-y-5">
        {resultCard}

        <section className="surface-card p-4 sm:p-5 md:p-7">
          <h1 className="text-xl font-bold text-stone-950 sm:text-2xl md:text-3xl">
            Calculateur d&apos;heures creuses
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-stone-600 sm:mt-2 sm:text-base sm:leading-6">
            Règle la durée et le mode, CycleSmart trouve le bon moment.
          </p>
          <div className="mt-6">{renderModeAndDuration()}</div>
        </section>

        {slotFormCard}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {resultCard}

      <section className="surface-card p-4 sm:p-5 md:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-stone-950 sm:text-2xl md:text-3xl">
              Calculateur d&apos;heures creuses
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-stone-600 sm:mt-2 sm:text-base sm:leading-6">
              Choisis ton appareil, ajuste la durée si besoin.
            </p>
          </div>
          <div className="hidden shrink-0 md:block">
            <ActionLink href="/creneaux">Modifier les heures creuses</ActionLink>
          </div>
        </div>

        <div className="mt-6 divide-y divide-stone-100">
          <div className="pb-6">{machineSection}</div>
          <div className="pt-6">{renderModeAndDuration()}</div>
        </div>
      </section>
    </div>
  );
}
