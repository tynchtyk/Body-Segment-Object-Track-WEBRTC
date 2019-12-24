const cacheName = 'pwa-conf-v1';
const staticAssets = [
  './',
  './index.html',
  './webrtc.js',
  './utils.js',
  '/favicon.ico',
  '/manifest.json',
  '/img/icons/icon-512x512.png'
];

self.addEventListener('install', async event => {
    const cache = await caches.open(cacheName); 
      await cache.addAll(staticAssets); 
  });
  
  self.addEventListener('fetch', async event => {
    const req = event.request;
  event.respondWith(cacheFirst(req));
  });

  async function cacheFirst(req) {
    const cache = await caches.open(cacheName); 
    const cachedResponse = await cache.match(req); 
    return cachedResponse || fetch(req); 
  }