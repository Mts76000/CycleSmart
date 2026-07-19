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
import { delayStepOptions, formatDuration, useCycle } from "@/lib/cycle-store";

function slotCountLabel(count: number) {
  return `${count} creneau${count > 1 ? "x" : ""}`;
}

function durationToTime(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const rest = (minutes % 60).toString().padStart(2, "0");

  return `${hours}:${rest}`;
}

function durationTimeToMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":");

  return Number(hours) * 60 + Number(minutes);
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

function StepSelect({
  className = "",
  value,
  onChange,
}: {
  className?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <select
      className={`h-12 min-w-0 rounded-2xl bg-slate-100 px-3 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4 ${className}`}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      {delayStepOptions.map((step) => (
        <option key={step} value={step}>
          Pas {formatDuration(step)}
        </option>
      ))}
    </select>
  );
}

function ModeSelect({
  className = "",
  value,
  onChange,
}: {
  className?: string;
  value: "soon" | "last";
  onChange: (value: "soon" | "last") => void;
}) {
  return (
    <select
      className={`h-12 min-w-0 rounded-2xl bg-slate-100 px-3 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4 ${className}`}
      value={value}
      onChange={(event) => onChange(event.target.value as "soon" | "last")}
    >
      <option value="soon">Depart dans</option>
      <option value="last">Fin dans</option>
    </select>
  );
}

function DurationFields({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      className="mt-1 h-12 w-full rounded-2xl bg-white px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
      type="time"
      min="00:30"
      max="08:00"
      step="300"
      value={durationToTime(value)}
      onChange={(event) => onChange(durationTimeToMinutes(event.target.value))}
    />
  );
}

