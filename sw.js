const CACHE_NAME = 'assistant-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // External Libraries
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://unpkg.com/dexie@latest/dist/dexie.js',
  'https://unpkg.com/tabulator-tables@5.5.0/dist/css/tabulator_modern.min.css',
  'https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js'
];

// 1. Install Event: Cache all essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching shell assets');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activate Event: Cleanup old caches if version changes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 3. Fetch Event: Network-First strategy for Data, Cache-First for Assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If the request is for your Google Script Data, try Network first
  if (url.hostname.includes('google.com') || url.hostname.includes('googleusercontent.com')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // For app assets (Vue, Tabulator, CSS), use Cache-First
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});