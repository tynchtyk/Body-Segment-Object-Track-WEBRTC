const cacheName = 'pwa-conf-v1';
const staticAssets = [
  './',
  './index.html',
  './webrtc.js',
  './utils.js',
  './favicon.ico'
];

self.addEventListener('install', async event => {
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
  });
  
  // Optional: clents.claim() makes the service worker take over the current page
  // instead of waiting until next load. Useful if you have used SW to prefetch content
  // that's needed on other routes. But potentially dangerous as you are still running the
  // previous version of the app, but with new resources.
  self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
  });
  
  self.addEventListener('fetch', event => {
    const req = event.request;
  
    if (/.*(json)$/.test(req.url)) {
      event.respondWith(networkFirst(req));
    } else {
      event.respondWith(cacheFirst(req));
    }
  });
  
  async function cacheFirst(req) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(req);
    return cachedResponse || networkFirst(req);
  }
  
  async function networkFirst(req) {
    const cache = await caches.open(cacheName);
    try {
      const fresh = await fetch(req);
      cache.put(req, fresh.clone());
      return fresh;
    } catch (e) {
      const cachedResponse = await cache.match(req);
      return cachedResponse;
    }
  }
  