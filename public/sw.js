const CACHE_NAME = 'pwa-cache-v2';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of STATIC_FILES) {
        try {
          await cache.add(url);
          console.log(`[Service Worker] Cached static: ${url}`);
        } catch (err) {
          console.warn(`[Service Worker] Failed to cache static: ${url}`, err);
        }
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Handle API GET requests
  if (requestUrl.pathname.startsWith('/api/') && event.request.method === 'GET') {
    event.respondWith(
      caches.open('api-cache').then(async (cache) => {
        try {
          const response = await fetch(event.request);
          cache.put(event.request, response.clone());
          return response;
        } catch (err) {
          console.warn('API fetch failed, using cache', err);
          return cache.match(event.request);
        }
      })
    );
    return; // IMPORTANT: exit early if handled
  }

  // Handle all other static GET requests
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
