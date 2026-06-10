import { query } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await query<{ now: string; database: string }>(
      "select now()::text as now, current_database() as database",
    );

    return Response.json({
      ok: true,
      database: result.rows[0]?.database,
      now: result.rows[0]?.now,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    );
  }
}
