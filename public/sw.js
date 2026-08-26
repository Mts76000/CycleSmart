const CACHE = "cyclesmart-cache-v3";

const APP_ROUTES = [
  "/",
  "/calculer",
  "/creneaux",
  "/machines",
  "/profil",
  "/connexion",
  "/inscription",
];

const PRECACHE_URLS = [
  ...APP_ROUTES,
  "/manifest.webmanifest",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/screenshot-mobile.png",
  "/screenshot-wide.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map((url) =>
            cache.add(new Request(url, { cache: "reload" })).catch(() => undefined),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))),
      )
      .then(() => self.clients.claim()),
  );
});

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function isAssetRequest(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:css|js|png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)
  );
}

function isPageRequest(request) {
  return request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
}

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE);
  const isPage = isPageRequest(request);

  try {
    const response = await fetch(request, {
      cache: isPage ? "no-store" : "default",
    });

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);

      if (fallback) {
        return fallback;
      }
    }

    return new Response("Page indisponible hors ligne.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }

  return response;
}

async function apiNetworkFirst(request) {
  const cache = await caches.open(CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return Response.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Hors ligne. Les donnees distantes sont indisponibles.",
        },
      },
      { status: 503 },
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !isSameOrigin(request)) {
    return;
  }

  const url = new URL(request.url);

  if (url.pathname === "/sw.js") {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(apiNetworkFirst(request));
    return;
  }

  if (isPageRequest(request)) {
    event.respondWith(networkFirst(request, "/calculer"));
    return;
  }

  if (isAssetRequest(url)) {
    event.respondWith(cacheFirst(request));
  }
});
