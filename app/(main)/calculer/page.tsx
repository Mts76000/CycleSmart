"use client";

import Link from "next/link";
import { ClockIcon, DeviceIcon } from "../../../components/icons";
import {
  dayMinutes,
  formatDuration,
  minutesToTime,
  timeToMinutes,
  type Suggestion,
  useCycle,
} from "../../../lib/cycle-store";

function formatWait(wait: number) {
  if (wait === 0) {
    return "0 h";
  }

  return formatDuration(wait);
}

function WaitLabel({ suggestion }: { suggestion: Suggestion }) {
  if (suggestion.wait === 0) {
    return <>Lance maintenant</>;
  }

  return (
    <>
      Mets <span className="text-white">{formatWait(suggestion.wait)}</span> maintenant
      differe
    </>
  );
}

function getSlotEndForSuggestion(suggestion: Suggestion) {
  const slotStart = timeToMinutes(suggestion.slot.start);
  const rawSlotEnd = timeToMinutes(suggestion.slot.end);
  let slotEnd = rawSlotEnd <= slotStart ? rawSlotEnd + dayMinutes : rawSlotEnd;

  while (slotEnd < suggestion.start) {
    slotEnd += dayMinutes;
  }

  return slotEnd;
}

function getSlotStartForSuggestion(suggestion: Suggestion) {
  let slotStart = timeToMinutes(suggestion.slot.start);

  while (slotStart + dayMinutes <= suggestion.start) {
    slotStart += dayMinutes;
  }

  return slotStart;
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
  const slotStart = getSlotStartForSuggestion(suggestion);
  const waitUntilSlot = slotStart - now;

  if (waitUntilSlot <= 0 || suggestion.start === slotStart) {
    return null;
  }

  const exactDelay = Math.floor(waitUntilSlot / delayStep) * delayStep;
  const setupAt = slotStart - exactDelay;

  if (exactDelay <= 0 || setupAt <= now) {
    return null;
  }

  return {
    exactDelay,
    setupAt,
    slotStart,
  };
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
  const slotStart = getSlotStartForSuggestion(suggestion);
  const waitUntilSlot = slotStart - now;
  const earlyDelay = Math.floor(waitUntilSlot / delayStep) * delayStep;
  const earlyStart = now + earlyDelay;

  if (earlyDelay <= 0 || earlyStart >= slotStart || suggestion.start === slotStart) {
    return null;
  }

  return {
    earlyDelay,
    earlyStart,
    minutesBefore: slotStart - earlyStart,
  };
}

