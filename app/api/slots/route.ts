import { ensureDatabaseSchema, getPool, query } from "../../../lib/db";

export const dynamic = "force-dynamic";

type SlotPayload = {
  id: string;
  name: string;
  start: string;
  end: string;
};

function normalizeEmail(email: string | null) {
  return email?.trim().toLowerCase() || "";
}

function isSlot(value: unknown): value is SlotPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const slot = value as SlotPayload;
  return Boolean(slot.id && slot.name && slot.start && slot.end);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = normalizeEmail(url.searchParams.get("email"));

    if (!email) {
      return Response.json({ ok: false, error: "Email manquant." }, { status: 400 });
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
        where user_email = $1
        order by start_time asc, created_at asc
      `,
      [email],
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
    const body = (await request.json()) as { email?: string; name?: string; slots?: unknown[] };
    const email = normalizeEmail(body.email || null);
    const name = body.name?.trim() || "Utilisateur";
    const slots = Array.isArray(body.slots) ? body.slots.filter(isSlot) : [];

    if (!email) {
      return Response.json({ ok: false, error: "Email manquant." }, { status: 400 });
    }

    await ensureDatabaseSchema();
    await client.query("begin");
    await client.query(
      `
        insert into users (email, name)
        values ($1, $2)
        on conflict (email)
        do update set name = excluded.name, updated_at = now()
      `,
      [email, name],
    );
    await client.query("delete from off_peak_slots where user_email = $1", [email]);

    for (const slot of slots) {
      await client.query(
        `
          insert into off_peak_slots (id, user_email, name, start_time, end_time)
          values ($1, $2, $3, $4, $5)
        `,
        [slot.id, email, slot.name, slot.start, slot.end],
      );
    }

    await client.query("commit");

    return Response.json({ ok: true, saved: slots.length });
  } catch (error) {
    await client.query("rollback");

    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
