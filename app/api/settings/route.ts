import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { cycleDevices, cyclePreferences, type CycleProgram } from "@/drizzle/schema";
import { requireAuth } from "@/lib/permissions";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api-response";
import { validateBody } from "@/lib/validation";
import { settingsSchema } from "@/lib/validation-schemas";
import { createRateLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const rateLimiter = createRateLimiter("settings-put", 120, 60);

export const GET = withApiErrorHandling(async () => {
  const session = await requireAuth();

  const [devices, [preferences]] = await Promise.all([
    db
      .select({
        id: cycleDevices.id,
        name: cycleDevices.name,
        programs: cycleDevices.programs,
        builtIn: cycleDevices.builtIn,
      })
      .from(cycleDevices)
      .where(eq(cycleDevices.userId, session.user.id))
      .orderBy(asc(cycleDevices.sortOrder), asc(cycleDevices.createdAt)),
    db
      .select({
        selectedProgramId: cyclePreferences.selectedProgramId,
        duration: cyclePreferences.duration,
        calculationMode: cyclePreferences.calculationMode,
      })
      .from(cyclePreferences)
      .where(eq(cyclePreferences.userId, session.user.id))
      .limit(1),
  ]);

  if (!preferences && devices.length === 0) {
    return apiSuccess({ settings: null });
  }

  return apiSuccess({
    settings: {
      machines: devices,
      duration: preferences?.duration,
      selectedProgramId: preferences?.selectedProgramId,
      calculationMode: preferences?.calculationMode,
    },
  });
});

export const PUT = withApiErrorHandling(async (request: Request) => {
  const session = await requireAuth();

  const rateLimit = await rateLimiter.check(session.user.id);
  if (!rateLimit.success) {
    return apiError("RATE_LIMITED", "Trop de modifications de réglages. Réessayez plus tard.");
  }

  const validation = await validateBody(settingsSchema, request);
  if (!validation.success) return validation.response;
  const { machines, duration, calculationMode } = validation.data;

  const allProgramIds = machines.flatMap((machine) =>
    machine.programs.map((program) => program.id),
  );
  const selectedProgramId = allProgramIds.includes(validation.data.selectedProgramId ?? "")
    ? validation.data.selectedProgramId!
    : (allProgramIds[0] ?? null);

  await db.transaction(async (tx) => {
    await tx.delete(cycleDevices).where(eq(cycleDevices.userId, session.user.id));

    await tx.insert(cycleDevices).values(
      machines.map((machine, index) => ({
        id: machine.id,
        userId: session.user.id,
        name: machine.name,
        programs: machine.programs as CycleProgram[],
        builtIn: machine.builtIn,
        sortOrder: index,
      })),
    );

    await tx
      .insert(cyclePreferences)
      .values({
        userId: session.user.id,
        selectedProgramId,
        duration,
        calculationMode,
      })
      .onConflictDoUpdate({
        target: cyclePreferences.userId,
        set: { selectedProgramId, duration, calculationMode, updatedAt: new Date() },
      });
  });

  return apiSuccess({ saved: machines.length });
});
