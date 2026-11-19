const CACHE = 'derby-v6';

// App shell: everything the game needs to run with no network.
// All passages and the daily-track logic already live inside index.html,
// so once these are cached, practice AND the daily race work fully offline.
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './img/icon-180.png',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/kart-thumbs.webp',
  './img/kart-pops.webp',
  './img/kart-birdie.webp',
  './img/kart-sir.webp',
  './img/kart-lil.webp',
  './img/big-thumbs.webp',
  './img/big-birdie.webp',
  './img/big-lil.webp',
  './img/big-pops.webp',
  './img/big-sir.webp',
  './img/gang.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(FILES.map(f => c.add(f))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isFont =
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  // Google Fonts: cache-first. After the first online load the typeface
  // persists, so the game keeps its look offline.
  if (isFont) {
    e.respondWith(
      caches.match(req).then(hit =>
        hit ||
        fetch(req).then(r => {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return r;
        }).catch(() => hit)
      )
    );
    return;
  }

  // Same-origin: network-first (so a new daily build arrives when online),
  // falling back to cache, then to the app shell when fully offline.
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(r => {
        if (r.ok) {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return r;
      }).catch(() =>
        caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))
      )
    );
  }
});
