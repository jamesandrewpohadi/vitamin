/* Bump VERSION whenever any precached file changes. Updates wait for all
   existing tabs/app windows to close, avoiding mixed old/new app versions. */
const VERSION = '3a3fbf770b77';
const CACHE_PREFIX = `daily-vitamins:${self.registration.scope}:`;
const CACHE_NAME = CACHE_PREFIX + VERSION;
const ASSETS = [
  "index.html",
  "style.css",
  "app.mjs",
  "tracker.mjs",
  "pwa.js",
  "manifest.webmanifest",
  "assets/icons/apple-touch-icon.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png"
];
const urls = ASSETS.map(asset => new URL(asset, self.registration.scope).href);
const shellURL = new URL('index.html', self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Reload bypasses the browser HTTP cache when installing a new release.
    await cache.addAll(urls.map(url => new Request(url, { cache: 'reload' })));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const cleanURL = url.origin + url.pathname;
  const appEntries = [self.registration.scope, shellURL];
  if (request.mode === 'navigate' && appEntries.includes(cleanURL)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match(shellURL)) || fetch(request);
    })());
  } else if (urls.includes(cleanURL)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match(cleanURL)) || fetch(request);
    })());
  }
});
