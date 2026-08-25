import { query } from "@/lib/db";
import { rateLimitByIp, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  const rateLimit = await rateLimitByIp("health", 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfter);
  }

  try {
    await query("select 1");

    return Response.json({
      ok: true,
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
