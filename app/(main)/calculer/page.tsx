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

function formatWait(wait: number) {
  return wait === 0 ? "0 h" : formatDuration(wait);
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

function getExactStartAdvice(
  suggestion: Suggestion | undefined,
  currentTime: string,
  delayStep: number,
) {
  if (!suggestion) {
    return null;
  }

  const now = timeToMinutes(currentTime);
  const { slotStart } = getSlotBoundsForSuggestion(suggestion);
  const waitUntilSlot = slotStart - now;

  if (waitUntilSlot <= 0 || suggestion.start === slotStart) {
    return null;
  }

  const exactDelay = Math.floor(waitUntilSlot / delayStep) * delayStep;
  const setupAt = slotStart - exactDelay;

  if (exactDelay <= 0 || setupAt <= now) {
    return null;
  }

  return { exactDelay, setupAt, slotStart };
}

function getEarlyStartWarning(
  suggestion: Suggestion | undefined,
  currentTime: string,
  delayStep: number,
) {
  if (!suggestion) {
    return null;
  }

  const now = timeToMinutes(currentTime);
  const { slotStart } = getSlotBoundsForSuggestion(suggestion);
  const waitUntilSlot = slotStart - now;
  const earlyDelay = Math.floor(waitUntilSlot / delayStep) * delayStep;
  const earlyStart = now + earlyDelay;

  if (earlyDelay <= 0 || earlyStart >= slotStart || suggestion.start === slotStart) {
    return null;
  }

  return { earlyDelay, earlyStart, minutesBefore: slotStart - earlyStart };
}

export default function CalculerPage() {
  const [showSlotForm, setShowSlotForm] = useState(false);
  const {
    addSlot,
    currentTime,
    devices,
    duration,
    finishMode,
    isAuthenticated,
    newSlot,
    removeSlot,
    selectedDeviceId,
    selectDevice,
    setDuration,
    setFinishMode,
    setNewSlot,
    slots,
    suggestions,
    syncStatus,
    updateDevice,
    updateSlot,
  } = useCycle();
  const recommended = suggestions[0];
  const selectedDevice = devices.find((device) => device.id === selectedDeviceId);
  const delayStep = selectedDevice?.delayStep || 30;
  const selectedDelayStepIndex = Math.max(0, delayStepOptions.indexOf(delayStep));
  const exactStartAdvice = getExactStartAdvice(recommended, currentTime, delayStep);
  const earlyStartWarning = getEarlyStartWarning(recommended, currentTime, delayStep);
  const endsOutsideSlot = recommended
    ? recommended.end > getSlotBoundsForSuggestion(recommended).slotEnd
    : false;
  const isSynced = syncStatus === "saved" || syncStatus === "saving";
  const resultCard = (
    <section className="rounded-[28px] bg-emerald-700 p-5 text-white shadow-xl shadow-emerald-300/30 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
            Prochain lancement
          </p>
          <h2 className="mt-3 text-6xl font-black tracking-normal md:text-7xl">
            {recommended ? formatWait(recommended.wait) : "--"}
          </h2>
          <p className="mt-3 text-base font-bold leading-6 text-white/80">
            {recommended
              ? `Depart a ${minutesToTime(recommended.start)} · fin a ${minutesToTime(
                  recommended.end,
                )}`
              : "Ajoute un creneau pour obtenir une recommandation."}
          </p>
        </div>
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15">
          <ClockIcon className="size-6" />
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white/12 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">Appareil</p>
          <p className="mt-2 text-lg font-black">{selectedDevice?.name || "Machine"}</p>
        </div>
        <div className="rounded-3xl bg-white/12 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">Cycle</p>
          <p className="mt-2 text-lg font-black">{formatDuration(duration)}</p>
        </div>
      </div>

      {(exactStartAdvice || earlyStartWarning || endsOutsideSlot) && recommended && (
        <div className="mt-4 rounded-3xl bg-white/12 p-4 text-sm font-semibold leading-6 text-white/85">
          {exactStartAdvice && (
            <p>
              Pour demarrer pile a {minutesToTime(exactStartAdvice.slotStart)}, regle{" "}
              {formatDuration(exactStartAdvice.exactDelay)} a{" "}
              {minutesToTime(exactStartAdvice.setupAt)}.
            </p>
          )}
          {!exactStartAdvice && earlyStartWarning && (
            <p>
              {formatDuration(earlyStartWarning.earlyDelay)} maintenant partirait a{" "}
              {minutesToTime(earlyStartWarning.earlyStart)}, avant le creneau.
            </p>
          )}
          {endsOutsideSlot && (
            <p className={exactStartAdvice || earlyStartWarning ? "mt-1 text-white/75" : ""}>
              Fin hors heures creuses, mais depart bien dans {recommended.slot.name}.
            </p>
          )}
        </div>
      )}
    </section>
  );

  const controlsCard = (
    <section className="rounded-[28px] bg-white p-5 shadow-xl shadow-slate-200/70 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-slate-950 md:text-3xl">
            Calculateur de cycle
          </p>
          <p className="mt-2 max-w-2xl leading-6 text-slate-600">
            Choisis ton appareil, ajuste la duree si besoin, puis garde le delai de lancement sous
            les yeux.
          </p>
        </div>
        {isSynced && (
            <span className="hidden rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:inline-flex">
              Enregistre
          </span>
        )}
      </div>

      <div className="mt-6 rounded-3xl bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700">
            <DeviceIcon className="size-5" />
          </span>
          <div>
            <p className="font-bold text-slate-950">Machine</p>
            <p className="text-sm leading-5 text-slate-500">
              {isAuthenticated
                ? "Tes reglages sont gardes avec ton compte."
                : "Choisis un appareil pour tester sans compte."}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
          {devices.map((device) => {
            const active = selectedDeviceId === device.id;

            return (
              <button
                className={`relative rounded-2xl border bg-white px-3 py-3 text-left text-slate-700 transition ${
                  active
                    ? "border-emerald-300 shadow-sm"
                    : "border-transparent hover:border-emerald-100 hover:text-emerald-800"
                }`}
                key={device.id}
                type="button"
                onClick={() => selectDevice(device.id)}
              >
                {active && (
                  <span className="absolute right-3 top-3 size-2 rounded-full bg-emerald-500" />
                )}
                <span className="block pr-4 font-bold leading-5">{device.name}</span>
                <span className="mt-1 block text-sm text-slate-500">
                  {formatDuration(device.defaultDuration)} · pas {formatDuration(device.delayStep)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-slate-50 p-4">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
          <button
            className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
              finishMode === "soon" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
            }`}
            type="button"
            onClick={() => setFinishMode("soon")}
          >
            Depart des que possible
          </button>
          <button
            className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
              finishMode === "last" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
            }`}
            type="button"
            onClick={() => setFinishMode("last")}
          >
            Fin au dernier moment
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
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
          min="30"
          max="480"
          step="5"
          value={duration}
          onChange={(event) => setDuration(Number(event.target.value))}
        />
        <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
          <span>30 min</span>
          <span>4 h</span>
          <span>8 h</span>
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

          <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
            <button
              className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                finishMode === "soon" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
              }`}
              type="button"
              onClick={() => setFinishMode("soon")}
            >
              Depart des que possible
            </button>
            <button
              className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                finishMode === "last" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
              }`}
              type="button"
              onClick={() => setFinishMode("last")}
            >
              Fin au dernier moment
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
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
            min="30"
            max="480"
            step="5"
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          />
          <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
            <span>30 min</span>
            <span>4 h</span>
            <span>8 h</span>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <label className="text-sm font-bold text-slate-700" htmlFor="guest-delay-step">
              Pas du depart differe
            </label>
            <span className="rounded-full bg-slate-50 px-4 py-2 text-base font-black text-emerald-700">
              {formatDuration(delayStep)}
            </span>
          </div>
          <input
            id="guest-delay-step"
            className="mt-4 w-full accent-emerald-700"
            type="range"
            min="0"
            max={delayStepOptions.length - 1}
            step="1"
            value={selectedDelayStepIndex}
            onChange={(event) => {
              if (selectedDevice) {
                updateDevice(selectedDevice.id, {
                  delayStep: delayStepOptions[Number(event.target.value)],
                });
              }
            }}
          />
          <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
            {delayStepOptions.map((step) => (
              <span key={step}>{formatDuration(step)}</span>
            ))}
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
