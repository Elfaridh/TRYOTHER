const CACHE='sarpras-v1';
const ASSETS=[
  './','./index.html','./login.html','./lokasi.html','./aset.html','./pemeliharaan.html','./mutasi.html','./laporan.html',
  './css/style.css','./manifest.json','./assets/logo-daarul-amiin.svg',
  './js/db.js','./js/auth.js','./js/common.js','./js/dashboard.js','./js/lokasi.js','./js/aset.js','./js/pemeliharaan.js','./js/mutasi.js','./js/laporan.js','./js/export.js',
  './data/template-aset.csv','./data/template-aset.xls'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;}).catch(()=>caches.match('./index.html')))));
