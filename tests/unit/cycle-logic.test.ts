import { describe, expect, it } from "vitest";
import {
  dayMinutes,
  defaultMachines,
  delayStepOptions,
  formatDuration,
  getDefaultSlotName,
  getSuggestions,
  minutesToTime,
  timeToMinutes,
  type Slot,
} from "@/lib/cycle-store";

describe("time conversion", () => {
  it("converts HH:MM to minutes", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("01:30")).toBe(90);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("converts minutes back to HH:MM", () => {
    expect(minutesToTime(0)).toBe("00:00");
    expect(minutesToTime(90)).toBe("01:30");
    expect(minutesToTime(1440)).toBe("00:00");
  });
});

describe("formatDuration", () => {
  it("formats minutes only", () => {
    expect(formatDuration(45)).toBe("45 min");
  });

  it("formats whole hours", () => {
    expect(formatDuration(120)).toBe("2 h");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(150)).toBe("2 h 30");
  });
});

describe("getDefaultSlotName", () => {
  it("names a slot based on its start time", () => {
    expect(getDefaultSlotName("02:00")).toBe("Nuit");
    expect(getDefaultSlotName("08:00")).toBe("Matin");
    expect(getDefaultSlotName("14:00")).toBe("Apres-midi");
    expect(getDefaultSlotName("20:00")).toBe("Soir");
  });
});

describe("getSuggestions", () => {
  const slots: Slot[] = [
    { id: "nuit", name: "Nuit", start: "01:00", end: "07:00" },
    { id: "aprem", name: "Apres-midi", start: "14:00", end: "16:00" },
  ];

  it("picks the soonest suggestion by default", () => {
    const result = getSuggestions(slots, "00:00", 60, "soon", 30, "depart");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].slot.id).toBe("nuit");
    expect(result[0].wait).toBe(60);
  });

  it("respects calculation mode 'last'", () => {
    const result = getSuggestions(slots, "06:00", 60, "last", 30, "depart");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].end).toBeGreaterThan(result[0].start);
  });

  it("aligns depart wait to the delay step", () => {
    const result = getSuggestions(slots, "00:50", 60, "soon", 30, "depart");
    expect(result[0].wait % 30).toBe(0);
  });

  it("handles 'fin' delay mode", () => {
    const result = getSuggestions(slots, "00:00", 60, "soon", 30, "fin");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].slot.id).toBe("nuit");
  });

  it("returns the start of the slot even if the cycle ends after it", () => {
    const shortSlot: Slot[] = [{ id: "short", name: "Short", start: "14:00", end: "14:30" }];
    const result = getSuggestions(shortSlot, "14:00", 60, "soon", 30, "depart");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].start).toBe(timeToMinutes("14:00"));
    expect(result[0].end).toBe(timeToMinutes("14:00") + 60);
  });
});

describe("constants", () => {
  it("has expected default values", () => {
    expect(dayMinutes).toBe(1440);
    expect(delayStepOptions).toEqual([30, 60, 120]);
    expect(defaultMachines.length).toBeGreaterThan(0);
    expect(defaultMachines[0].programs.length).toBeGreaterThan(0);
  });
});
