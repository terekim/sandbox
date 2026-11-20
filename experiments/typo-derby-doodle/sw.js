const CACHE = 'derby-doodle-v1';

// App shell. The gang is generated SVG inside gang.js and every passage lives
// in index.html, so these few files are all the game needs to run offline.
const FILES = [
  './',
  './index.html',
  './gang.js',
  './manifest.json',
  './img/icon-180.png',
  './img/icon-192.png',
  './img/icon-512.png'
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
      .then(k => Promise.all(k.filter(x => x.startsWith('derby-doodle-') && x !== CACHE).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  // Google Fonts: cache first, so the fonts survive offline after one online load.
  if (isFont) {
    e.respondWith(
      caches.match(req).then(hit =>
        hit || fetch(req).then(r => {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return r;
        }).catch(() => hit)
      )
    );
    return;
  }

  // Same origin: network first, then cache, then the app shell.
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(r => {
        if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return r;
      }).catch(() =>
        caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))
      )
    );
  }
});
