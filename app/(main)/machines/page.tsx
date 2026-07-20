"use client";

import { useState } from "react";
import {
  DeviceIcon,
  TrashIcon,
  PlusIcon,
} from "@/components/icons";
import {
  delayStepOptions,
  formatDuration,
  useCycle,
  type Machine,
  type Program,
  type ProgramDelayMode,
} from "@/lib/cycle-store";

function durationToTime(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const rest = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${rest}`;
}

function durationTimeToMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
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
      className={`h-12 min-w-0 rounded-2xl border border-slate-200 bg-slate-100 px-3 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4 ${className}`}
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

function DelayModeSelect({
  className = "",
  value,
  onChange,
}: {
  className?: string;
  value: "depart" | "fin";
  onChange: (value: "depart" | "fin") => void;
}) {
  return (
    <select
      className={`h-12 min-w-0 rounded-2xl border border-slate-200 bg-slate-100 px-3 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4 ${className}`}
      value={value}
      onChange={(event) => onChange(event.target.value as "depart" | "fin")}
    >
      <option value="depart">Départ dans</option>
      <option value="fin">Fin à</option>
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
      className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
      type="time"
      min="00:30"
      max="08:00"
      step="300"
      value={durationToTime(value)}
      onChange={(event) => onChange(durationTimeToMinutes(event.target.value))}
    />
  );
}

export default function MachinesPage() {
  const [showMachineForm, setShowMachineForm] = useState(false);
  const [showProgramForm, setShowProgramForm] = useState<string | null>(null);
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);
  const {
    machines,
    newMachine,
    newProgram,
    addMachine,
    addProgram,
    updateMachine,
    updateProgram,
    removeMachine,
    removeProgram,
    setNewMachine,
    setNewProgram,
    syncStatus,
    isAuthenticated,
  } = useCycle();

  const syncLabel = {
    local: "Sur cet appareil",
    loading: "Vérification...",
    saving: "Enregistrement...",
    saved: "Enregistré",
    error: "Sur cet appareil",
  }[syncStatus];
  const isSyncedWithAccount = isAuthenticated;

  const allProgramsCount = machines.reduce((sum, machine) => sum + machine.programs.length, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-[24px] bg-emerald-700 p-4 text-white shadow-xl shadow-emerald-200/50 sm:p-5 md:p-6 md:rounded-[30px] md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65 sm:text-sm">
          Configuration
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-normal sm:mt-3 sm:text-3xl md:text-5xl">
          Tes machines et programmes
        </h2>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-xl shadow-slate-200/70 sm:p-5 md:p-6 md:rounded-[28px]">
        <div className="flex items-center gap-2">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-green-50 text-emerald-700 sm:size-11">
            <DeviceIcon className="size-4 sm:size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-950 sm:text-xl">Machines</p>
            <p className="text-xs text-slate-500 sm:text-sm">
              {machines.length} machine{machines.length > 1 ? "s" : ""} · {allProgramsCount} programme{allProgramsCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <button
          className="mt-4 h-11 w-full rounded-2xl border border-emerald-200 bg-green-50 px-4 py-3 text-sm font-bold text-emerald-800 sm:mt-5 sm:h-12 sm:text-base"
          type="button"
          onClick={() => setShowMachineForm((visible) => !visible)}
        >
          {showMachineForm ? "Fermer" : "Ajouter une machine"}
        </button>

        {showMachineForm && (
          <div className="mt-3 rounded-2xl border border-dashed border-emerald-200 bg-green-50/50 p-3 sm:rounded-3xl sm:p-4">
            <div className="grid gap-2 sm:gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input
                className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none ring-emerald-300 focus:ring-4 sm:border-transparent sm:h-12 sm:px-4 sm:text-base"
                placeholder="Ex: Seche-linge"
                value={newMachine.name}
                onChange={(event) =>
                  setNewMachine((machine) => ({ ...machine, name: event.target.value }))
                }
              />
              <button
                className="h-11 rounded-2xl bg-emerald-500 px-4 text-sm font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:px-5 sm:text-base"
                type="button"
                disabled={!newMachine.name.trim()}
                onClick={() => {
                  const newMachineId = addMachine();
                  if (newMachineId) {
                    setShowMachineForm(false);
                    // Open program form for the new machine
                    setTimeout(() => {
                      setShowProgramForm(newMachineId);
                      setExpandedMachine(newMachineId);
                    }, 100);
                  }
                }}
              >
                Valider
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {machines.map((machine) => {
            const isExpanded = expandedMachine === machine.id;
            const isAddingProgram = showProgramForm === machine.id;

            return (
              <article
                key={machine.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 sm:size-10"
                    >
                      <DeviceIcon className="size-4 sm:size-5" />
                    </span>
                    <input
                      className="min-w-0 bg-transparent text-base font-bold text-slate-950 outline-none sm:text-lg"
                      aria-label={`Nom de ${machine.name}`}
                      value={machine.name}
                      onChange={(event) => updateMachine(machine.id, { name: event.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="h-9 shrink-0 whitespace-nowrap rounded-xl bg-emerald-100 px-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200 sm:h-10 sm:px-3 sm:text-sm"
                      type="button"
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedMachine(null);
                          return;
                        }

                        setExpandedMachine(machine.id);
                        if (machine.programs.length === 0) {
                          setShowProgramForm(machine.id);
                        }
                      }}
                    >
                      {isExpanded ? (
                        "Masquer"
                      ) : machine.programs.length === 0 ? (
                        <>
                          <span className="sm:hidden">Ajouter</span>
                          <span className="hidden sm:inline">Ajouter un programme</span>
                        </>
                      ) : (
                        `${machine.programs.length} prog.`
                      )}
                    </button>
                    <span className="h-6 w-px shrink-0 bg-slate-200" aria-hidden="true" />
                    <button
                      className="grid h-9 shrink-0 place-items-center rounded-2xl bg-white text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 sm:h-10 sm:w-10"
                      type="button"
                      disabled={machines.length <= 1}
                      onClick={() => removeMachine(machine.id)}
                      aria-label={`Supprimer ${machine.name}`}
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    {!isAddingProgram && (
                      <button
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-200 bg-green-50 py-3 text-sm font-bold text-emerald-800 transition hover:bg-green-100"
                        type="button"
                        onClick={() => setShowProgramForm(machine.id)}
                      >
                        <PlusIcon className="size-4" />
                        Ajouter un programme
                      </button>
                    )}

                    {isAddingProgram && (
                      <div className="rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm sm:p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-emerald-800">Nouveau programme</p>
                          <button
                            className="text-xs font-bold text-slate-400 hover:text-slate-600"
                            type="button"
                            onClick={() => setShowProgramForm(null)}
                          >
                            Annuler
                          </button>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                              Nom
                            </label>
                            <input
                              className="mt-1 h-11 w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none ring-emerald-300 focus:ring-4 sm:h-12 sm:px-4 sm:text-base"
                              placeholder="Ex: Coton"
                              value={newProgram.name}
                              onChange={(event) =>
                                setNewProgram((program) => ({ ...program, name: event.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                              Durée
                            </label>
                            <DurationFields
                              value={newProgram.duration}
                              onChange={(value) =>
                                setNewProgram((program) => ({
                                  ...program,
                                  duration: value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                              Pas
                            </label>
                            <StepSelect
                              className="mt-1 w-full bg-white"
                              value={newProgram.delayStep}
                              onChange={(delayStep) => setNewProgram((program) => ({ ...program, delayStep }))}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                              Mode départ
                            </label>
                            <DelayModeSelect
                              className="mt-1 w-full bg-white"
                              value={newProgram.delayMode}
                              onChange={(delayMode) => setNewProgram((program) => ({ ...program, delayMode }))}
                            />
                          </div>
                        </div>
                        <button
                          className="mt-3 h-11 w-full rounded-2xl bg-emerald-500 text-sm font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-base"
                          type="button"
                          disabled={!newProgram.name.trim()}
                          onClick={() => {
                            addProgram(machine.id);
                            setShowProgramForm(null);
                          }}
                        >
                          Valider
                        </button>
                      </div>
                    )}

                    {machine.programs.map((program) => (
                      <div
                        key={program.id}
                        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_minmax(120px,140px)_minmax(120px,140px)_minmax(120px,140px)_44px] sm:items-end"
                      >
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Programme
                          </label>
                          <input
                            className="mt-1 w-full bg-transparent font-bold text-slate-950 outline-none"
                            value={program.name}
                            onChange={(event) => updateProgram(program.id, { name: event.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Durée
                          </label>
                          <DurationFields
                            value={program.duration}
                            onChange={(value) =>
                              updateProgram(program.id, {
                                duration: value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Pas
                          </label>
                          <StepSelect
                            className="mt-1 w-full bg-white"
                            value={program.delayStep}
                            onChange={(delayStep) => updateProgram(program.id, { delayStep })}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Mode départ
                          </label>
                          <DelayModeSelect
                            className="mt-1 w-full bg-white"
                            value={program.delayMode}
                            onChange={(delayMode) => updateProgram(program.id, { delayMode })}
                          />
                        </div>

                        <button
                          className="grid h-12 place-items-center rounded-2xl bg-white text-slate-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                          type="button"
                          disabled={machine.programs.length <= 1}
                          onClick={() => removeProgram(program.id)}
                          aria-label={`Supprimer ${program.name}`}
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] border border-emerald-100 bg-green-50 p-4 text-sm leading-6 text-emerald-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {isSyncedWithAccount ? (
            <p>
              Réglages : <span className="font-bold">{syncLabel}</span>. Tes réglages sont liés
              à ton compte.
            </p>
          ) : (
            <>
              <p>
                Réglages : <span className="font-bold">{syncLabel}</span>. Connecte-toi pour
                retrouver tes réglages sur plusieurs appareils.
              </p>
              <div className="flex gap-2 font-bold text-emerald-800">
                <a href="/connexion" className="hover:underline">Connexion</a>
                <span aria-hidden="true">·</span>
                <a href="/inscription" className="hover:underline">Inscription</a>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
