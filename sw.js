const CACHE_NAME = 'pt-nti-pwa-v4.0.0';

const PRECACHE_ASSETS = [
  './',
  './style.css?v=4.0.0',
  './app.js?v=4.0.0',
  './manifest.json',
  './assets/docs/CP_PT_NTI.pdf',
  './assets/images/logo_pti.png',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
  './assets/images/machining_precision_1.jpg',
  './assets/images/machining_precision_2.jpg',
  './assets/images/machining_precision_3.jpg',
  './assets/images/produk_dies_stamping_1.jpg',
  './assets/images/produk_dies_cavity_2.jpg',
  './assets/images/jig_inspection_fixture_1.jpg',
  './assets/images/jig_inspection_fixture_2.jpg',
  './assets/images/fabrikasi_rak_blue.jpg',
  './assets/images/fabrikasi_rak_meja_susun.jpg',
  './assets/images/fabrikasi_trolley_material.jpg',
  './assets/images/cnc_milling_gut_3axis.jpg',
  './assets/images/cnc_bubut_hision.jpg',
  './assets/images/milling_manual.jpg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Network-first for HTML navigation, CSS, and JS to prevent stale cache bugs
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('./')))
    );
    return;
  }

  // Cache-first for images and PDFs
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
