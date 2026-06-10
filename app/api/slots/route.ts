import { ensureDatabaseSchema, getPool, query } from "../../../lib/db";
import { getCurrentUser, requireCurrentUser } from "../../../lib/current-user";

export const dynamic = "force-dynamic";

type SlotPayload = {
  id: string;
  name: string;
  start: string;
  end: string;
};

function isSlot(value: unknown): value is SlotPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const slot = value as SlotPayload;
  return Boolean(slot.id && slot.name && slot.start && slot.end);
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
  const client = await getPool().connect();

  try {
    const user = await requireCurrentUser();
    const body = (await request.json()) as { slots?: unknown[] };
    const slots = Array.isArray(body.slots) ? body.slots.filter(isSlot) : [];

    await ensureDatabaseSchema();
    await client.query("begin");
    await client.query("delete from off_peak_slots where user_id = $1", [user.id]);

    for (const slot of slots) {
      await client.query(
        `
          insert into off_peak_slots (id, user_id, name, start_time, end_time)
          values ($1, $2, $3, $4, $5)
        `,
        [slot.id, user.id, slot.name, slot.start, slot.end],
      );
    }

    await client.query("commit");

    return Response.json({ ok: true, saved: slots.length });
  } catch (error) {
    await client.query("rollback");

    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return Response.json({ ok: false, error: "Non connecte." }, { status: 401 });
    }

    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
