"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionLink } from "@/components/action-link";
import {
  ClockIcon,
  DeviceIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  TrashIcon,
} from "@/components/icons";
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
    <div className="relative mt-2 h-5 text-xs font-semibold text-stone-400 font-numeric">
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
  const delayStep = selectedProgram?.delayStep || 30;
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
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
          {isFinMode ? "À régler sur \u201cfin dans\u201d" : "Prochain lancement"}
        </p>
        {isSynced && (
          <span className="hidden shrink-0 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-bold text-white/80 lg:inline-flex">
            Enregistré
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center gap-4 sm:mt-6 sm:gap-5 lg:mt-8 lg:justify-center lg:gap-10">
        <TimeDial minutes={dialWait} label={isFinMode ? "avant la fin" : "avant départ"} size="lg" />
        <div className="min-w-0 flex-1 space-y-2 lg:max-w-sm lg:flex-none lg:text-center">
          <p className="break-words text-base font-bold leading-6 text-white/90 lg:text-lg">
            {recommended
              ? `${recommended.slot.name} · ${minutesToTime(recommended.start)} → ${minutesToTime(recommended.end)}`
              : "Ajoute un créneau pour obtenir une recommandation."}
          </p>
          {endsOutsideSlot && recommended && (
            <p className="rounded-xl bg-white/12 px-3 py-2 text-xs font-semibold leading-5 text-white/85">
              Fin hors heures creuses, mais départ bien dans {recommended.slot.name}.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 border-t border-white/15 pt-4 sm:gap-3 sm:pt-5 lg:mx-auto lg:max-w-md">
        <div className="rounded-2xl bg-white/10 px-3 py-2.5 sm:rounded-3xl sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55 sm:text-xs">Programme</p>
          <p className="mt-1 truncate text-sm font-black sm:mt-2 sm:text-lg">{selectedProgram?.name || "Programme"}</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2.5 sm:rounded-3xl sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55 sm:text-xs">Cycle</p>
          <p className="mt-1 font-numeric text-sm font-black sm:mt-2 sm:text-lg">{formatDuration(duration)}</p>
        </div>
      </div>
    </section>
  );

  const upcomingSlotsPreview = (
    <section className="surface-card p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-stone-950">Tes heures creuses</p>
        <Link className="text-xs font-bold text-emerald-700 transition hover:text-emerald-800" href="/creneaux">
          Voir tout
        </Link>
      </div>

      {slots.length === 0 ? (
        <div className="surface-sub mt-3 flex flex-col items-center gap-3 p-5 text-center">
          <p className="text-sm font-semibold leading-6 text-stone-500">
            Ajoute un créneau d&apos;heures creuses pour obtenir une recommandation.
          </p>
          <Link
            className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
            href="/creneaux"
          >
            Ajouter un créneau
          </Link>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {slots.slice(0, 3).map((slot) => {
            const SlotIcon = getSlotIcon(slot.start);

            return (
              <div className="surface-sub flex items-center gap-3 px-3 py-2.5" key={slot.id}>
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-emerald-700">
                  <SlotIcon className="size-4" />
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-bold text-stone-700">{slot.name}</p>
                <p className="shrink-0 text-xs font-bold text-stone-400 font-numeric">
                  {slot.start} - {slot.end}
                </p>
              </div>
            );
          })}
          {slots.length < 3 && (
            <Link
              className="block rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-center text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
              href="/creneaux"
            >
              + Ajouter un autre créneau
            </Link>
          )}
        </div>
      )}
    </section>
  );

  const machineSection = (
    <div>
      <div className="flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 sm:size-10">
          <DeviceIcon className="size-4 sm:size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-stone-950 sm:text-base">Machine</p>
          <p className="text-xs leading-4 text-stone-500 sm:text-sm sm:leading-5">
            {isAuthenticated
              ? "Tes réglages sont gardés avec ton compte."
              : "Choisis un appareil pour tester sans compte."}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {machines.map((machine) => (
          <div key={machine.id}>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-stone-400">{machine.name}</p>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {machine.programs.map((program) => {
                const active = selectedProgramId === program.id;

                return (
                  <button
                    className={`relative rounded-2xl px-4 py-3.5 text-left transition ${
                      active
                        ? "bg-emerald-500 text-white shadow-cta"
                        : "bg-[var(--surface-1)] text-stone-700 hover:bg-emerald-50"
                    }`}
                    key={program.id}
                    type="button"
                    onClick={() => selectProgram(program.id)}
                  >
                    <span
                      className={`block text-[11px] font-bold uppercase tracking-[0.1em] ${
                        active ? "text-white/70" : "text-stone-400"
                      }`}
                    >
                      {program.name}
                    </span>
                    <span className="mt-1 block font-numeric text-2xl font-black leading-tight">
                      {formatDuration(program.duration)}
                    </span>
                    <span className={`mt-1 block text-xs font-numeric ${active ? "text-white/70" : "text-stone-400"}`}>
                      pas {formatDuration(program.delayStep)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ActionLink className="mt-4" href="/machines" block>
        Gérer les programmes
      </ActionLink>
    </div>
  );

  function renderModeAndDuration() {
    return (
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-stone-400">Mode de calcul</p>
          <div className="mt-3">
            <SegmentedControl
              value={calculationMode}
              onChange={setCalculationMode}
              options={[
                { value: "soon", label: "Plus tôt possible" },
                { value: "last", label: "Plus tard possible" },
              ]}
              columns={1}
            />
          </div>

          <div className="mt-5 flex items-center justify-between gap-2 border-t border-stone-100 pt-4">
            <span className="text-sm font-semibold text-stone-600">Mode départ différé</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
              {selectedProgram?.delayMode === "fin" ? "Fin à" : "Départ dans"}
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-stone-400" htmlFor="duration">
            Durée du programme
          </label>
          <p className="mt-1 font-display font-numeric text-3xl font-black leading-none text-stone-950">
            {formatDuration(duration)}
          </p>
          <div className="mt-6">
            <Slider id="duration" min={durationMin} max={durationMax} step={5} value={duration} onChange={setDuration} />
          </div>
          <DurationTicks />
        </div>
      </div>
    );
  }

  const guestExtras = (
    <>
      <div className="surface-card flex items-center justify-between gap-4 p-4">
        <label className="text-sm font-bold text-stone-700" htmlFor="guest-delay-step">
          Pas du départ différé
        </label>
        <select
          id="guest-delay-step"
          className="field-select rounded-full border-none bg-emerald-50 px-4 py-2 text-base font-black text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
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

      <div className="surface-card p-4">
        <span className="text-sm font-bold text-stone-700">Mode départ différé</span>
        <div className="mt-3">
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
          />
        </div>
      </div>

      <section className="flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border border-emerald-100 bg-emerald-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold leading-6 text-emerald-950">
          Crée un compte pour garder tes heures creuses et tes appareils.
        </p>
        <div className="flex shrink-0 gap-2">
          <Link
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.98]"
            href="/inscription"
          >
            Créer un compte
          </Link>
          <Link
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-[0.98]"
            href="/connexion"
          >
            Connexion
          </Link>
        </div>
      </section>
    </>
  );

  const slotFormCard = (
    <section className="surface-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-bold text-stone-950">Heures creuses</p>
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
        <div className="surface-sub mt-3 grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_120px_120px_auto]">
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
          <p className="surface-sub p-4 text-sm leading-6 text-stone-500">
            Exemple : 01:06 - 07:06 ou 14:36 - 16:36.
          </p>
        )}
        {slots.map((slot, index) => {
          const SlotIcon = getSlotIcon(slot.start);

          return (
            <article
              className="surface-sub grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_112px_112px_40px] sm:items-center"
              key={slot.id}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white">
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
                className="grid h-11 place-items-center rounded-2xl bg-white text-stone-400 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.96]"
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
      <div className="mx-auto max-w-5xl space-y-4 md:grid md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] md:items-start md:gap-6 md:space-y-0">
        <div className="space-y-4 md:sticky md:top-5">
          {resultCard}
          {upcomingSlotsPreview}
        </div>

        <div className="space-y-4">
          <section className="surface-card p-4 sm:p-5 md:p-7">
            <p className="text-xl font-bold text-stone-950 sm:text-2xl md:text-3xl">Calculateur de cycle</p>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-stone-600 sm:mt-2 sm:text-base sm:leading-6">
              Choisis ton appareil, ajuste la durée si besoin.
            </p>
            <div className="mt-6 divide-y divide-stone-100">
              <div className="pb-6">{machineSection}</div>
              <div className="pt-6">{renderModeAndDuration()}</div>
            </div>
          </section>

          {slotFormCard}
          <div className="grid gap-3">{guestExtras}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {resultCard}

      <section className="surface-card p-4 sm:p-5 md:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold text-stone-950 sm:text-2xl md:text-3xl">Calculateur de cycle</p>
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
