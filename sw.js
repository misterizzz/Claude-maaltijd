/**
 * sw.js — Service Worker voor offline-first PWA
 *
 * Strategie: Cache-first met network fallback.
 * Alle app-bestanden worden bij installatie gecached zodat
 * de app volledig offline werkt.
 */

const CACHE_NAME = 'maaltijd-v1';

// Bestanden om te cachen bij installatie
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/crypto.js',
  '/js/db.js',
  '/js/export.js',
  '/js/app.js',
  '/manifest.json',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
];

/**
 * Install-event: cache alle benodigde bestanden.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Bestanden worden gecached...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // Forceer activatie zonder te wachten op andere tabs
        return self.skipWaiting();
      })
  );
});

/**
 * Activate-event: verwijder oude caches bij updates.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Oude cache verwijderd:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Neem direct controle over alle open pagina's
        return self.clients.claim();
      })
  );
});

/**
 * Fetch-event: cache-first strategie.
 * Probeer eerst uit cache te serveren, val terug op netwerk.
 */
self.addEventListener('fetch', (event) => {
  // Alleen GET-verzoeken cachen
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Niet in cache: probeer van het netwerk te laden
      return fetch(event.request)
        .then((networkResponse) => {
          // Bewaar een kopie in de cache voor toekomstig gebruik
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Als het netwerk ook niet beschikbaar is, toon een fallback
          // voor navigatie-verzoeken
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
    })
  );
});
