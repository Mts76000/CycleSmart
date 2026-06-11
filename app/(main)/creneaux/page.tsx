"use client";

import Link from "next/link";
import { ClockIcon, DeviceIcon, MoonIcon, SunIcon, TrashIcon } from "../../../components/icons";
import { formatDuration, useCycle } from "../../../lib/cycle-store";

export default function CreneauxPage() {
  const {
    addDevice,
    addSlot,
    best,
    devices,
    newDevice,
    newSlot,
    removeDevice,
    removeSlot,
    selectedDeviceId,
    setNewDevice,
    setNewSlot,
    slots,
    syncStatus,
  } = useCycle();
  const syncLabel = {
    local: "Sauvegarde locale uniquement",
    loading: "Chargement de tes creneaux...",
    saving: "Sauvegarde en cours...",
    saved: "Creneaux sauvegardes sur ton compte",
    error: "Connexion au compte indisponible",
  }[syncStatus];

  return (
    <div className="space-y-5 md:grid md:grid-cols-[minmax(0,1fr)_360px] md:items-start md:gap-6 md:space-y-0">
      <div className="space-y-5">
        <section className="pt-4 md:pt-0">
          <p className="text-3xl font-bold">Mes heures creuses</p>
          <p className="mt-2 leading-6 text-slate-500">
            Ajoute tes plages tarifaires. Le calculateur placera le cycle dedans, meme si un creneau
            traverse minuit.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Creneaux enregistres
            </p>
          </div>

          {slots.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm leading-6 text-slate-500">
              Aucun creneau enregistre pour le moment. Ajoute ta premiere plage depuis le panneau a
              droite.
            </div>
          )}

          {slots.map((slot, index) => (
            <article className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm" key={slot.id}>
              <span
                className={`grid size-10 place-items-center rounded-2xl ${
                  index === 0 ? "bg-emerald-500 text-white" : "bg-white/80 text-emerald-700"
                }`}
                aria-hidden="true"
              >
                {index === 0 ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">
                  {slot.start} - {slot.end}
                </p>
                <p className="text-sm text-slate-500">{slot.name} · Quotidien</p>
              </div>
              <button
                className="grid size-9 place-items-center rounded-full text-slate-500"
                type="button"
                onClick={() => removeSlot(slot.id)}
                aria-label={`Supprimer ${slot.name}`}
              >
                <TrashIcon className="size-4" />
              </button>
            </article>
          ))}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Machines
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {devices.map((device) => {
              const active = selectedDeviceId === device.id;

              return (
                <article
                  className={`rounded-2xl bg-white p-4 shadow-sm ${
                    active ? "ring-2 ring-emerald-200" : ""
                  }`}
                  key={device.id}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
                        active ? "bg-emerald-500 text-white" : "bg-green-50 text-emerald-700"
                      }`}
                    >
                      <DeviceIcon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-950">{device.name}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-500">{device.description}</p>
                      <p className="mt-2 text-sm font-bold text-emerald-700">
                        {formatDuration(device.defaultDuration)}
                      </p>
                    </div>
                  </div>
                  {!device.builtIn && (
                    <button
                      className="mt-3 text-sm font-bold text-slate-400 hover:text-red-600"
                      type="button"
                      onClick={() => removeDevice(device.id)}
                    >
                      Supprimer
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="space-y-5 md:sticky md:top-6">
        <section className="rounded-[24px] border border-emerald-200 bg-green-50 p-5">
          <p className="text-lg font-bold text-emerald-900">Sauvegarde des creneaux</p>
          <p className="mt-2 text-sm leading-6 text-emerald-900/75">
            Pour retrouver tes heures creuses sur tous tes appareils, cree un compte ou connecte-toi.
            Sans compte, les changements restent seulement sur ce navigateur.
          </p>
          <p className="mt-3 rounded-2xl bg-white/80 px-3 py-2 text-sm font-bold text-emerald-800">
            {syncLabel}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              className="flex h-11 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-bold text-white"
              href="/inscription"
            >
              Creer un compte
            </Link>
            <Link
              className="flex h-11 items-center justify-center rounded-2xl bg-white text-sm font-bold text-emerald-700"
              href="/connexion"
            >
              Connexion
            </Link>
          </div>
        </section>

        <section className="rounded-[24px] bg-white p-6 shadow-xl shadow-slate-200/70">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Prochain creneau
          </p>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-lg font-bold">{best?.slot.name || "Aucun creneau"}</p>
              <p className="mt-5 text-4xl font-black text-emerald-700">
                {best ? `${best.slot.start} - ${best.slot.end}` : "--:--"}
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-2xl bg-white/80 text-emerald-700">
              <ClockIcon className="size-5" />
            </span>
          </div>
        </section>

        <section className="rounded-[24px] border border-dashed border-emerald-200 bg-white/70 p-4">
          <p className="mb-3 font-bold">Ajouter un creneau</p>
          <input
            className="h-12 w-full rounded-2xl bg-slate-100 px-4 outline-none ring-emerald-300 focus:ring-4"
            placeholder="Nom du creneau"
            value={newSlot.name}
            onChange={(event) => setNewSlot((slot) => ({ ...slot, name: event.target.value }))}
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input
              className="h-12 rounded-2xl bg-slate-100 px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
              type="time"
              value={newSlot.start}
              onChange={(event) => setNewSlot((slot) => ({ ...slot, start: event.target.value }))}
            />
            <input
              className="h-12 rounded-2xl bg-slate-100 px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
              type="time"
              value={newSlot.end}
              onChange={(event) => setNewSlot((slot) => ({ ...slot, end: event.target.value }))}
            />
          </div>
          <button
            className="mt-3 h-14 w-full rounded-2xl bg-emerald-500 px-4 font-bold text-white transition active:scale-[0.99]"
            type="button"
            onClick={addSlot}
          >
            Ajouter un creneau
          </button>
        </section>

        <section className="rounded-[24px] border border-dashed border-emerald-200 bg-white/70 p-4">
          <p className="font-bold">Ajouter une machine</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Elle apparaitra ensuite dans le calculateur avec sa duree par defaut.
          </p>
          <div className="mt-3 grid gap-3">
            <input
              className="h-12 rounded-2xl bg-slate-100 px-4 outline-none ring-emerald-300 focus:ring-4"
              placeholder="Ex: Seche-linge"
              value={newDevice.name}
              onChange={(event) =>
                setNewDevice((device) => ({ ...device, name: event.target.value }))
              }
            />
            <input
              className="h-12 rounded-2xl bg-slate-100 px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
              min="30"
              max="480"
              step="5"
              type="number"
              value={newDevice.duration}
              onChange={(event) =>
                setNewDevice((device) => ({
                  ...device,
                  duration: Number(event.target.value),
                }))
              }
            />
          </div>
          <button
            className="mt-3 h-14 w-full rounded-2xl bg-emerald-500 px-4 font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={!newDevice.name.trim()}
            onClick={addDevice}
          >
            Ajouter la machine
          </button>
        </section>
      </aside>
    </div>
  );
}
