const CACHE_NAME = 'pt-nti-pwa-v2.0.0';
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./fasilitas.html",
  "./produk.html",
  "./pelanggan.html",
  "./rfq.html",
  "./kontak.html",
  "./produk-machining-presisi-spherical.html",
  "./produk-machining-pelat-cetakan.html",
  "./produk-machining-billet-kontur.html",
  "./produk-stamping-dies-heavy-duty.html",
  "./produk-mold-dies-cavity.html",
  "./produk-jig-inspection-fixture-a.html",
  "./produk-jig-inspection-fixture-b.html",
  "./produk-fabrikasi-rangka-mesin.html",
  "./produk-fabrikasi-meja-assembly.html",
  "./produk-fabrikasi-trolley-material.html",
  "./layanan-cnc-milling-3axis.html",
  "./layanan-cnc-bubut.html",
  "./layanan-milling-manual.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./assets/docs/CP_PT_NTI.pdf",
  "./assets/images/logo_pti.png",
  "./assets/images/icon-192.png",
  "./assets/images/icon-512.png",
  "./assets/images/machining_precision_1.jpg",
  "./assets/images/machining_precision_2.jpg",
  "./assets/images/machining_precision_3.jpg",
  "./assets/images/produk_dies_stamping_1.jpg",
  "./assets/images/produk_dies_cavity_2.jpg",
  "./assets/images/jig_inspection_fixture_1.jpg",
  "./assets/images/jig_inspection_fixture_2.jpg",
  "./assets/images/fabrikasi_rak_blue.jpg",
  "./assets/images/fabrikasi_rak_meja_susun.jpg",
  "./assets/images/fabrikasi_trolley_material.jpg",
  "./assets/images/cnc_milling_gut_3axis.jpg",
  "./assets/images/cnc_bubut_hision.jpg",
  "./assets/images/milling_manual.jpg"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => caches.match('./index.html')))
  );
});
