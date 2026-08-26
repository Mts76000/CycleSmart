import type { PoolClient } from "pg";
import { getCurrentUser, requireCurrentUser } from "@/lib/current-user";
import { ensureDatabaseSchema, getPool, query } from "@/lib/db";
import { rateLimitByUser, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type ProgramPayload = {
  id: string;
  name: string;
  description?: string;
  duration: number;
  delayStep: number;
  delayMode?: string;
};

type MachinePayload = {
  id: string;
  name: string;
  programs?: unknown[];
  builtIn?: boolean;
};

type SettingsPayload = {
  machines?: unknown[];
  duration?: unknown;
  selectedProgramId?: unknown;
  calculationMode?: unknown;
};

const allowedDelaySteps = [30, 60, 120];

function normalizeDuration(value: unknown) {
  const duration = Number(value) || 150;
  return Math.min(Math.max(duration, 30), 480);
}

function normalizeDelayStep(value: unknown) {
  const step = Number(value) || 60;
  return allowedDelaySteps.includes(step) ? step : 60;
}

function normalizeDelayMode(value: unknown) {
  return value === "fin" ? "fin" : "depart";
}

const MAX_NAME_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 200;

function isNonEmptyString(value: unknown, maxLength = MAX_NAME_LENGTH): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

function isProgram(value: unknown): value is ProgramPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const program = value as ProgramPayload;
  return (
    typeof program.id === "string" &&
    program.id.length > 0 &&
    isNonEmptyString(program.name) &&
    typeof program.duration === "number" &&
    (!program.description || isNonEmptyString(program.description, MAX_DESCRIPTION_LENGTH)) &&
    (!program.delayMode || typeof program.delayMode === "string") &&
    (program.delayStep === undefined || typeof program.delayStep === "number")
  );
}

function normalizePrograms(programs: unknown[]) {
  return programs.filter(isProgram).map((program) => ({
    id: program.id,
    name: program.name.trim() || "Programme",
    description: program.description?.trim() || "",
    duration: normalizeDuration(program.duration),
    delayStep: normalizeDelayStep(program.delayStep),
    delayMode: normalizeDelayMode(program.delayMode),
  }));
}

function isMachine(value: unknown): value is MachinePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const machine = value as MachinePayload;
  return (
    typeof machine.id === "string" &&
    machine.id.length > 0 &&
    isNonEmptyString(machine.name) &&
    (!machine.programs || Array.isArray(machine.programs))
  );
}

function normalizeMachines(machines: unknown[]) {
  return machines.filter(isMachine).map((machine) => ({
    id: machine.id,
    name: machine.name.trim() || "Machine",
    programs: normalizePrograms(Array.isArray(machine.programs) ? machine.programs : []),
    builtIn: Boolean(machine.builtIn),
  }));
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ ok: false, error: "Non connecte." }, { status: 401 });
    }

    await ensureDatabaseSchema();
    const [devicesResult, preferencesResult] = await Promise.all([
      query<{
        id: string;
        name: string;
        programs: ProgramPayload[];
        built_in: boolean;
      }>(
        `
          select id, name, programs, built_in
          from cycle_devices
          where user_id = $1
          order by sort_order asc, created_at asc
        `,
        [user.id],
      ),
      query<{
        selected_program_id: string | null;
        duration: number;
        calculation_mode: "soon" | "last";
      }>(
        `
          select selected_program_id, duration, calculation_mode
          from cycle_preferences
          where user_id = $1
          limit 1
        `,
        [user.id],
      ),
    ]);

    const preferences = preferencesResult.rows[0];
    const machines = devicesResult.rows.map((device) => ({
      id: device.id,
      name: device.name,
      programs: device.programs,
      builtIn: device.built_in,
    }));

    if (!preferences && machines.length === 0) {
      return Response.json({ ok: true, settings: null });
    }

    return Response.json({
      ok: true,
      settings: {
        machines,
        duration: preferences?.duration,
        selectedProgramId: preferences?.selected_program_id,
        calculationMode: preferences?.calculation_mode,
      },
    });
  } catch (error) {
    console.error("GET /api/settings failed:", error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}

const MAX_BODY_SIZE = 1024 * 1024;

export async function PUT(request: Request) {
  const user = await requireCurrentUser();
  const rateLimit = await rateLimitByUser("settings:put", user.id, 120, 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfter);
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_SIZE) {
    return Response.json({ ok: false, error: "Donnees trop volumineuses." }, { status: 413 });
  }

  let client: PoolClient | undefined;
  let transactionStarted = false;

  try {
    const body = (await request.json()) as SettingsPayload;
    const machines = normalizeMachines(Array.isArray(body.machines) ? body.machines : []);

    if (machines.length === 0) {
      return Response.json({ ok: false, error: "Aucune machine a enregistrer." }, { status: 400 });
    }

    const allProgramIds = machines.flatMap((machine) => machine.programs.map((program) => program.id));
    const selectedProgramId =
      typeof body.selectedProgramId === "string" && allProgramIds.includes(body.selectedProgramId)
        ? body.selectedProgramId
        : allProgramIds[0] ?? null;
    const calculationMode = body.calculationMode === "last" ? "last" : "soon";
    const duration = normalizeDuration(body.duration);

    await ensureDatabaseSchema();
    client = await getPool().connect();
    await client.query("begin");
    transactionStarted = true;

    await client.query("delete from cycle_devices where user_id = $1", [user.id]);

    for (const [index, machine] of machines.entries()) {
      await client.query(
        `
          insert into cycle_devices (
            id, user_id, name, programs, built_in, sort_order, updated_at
          )
          values ($1, $2, $3, $4, $5, $6, now())
        `,
        [
          machine.id,
          user.id,
          machine.name,
          JSON.stringify(machine.programs),
          machine.builtIn,
          index,
        ],
      );
    }

    await client.query(
      `
        insert into cycle_preferences (
          user_id, selected_program_id, duration, calculation_mode, updated_at
        )
        values ($1, $2, $3, $4, now())
        on conflict (user_id) do update set
          selected_program_id = excluded.selected_program_id,
          duration = excluded.duration,
          calculation_mode = excluded.calculation_mode,
          updated_at = now()
      `,
      [user.id, selectedProgramId, duration, calculationMode],
    );

    await client.query("commit");

    return Response.json({ ok: true, saved: machines.length });
  } catch (error) {
    if (client && transactionStarted) {
      await client.query("rollback");
    }

    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return Response.json({ ok: false, error: "Non connecte." }, { status: 401 });
    }

    console.error("PUT /api/settings failed:", error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  } finally {
    client?.release();
  }
}
