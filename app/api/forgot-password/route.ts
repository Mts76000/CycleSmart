import { auth } from "@/lib/auth";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api-response";
import { validateBody } from "@/lib/validation";
import { forgotPasswordSchema } from "@/lib/validation-schemas";
import { createRateLimiter } from "@/lib/rate-limit";
import { requestMetadata } from "@/lib/audit-log";

const rateLimiter = createRateLimiter("forgot-password", 5, 60 * 15);

export const POST = withApiErrorHandling(async (request: Request) => {
  const { ip } = requestMetadata(request);
  const rateLimit = await rateLimiter.check(ip ?? "unknown");
  if (!rateLimit.success) {
    return apiError("RATE_LIMITED", "Trop de tentatives. Réessayez plus tard.");
  }

  const validation = await validateBody(forgotPasswordSchema, request);
  if (!validation.success) return validation.response;

  // Always return success regardless of whether the email exists, to avoid leaking
  // which addresses are registered.
  await auth.api
    .requestPasswordReset({ body: { email: validation.data.email, redirectTo: "/reset-password" } })
    .catch(() => {});

  return apiSuccess(null, "Si un compte existe avec cet email, un lien a été envoyé.");
});
