"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Slot = {
  id: string;
  name: string;
  start: string;
  end: string;
};

export type CalculationMode = "soon" | "last";

export type ProgramDelayMode = "depart" | "fin";

export type Program = {
  id: string;
  name: string;
  description: string;
  duration: number;
  delayStep: number;
  delayMode: ProgramDelayMode;
};

export type Machine = {
  id: string;
  name: string;
  programs: Program[];
  builtIn?: boolean;
};

export type Suggestion = {
  id: string;
  slot: Slot;
  start: number;
  end: number;
  wait: number;
};

type NewSlot = {
  name: string;
  start: string;
  end: string;
};

type NewProgram = {
  name: string;
  duration: number;
  delayStep: number;
  delayMode: ProgramDelayMode;
};

type NewMachine = {
  name: string;
};

type StoredSettings = Partial<{
  duration: number;
  calculationMode: CalculationMode;
  selectedProgramId: string;
  machines: Machine[];
}>;

type CycleContextValue = {
  isAuthenticated: boolean;
  currentTime: string;
  todayLabel: string;
  duration: number;
  selectedProgramId: string;
  machines: Machine[];
  newProgram: NewProgram;
  newMachine: NewMachine;
  calculationMode: CalculationMode;
  slots: Slot[];
  newSlot: NewSlot;
  suggestions: Suggestion[];
  alternativeSuggestion: Suggestion | null;
  best: Suggestion | undefined;
  syncStatus: "local" | "loading" | "saving" | "saved" | "error";
  setCurrentTime: (time: string) => void;
  setDuration: (duration: number) => void;
  selectProgram: (programId: string) => void;
  setNewProgram: (program: NewProgram | ((program: NewProgram) => NewProgram)) => void;
  setNewMachine: (machine: NewMachine | ((machine: NewMachine) => NewMachine)) => void;
  addMachine: () => string | null;
  addProgram: (machineId: string) => void;
  updateMachine: (
    machineId: string,
    patch: Partial<Pick<Machine, "name">>,
  ) => void;
  updateProgram: (
    programId: string,
    patch: Partial<Pick<Program, "name" | "duration" | "delayStep" | "delayMode">>,
  ) => void;
  removeMachine: (machineId: string) => void;
  removeProgram: (programId: string) => void;
  setCalculationMode: (mode: CalculationMode) => void;
  setNewSlot: (slot: NewSlot | ((slot: NewSlot) => NewSlot)) => void;
  addSlot: () => void;
  updateSlot: (slotId: string, patch: Partial<Pick<Slot, "name" | "start" | "end">>) => void;
  removeSlot: (id: string) => void;
  clearSlots: () => void;
};

const defaultSlots: Slot[] = [
  {
    id: "default-1",
    name: "Nuit",
    start: "01:30",
    end: "07:30",
  },
  {
    id: "default-2",
    name: "Apres-midi",
    start: "14:00",
    end: "16:00",
  },
];

const defaultNewSlot = { name: "", start: "22:00", end: "06:00" };
const storageKey = "cyclesmart-slots";
const settingsStorageKey = "cyclesmart-settings";
export const dayMinutes = 24 * 60;

export const defaultMachines: Machine[] = [
  {
    id: "washing-machine",
    name: "Lave-linge",
    programs: [
      {
        id: "washing-machine-cotton",
        name: "Coton",
        description: "Programme standard",
        duration: 150,
        delayStep: 30,
        delayMode: "depart",
      },
      {
        id: "washing-machine-quick",
        name: "Rapide",
        description: "Cycle court",
        duration: 45,
        delayStep: 30,
        delayMode: "depart",
      },
    ],
    builtIn: true,
  },
  {
    id: "dishwasher",
    name: "Lave-vaisselle",
    programs: [
      {
        id: "dishwasher-eco",
        name: "Eco",
        description: "Cycle economique",
        duration: 195,
        delayStep: 60,
        delayMode: "fin",
      },
      {
        id: "dishwasher-intense",
        name: "Intense",
        description: "Cycle intensif",
        duration: 150,
        delayStep: 60,
        delayMode: "fin",
      },
    ],
    builtIn: true,
  },
];

