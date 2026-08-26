# syntax=docker/dockerfile:1

FROM node:26-alpine AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --include=dev overrides an ambient NODE_ENV=production (e.g. Coolify's build-time env
# vars) that would otherwise make npm silently skip devDependencies — breaking both the
# "prepare" script (husky) and `next build` itself (needs typescript, eslint, etc.).
RUN npm ci --include=dev

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time env vars: only what's needed to satisfy lib/env.ts during `next build`.
# Real secrets are injected at runtime by Coolify, not baked into the image.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_IS_PREVIEW
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runtime ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# curl: Coolify's own healthcheck probe (separate from the HEALTHCHECK instruction below)
# tries curl first, falling back to busybox's wget — this image only has the latter by
# default. Installing curl lets Coolify's probe (and ours) use whichever it prefers.
RUN apk add --no-cache curl

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
# drizzle-orm isn't traced into the Next.js standalone bundle (it's webpacked into the app's
# own server chunks, not kept as a real node_modules package) — the migration script run at
# container startup needs it as an actual importable package. Zero runtime deps of its own.
COPY --from=deps /app/node_modules/drizzle-orm ./node_modules/drizzle-orm

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

# Runs drizzle migrations against DATABASE_URL before starting the server, so every deploy
# converges the prod schema automatically instead of relying on a manual `db:migrate` run.
# Plain JS (drizzle/migrate-prod.mjs), not the tsx-based db:migrate script, since this image
# has no devDependencies.
CMD ["sh", "-c", "node drizzle/migrate-prod.mjs && node server.js"]
