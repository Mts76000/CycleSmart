import { pgTable, text, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { user } from "@/drizzle/schema/auth";

export type CycleProgram = {
  id: string;
  name: string;
  description: string;
  duration: number;
  delayStep: number;
  delayMode: "depart" | "fin";
};

// Per-user off-peak time slots (heures creuses). Composite PK (userId, id): slot ids are
// only unique within a user's own list, not globally.
export const offPeakSlots = pgTable(
  "off_peak_slots",
  {
    id: text("id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.id] })],
);

// Per-user washing machines/appliances, each with its own list of programs (cycles).
export const cycleDevices = pgTable(
  "cycle_devices",
  {
    id: text("id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    defaultDuration: integer("default_duration"),
    delayStep: integer("delay_step"),
    builtIn: boolean("built_in").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    programs: jsonb("programs").$type<CycleProgram[]>().notNull().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.id] })],
);

// One row per user: last-used calculator settings, restored on next visit.
export const cyclePreferences = pgTable("cycle_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  selectedDeviceId: text("selected_device_id"),
  selectedProgramId: text("selected_program_id"),
  duration: integer("duration").notNull().default(150),
  finishMode: text("finish_mode").notNull().default("soon"),
  finishModeConfigured: boolean("finish_mode_configured").notNull().default(false),
  calculationMode: text("calculation_mode").notNull().default("soon"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
