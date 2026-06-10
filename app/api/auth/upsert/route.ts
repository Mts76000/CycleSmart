import { ensureDatabaseSchema, query } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; name?: string };
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim() || "Utilisateur";

    if (!email || !email.includes("@")) {
      return Response.json({ ok: false, error: "Adresse e-mail invalide." }, { status: 400 });
    }

    await ensureDatabaseSchema();
    await query(
      `
        insert into users (email, name)
        values ($1, $2)
        on conflict (email)
        do update set name = excluded.name, updated_at = now()
      `,
      [email, name],
    );

    return Response.json({ ok: true, user: { email, name } });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}
