"use client";

import Link from "next/link";
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
      className={`field-select h-12 min-w-0 rounded-[var(--radius-sm)] bg-[var(--surface-1)] px-3 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4 ${className}`}
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
      className={`field-select h-12 min-w-0 rounded-[var(--radius-sm)] bg-[var(--surface-1)] px-3 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4 ${className}`}
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
      className="mt-1 h-12 w-full rounded-[var(--radius-sm)] bg-[var(--surface-1)] px-3 font-bold text-emerald-700 outline-none ring-emerald-300 focus:ring-4"
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
    isAuthenticated,
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
  } = useCycle();

  const allProgramsCount = machines.reduce((sum, machine) => sum + machine.programs.length, 0);
  const selectedMachine = machines.find((machine) => machine.id === expandedMachine) ?? null;
  const isAddingProgram = selectedMachine ? showProgramForm === selectedMachine.id : false;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="surface-hero p-6 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65">Configuration</p>
          <h2 className="mt-2 text-2xl font-display font-black tracking-tight sm:text-3xl">
            Tes machines et programmes
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/80">
            La gestion des appareils et programmes est réservée aux comptes connectés.
            En mode invité, utilise les appareils par défaut sur la page Calculer.
          </p>
        </section>

        <section className="surface-card p-6 text-center">
          <p className="text-stone-600">
            Connecte-toi pour ajouter tes propres machines et programmes.
          </p>
          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.98]"
              href="/inscription"
            >
              Créer un compte
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-200 bg-white px-6 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 active:scale-[0.98]"
              href="/connexion"
            >
              Connexion
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="surface-hero p-4 text-white sm:p-5 md:p-6 lg:p-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65 sm:text-sm">
              Configuration
            </p>
            <h2 className="mt-2 text-2xl font-display font-black tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
              Tes machines et programmes
            </h2>
          </div>
          <p className="hidden shrink-0 text-right text-sm font-bold text-white/70 sm:block font-numeric">
            {machines.length} machine{machines.length > 1 ? "s" : ""} · {allProgramsCount} prog.
          </p>
        </div>
      </section>

      <section className="surface-card overflow-hidden md:grid md:grid-cols-[300px_minmax(0,1fr)]">
        {/* Master list */}
        <div className="border-b border-stone-100 p-4 sm:p-5 md:border-b-0 md:border-r md:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-stone-400">Machines</p>
            <button
              className="grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 active:scale-[0.95]"
              type="button"
              onClick={() => setShowMachineForm((visible) => !visible)}
              aria-label={showMachineForm ? "Fermer le formulaire" : "Ajouter une machine"}
            >
              <PlusIcon className={`size-4 transition-transform ${showMachineForm ? "rotate-45" : ""}`} />
            </button>
          </div>

          {showMachineForm && (
            <div className="mt-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-3">
              <div className="grid gap-2">
                <input
                  className="h-11 min-w-0 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none ring-emerald-300 focus:ring-4"
                  placeholder="Ex: Seche-linge"
                  value={newMachine.name}
                  onChange={(event) =>
                    setNewMachine((machine) => ({ ...machine, name: event.target.value }))
                  }
                />
                <button
                  className="inline-flex h-10 w-full items-center justify-center rounded-full bg-emerald-500 px-4 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  disabled={!newMachine.name.trim()}
                  onClick={() => {
                    const newMachineId = addMachine();
                    if (newMachineId) {
                      setShowMachineForm(false);
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

          <div className="mt-4 space-y-1.5 md:max-h-[calc(100dvh-20rem)] md:overflow-y-auto">
            {machines.map((machine) => {
              const isSelected = expandedMachine === machine.id;

              return (
                <button
                  key={machine.id}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    isSelected ? "bg-emerald-50 text-emerald-900" : "text-stone-600 hover:bg-stone-50"
                  }`}
                  type="button"
                  onClick={() =>
                    setExpandedMachine((current) => (current === machine.id ? null : machine.id))
                  }
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                      isSelected ? "bg-emerald-500 text-white" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    <DeviceIcon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{machine.name}</span>
                    <span className="block text-xs text-stone-400">
                      {machine.programs.length} programme{machine.programs.length > 1 ? "s" : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail pane */}
        <div className="p-4 sm:p-5 md:p-6">
          {!selectedMachine ? (
            <div className="grid h-full min-h-[220px] place-items-center rounded-[var(--radius-md)] border border-dashed border-stone-200 p-6 text-center">
              <div>
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-stone-50 text-stone-400">
                  <DeviceIcon className="size-5" />
                </span>
                <p className="mt-3 font-bold text-stone-700">Choisis une machine</p>
                <p className="mt-1 text-sm text-stone-400">
                  Selectionne une machine dans la liste pour voir et modifier ses programmes.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-3">
                <input
                  className="min-w-0 flex-1 bg-transparent text-xl font-bold text-stone-950 outline-none sm:text-2xl"
                  aria-label={`Nom de ${selectedMachine.name}`}
                  value={selectedMachine.name}
                  onChange={(event) => updateMachine(selectedMachine.id, { name: event.target.value })}
                />
                <button
                  className="grid size-9 shrink-0 place-items-center rounded-xl bg-stone-50 text-stone-400 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-30"
                  type="button"
                  disabled={machines.length <= 1}
                  onClick={() => {
                    removeMachine(selectedMachine.id);
                    setExpandedMachine(null);
                  }}
                  aria-label={`Supprimer ${selectedMachine.name}`}
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {selectedMachine.programs.map((program) => (
                  <div
                    key={program.id}
                    className="space-y-3 rounded-[var(--radius-md)] border border-stone-100 bg-white p-3 sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <input
                        className="min-w-0 flex-1 bg-transparent text-lg font-bold text-stone-950 outline-none"
                        value={program.name}
                        onChange={(event) => updateProgram(program.id, { name: event.target.value })}
                      />
                      <button
                        className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-1)] text-stone-400 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-30"
                        type="button"
                        disabled={selectedMachine.programs.length <= 1}
                        onClick={() => removeProgram(program.id)}
                        aria-label={`Supprimer ${program.name}`}
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
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

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
                            Pas
                          </label>
                          <StepSelect
                            className="mt-1 w-full"
                            value={program.delayStep}
                            onChange={(delayStep) => updateProgram(program.id, { delayStep })}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
                            Mode
                          </label>
                          <DelayModeSelect
                            className="mt-1 w-full"
                            value={program.delayMode}
                            onChange={(delayMode) => updateProgram(program.id, { delayMode })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!isAddingProgram && (
                  <button
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.98] lg:col-span-2"
                    type="button"
                    onClick={() => setShowProgramForm(selectedMachine.id)}
                  >
                    <PlusIcon className="size-4" />
                    Ajouter un programme
                  </button>
                )}

                {isAddingProgram && (
                  <div className="rounded-[var(--radius-md)] border border-dashed border-emerald-200 bg-emerald-50/40 p-3 sm:p-4 lg:col-span-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-emerald-800">Nouveau programme</p>
                      <button
                        className="text-xs font-bold text-stone-400 transition hover:text-stone-600"
                        type="button"
                        onClick={() => setShowProgramForm(null)}
                      >
                        Annuler
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-[0.12em] text-stone-400">
                          Nom
                        </label>
                        <input
                          className="mt-1 h-11 w-full min-w-0 rounded-[var(--radius-sm)] bg-white px-3 text-sm outline-none ring-emerald-300 focus:ring-4 sm:h-12 sm:px-4 sm:text-base"
                          placeholder="Ex: Coton"
                          value={newProgram.name}
                          onChange={(event) =>
                            setNewProgram((program) => ({ ...program, name: event.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-[0.12em] text-stone-400">
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
                        <label className="block text-xs font-bold uppercase tracking-[0.12em] text-stone-400">
                          Pas
                        </label>
                        <StepSelect
                          className="mt-1 w-full"
                          value={newProgram.delayStep}
                          onChange={(delayStep) => setNewProgram((program) => ({ ...program, delayStep }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-[0.12em] text-stone-400">
                          Mode départ
                        </label>
                        <DelayModeSelect
                          className="mt-1 w-full"
                          value={newProgram.delayMode}
                          onChange={(delayMode) => setNewProgram((program) => ({ ...program, delayMode }))}
                        />
                      </div>
                    </div>
                    <button
                      className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-emerald-500 px-4 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      disabled={!newProgram.name.trim()}
                      onClick={() => {
                        addProgram(selectedMachine.id);
                        setShowProgramForm(null);
                      }}
                    >
                      Valider
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
