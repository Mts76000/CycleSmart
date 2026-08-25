import { headers } from "next/headers";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitBucket>();

function getKey(prefix: string, identifier: string) {
  return `${prefix}:${identifier}`;
}

function cleanExpired(now: number) {
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt < now) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  prefix: string,
  identifier: string,
  maxRequests: number,
  windowMs: number,
) {
  const now = Date.now();
  cleanExpired(now);

  const key = getKey(prefix, identifier);
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export async function getClientIp() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = headerStore.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export async function rateLimitByIp(
  prefix: string,
  maxRequests: number,
  windowMs: number,
) {
  const ip = await getClientIp();

  if (ip === "127.0.0.1" || ip === "::1" || ip === "unknown") {
    return { allowed: true, retryAfter: 0 };
  }

  return checkRateLimit(prefix, ip, maxRequests, windowMs);
}

export async function rateLimitByUser(
  prefix: string,
  userId: string,
  maxRequests: number,
  windowMs: number,
) {
  const ip = await getClientIp();
  const identifier = `${userId}:${ip}`;
  return checkRateLimit(prefix, identifier, maxRequests, windowMs);
}

export function rateLimitResponse(retryAfter: number) {
  return Response.json(
    {
      ok: false,
      error: `Trop de requetes. Reessaie dans ${retryAfter} secondes.`,
    },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
