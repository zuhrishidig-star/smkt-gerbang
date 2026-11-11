/* Service worker Gerbang SMKT: menyimpan tampilan aplikasi agar tetap
 * terbuka saat sinyal di gerbang hilang. Data scan tidak lewat sini —
 * antrean scan disimpan oleh app.js dan kios.js.
 * Model wajah (vendor/mediapipe, ±27 MB) sengaja tidak dipasang di awal:
 * tersimpan otomatis saat kios pertama kali dibuka. */
const CACHE = 'smkt-gerbang-v22';
const ASET = [
  './', 'index.html', 'style.css', 'tema.css', 'config.js', 'app.js', 'manifest.webmanifest',
  'tatib.html', 'tatib.css', 'tatib.js',
  'kios.html', 'kios.css', 'kios.js', 'vendor/jsQR.js',
  'vendor/html5-qrcode.min.js',
  'fonts/plus-jakarta-sans-latin-500-normal.woff2',
  'fonts/plus-jakarta-sans-latin-700-normal.woff2',
  'fonts/plus-jakarta-sans-latin-800-normal.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/logo-64.png', 'icons/logo-128.png', 'icons/logo-256.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASET)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Jaringan dulu (perubahan config.js langsung terpakai), cadangan dari cache saat offline.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) { const salin = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, salin)); }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then((r) => r || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
