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
import { readLocalUser } from "./auth-store";

export type Slot = {
  id: string;
  name: string;
  start: string;
  end: string;
};

export type FinishMode = "soon" | "last";

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

type CycleContextValue = {
  currentTime: string;
  todayLabel: string;
  duration: number;
  finishMode: FinishMode;
  slots: Slot[];
  newSlot: NewSlot;
  suggestions: Suggestion[];
  best: Suggestion | undefined;
  syncStatus: "local" | "loading" | "saving" | "saved" | "error";
  setCurrentTime: (time: string) => void;
  setDuration: (duration: number) => void;
  setFinishMode: (mode: FinishMode) => void;
  setNewSlot: (slot: NewSlot | ((slot: NewSlot) => NewSlot)) => void;
  addSlot: () => void;
  removeSlot: (id: string) => void;
  clearSlots: () => void;
};

const defaultSlots: Slot[] = [];

const defaultNewSlot = { name: "", start: "22:00", end: "06:00" };
const storageKey = "cyclesmart-slots";
export const dayMinutes = 24 * 60;

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

export function CycleProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState("12:00");
  const [todayLabel, setTodayLabel] = useState("");
  const [duration, setDuration] = useState(150);
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
      const user = readLocalUser();
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        try {
          setSlots(JSON.parse(stored) as Slot[]);
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }

      syncTime();
      setHydrated(true);

      if (!user) {
        setRemoteHydrated(true);
        setSyncStatus("local");
        return;
      }

      setSyncStatus("loading");
      fetch(`/api/slots?email=${encodeURIComponent(user.email)}`)
        .then((response) => response.json())
        .then((data: { ok?: boolean; slots?: Slot[] }) => {
          if (data.ok && Array.isArray(data.slots)) {
            setSlots(data.slots);
            setSyncStatus("saved");
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
    if (!hydrated || !remoteHydrated) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(slots));
    const user = readLocalUser();

    if (!user) {
      return;
    }

    const controller = new AbortController();
    const statusTimer = window.setTimeout(() => setSyncStatus("saving"), 0);
    fetch("/api/slots", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, name: user.name, slots }),
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: { ok?: boolean }) => setSyncStatus(data.ok ? "saved" : "error"))
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

  const addSlot = useCallback(() => {
    setSlots((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: newSlot.name.trim() || "Nouveau creneau",
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
      finishMode,
      slots,
      newSlot,
      suggestions,
      best: suggestions[0],
      syncStatus,
      setCurrentTime,
      setDuration,
      setFinishMode,
      setNewSlot,
      addSlot,
      removeSlot,
      clearSlots,
    }),
    [
      addSlot,
      clearSlots,
      currentTime,
      duration,
      finishMode,
      newSlot,
      removeSlot,
      slots,
      suggestions,
      syncStatus,
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
