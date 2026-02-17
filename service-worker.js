const CACHE = 'sarpras-v4';
const ASSETS = [
  './',
  './index.html',
  './login.html',
  './lokasi.html',
  './aset.html',
  './pemeliharaan.html',
  './mutasi.html',
  './laporan.html',
  './settings.html',
  './css/style.css',
  './manifest.json',
  './assets/logo-daarul-amiin.svg',
  './js/db.js',
  './js/auth.js',
  './js/common.js',
  './js/dashboard.js',
  './js/lokasi.js',
  './js/aset.js',
  './js/pemeliharaan.js',
  './js/mutasi.js',
  './js/laporan.js',
  './js/settings.js',
  './js/export.js',
  './data/template-aset.csv',
  './data/template-aset.xls'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./login.html')))
  );
});