export default function CreneauxPage() {
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const {
    addDevice,
    addSlot,
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
    updateDevice,
    updateSlot,
  } = useCycle();

  const selectedDevice = devices.find((device) => device.id === selectedDeviceId);
  const modeLabel = selectedDevice?.mode === "last" ? "Fin dans le creneau" : "Depart dans le creneau";

  const syncLabel = {
    local: "Sur cet appareil",
    loading: "Verification...",
    saving: "Enregistrement...",
    saved: "Enregistre",
    error: "Sur cet appareil",
  }[syncStatus];
  const isSyncedWithAccount = syncStatus === "saved" || syncStatus === "saving";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-[30px] bg-emerald-700 p-6 text-white shadow-xl shadow-emerald-200/50 md:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/65">
          Reglages du calcul
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-normal md:text-5xl">
          Tes heures creuses et tes machines
        </h2>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-xl shadow-slate-200/70 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-green-50 text-emerald-700">
              <ClockIcon className="size-5" />
            </span>
            <div>
              <p className="text-xl font-bold text-slate-950">Heures creuses</p>
              <p className="text-sm text-slate-500">{slotCountLabel(slots.length)} enregistre</p>
            </div>
          </div>
          <p className="max-w-full rounded-full bg-green-50 px-4 py-2 text-sm font-bold leading-snug text-emerald-800">
            {modeLabel}
          </p>
        </div>

        <button
          className="mt-5 h-12 w-full rounded-2xl border border-emerald-200 bg-green-50 font-bold text-emerald-800"
          type="button"
          onClick={() => setShowSlotForm((visible) => !visible)}
        >
          {showSlotForm ? "Fermer" : "Ajouter une plage"}
        </button>

        {showSlotForm && (
          <div className="mt-3 rounded-3xl border border-dashed border-emerald-200 bg-green-50/50 p-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_140px_auto]">
              <input
                className="h-12 rounded-2xl bg-white px-4 outline-none ring-emerald-300 focus:ring-4"
                placeholder="Nom automatique si vide"
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
                className="h-12 rounded-2xl bg-emerald-500 px-5 font-bold text-white transition active:scale-[0.99]"
                type="button"
                onClick={() => {
                  addSlot();
                  setShowSlotForm(false);
                }}
              >
                Valider
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {slots.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">
              Ajoute tes plages d&apos;heures creuses. Exemple : 01:06 - 07:06 et 14:36 - 16:36.
            </div>
          )}

          {slots.map((slot, index) => (
            (() => {
              const SlotIcon = getSlotIcon(slot.start);

              return (
                <article
                  className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[minmax(180px,1fr)_140px_140px_44px] md:items-end"
                  key={slot.id}
                >
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Plage {index + 1}
                    </span>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white">
                        <SlotIcon className="size-5" />
                      </span>
                      <input
                        className="min-w-0 flex-1 bg-transparent text-lg font-bold text-slate-950 outline-none"
                        aria-label={`Nom du creneau ${index + 1}`}
                        value={slot.name}
                        onChange={(event) => updateSlot(slot.id, { name: event.target.value })}
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Debut
                    </span>
                    <input
                      className="mt-1 h-12 w-full rounded-2xl bg-white px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
                      type="time"
                      value={slot.start}
                      onChange={(event) => updateSlot(slot.id, { start: event.target.value })}
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Fin
                    </span>
                    <input
                      className="mt-1 h-12 w-full rounded-2xl bg-white px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
                      type="time"
                      value={slot.end}
                      onChange={(event) => updateSlot(slot.id, { end: event.target.value })}
                    />
                  </label>

                  <button
                    className="grid h-12 place-items-center rounded-2xl bg-white text-slate-400 hover:text-red-600"
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    aria-label={`Supprimer ${slot.name}`}
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </article>
              );
            })()
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-xl shadow-slate-200/70 md:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-green-50 text-emerald-700">
            <DeviceIcon className="size-5" />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-950">Machines</p>
            <p className="text-sm text-slate-500">
              Duree du cycle et precision du depart differe.
            </p>
          </div>
        </div>

        <button
          className="mt-5 h-12 w-full rounded-2xl border border-emerald-200 bg-green-50 font-bold text-emerald-800"
          type="button"
          onClick={() => setShowDeviceForm((visible) => !visible)}
        >
          {showDeviceForm ? "Fermer" : "Ajouter une machine"}
        </button>

        {showDeviceForm && (
          <div className="mt-3 rounded-3xl border border-dashed border-emerald-200 bg-green-50/50 p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_140px_minmax(160px,1fr)_minmax(130px,1fr)_auto] xl:items-end">
              <input
                className="h-12 min-w-0 rounded-2xl bg-white px-4 outline-none ring-emerald-300 focus:ring-4 sm:col-span-2 xl:col-span-1"
                placeholder="Ex: Seche-linge"
                value={newDevice.name}
                onChange={(event) =>
                  setNewDevice((device) => ({ ...device, name: event.target.value }))
                }
              />
              <DurationFields
                value={newDevice.duration}
                onChange={(value) =>
                  setNewDevice((device) => ({
                    ...device,
                    duration: value,
                  }))
                }
              />
              <StepSelect
                className="bg-white"
                value={newDevice.delayStep}
                onChange={(delayStep) => setNewDevice((device) => ({ ...device, delayStep }))}
              />
              <ModeSelect
                className="bg-white"
                value={newDevice.mode}
                onChange={(mode) => setNewDevice((device) => ({ ...device, mode }))}
              />
              <button
                className="h-12 rounded-2xl bg-emerald-500 px-5 font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 xl:col-span-1"
                type="button"
                disabled={!newDevice.name.trim()}
                onClick={() => {
                  addDevice();
                  setShowDeviceForm(false);
                }}
              >
                Valider
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {devices.map((device) => {
            const active = selectedDeviceId === device.id;

            return (
              <article
                className={`grid gap-4 rounded-2xl border p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(120px,140px)_minmax(0,1fr)_minmax(0,1fr)_44px] xl:items-end ${
                  active ? "border-emerald-300 bg-slate-50 shadow-sm" : "border-slate-100 bg-slate-50"
                }`}
                key={device.id}
              >
                <label className="block md:col-span-2 xl:col-span-1">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Machine
                  </span>
                  <div className="mt-1 flex items-center gap-3">
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700"
                    >
                      <DeviceIcon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <input
                        className="w-full min-w-0 bg-transparent text-lg font-bold text-slate-950 outline-none"
                        aria-label={`Nom de ${device.name}`}
                        value={device.name}
                        onChange={(event) => updateDevice(device.id, { name: event.target.value })}
                      />
                    </div>
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Duree
                  </span>
                  <DurationFields
                    value={device.defaultDuration}
                    onChange={(value) =>
                      updateDevice(device.id, {
                        defaultDuration: value,
                      })
                    }
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Depart differe
                  </span>
                  <StepSelect
                    className="mt-1 w-full bg-white"
                    value={device.delayStep}
                    onChange={(delayStep) => updateDevice(device.id, { delayStep })}
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Mode
                  </span>
                  <ModeSelect
                    className="mt-1 w-full bg-white"
                    value={device.mode}
                    onChange={(mode) => updateDevice(device.id, { mode })}
                  />
                </label>

                <button
                  className="grid h-12 place-items-center rounded-2xl bg-white text-slate-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 md:col-span-2 md:justify-self-end xl:col-span-1 xl:justify-self-auto"
                  type="button"
                  disabled={devices.length <= 1}
                  onClick={() => removeDevice(device.id)}
                  aria-label={`Supprimer ${device.name}`}
                >
                  <TrashIcon className="size-4" />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] border border-emerald-100 bg-green-50 p-4 text-sm leading-6 text-emerald-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {isSyncedWithAccount ? (
            <p>
              Reglages : <span className="font-bold">{syncLabel}</span>. Tes reglages sont lies
              a ton compte.
            </p>
          ) : (
            <>
              <p>
                Reglages : <span className="font-bold">{syncLabel}</span>. Connecte-toi pour
                retrouver tes reglages sur plusieurs appareils.
              </p>
              <div className="flex gap-2 font-bold text-emerald-800">
                <Link href="/connexion">Connexion</Link>
                <span aria-hidden="true">·</span>
                <Link href="/inscription">Inscription</Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
