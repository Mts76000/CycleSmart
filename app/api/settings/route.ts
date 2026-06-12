import type { PoolClient } from "pg";
import { getCurrentUser, requireCurrentUser } from "@/lib/current-user";
import { ensureDatabaseSchema, getPool, query } from "@/lib/db";

export const dynamic = "force-dynamic";

type DevicePayload = {
  id: string;
  name: string;
  description?: string;
  defaultDuration: number;
  delayStep: number;
  builtIn?: boolean;
};

type SettingsPayload = {
  devices?: unknown[];
  duration?: unknown;
  selectedDeviceId?: unknown;
  finishMode?: unknown;
  finishModeConfigured?: unknown;
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

function isDevice(value: unknown): value is DevicePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const device = value as DevicePayload;
  return Boolean(
    device.id &&
      device.name &&
      typeof device.defaultDuration === "number" &&
      typeof device.delayStep === "number",
  );
}

function normalizeDevices(devices: unknown[]) {
  return devices.filter(isDevice).map((device) => ({
    id: device.id,
    name: device.name.trim() || "Machine",
    description: device.description?.trim() || "Machine personnalisee",
    defaultDuration: normalizeDuration(device.defaultDuration),
    delayStep: normalizeDelayStep(device.delayStep),
    builtIn: Boolean(device.builtIn),
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
        description: string;
        default_duration: number;
        delay_step: number;
        built_in: boolean;
      }>(
        `
          select id, name, description, default_duration, delay_step, built_in
          from cycle_devices
          where user_id = $1
          order by sort_order asc, created_at asc
        `,
        [user.id],
      ),
      query<{
        selected_device_id: string | null;
        duration: number;
        finish_mode: "soon" | "last";
        finish_mode_configured: boolean;
      }>(
        `
          select selected_device_id, duration, finish_mode, finish_mode_configured
          from cycle_preferences
          where user_id = $1
          limit 1
        `,
        [user.id],
      ),
    ]);

    const preferences = preferencesResult.rows[0];
    const devices = devicesResult.rows.map((device) => ({
      id: device.id,
      name: device.name,
      description: device.description,
      defaultDuration: device.default_duration,
      delayStep: device.delay_step,
      builtIn: device.built_in,
    }));

    if (!preferences && devices.length === 0) {
      return Response.json({ ok: true, settings: null });
    }

    return Response.json({
      ok: true,
      settings: {
        devices,
        duration: preferences?.duration,
        selectedDeviceId: preferences?.selected_device_id,
        finishMode: preferences?.finish_mode,
        finishModeConfigured: preferences?.finish_mode_configured,
      },
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  let client: PoolClient | undefined;
  let transactionStarted = false;

  try {
    const user = await requireCurrentUser();
    const body = (await request.json()) as SettingsPayload;
    const devices = normalizeDevices(Array.isArray(body.devices) ? body.devices : []);

    if (devices.length === 0) {
      return Response.json({ ok: false, error: "Aucune machine a enregistrer." }, { status: 400 });
    }

    const selectedDeviceId =
      typeof body.selectedDeviceId === "string" &&
      devices.some((device) => device.id === body.selectedDeviceId)
        ? body.selectedDeviceId
        : devices[0].id;
    const finishMode = body.finishMode === "last" ? "last" : "soon";
    const duration = normalizeDuration(body.duration);
    const finishModeConfigured = Boolean(body.finishModeConfigured);

    await ensureDatabaseSchema();
    client = await getPool().connect();
    await client.query("begin");
    transactionStarted = true;

    await client.query("delete from cycle_devices where user_id = $1", [user.id]);

    for (const [index, device] of devices.entries()) {
      await client.query(
        `
          insert into cycle_devices (
            id, user_id, name, description, default_duration, delay_step, built_in, sort_order, updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, now())
        `,
        [
          device.id,
          user.id,
          device.name,
          device.description,
          device.defaultDuration,
          device.delayStep,
          device.builtIn,
          index,
        ],
      );
    }

    await client.query(
      `
        insert into cycle_preferences (
          user_id, selected_device_id, duration, finish_mode, finish_mode_configured, updated_at
        )
        values ($1, $2, $3, $4, $5, now())
        on conflict (user_id) do update set
          selected_device_id = excluded.selected_device_id,
          duration = excluded.duration,
          finish_mode = excluded.finish_mode,
          finish_mode_configured = excluded.finish_mode_configured,
          updated_at = now()
      `,
      [user.id, selectedDeviceId, duration, finishMode, finishModeConfigured],
    );

    await client.query("commit");

    return Response.json({ ok: true, saved: devices.length });
  } catch (error) {
    if (client && transactionStarted) {
      await client.query("rollback");
    }

    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return Response.json({ ok: false, error: "Non connecte." }, { status: 401 });
    }

    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  } finally {
    client?.release();
  }
}
