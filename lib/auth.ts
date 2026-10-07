import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendChangeEmailVerification,
  sendSignupAdminNotification,
} from "@/lib/email";
import { getClientIp, logAuditEvent } from "@/lib/audit-log";

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg" }),

  // These flows go through our own routes (/api/register, /api/login, /api/forgot-password),
  // which add Turnstile + per-IP/per-email rate limiting. Disabling the native HTTP
  // endpoints stops anyone from calling them directly to skip those checks. Server-side
  // `auth.api.*` calls bypass the router, so our routes keep working.
  disabledPaths: ["/sign-up/email", "/sign-in/email", "/request-password-reset"],

  rateLimit: {
    customRules: {
      // Still public (resend button on /verify-email): cap it to limit email spam.
      "/send-verification-email": { window: 60 * 60, max: 5 },
    },
  },

  advanced: {
    // Same rule as getClientIp(): X-Real-IP is set by the reverse proxy, whereas the
    // first X-Forwarded-For entry is client-controlled.
    ipAddress: { ipAddressHeaders: ["x-real-ip"] },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 60, // 1h
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60, // 1h
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false, // never settable by the client
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        await sendChangeEmailVerification(user.email, newEmail, url);
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (used when rememberMe is true)
    updateAge: 60 * 60 * 24, // refresh once per day of activity
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await sendSignupAdminNotification(user.email, user.name);
        },
      },
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/change-password") {
        const session = ctx.context.newSession ?? ctx.context.session;
        if (session) {
          await logAuditEvent({
            userId: session.user.id,
            action: "user.change_password",
            entityType: "user",
            entityId: session.user.id,
            ip: ctx.request ? getClientIp(ctx.request.headers) : null,
            userAgent: ctx.request?.headers.get("user-agent") ?? null,
          });
        }
      }
    }),
  },
});

export type Session = typeof auth.$Infer.Session;
