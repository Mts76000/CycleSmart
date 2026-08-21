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
  } = useCycle();

  const allProgramsCount = machines.reduce((sum, machine) => sum + machine.programs.length, 0);
  const selectedMachine = machines.find((machine) => machine.id === expandedMachine) ?? null;
  const isAddingProgram = selectedMachine ? showProgramForm === selectedMachine.id : false;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-[24px] bg-emerald-700 p-4 text-white shadow-hero sm:p-5 md:p-6 md:rounded-[30px] md:p-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65 sm:text-sm">
              Configuration
            </p>
            <h2 className="mt-2 text-2xl font-display font-black tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
              Tes machines et programmes
            </h2>
          </div>
          <p className="hidden shrink-0 text-right text-sm font-bold text-white/70 sm:block">
            {machines.length} machine{machines.length > 1 ? "s" : ""} · {allProgramsCount} prog.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] bg-white shadow-card md:grid md:grid-cols-[300px_minmax(0,1fr)]">
        {/* Master list */}
        <div className="border-b border-slate-100 p-4 sm:p-5 md:border-b-0 md:border-r md:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-slate-400">Machines</p>
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
                  className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-emerald-300 focus:ring-4"
                  placeholder="Ex: Seche-linge"
                  value={newMachine.name}
                  onChange={(event) =>
                    setNewMachine((machine) => ({ ...machine, name: event.target.value }))
                  }
                />
                <button
                  className="h-11 rounded-xl bg-emerald-500 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
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
                    isSelected ? "bg-emerald-50 text-emerald-900" : "text-slate-600 hover:bg-slate-50"
                  }`}
                  type="button"
                  onClick={() =>
                    setExpandedMachine((current) => (current === machine.id ? null : machine.id))
                  }
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                      isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <DeviceIcon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{machine.name}</span>
                    <span className="block text-xs text-slate-400">
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
            <div className="grid h-full min-h-[220px] place-items-center rounded-2xl border border-dashed border-slate-200 p-6 text-center">
              <div>
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-50 text-slate-400">
                  <DeviceIcon className="size-5" />
                </span>
                <p className="mt-3 font-bold text-slate-700">Choisis une machine</p>
                <p className="mt-1 text-sm text-slate-400">
                  Selectionne une machine a gauche pour voir et modifier ses programmes.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-3">
                <input
                  className="min-w-0 flex-1 bg-transparent text-xl font-bold text-slate-950 outline-none sm:text-2xl"
                  aria-label={`Nom de ${selectedMachine.name}`}
                  value={selectedMachine.name}
                  onChange={(event) => updateMachine(selectedMachine.id, { name: event.target.value })}
                />
                <button
                  className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-30"
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

              <div className="mt-4 space-y-3">
                {selectedMachine.programs.map((program) => (
                  <div
                    key={program.id}
                    className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(120px,140px)_minmax(120px,140px)_minmax(120px,140px)_44px] sm:items-end"
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
                      className="grid h-12 place-items-center rounded-2xl bg-white text-slate-400 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-30"
                      type="button"
                      disabled={selectedMachine.programs.length <= 1}
                      onClick={() => removeProgram(program.id)}
                      aria-label={`Supprimer ${program.name}`}
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                ))}

                {!isAddingProgram && (
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
                    type="button"
                    onClick={() => setShowProgramForm(selectedMachine.id)}
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
                        className="text-xs font-bold text-slate-400 transition hover:text-slate-600"
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
                      className="mt-3 h-11 w-full rounded-2xl bg-emerald-500 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-base"
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
