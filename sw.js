/* TechCampus — service worker : hors connexion + mises à jour.
   La constante VERSION est remplacée à chaque compilation : toute nouvelle version
   publiée est ainsi détectée par les appareils. */
const VERSION = "2026-10-05T20:55:40.742Z";
const APP_CACHE = "techcampus-app-" + VERSION;
const CONTENT_CACHE = "techcampus-content";
const PY_CACHE = "techcampus-pyodide-314.0.7";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon.svg", "./icons/icon-192.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_CACHE);
      await cache.addAll(CORE);
      // Pré-cache des fichiers JS/CSS référencés par index.html
      try {
        const html = await (await fetch("./index.html", { cache: "reload" })).text();
        const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => m[1]);
        await cache.addAll(assets);
      } catch (e) {
        /* hors ligne pendant l'installation */
      }
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k.startsWith("techcampus-app-") && k !== APP_CACHE) await caches.delete(k);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skip-waiting") self.skipWaiting();
});

async function networkFirst(req, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(fallbackUrl ?? req, res.clone());
    return res;
  } catch (e) {
    return (await cache.match(fallbackUrl ?? req)) || (await caches.match(req)) || Response.error();
  }
}

async function cacheFirst(req, cacheName) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) (await caches.open(cacheName)).put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreSearch: false });
  const net = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => hit || Response.error());
  return hit || net;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Python (Pyodide) et ses paquets : volumineux et versionnés → cache durable,
  // conservé d'une version de l'application à l'autre.
  if (url.pathname.includes("/pyodide/") || (url.hostname === "cdn.jsdelivr.net" && url.pathname.startsWith("/pyodide/"))) {
    event.respondWith(cacheFirst(req, PY_CACHE));
    return;
  }
  if (url.origin !== self.location.origin) return; // API Claude, documentation… : jamais mis en cache

  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req, APP_CACHE, "./index.html"));
    return;
  }
  if (url.pathname.includes("/assets/")) {
    event.respondWith(cacheFirst(req, APP_CACHE));
    return;
  }
  if (url.pathname.includes("/content/")) {
    // « Vérifier les mises à jour » demande explicitement la version réseau
    if (req.cache === "no-cache" || req.cache === "reload") event.respondWith(networkFirst(req, CONTENT_CACHE));
    else event.respondWith(staleWhileRevalidate(req, CONTENT_CACHE));
    return;
  }
  event.respondWith(staleWhileRevalidate(req, APP_CACHE));
});
