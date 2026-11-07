// Keeps the app itself available offline. Photos and orders live in
// IndexedDB on the device and never pass through here.
const CACHE = 'catalog-shell-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      if (hit) {
        // Refresh the cached copy in the background so a new version is
        // picked up the next time the app is opened.
        fetch(e.request)
          .then((res) => {
            if (res && res.ok) caches.open(CACHE).then((c) => c.put(e.request, res));
          })
          .catch(() => {});
        return hit;
      }
      return fetch(e.request).catch(() => caches.match('./index.html'));
    })
  );
});
