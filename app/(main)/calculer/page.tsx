"use client";

import {
  formatDuration,
  minutesToTime,
  type Suggestion,
  useCycle,
} from "../../../lib/cycle-store";
import { CalendarIcon, ClockIcon } from "../../../components/icons";

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
    duration,
    finishMode,
    setDuration,
    setFinishMode,
    suggestions,
    todayLabel,
  } = useCycle();
  const recommended = suggestions[0];

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white bg-white p-5 shadow-xl shadow-slate-200/70 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Heure actuelle
            </p>
            <div className="mt-3 flex items-end gap-4">
              <p className="text-5xl font-black text-slate-950 md:text-6xl">{currentTime}</p>
              <p className="pb-2 capitalize text-slate-500">{todayLabel || "Aujourd'hui"}</p>
            </div>
          </div>
          <div className="rounded-3xl bg-green-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-800 md:max-w-xs">
            Le calcul se met a jour automatiquement avec l&apos;heure de ton appareil.
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
          <div>
            <p className="text-2xl font-bold md:text-3xl">Calculateur de cycle</p>
            <p className="mt-2 max-w-2xl leading-6 text-slate-600">
              Configure la duree et le comportement souhaite pour trouver le meilleur depart.
            </p>
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
          <section className="rounded-[28px] bg-emerald-700 p-6 text-white shadow-xl shadow-emerald-300/30">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-white/15">
                <ClockIcon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white/75">
                  {recommended ? formatWaitPrefix(recommended.wait) : "Depart recommande"}
                </p>
                <p className="mt-1 text-4xl font-black">
                  {recommended ? formatWait(recommended.wait) : "--"}
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-white/15 p-4 text-sm font-semibold leading-6 text-white/85">
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
                <p className="font-bold">Mode de calcul</p>
                <p className="text-sm text-slate-500">
                  {finishMode === "last" ? "Fin au dernier moment" : "Depart des que possible"}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
