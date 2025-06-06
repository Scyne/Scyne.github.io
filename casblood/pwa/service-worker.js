const CACHE_NAME = 'glucose-pwa-v1';
const OFFLINE_URL = '/casblood/pwa/offline.html';
const PRECACHE_URLS = [
  '/casblood/pwa/',
  '/casblood/pwa/index.html',
  '/casblood/pwa/service-worker.js',
  '/casblood/pwa/manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js',
  'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse || Response.error();
      }
    })());
  } else {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      const networkResponsePromise = fetch(event.request);
      
      event.waitUntil((async () => {
        const networkResponse = await networkResponsePromise;
        await cache.put(event.request, networkResponse.clone());
      })());

      return cachedResponse || networkResponsePromise;
    })());
  }
});
