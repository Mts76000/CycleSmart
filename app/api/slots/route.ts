import type { PoolClient } from "pg";
import { getCurrentUser, requireCurrentUser } from "@/lib/current-user";
import { ensureDatabaseSchema, getPool, query } from "@/lib/db";
import { rateLimitByUser, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type SlotPayload = {
  id: string;
  name: string;
  start: string;
  end: string;
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_BODY_SIZE = 1024 * 1024;

function isValidTime(value: unknown): value is string {
  return typeof value === "string" && timePattern.test(value);
}

function isValidName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 60;
}

function isSlot(value: unknown): value is SlotPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const slot = value as SlotPayload;
  return (
    typeof slot.id === "string" &&
    slot.id.length > 0 &&
    isValidName(slot.name) &&
    isValidTime(slot.start) &&
    isValidTime(slot.end)
  );
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ ok: false, error: "Non connecte." }, { status: 401 });
    }

    await ensureDatabaseSchema();
    const result = await query<{
      id: string;
      name: string;
      start_time: string;
      end_time: string;
    }>(
      `
        select id, name, start_time, end_time
        from off_peak_slots
        where user_id = $1
        order by start_time asc, created_at asc
      `,
      [user.id],
    );

    return Response.json({
      ok: true,
      slots: result.rows.map((slot) => ({
        id: slot.id,
        name: slot.name,
        start: slot.start_time,
        end: slot.end_time,
      })),
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const user = await requireCurrentUser();
  const rateLimit = await rateLimitByUser("slots:put", user.id, 30, 60 * 1000);
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
    const body = (await request.json()) as { slots?: unknown[] };
    const slots = Array.isArray(body.slots) ? body.slots.filter(isSlot) : [];

    await ensureDatabaseSchema();
    client = await getPool().connect();
    await client.query("begin");
    transactionStarted = true;
    await client.query("delete from off_peak_slots where user_id = $1", [user.id]);

    for (const slot of slots) {
      await client.query(
        `
          insert into off_peak_slots (id, user_id, name, start_time, end_time)
          values ($1, $2, $3, $4, $5)
        `,
        [slot.id, user.id, slot.name.trim(), slot.start, slot.end],
      );
    }

    await client.query("commit");

    return Response.json({ ok: true, saved: slots.length });
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
