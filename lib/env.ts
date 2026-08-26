import { z } from "zod";

// Treats an empty string the same as "unset" for optional vars (a var left blank in
// .env.local, e.g. `UPSTASH_REDIS_REST_URL=`, should not fail format validation like z.url()).
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.url(),
  // Set to "true" on the Coolify preview/staging environment (see README) to force
  // noindex regardless of NODE_ENV, which is "production" there too.
  NEXT_PUBLIC_IS_PREVIEW: optional(z.enum(["true", "false"])),

  DATABASE_URL: z.url(),

  BETTER_AUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  NEXT_PUBLIC_UMAMI_WEBSITE_ID: optional(z.string().min(1)),

  RESEND_API_KEY: z.string().min(1),
  CONTACT_EMAIL: z.email(),

  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),

  CRON_SECRET: z.string().min(16),

  UPSTASH_REDIS_REST_URL: optional(z.url()),
  UPSTASH_REDIS_REST_TOKEN: optional(z.string().min(1)),
});

export type Env = z.infer<typeof envSchema>;

// Exported for unit testing the schema in isolation (see tests/unit/env.test.ts) without
// re-importing this module under different process.env values.
export { envSchema };

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid environment variables:", z.treeifyError(parsed.error));
    throw new Error("Invalid environment variables. Check the errors above and your .env file.");
  }

  return parsed.data;
}

export const env = loadEnv();
