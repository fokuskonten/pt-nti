const CACHE_NAME = 'pt-nti-pwa-v1.0.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './assets/catalog.json',
  './assets/docs/CP_PT_NTI.pdf',
  './assets/images/logo_pti.png',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
  './assets/images/cnc_bubut_hision.jpg',
  './assets/images/cnc_milling_gut_3axis.jpg',
  './assets/images/milling_manual.jpg',
  './assets/images/machining_precision_1.jpg',
  './assets/images/machining_precision_2.jpg',
  './assets/images/machining_precision_3.jpg',
  './assets/images/produk_dies_stamping_1.jpg',
  './assets/images/produk_dies_cavity_2.jpg',
  './assets/images/jig_inspection_fixture_1.jpg',
  './assets/images/jig_inspection_fixture_2.jpg',
  './assets/images/fabrikasi_rak_blue.jpg',
  './assets/images/fabrikasi_rak_meja_susun.jpg',
  './assets/images/fabrikasi_trolley_material.jpg'
];

// Install Event - Pre-cache critical application assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
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

// Fetch Event - Cache-First strategy with Network Fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip external WhatsApp or non-HTTP protocols
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately
        return cachedResponse;
      }

      // If not in cache, fetch from network and store in cache
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback for navigation requests when completely offline
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
