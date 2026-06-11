"use client";

import {
  favoriteDurations,
  formatDuration,
  minutesToTime,
  type Suggestion,
  useCycle,
} from "../../../lib/cycle-store";
import { CalendarIcon, ClockIcon, DeviceIcon } from "../../../components/icons";

function formatWait(wait: number) {
  return wait === 0 ? "Maintenant" : formatDuration(wait);
}

function formatWaitPrefix(wait: number) {
  return wait === 0 ? "Lance le cycle" : "A lancer dans";
}

function getSuggestionTone(index: number) {
  return index === 0
    ? "border-emerald-300 bg-green-50 shadow-sm shadow-emerald-200/50"
    : "border-slate-200 bg-white";
}

function SuggestionCard({ index, suggestion }: { index: number; suggestion: Suggestion }) {
  const isRecommended = index === 0;

  return (
    <article
      className={`grid gap-4 rounded-3xl border p-4 md:grid-cols-[minmax(0,1fr)_120px_120px] md:items-center ${getSuggestionTone(
        index,
      )}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
              isRecommended ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {isRecommended ? "Recommande" : "Option"}
          </span>
          <span className="text-sm font-semibold text-emerald-800">{suggestion.slot.name}</span>
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          {formatWaitPrefix(suggestion.wait)}
        </p>
        <p className="mt-1 text-4xl font-black tracking-normal text-slate-950">
          {formatWait(suggestion.wait)}
        </p>
      </div>

      <div className="rounded-2xl bg-white px-4 py-3 md:text-center">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Depart</p>
        <p className="mt-1 text-xl font-black text-emerald-800">{minutesToTime(suggestion.start)}</p>
      </div>

      <div className="rounded-2xl bg-white px-4 py-3 md:text-center">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Fin</p>
        <p className="mt-1 text-xl font-black text-slate-800">{minutesToTime(suggestion.end)}</p>
      </div>
    </article>
  );
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
    todayLabel,
  } = useCycle();
  const recommended = suggestions[0];
  const selectedDevice = devices.find((device) => device.id === selectedDeviceId);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-emerald-700 p-5 text-white shadow-xl shadow-emerald-300/30 md:p-7">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
              Prochain lancement
            </p>
            <p className="mt-3 text-5xl font-black tracking-normal md:text-6xl">
              {recommended ? formatWait(recommended.wait) : "--"}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
              {recommended
                ? `Depart a ${minutesToTime(recommended.start)} · fin a ${minutesToTime(
                    recommended.end,
                  )}`
                : "Ajoute un creneau pour obtenir une recommandation precise."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 md:min-w-[320px]">
            <div className="rounded-3xl bg-white/12 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Appareil</p>
              <p className="mt-2 text-lg font-black">{selectedDevice?.name || "Personnalise"}</p>
            </div>
            <div className="rounded-3xl bg-white/12 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Cycle</p>
              <p className="mt-2 text-lg font-black">{formatDuration(duration)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
          <div>
            <p className="text-2xl font-bold md:text-3xl">Calculateur de cycle</p>
            <p className="mt-2 max-w-2xl leading-6 text-slate-600">
              Choisis ton appareil, ajuste la duree si besoin, puis garde le delai de lancement sous
              les yeux.
            </p>
          </div>

          <div className="mt-7 rounded-3xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700">
                  <DeviceIcon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-950">Machine</p>
                  <p className="text-xs text-slate-500">
                    Les machines se gerent depuis la page Creneaux.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {devices.map((device) => {
                const active = selectedDeviceId === device.id;

                return (
                  <button
                    className={`shrink-0 rounded-2xl px-4 py-3 text-left transition ${
                      active
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:text-emerald-700"
                    }`}
                    key={device.id}
                    type="button"
                    onClick={() => selectDevice(device.id)}
                  >
                    <span className="block text-sm font-bold">{device.name}</span>
                    <span className={`mt-1 block text-xs ${active ? "text-white/75" : "text-slate-400"}`}>
                      {formatDuration(device.defaultDuration)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-slate-700" htmlFor="duration">
                Duree du programme
              </label>
              <span className="rounded-full border-2 border-emerald-400 bg-white px-4 py-2 text-lg font-bold text-emerald-700">
                {formatDuration(duration)}
              </span>
            </div>
            <input
              id="duration"
              className="mt-6 w-full accent-emerald-700"
              type="range"
              min="30"
              max="480"
              step="5"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
            <div className="mt-2 flex justify-between text-sm text-slate-400">
              <span>30 min</span>
              <span>4 h</span>
              <span>8 h</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {favoriteDurations.map((favorite) => (
                <button
                  className={`h-11 rounded-2xl text-sm font-bold transition ${
                    duration === favorite
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-slate-600 hover:text-emerald-700"
                  }`}
                  key={favorite}
                  type="button"
                  onClick={() => setDuration(favorite)}
                >
                  {formatDuration(favorite)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              className={`rounded-xl px-3 py-3 text-sm font-semibold ${
                finishMode === "soon" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
              }`}
              type="button"
              onClick={() => setFinishMode("soon")}
            >
              Des que possible
            </button>
            <button
              className={`rounded-xl px-3 py-3 text-sm font-semibold ${
                finishMode === "last" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
              }`}
              type="button"
              onClick={() => setFinishMode("last")}
            >
              Finir au dernier moment
            </button>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Quand lancer ?</p>
                <p className="mt-1 text-sm text-slate-500">
                  Le delai d&apos;attente est mis en avant pour savoir quoi faire maintenant.
                </p>
              </div>
              <p className="text-sm text-slate-400">
                {suggestions.length > 0
                  ? `${suggestions.length} option${suggestions.length > 1 ? "s" : ""}`
                  : ""}
              </p>
            </div>
            <div className="mt-3 grid gap-3">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <SuggestionCard index={index} key={suggestion.id} suggestion={suggestion} />
              ))}

              {suggestions.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm leading-6 text-slate-500 xl:col-span-3">
                  Aucun creneau ne peut contenir ce cycle complet. Reduis la duree ou ajoute un
                  creneau plus long.
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <section className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-200/70">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-green-50 text-emerald-700">
                <ClockIcon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-500">
                  {recommended ? formatWaitPrefix(recommended.wait) : "Depart recommande"}
                </p>
                <p className="mt-1 text-4xl font-black text-slate-950">
                  {recommended ? formatWait(recommended.wait) : "--"}
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm font-semibold leading-6 text-emerald-900">
              {recommended
                ? `Depart a ${minutesToTime(recommended.start)}. Fin prevue a ${minutesToTime(
                    recommended.end,
                  )} avec le creneau ${recommended.slot.name}.`
                : "Ajoute un creneau compatible pour obtenir une recommandation."}
            </div>
          </section>

          <section className="rounded-[24px] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-green-50 text-emerald-700">
                <CalendarIcon className="size-5" />
              </span>
              <div>
                <p className="font-bold">Heure actuelle</p>
                <p className="text-sm text-slate-500">
                  {currentTime} · {todayLabel || "Aujourd'hui"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="font-bold">Mode de calcul</p>
            <p className="mt-1 text-sm text-slate-500">
              {finishMode === "last" ? "Fin au dernier moment" : "Depart des que possible"}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
