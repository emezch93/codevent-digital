// sw.js — CodeVent Digital Service Worker
const CACHE = 'codevent-v1';

const PRECACHE = [
  '/codevent-digital/',
  '/codevent-digital/index.html',
  '/codevent-digital/learning.html',
  '/codevent-digital/community.html',
  '/codevent-digital/testimonial.html',
  '/codevent-digital/shop.html',
  '/codevent-digital/auth.js',
  '/codevent-digital/firebase-config.js',
  '/codevent-digital/icons/icon-192.png',
  '/codevent-digital/icons/icon-512.png',
];

// Install — cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate — clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', e => {
  // Skip Firebase and external requests
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
