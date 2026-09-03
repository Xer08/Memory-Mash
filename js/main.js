const CACHE_NAME = "rune-clash-v8";
const ASSETS = [
  "./", "./index.html", "./manifest.json",
  "./css/theme.css", "./css/board.css", "./css/effects.css",
  "./js/state.js", "./js/juiciness.js", "./js/combat.js", "./js/hero.js",
  "./js/board.js", "./js/dungeon.js", "./js/main.js",
  "./icon-192.png", "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Network First para HTML/CSS/JS: evita que GitHub Pages quede atrapado
// mostrando una versión vieja después de un deploy. Si no hay red, usamos caché.
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isAppCode = /\.(html?|css|js)$/.test(url.pathname) || request.mode === "navigate";

  event.respondWith(
    (isAppCode ? fetch(request, { cache: "no-store" }) : caches.match(request))
      .then(response => {
        if (response) {
          if (isAppCode && response.ok) {
            const clone = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, clone)));
          }
          return response;
        }
        return fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, clone)));
          }
          return networkResponse;
        });
      })
      .catch(() => caches.match(request).then(cached => {
        if (cached) return cached;
        if (request.mode === "navigate") return caches.match("./index.html");
        return new Response("Recurso no disponible sin conexión.", { status: 503 });
      }))
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CLEAR_CACHE") {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))));
  }
});
