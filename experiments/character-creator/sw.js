const CACHE = 'creator-v1';
const FILES = ['./','./index.html','./manifest.json','./img/icon-180.png','./img/icon-192.png','./img/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(FILES.map(f => c.add(f)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (isFont) { e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const c=r.clone(); caches.open(CACHE).then(x=>x.put(req,c)); return r; }).catch(()=>hit))); return; }
  if (url.origin === location.origin) { e.respondWith(fetch(req).then(r => { if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c));} return r; }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html')))); }
});
