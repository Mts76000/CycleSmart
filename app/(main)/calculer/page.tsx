"use client";

import {
  formatDuration,
  minutesToTime,
  useCycle,
} from "../../../lib/cycle-store";

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

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-white bg-white shadow-xl shadow-slate-200/70">
        <div className="relative min-h-52 bg-[radial-gradient(circle_at_10%_15%,#dff8f4,transparent_30%),linear-gradient(145deg,#ffffff,#edf2f0)] p-6">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(135deg,transparent_15%,rgba(8,126,127,.08)_16%,transparent_40%),linear-gradient(165deg,transparent_45%,rgba(15,23,42,.08)_46%,transparent_72%)]" />
          <div className="relative mt-20">
            <p className="text-5xl font-bold text-slate-950">{currentTime}</p>
            <p className="mt-2 capitalize text-slate-500">
              {todayLabel || "Aujourd'hui"}
            </p>
            <p className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              Heure actuelle synchronisee automatiquement
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-200/70">
        <div>
          <p className="text-2xl font-bold">Calculateur de cycle</p>
          <p className="mt-2 leading-6 text-slate-600">
            Configure la duree et le comportement souhaite pour trouver le
            meilleur depart.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="duration"
          >
            Duree du programme
          </label>
          <span className="rounded-full border-2 border-cyan-400 px-4 py-2 text-lg font-bold text-teal-700">
            {formatDuration(duration)}
          </span>
        </div>
        <input
          id="duration"
          className="mt-6 w-full accent-teal-700"
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

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            className={`rounded-xl px-3 py-3 text-sm font-semibold ${
              finishMode === "soon"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-slate-500"
            }`}
            type="button"
            onClick={() => setFinishMode("soon")}
          >
            Des que possible
          </button>
          <button
            className={`rounded-xl px-3 py-3 text-sm font-semibold ${
              finishMode === "last"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-slate-500"
            }`}
            type="button"
            onClick={() => setFinishMode("last")}
          >
            Finir au dernier moment
          </button>
        </div>

        <div className="mt-7">
          <p className="font-semibold">Suggestions de depart</p>
          <div className="mt-3 space-y-3">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <article
                className="rounded-2xl bg-slate-100 p-4"
                key={suggestion.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      index === 0
                        ? "bg-teal-700 text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    {index === 0 ? "Recommande" : "Option"}
                  </span>
                  <span className="text-sm text-slate-500">
                    {suggestion.slot.name}
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {minutesToTime(suggestion.start)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Fin prevue a {minutesToTime(suggestion.end)}
                    </p>
                  </div>
                  <p className="text-right text-sm font-semibold text-teal-700">
                    {suggestion.wait === 0
                      ? "Maintenant"
                      : `Dans ${formatDuration(suggestion.wait)}`}
                  </p>
                </div>
              </article>
            ))}

            {suggestions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-500">
                Aucun creneau ne peut contenir ce cycle complet. Reduis la duree
                ou ajoute un creneau plus long.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
