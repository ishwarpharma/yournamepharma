/*
 * IMPORTANT: Increase CACHE_VERSION whenever ishwarshopify.json or website
 * files change. The new cache is prepared, then users are asked to reload.
 */
const CACHE_VERSION = 'yournamepharma-v2';
const CACHE_NAME = `yournamepharma-${CACHE_VERSION}`;
const CORE_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './ishwarshopify.json',
  './manifest.json',
  './assets/favicon/favicon.ico',
  './assets/favicon/favicon.svg',
  './assets/favicon/favicon-16.png',
  './assets/favicon/favicon-32.png',
  './assets/favicon/favicon-48.png',
  './assets/favicon/favicon-64.png',
  './assets/favicon/favicon-128.png',
  './assets/favicon/apple-touch-icon.png',
  './assets/favicon/android-chrome-192.png',
  './assets/favicon/android-chrome-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const path of CORE_FILES) {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (response.ok) await cache.put(path, response);
      } catch (error) {
        // Keep installation resilient if one optional icon is unavailable.
        if (path === './index.html' || path === './app.js' || path === './ishwarshopify.json') throw error;
      }
    }
    // Cache the external libraries when reachable so the order catalogue
    // and PDF checkout can also work offline after the first online visit.
    const cdnFiles = [
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    ];
    for (const url of cdnFiles) {
      try {
        const response = await fetch(url, { mode: 'cors', cache: 'reload' });
        if (response.ok) await cache.put(url, response);
      } catch (_) {}
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('yournamepharma-') && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCsv = isSameOrigin && url.pathname.endsWith('/ishwarshopify.json');
  const isAppShell = isSameOrigin && (
    url.pathname.endsWith('/') ||
    /\.(html|css|js|json|ico|svg|png|webmanifest)$/i.test(url.pathname) ||
    isCsv
  );
  const isKnownCdn = url.hostname === 'cdnjs.cloudflare.com';
  const isImage = request.destination === 'image';
  if (!isAppShell && !isKnownCdn && !isImage) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: isCsv });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && (response.ok || response.type === 'opaque')) {
        await cache.put(request, response.clone());
        if (isImage) {
          const keys = await cache.keys();
          const imageKeys = keys.filter(key => key.destination === 'image');
          while (imageKeys.length > 180) {
            await cache.delete(imageKeys.shift());
          }
        }
      }
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        const offlinePage = await cache.match('./index.html');
        if (offlinePage) return offlinePage;
      }
      throw error;
    }
  })());
});
