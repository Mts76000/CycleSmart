import type { NextConfig } from "next";

// Self-hosted Umami: derive its origin from the script URL so the CSP allows whatever
// instance/domain this deployment points at, instead of hardcoding a fixed host.
function umamiOrigin(): string | null {
  if (!process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL) return null;
  try {
    return new URL(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL).origin;
  } catch {
    return null;
  }
}

// CSP whitelist rationale:
// - 'self' + inline styles/scripts: Next.js/Tailwind require these for hydration + the
//   theme-init script in app/layout.tsx.
// - Umami origin: self-hosted analytics script (lib/umami.ts), domain varies per deployment.
// - challenges.cloudflare.com: Turnstile widget + its iframe challenge.
// - accounts.google.com: Google OAuth (better-auth socialProviders.google).
// - 'unsafe-eval' in script-src: non-production only. React dev mode (`next dev`, which
//   also backs the "test" env used by Playwright's webServer — see playwright.config.ts)
//   uses eval() to reconstruct callstacks across environments (Fast Refresh, component
//   stacks); it never does in a production build, so this is left out of the prod CSP.
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  process.env.NODE_ENV !== "production" ? "'unsafe-eval'" : null,
  umamiOrigin(),
  "https://challenges.cloudflare.com",
]
  .filter(Boolean)
  .join(" ");

const connectSrc = ["'self'", umamiOrigin()].filter(Boolean).join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  `connect-src ${connectSrc}`,
  "frame-src https://challenges.cloudflare.com https://accounts.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Lean production image for the multi-stage Dockerfile (see Dockerfile).
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      // Google account avatars (better-auth Google OAuth profile images)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
