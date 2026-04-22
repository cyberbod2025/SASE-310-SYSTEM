const CACHE_NAME = "sase-cache-v4.3";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/assets/branding/SASE_ICON_PREMIUM.png",
  "/sase-orb.splinecode"
];
const DEV_PORTS = new Set(["3100", "3101", "5173"]);
const isDevRuntime =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1" ||
  /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(self.location.hostname) ||
  DEV_PORTS.has(self.location.port);

// Instalación: Cachear activos básicos
self.addEventListener("install", (event) => {
  self.skipWaiting(); 

  if (isDevRuntime) {
    event.waitUntil(Promise.resolve());
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
});

// Activación: Purga total de TODAS las versiones anteriores
self.addEventListener("activate", (event) => {
  if (isDevRuntime) {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }).then(() => self.registration.unregister())
    );
    return;
  }

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Network First para HTML/Navegación, Cache First para el resto
self.addEventListener("fetch", (event) => {
  if (isDevRuntime) {
    return;
  }

  const isNavigation = event.request.mode === "navigate" || 
                      event.request.url.endsWith(".html") ||
                      event.request.url === self.location.origin + "/";

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((netRes) => {
          // No cacheamos dinámicamente archivos grandes o scripts críticos para evitar hashes huérfanos
          return netRes;
        }).catch(() => response);
      })
    );
  }
});
