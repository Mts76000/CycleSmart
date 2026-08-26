import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { offPeakSlots } from "@/drizzle/schema";
import { requireAuth } from "@/lib/permissions";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api-response";
import { validateBody } from "@/lib/validation";
import { slotsSchema } from "@/lib/validation-schemas";
import { createRateLimiter } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const rateLimiter = createRateLimiter("slots-put", 120, 60);

export const GET = withApiErrorHandling(async () => {
  const session = await requireAuth();

  const slots = await db
    .select({
      id: offPeakSlots.id,
      name: offPeakSlots.name,
      start: offPeakSlots.startTime,
      end: offPeakSlots.endTime,
    })
    .from(offPeakSlots)
    .where(eq(offPeakSlots.userId, session.user.id))
    .orderBy(asc(offPeakSlots.startTime), asc(offPeakSlots.createdAt));

  return apiSuccess({ slots });
});

export const PUT = withApiErrorHandling(async (request: Request) => {
  const session = await requireAuth();

  const rateLimit = await rateLimiter.check(session.user.id);
  if (!rateLimit.success) {
    return apiError("RATE_LIMITED", "Trop de modifications de créneaux. Réessayez plus tard.");
  }

  const validation = await validateBody(slotsSchema, request);
  if (!validation.success) return validation.response;

  // Defensive: a slot id should be unique within the same user's list.
  const seen = new Set<string>();
  const slots = validation.data.slots.filter((slot) => {
    if (seen.has(slot.id)) {
      logger.warn(
        { userId: session.user.id, slotId: slot.id },
        "Duplicate slot id in PUT /api/slots",
      );
      return false;
    }
    seen.add(slot.id);
    return true;
  });

  await db.transaction(async (tx) => {
    await tx.delete(offPeakSlots).where(eq(offPeakSlots.userId, session.user.id));

    if (slots.length > 0) {
      await tx.insert(offPeakSlots).values(
        slots.map((slot) => ({
          id: slot.id,
          userId: session.user.id,
          name: slot.name,
          startTime: slot.start,
          endTime: slot.end,
        })),
      );
    }
  });

  return apiSuccess({ saved: slots.length });
});