export default function CalculerPage() {
  const {
    currentTime,
    devices,
    duration,
    finishMode,
    selectedDeviceId,
    selectDevice,
    setDuration,
    setFinishMode,
    suggestions,
  } = useCycle();
  const recommended = suggestions[0];
  const selectedDevice = devices.find((device) => device.id === selectedDeviceId);
  const delayStep = selectedDevice?.delayStep || 30;
  const exactStartAdvice = getExactStartAdvice(recommended, currentTime, delayStep);
  const earlyStartWarning = getEarlyStartWarning(recommended, currentTime, delayStep);
  const endsOutsideSlot = recommended
    ? recommended.end > getSlotEndForSuggestion(recommended)
    : false;

  return (
    <div className="mx-auto max-w-4xl space-y-3 md:space-y-4">
      <section className="rounded-[28px] bg-white p-3 shadow-xl shadow-slate-200/70 md:p-5">
        <div className="rounded-[24px] bg-emerald-700 p-5 text-white md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65 md:text-sm">
                Reglage a mettre maintenant
              </p>
              <h2 className="mt-2 text-5xl font-black tracking-normal md:text-7xl">
                {recommended ? formatWait(recommended.wait) : "--"}
              </h2>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15">
              <ClockIcon className="size-5" />
            </span>
          </div>

          <p className="mt-3 max-w-xl text-lg font-bold leading-7 text-white md:text-2xl">
            {recommended ? (
              <WaitLabel suggestion={recommended} />
            ) : (
              "Ajoute un creneau pour calculer ton depart."
            )}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-3xl bg-white/12 p-3 md:p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
                Depart prevu
              </p>
              <p className="mt-1 text-2xl font-black md:text-3xl">
                {recommended ? minutesToTime(recommended.start) : "--:--"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
                Fin estimee
              </p>
              <p className="mt-1 text-2xl font-black md:text-3xl">
                {recommended ? minutesToTime(recommended.end) : "--:--"}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm font-semibold leading-5 text-white/75">
            {selectedDevice?.name || "Machine"} · cycle {formatDuration(duration)} · depart
            reglable par pas de {formatDuration(selectedDevice?.delayStep || 30)}.
          </p>
          {exactStartAdvice && (
            <div className="mt-2 rounded-2xl bg-white/12 px-3 py-2 text-sm font-semibold leading-5 text-white/85">
              <p className="font-bold text-white">Option plus precise</p>
              <p>
                A {minutesToTime(exactStartAdvice.setupAt)}, regle{" "}
                {formatDuration(exactStartAdvice.exactDelay)} pour demarrer a{" "}
                {minutesToTime(exactStartAdvice.slotStart)}.
              </p>
              {earlyStartWarning && (
                <p className="mt-1 text-white/75">
                  Ne mets pas {formatDuration(earlyStartWarning.earlyDelay)} maintenant : depart{" "}
                  {minutesToTime(earlyStartWarning.earlyStart)},{" "}
                  {formatDuration(earlyStartWarning.minutesBefore)} avant le creneau.
                </p>
              )}
            </div>
          )}
          {!exactStartAdvice && earlyStartWarning && (
            <p className="mt-2 rounded-2xl bg-white/12 px-3 py-2 text-sm font-semibold leading-5 text-white/85">
              Si tu mets {formatDuration(earlyStartWarning.earlyDelay)} maintenant, depart a{" "}
              {minutesToTime(earlyStartWarning.earlyStart)}, soit{" "}
              {formatDuration(earlyStartWarning.minutesBefore)} avant les heures creuses.
            </p>
          )}
          {endsOutsideSlot && recommended && (
            <p className="mt-2 rounded-2xl bg-white/12 px-3 py-2 text-sm font-semibold leading-5 text-white/85">
              Fin hors heures creuses, mais le depart est bien dans {recommended.slot.name}.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-xl shadow-slate-200/60 md:p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-green-50 text-emerald-700">
            <DeviceIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-950">Choisis ta machine</p>
            <p className="text-sm leading-5 text-slate-500">
              Ajuste vite la duree si le programme change.
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
          {devices.map((device) => {
            const active = selectedDeviceId === device.id;

            return (
              <button
                className={`rounded-2xl px-3 py-3 text-left transition ${
                  active
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                    : "bg-slate-50 text-slate-700 hover:bg-green-50 hover:text-emerald-800"
                }`}
                key={device.id}
                type="button"
                onClick={() => selectDevice(device.id)}
              >
                <span className="block font-bold">{device.name}</span>
                <span className={`mt-1 block text-sm ${active ? "text-white/75" : "text-slate-500"}`}>
                  {formatDuration(device.defaultDuration)} · pas {formatDuration(device.delayStep)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 rounded-3xl bg-slate-50 p-4">
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
            <button
              className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                finishMode === "soon" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
              }`}
              type="button"
              onClick={() => setFinishMode("soon")}
            >
              Des que possible
            </button>
            <button
              className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                finishMode === "last" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
              }`}
              type="button"
              onClick={() => setFinishMode("last")}
            >
              Plus tard possible
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
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

      <Link
        className="block rounded-2xl border border-emerald-100 bg-green-50 px-4 py-3 text-center text-sm font-bold text-emerald-800"
        href="/creneaux"
      >
        Modifier les heures creuses
      </Link>
    </div>
  );
}
