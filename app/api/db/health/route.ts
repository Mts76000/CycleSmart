import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessionSecretLength = process.env.SESSION_SECRET?.trim().length || 0;

  try {
    const result = await query<{ now: string; database: string }>(
      "select now()::text as now, current_database() as database",
    );

    return Response.json({
      ok: true,
      database: result.rows[0]?.database,
      now: result.rows[0]?.now,
      sessionSecretConfigured: sessionSecretLength >= 32,
      sessionSecretLength,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown database error",
        sessionSecretConfigured: sessionSecretLength >= 32,
        sessionSecretLength,
      },
      { status: 500 },
    );
  }
}
