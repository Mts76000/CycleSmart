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

export type FinishMode = "soon" | "last";

export type CycleDevice = {
  id: string;
  name: string;
  description: string;
  defaultDuration: number;
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

type NewDevice = {
  name: string;
  duration: number;
};

type CycleContextValue = {
  currentTime: string;
  todayLabel: string;
  duration: number;
  selectedDeviceId: string;
  devices: CycleDevice[];
  newDevice: NewDevice;
  finishMode: FinishMode;
  slots: Slot[];
  newSlot: NewSlot;
  suggestions: Suggestion[];
  best: Suggestion | undefined;
  syncStatus: "local" | "loading" | "saving" | "saved" | "error";
  setCurrentTime: (time: string) => void;
  setDuration: (duration: number) => void;
  selectDevice: (deviceId: string) => void;
  setNewDevice: (device: NewDevice | ((device: NewDevice) => NewDevice)) => void;
  addDevice: () => void;
  removeDevice: (deviceId: string) => void;
  setFinishMode: (mode: FinishMode) => void;
  setNewSlot: (slot: NewSlot | ((slot: NewSlot) => NewSlot)) => void;
  addSlot: () => void;
  removeSlot: (id: string) => void;
  clearSlots: () => void;
};

const defaultSlots: Slot[] = [];

const defaultNewSlot = { name: "", start: "22:00", end: "06:00" };
const storageKey = "cyclesmart-slots";
const settingsStorageKey = "cyclesmart-settings";
export const dayMinutes = 24 * 60;

export const defaultCycleDevices: CycleDevice[] = [
  {
    id: "washing-machine",
    name: "Lave-linge",
    description: "Programme coton ou mixte",
    defaultDuration: 150,
    builtIn: true,
  },
  {
    id: "dishwasher",
    name: "Lave-vaisselle",
    description: "Cycle eco quotidien",
    defaultDuration: 195,
    builtIn: true,
  },
];

export const favoriteDurations = [30, 75, 150, 180];
const defaultNewDevice: NewDevice = { name: "", duration: 120 };

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

function getSuggestions(slots: Slot[], currentTime: string, duration: number, finishMode: FinishMode) {
  const now = timeToMinutes(currentTime);
  const candidates = slots.flatMap((slot) => {
    const start = timeToMinutes(slot.start);
    const rawEnd = timeToMinutes(slot.end);
    const end = rawEnd <= start ? rawEnd + dayMinutes : rawEnd;

    return [0, dayMinutes].flatMap((offset) => {
      const slotStart = start + offset;
      const slotEnd = end + offset;
      const earliestStart = Math.max(now, slotStart);
      const latestStart = slotEnd - duration;

      if (latestStart < earliestStart) {
        return [];
      }

      const targetStart = finishMode === "last" ? latestStart : earliestStart;

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
    if (finishMode === "last") {
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
    return JSON.parse(stored) as Partial<{
      duration: number;
      finishMode: FinishMode;
      selectedDeviceId: string;
      devices: CycleDevice[];
    }>;
  } catch {
    window.localStorage.removeItem(settingsStorageKey);
    return null;
  }
}

function mergeStoredDevices(storedDevices: CycleDevice[] | undefined) {
  if (!Array.isArray(storedDevices)) {
    return defaultCycleDevices;
  }

  const customDevices = storedDevices.filter((device) => {
    return (
      device &&
      typeof device.id === "string" &&
      typeof device.name === "string" &&
      typeof device.defaultDuration === "number" &&
      !defaultCycleDevices.some((defaultDevice) => defaultDevice.id === device.id)
    );
  });

  return [...defaultCycleDevices, ...customDevices];
}

export function CycleProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState("12:00");
  const [todayLabel, setTodayLabel] = useState("");
  const [duration, setDuration] = useState(150);
  const [selectedDeviceId, setSelectedDeviceId] = useState("washing-machine");
  const [devices, setDevices] = useState<CycleDevice[]>(defaultCycleDevices);
  const [newDevice, setNewDevice] = useState<NewDevice>(defaultNewDevice);
  const [finishMode, setFinishMode] = useState<FinishMode>("last");
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
      const nextDevices = mergeStoredDevices(storedSettings?.devices);
      setDevices(nextDevices);

      if (storedSettings?.duration && storedSettings.duration >= 30 && storedSettings.duration <= 480) {
        setDuration(storedSettings.duration);
      }
      if (
        storedSettings?.selectedDeviceId &&
        nextDevices.some((device) => device.id === storedSettings.selectedDeviceId)
      ) {
        setSelectedDeviceId(storedSettings.selectedDeviceId);
      }
      if (storedSettings?.finishMode === "soon" || storedSettings?.finishMode === "last") {
        setFinishMode(storedSettings.finishMode);
      }

      syncTime();
      setHydrated(true);

      setSyncStatus("loading");
      fetch("/api/slots")
        .then((response) => response.json())
        .then((data: { ok?: boolean; slots?: Slot[] }) => {
          if (data.ok && Array.isArray(data.slots)) {
            if (data.slots.length > 0 || storedSlots.length === 0) {
              setSlots(data.slots);
            }
            setSyncStatus("saved");
          } else if ("error" in data) {
            setSyncStatus("local");
          } else {
            setSyncStatus("error");
          }
        })
        .catch(() => setSyncStatus("error"))
        .finally(() => setRemoteHydrated(true));
    }, 0);
    const interval = window.setInterval(syncTime, 30_000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      settingsStorageKey,
      JSON.stringify({ devices, duration, finishMode, selectedDeviceId }),
    );
  }, [devices, duration, finishMode, hydrated, selectedDeviceId]);

  useEffect(() => {
    if (!hydrated || !remoteHydrated) {
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
  }, [hydrated, remoteHydrated, slots]);

  const suggestions = useMemo(
    () => getSuggestions(slots, currentTime, duration, finishMode),
    [currentTime, duration, finishMode, slots],
  );

  const updateDuration = useCallback((nextDuration: number) => {
    setDuration(nextDuration);
    setSelectedDeviceId("custom");
  }, []);

  const selectDevice = useCallback((deviceId: string) => {
    const device = devices.find((item) => item.id === deviceId);

    if (!device) {
      return;
    }

    setSelectedDeviceId(device.id);
    setDuration(device.defaultDuration);
  }, [devices]);

  const addDevice = useCallback(() => {
    const name = newDevice.name.trim();
    const defaultDuration = Math.min(Math.max(Number(newDevice.duration) || 120, 30), 480);

    if (!name) {
      return;
    }

    const device: CycleDevice = {
      id: crypto.randomUUID(),
      name,
      description: "Machine personnalisee",
      defaultDuration,
    };

    setDevices((current) => [...current, device]);
    setSelectedDeviceId(device.id);
    setDuration(device.defaultDuration);
    setNewDevice(defaultNewDevice);
  }, [newDevice]);

  const removeDevice = useCallback((deviceId: string) => {
    setDevices((current) => {
      const device = current.find((item) => item.id === deviceId);

      if (!device || device.builtIn) {
        return current;
      }

      return current.filter((item) => item.id !== deviceId);
    });

    setSelectedDeviceId((current) => {
      if (current !== deviceId) {
        return current;
      }

      setDuration(defaultCycleDevices[0].defaultDuration);
      return defaultCycleDevices[0].id;
    });
  }, []);

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
      currentTime,
      todayLabel,
      duration,
      selectedDeviceId,
      devices,
      newDevice,
      finishMode,
      slots,
      newSlot,
      suggestions,
      best: suggestions[0],
      syncStatus,
      setCurrentTime,
      setDuration: updateDuration,
      selectDevice,
      setNewDevice,
      addDevice,
      removeDevice,
      setFinishMode,
      setNewSlot,
      addSlot,
      removeSlot,
      clearSlots,
    }),
    [
      addSlot,
      addDevice,
      clearSlots,
      currentTime,
      devices,
      duration,
      finishMode,
      newDevice,
      newSlot,
      removeDevice,
      removeSlot,
      selectDevice,
      selectedDeviceId,
      slots,
      suggestions,
      syncStatus,
      updateDuration,
      todayLabel,
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
