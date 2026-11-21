const CACHE = 'tas-v1';
// App shell: every image, the stories (inside index.html) and the online library.
// Quick races and the daily story work fully offline once this is cached.
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./vendor/trystero-nostr.js",
  "./img/av1.webp",
  "./img/av2.webp",
  "./img/av3.webp",
  "./img/av4.webp",
  "./img/av5.webp",
  "./img/av6.webp",
  "./img/av7.webp",
  "./img/av8.webp",
  "./img/av9.webp",
  "./img/avatar.webp",
  "./img/blue.webp",
  "./img/bump1.webp",
  "./img/bump2.webp",
  "./img/bush.webp",
  "./img/cactus.webp",
  "./img/enter_key.webp",
  "./img/green.webp",
  "./img/lb_blue.webp",
  "./img/lb_green.webp",
  "./img/lb_orange.webp",
  "./img/lb_yellow.webp",
  "./img/lf_c01.webp",
  "./img/lf_c03.webp",
  "./img/lf_c04.webp",
  "./img/lf_c05.webp",
  "./img/lf_c06.webp",
  "./img/lf_c07.webp",
  "./img/lf_c08.webp",
  "./img/lf_c09.webp",
  "./img/lf_c10.webp",
  "./img/lf_c11.webp",
  "./img/lf_c12.webp",
  "./img/lf_c13.webp",
  "./img/lf_c14.webp",
  "./img/lf_c15.webp",
  "./img/lf_c16.webp",
  "./img/lf_me.webp",
  "./img/lobby_scene.webp",
  "./img/mound.webp",
  "./img/orange.webp",
  "./img/purple.webp",
  "./img/rock.webp",
  "./img/sand.webp",
  "./img/start_scene.webp",
  "./img/start_title.webp",
  "./img/timer.webp",
  "./img/title.webp",
  "./img/icon-180.png",
  "./img/icon-192.png",
  "./img/icon-512.png"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(FILES.map(f => c.add(f)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith('tas-') && x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; }).catch(() => hit)));
    return;
  }
  if (url.origin === location.origin) {
    // network first so updates arrive, cache when offline
    e.respondWith(fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
  }
});
