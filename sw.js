/**
 * CodeVent Digital — sw.js
 * Registered as: /codevent-digital/sw.js  (matches your index.html exactly)
 *
 * Cache-First  → static assets (CSS, JS, images, fonts, icons)
 * Network-First → HTML pages (always try fresh, fall back to cache, then offline.html)
 * Auto-update  → skipWaiting + clientsClaim (zero stale activations)
 */

const CACHE_VERSION = 'cv-v1';
const SHELL_CACHE   = `codevent-shell-${CACHE_VERSION}`;
const PAGES_CACHE   = `codevent-pages-${CACHE_VERSION}`;
const ALL_CACHES    = [SHELL_CACHE, PAGES_CACHE];

/* Pages & assets to pre-cache on install */
const SHELL_ASSETS = [
  'index.html',
  'learning.html',
  'community.html',
  'testimonial.html',
  'shop.html',
  'contact.html',
  'offline.html',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
];

/* ── Install ─────────────────────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS.map(url =>
        new Request(url, { cache: 'reload' })
      )))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: delete old caches ─────────────────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !ALL_CACHES.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch ───────────────────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!['http:', 'https:'].includes(url.protocol)) return;

  /* External origins (Google Fonts, Firebase, CDNs, WhatsApp…) — network only */
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request).catch(() => new Response('', { status: 503 }))
    );
    return;
  }

  const isHTML = request.headers.get('accept')?.includes('text/html');

  event.respondWith(isHTML ? networkFirst(request) : cacheFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request)
      || await (await caches.open(SHELL_CACHE)).match(request);
    if (cached) return cached;
    return (await caches.open(SHELL_CACHE)).match('offline.html');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return new Response('Asset unavailable offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/* ── Listen for SKIP_WAITING message from pwa-register.js ───────────── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

/* ── Push Notifications (future-ready) ──────────────────────────────── */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'CodeVent Digital', {
      body:  data.body || 'New update from CodeVent!',
      icon:  'icons/icon-192x192.png',
      badge: 'icons/icon-96x96.png',
      data:  { url: data.url || 'index.html' }
    })
  );
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || 'index.html'));
});