export const favoriteDurations = [30, 75, 150, 180];
export const delayStepOptions = [30, 60, 120];
const defaultNewProgram: NewProgram = { name: "", duration: 120, delayStep: 60, delayMode: "depart" };
const defaultNewMachine: NewMachine = { name: "" };

function getAllPrograms(machines: Machine[]): Program[] {
  return machines.flatMap((machine) => machine.programs);
}

const CycleContext = createContext<CycleContextValue | null>(null);

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const normalized = ((Math.round(totalMinutes) % dayMinutes) + dayMinutes) % dayMinutes;
  const hours = Math.floor(normalized / 60).toString().padStart(2, "0");
  const minutes = (normalized % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) {
    return `${rest} min`;
  }

  if (rest === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${rest.toString().padStart(2, "0")}`;
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

function getNowTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function alignEventToDelayStep(
  earliestEvent: number,
  latestEvent: number,
  now: number,
  delayStep: number,
  calculationMode: CalculationMode,
) {
  if (calculationMode === "last") {
    const wait = Math.floor((latestEvent - now) / delayStep) * delayStep;
    return wait >= 0 ? now + wait : null;
  }

  const wait = Math.ceil((earliestEvent - now) / delayStep) * delayStep;
  return now + Math.max(0, wait);
}

function getSuggestions(
  slots: Slot[],
  currentTime: string,
  duration: number,
  calculationMode: CalculationMode,
  delayStep: number,
  programDelayMode: "depart" | "fin",
) {
  const now = timeToMinutes(currentTime);

  const candidates = slots.flatMap((slot) => {
    const start = timeToMinutes(slot.start);
    const rawEnd = timeToMinutes(slot.end);
    const end = rawEnd <= start ? rawEnd + dayMinutes : rawEnd;

    return [0, dayMinutes].flatMap((offset) => {
      const slotStart = start + offset;
      const slotEnd = end + offset;
      const earliestStart = Math.max(now, slotStart);
      const latestStart = calculationMode === "last" ? slotEnd - duration : slotEnd;

      if (latestStart < earliestStart) {
        return [];
      }

      // "depart" machines dial in a wait-until-start; "fin" machines dial in a
      // wait-until-finish, so the delay-step rounding must apply to whichever
      // instant the machine's timer actually counts down to.
      const targetStart =
        programDelayMode === "fin"
          ? (() => {
              const targetFinish = alignEventToDelayStep(
                earliestStart + duration,
                latestStart + duration,
                now,
                delayStep,
                calculationMode,
              );
              return targetFinish === null ? null : targetFinish - duration;
            })()
          : alignEventToDelayStep(earliestStart, latestStart, now, delayStep, calculationMode);

      if (targetStart === null || targetStart < earliestStart || targetStart > latestStart) {
        return [];
      }

      return [
        {
          id: `${slot.id}-${offset}`,
          slot,
          start: targetStart,
          end: targetStart + duration,
          wait: targetStart - now,
        },
      ];
    });
  });

  return candidates.sort((a, b) => {
    if (calculationMode === "last") {
      return a.end - b.end;
    }

    return a.start - b.start;
  });
}

function getDefaultSlotName(startTime: string) {
  const start = timeToMinutes(startTime);

  if (start < 6 * 60) {
    return "Nuit";
  }

  if (start < 12 * 60) {
    return "Matin";
  }

  if (start < 18 * 60) {
    return "Apres-midi";
  }

  return "Soir";
}

function getStoredSettings() {
  const stored = window.localStorage.getItem(settingsStorageKey);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as StoredSettings;
  } catch {
    window.localStorage.removeItem(settingsStorageKey);
    return null;
  }
}

function mergeStoredMachines(storedMachines: Machine[] | undefined) {
  if (!Array.isArray(storedMachines)) {
    return defaultMachines;
  }

  const storedById = new Map(
    storedMachines
      .filter((machine) => machine && typeof machine.id === "string")
      .map((machine) => [machine.id, machine]),
  );
  const builtInSource = storedMachines.some((machine) =>
    defaultMachines.some((defaultMachine) => defaultMachine.id === machine.id),
  )
    ? defaultMachines.filter((defaultMachine) => storedById.has(defaultMachine.id))
    : defaultMachines;
  const builtInMachines = builtInSource.map((defaultMachine) => {
    const storedMachine = storedById.get(defaultMachine.id);

    return {
      ...defaultMachine,
      name: typeof storedMachine?.name === "string" ? storedMachine.name : defaultMachine.name,
      programs: defaultMachine.programs.map((defaultProgram) => {
        const storedProgram = storedMachine?.programs?.find((p) => p.id === defaultProgram.id);
        return {
          ...defaultProgram,
          name: typeof storedProgram?.name === "string" ? storedProgram.name : defaultProgram.name,
          duration: typeof storedProgram?.duration === "number"
            ? normalizeDuration(storedProgram.duration)
            : defaultProgram.duration,
          delayStep: normalizeDelayStep(storedProgram?.delayStep),
          delayMode: (storedProgram?.delayMode === "depart" || storedProgram?.delayMode === "fin") ? storedProgram.delayMode : defaultProgram.delayMode,
        };
      }),
    };
  });

  const customMachines = storedMachines.filter((machine) => {
    return (
      machine &&
      typeof machine.id === "string" &&
      typeof machine.name === "string" &&
      Array.isArray(machine.programs) &&
      !defaultMachines.some((defaultMachine) => defaultMachine.id === machine.id)
    );
  });

  return [
    ...builtInMachines,
    ...customMachines.map((machine) => ({
      ...machine,
      programs: machine.programs.map((program) => ({
        ...program,
        duration: normalizeDuration(program.duration),
        delayStep: normalizeDelayStep(program.delayStep),
        delayMode: (program.delayMode === "depart" || program.delayMode === "fin") ? program.delayMode : "depart",
      })),
    })),
  ];
}

function normalizeDuration(duration: number) {
  return Math.min(Math.max(Number(duration) || 120, 30), 480);
}

function normalizeDelayStep(delayStep: number | undefined) {
  const value = Number(delayStep) || 60;
  return delayStepOptions.includes(value) ? value : 60;
}

export function CycleProvider({
  children,
  isAuthenticated = false,
}: {
  children: ReactNode;
  isAuthenticated?: boolean;
}) {
  const [currentTime, setCurrentTime] = useState("12:00");
  const [todayLabel, setTodayLabel] = useState("");
  const [duration, setDuration] = useState(150);
  const [selectedProgramId, setSelectedProgramId] = useState("washing-machine-cotton");
  const [machines, setMachines] = useState<Machine[]>(defaultMachines);
  const [newProgram, setNewProgram] = useState<NewProgram>(defaultNewProgram);
  const [newMachine, setNewMachine] = useState<NewMachine>(defaultNewMachine);
  const [calculationMode, setCalculationMode] = useState<CalculationMode>("soon");
  const [slots, setSlots] = useState<Slot[]>(defaultSlots);
  const [newSlot, setNewSlot] = useState<NewSlot>(defaultNewSlot);
  const [hydrated, setHydrated] = useState(false);
  const [remoteHydrated, setRemoteHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"local" | "loading" | "saving" | "saved" | "error">(
    "local",
  );

  useEffect(() => {
    function syncTime() {
      setCurrentTime(getNowTime());
      setTodayLabel(getTodayLabel());
    }

    const timer = window.setTimeout(() => {
      let storedSlots: Slot[] = [];
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        try {
          storedSlots = JSON.parse(stored) as Slot[];
          setSlots(storedSlots);
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }

      const storedSettings = getStoredSettings();
      const nextMachines = mergeStoredMachines(storedSettings?.machines);
      setMachines(nextMachines);

      if (
        storedSettings?.duration &&
        storedSettings.duration >= 30 &&
        storedSettings.duration <= 480
      ) {
        setDuration(storedSettings.duration);
      }
      if (
        storedSettings?.selectedProgramId &&
        getAllPrograms(nextMachines).some((program) => program.id === storedSettings.selectedProgramId)
      ) {
        setSelectedProgramId(storedSettings.selectedProgramId);
      }
      if (
        storedSettings?.calculationMode === "soon" || storedSettings?.calculationMode === "last"
      ) {
        setCalculationMode(storedSettings.calculationMode);
      }

      syncTime();
      setHydrated(true);

      if (!isAuthenticated) {
        setSyncStatus("local");
        setRemoteHydrated(true);
        return;
      }

      setSyncStatus("loading");
      Promise.allSettled([
        fetch("/api/settings").then((response) => response.json()),
        fetch("/api/slots").then((response) => response.json()),
      ])
        .then(([settingsResult, slotsResult]) => {
          let hasError = false;

          if (settingsResult.status === "fulfilled") {
            const data = settingsResult.value as { ok?: boolean; settings?: StoredSettings | null };

            if (data.ok && data.settings) {
              const remoteMachines = mergeStoredMachines(data.settings.machines);
              setMachines(remoteMachines);

              if (
                data.settings.duration &&
                data.settings.duration >= 30 &&
                data.settings.duration <= 480
              ) {
                setDuration(data.settings.duration);
              }
              if (
                data.settings.selectedProgramId &&
                getAllPrograms(remoteMachines).some((program) => program.id === data.settings?.selectedProgramId)
              ) {
                setSelectedProgramId(data.settings.selectedProgramId);
              }
              if (
                data.settings.calculationMode === "soon" || data.settings.calculationMode === "last"
              ) {
                setCalculationMode(data.settings.calculationMode);
              }
            } else if (!data.ok) {
              hasError = true;
            }
          } else {
            hasError = true;
          }

          if (slotsResult.status === "fulfilled") {
            const data = slotsResult.value as { ok?: boolean; slots?: Slot[]; error?: string };

            if (data.ok && Array.isArray(data.slots)) {
              if (data.slots.length > 0 || storedSlots.length === 0) {
                setSlots(data.slots);
              }
            } else if (!("error" in data)) {
              hasError = true;
            }
          } else {
            hasError = true;
          }

          setSyncStatus(hasError ? "error" : "saved");
        })
        .catch(() => setSyncStatus("error"))
        .finally(() => setRemoteHydrated(true));
    }, 0);
    const interval = window.setInterval(syncTime, 30_000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      settingsStorageKey,
      JSON.stringify({ machines, duration, calculationMode, selectedProgramId }),
    );
  }, [machines, duration, calculationMode, hydrated, selectedProgramId]);

  useEffect(() => {
    if (!hydrated || !remoteHydrated || !isAuthenticated) {
      return;
    }

    const controller = new AbortController();
    const statusTimer = window.setTimeout(() => setSyncStatus("saving"), 0);
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        machines,
        duration,
        calculationMode,
        selectedProgramId,
      }),
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 401) {
          return { ok: false, local: true };
        }

        return response.json();
      })
      .then((data: { ok?: boolean; local?: boolean }) => {
        setSyncStatus(data.local ? "local" : data.ok ? "saved" : "error");
      })
      .catch((error) => {
        if ((error as Error).name !== "AbortError") {
          setSyncStatus("error");
        }
      });

    return () => {
      window.clearTimeout(statusTimer);
      controller.abort();
    };
  }, [
    machines,
    duration,
    calculationMode,
    hydrated,
    isAuthenticated,
    remoteHydrated,
    selectedProgramId,
  ]);

  useEffect(() => {
    if (!hydrated || !remoteHydrated || !isAuthenticated) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(slots));

    const controller = new AbortController();
    const statusTimer = window.setTimeout(() => setSyncStatus("saving"), 0);
    fetch("/api/slots", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots }),
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 401) {
          return { ok: false, local: true };
        }

        return response.json();
      })
      .then((data: { ok?: boolean; local?: boolean }) => {
        setSyncStatus(data.local ? "local" : data.ok ? "saved" : "error");
      })
      .catch((error) => {
        if ((error as Error).name !== "AbortError") {
          setSyncStatus("error");
        }
      });

    return () => {
      window.clearTimeout(statusTimer);
      controller.abort();
    };
  }, [hydrated, isAuthenticated, remoteHydrated, slots]);

  const selectedProgram = getAllPrograms(machines).find((program) => program.id === selectedProgramId);
  const selectedDelayStep = selectedProgram?.delayStep || 30;
  const selectedDelayMode = selectedProgram?.delayMode || "depart";
  const suggestions = useMemo(
    () => getSuggestions(slots, currentTime, duration, calculationMode, selectedDelayStep, selectedDelayMode),
    [currentTime, duration, calculationMode, selectedDelayStep, selectedDelayMode, slots],
  );
  const alternativeSuggestion = useMemo(() => {
    if (calculationMode !== "last") {
      return null;
    }

    const primary = suggestions[0];

    if (!primary) {
      return null;
    }

    const soonSuggestions = getSuggestions(
      slots,
      currentTime,
      duration,
      "soon",
      selectedDelayStep,
      selectedDelayMode,
    );

    return (
      soonSuggestions.find(
        (suggestion) =>
          suggestion.slot.id !== primary.slot.id && suggestion.start < primary.start,
      ) ?? null
    );
  }, [currentTime, duration, selectedDelayStep, calculationMode, selectedDelayMode, slots, suggestions]);

  const updateDuration = useCallback((nextDuration: number) => {
    setDuration(nextDuration);
  }, []);

  const updateCalculationMode = useCallback((mode: CalculationMode) => {
    setCalculationMode(mode);
  }, []);

  const selectProgram = useCallback((programId: string) => {
    const program = getAllPrograms(machines).find((item) => item.id === programId);

    if (!program) {
      return;
    }

    setSelectedProgramId(program.id);
    setDuration(program.duration);
  }, [machines]);

  const addMachine = useCallback(() => {
    const name = newMachine.name.trim();

    if (!name) {
      return null;
    }

    const machine: Machine = {
      id: crypto.randomUUID(),
      name,
      programs: [],
    };

    setMachines((current) => [...current, machine]);
    setNewMachine(defaultNewMachine);
    return machine.id;
  }, [newMachine]);

  const addProgram = useCallback((machineId: string) => {
    const name = newProgram.name.trim();
    const duration = normalizeDuration(newProgram.duration);
    const delayStep = normalizeDelayStep(newProgram.delayStep);
    const delayMode = (newProgram.delayMode === "depart" || newProgram.delayMode === "fin") ? newProgram.delayMode : "depart";

    if (!name) {
      return;
    }

    const program: Program = {
      id: crypto.randomUUID(),
      name,
      description: "Programme personnalise",
      duration,
      delayStep,
      delayMode,
    };

    setMachines((current) =>
      current.map((machine) => {
        if (machine.id !== machineId) {
          return machine;
        }
        return {
          ...machine,
          programs: [...machine.programs, program],
        };
      }),
    );
    setSelectedProgramId(program.id);
    setDuration(program.duration);
    setNewProgram(defaultNewProgram);
  }, [newProgram]);

  const updateMachine = useCallback((machineId: string, patch: Partial<Pick<Machine, "name">>) => {
    setMachines((current) =>
      current.map((machine) => {
        if (machine.id !== machineId) {
          return machine;
        }

        return {
          ...machine,
          name: patch.name === undefined ? machine.name : patch.name,
        };
      }),
    );
  }, []);

  const updateProgram = useCallback(
    (
      programId: string,
      patch: Partial<Pick<Program, "name" | "duration" | "delayStep" | "delayMode">>,
    ) => {
    setMachines((current) =>
      current.map((machine) => {
        const updatedPrograms = machine.programs.map((program) => {
          if (program.id !== programId) {
            return program;
          }

          const nextDuration =
            patch.duration === undefined
              ? program.duration
              : normalizeDuration(patch.duration);
          const nextDelayStep =
            patch.delayStep === undefined ? program.delayStep : normalizeDelayStep(patch.delayStep);
          const nextDelayMode =
            patch.delayMode === undefined ? program.delayMode : (patch.delayMode === "depart" || patch.delayMode === "fin" ? patch.delayMode : program.delayMode);

          if (selectedProgramId === programId && patch.duration !== undefined) {
            setDuration(nextDuration);
          }

          return {
            ...program,
            name: patch.name === undefined ? program.name : patch.name,
            duration: nextDuration,
            delayStep: nextDelayStep,
            delayMode: nextDelayMode,
          };
        });

        return {
          ...machine,
          programs: updatedPrograms,
        };
      }),
    );
  }, [selectedProgramId]);

  const removeMachine = useCallback((machineId: string) => {
    setMachines((current) => {
      const machine = current.find((item) => item.id === machineId);

      if (!machine || current.length <= 1) {
        return current;
      }

      const nextMachines = current.filter((item) => item.id !== machineId);
      const allPrograms = getAllPrograms(nextMachines);

      if (selectedProgramId && !allPrograms.find((p) => p.id === selectedProgramId)) {
        const nextProgram = allPrograms[0];
        if (nextProgram) {
          setSelectedProgramId(nextProgram.id);
          setDuration(nextProgram.duration);
        }
      }

      return nextMachines;
    });
  }, [selectedProgramId]);

  const removeProgram = useCallback((programId: string) => {
    setMachines((current) => {
      let found = false;
      const nextMachines = current.map((machine) => {
        const hasProgram = machine.programs.some((p) => p.id === programId);
        if (hasProgram) {
          found = true;
          if (machine.programs.length <= 1) {
            return machine;
          }
          return {
            ...machine,
            programs: machine.programs.filter((p) => p.id !== programId),
          };
        }
        return machine;
      });

      if (selectedProgramId === programId && found) {
        const allPrograms = getAllPrograms(nextMachines);
        const nextProgram = allPrograms[0];
        if (nextProgram) {
          setSelectedProgramId(nextProgram.id);
          setDuration(nextProgram.duration);
        }
      }

      return nextMachines;
    });
  }, [selectedProgramId]);

  const addSlot = useCallback(() => {
    setSlots((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: newSlot.name.trim() || getDefaultSlotName(newSlot.start),
        start: newSlot.start,
        end: newSlot.end,
      },
    ]);
    setNewSlot(defaultNewSlot);
  }, [newSlot]);

  const updateSlot = useCallback(
    (slotId: string, patch: Partial<Pick<Slot, "name" | "start" | "end">>) => {
      setSlots((current) =>
        current.map((slot) => {
          if (slot.id !== slotId) {
            return slot;
          }

          const nextStart = patch.start ?? slot.start;
          const nextName =
            patch.name !== undefined && patch.name.trim() === ""
              ? getDefaultSlotName(nextStart)
              : patch.name ?? slot.name;

          return {
            ...slot,
            ...patch,
            name: nextName,
          };
        }),
      );
    },
    [],
  );

  const removeSlot = useCallback((id: string) => {
    setSlots((current) => current.filter((slot) => slot.id !== id));
  }, []);

  const clearSlots = useCallback(() => {
    setSlots([]);
    window.localStorage.removeItem(storageKey);
    setSyncStatus("local");
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      currentTime,
      todayLabel,
      duration,
      selectedProgramId,
      machines,
      newProgram,
      newMachine,
      calculationMode,
      slots,
      newSlot,
      suggestions,
      alternativeSuggestion,
      best: suggestions[0],
      syncStatus,
      setCurrentTime,
      setDuration: updateDuration,
      selectProgram,
      setNewProgram,
      setNewMachine,
      addMachine,
      addProgram,
      updateMachine,
      updateProgram,
      removeMachine,
      removeProgram,
      setCalculationMode: updateCalculationMode,
      setNewSlot,
      addSlot,
      updateSlot,
      removeSlot,
      clearSlots,
    }),
    [
      addSlot,
      addMachine,
      addProgram,
      alternativeSuggestion,
      clearSlots,
      currentTime,
      duration,
      calculationMode,
      isAuthenticated,
      machines,
      newProgram,
      newMachine,
      newSlot,
      removeMachine,
      removeProgram,
      removeSlot,
      selectProgram,
      selectedProgramId,
      slots,
      suggestions,
      syncStatus,
      updateDuration,
      updateCalculationMode,
      todayLabel,
      updateMachine,
      updateProgram,
      updateSlot,
    ],
  );

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
}

export function useCycle() {
  const context = useContext(CycleContext);

  if (!context) {
    throw new Error("useCycle must be used inside CycleProvider");
  }

  return context;
}
