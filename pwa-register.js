/**
 * CodeVent Digital — pwa-register.js  (v2 · all-in-one)
 *
 * Add ONE line to every HTML page, before </body>:
 *   <script src="/codevent-digital/pwa-register.js"></script>
 *
 * This file does EVERYTHING:
 *   1. Injects all <head> PWA meta tags + manifest link (no flash, runs early via document.write guard)
 *   2. Registers the Service Worker
 *   3. Handles auto-updates with a branded banner
 *   4. Shows the "Install App" badge (A2HS)
 */

(function () {
  'use strict';

  const BASE   = '/codevent-digital';
  const ICONS  = BASE + '/icons';

  /* ═══════════════════════════════════════════════════════════════════════
     1. HEAD TAG INJECTION
     Runs synchronously before DOMContentLoaded so tags are in <head>
     before the browser makes any sub-resource decisions.
  ═══════════════════════════════════════════════════════════════════════ */
  (function injectHead() {
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;

    // Skip if already injected (e.g. HMR / double-load guard)
    if (document.querySelector('link[rel="manifest"]')) return;

    const tags = [
      // Manifest
      { tag: 'link',  attrs: { rel: 'manifest', href: BASE + '/manifest.json' } },

      // Theme
      { tag: 'meta',  attrs: { name: 'theme-color', content: '#5b4cff' } },

      // Android / Chrome
      { tag: 'meta',  attrs: { name: 'mobile-web-app-capable', content: 'yes' } },

      // iOS Safari
      { tag: 'meta',  attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' } },
      { tag: 'meta',  attrs: { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' } },
      { tag: 'meta',  attrs: { name: 'apple-mobile-web-app-title', content: 'CodeVent' } },

      // Apple touch icons (iOS home screen)
      { tag: 'link',  attrs: { rel: 'apple-touch-icon', href: ICONS + '/icon-192x192.png' } },
      { tag: 'link',  attrs: { rel: 'apple-touch-icon', sizes: '152x152', href: ICONS + '/icon-152x152.png' } },
      { tag: 'link',  attrs: { rel: 'apple-touch-icon', sizes: '144x144', href: ICONS + '/icon-144x144.png' } },
      { tag: 'link',  attrs: { rel: 'apple-touch-startup-image', href: ICONS + '/icon-512x512.png' } },

      // Microsoft / PWA
      { tag: 'meta',  attrs: { name: 'msapplication-TileImage', content: ICONS + '/icon-144x144.png' } },
      { tag: 'meta',  attrs: { name: 'msapplication-TileColor', content: '#5b4cff' } },
      { tag: 'meta',  attrs: { name: 'msapplication-config',    content: 'none' } },

      // Favicon fallback
      { tag: 'link',  attrs: { rel: 'icon', type: 'image/png', sizes: '192x192', href: ICONS + '/icon-192x192.png' } },
    ];

    tags.forEach(({ tag, attrs }) => {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      head.appendChild(el);
    });
  })();


  /* ═══════════════════════════════════════════════════════════════════════
     2. SERVICE WORKER REGISTRATION
  ═══════════════════════════════════════════════════════════════════════ */
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(
        BASE + '/service-worker.js',
        { scope: BASE + '/' }
      );

      // Detect new SW waiting to activate
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(newWorker);
          }
        });
      });

      // When SW takes control, reload once to serve fresh cached content
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) { refreshing = true; window.location.reload(); }
      });

      // Poll for updates every 60 s while the tab is open
      setInterval(() => reg.update(), 60_000);

    } catch (err) {
      console.warn('[PWA] SW registration failed:', err);
    }
  });


  /* ═══════════════════════════════════════════════════════════════════════
     3. UPDATE BANNER
  ═══════════════════════════════════════════════════════════════════════ */
  function showUpdateBanner(newWorker) {
    if (document.getElementById('cv-update-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'cv-update-banner';
    banner.innerHTML =
      '<span>🚀 New version of CodeVent is ready!</span>' +
      '<button id="cv-update-btn">Update Now</button>' +
      '<button id="cv-dismiss-btn" aria-label="Dismiss">✕</button>';

    Object.assign(banner.style, {
      position: 'fixed', bottom: '1.25rem', left: '50%',
      transform: 'translateX(-50%)',
      background: '#5b4cff', color: '#fff',
      display: 'flex', alignItems: 'center', gap: '.75rem',
      padding: '.75rem 1.25rem', borderRadius: '.65rem',
      boxShadow: '0 4px 24px rgba(91,76,255,.45)',
      fontSize: '.88rem', fontFamily: 'system-ui,sans-serif',
      zIndex: '9999', whiteSpace: 'nowrap',
      maxWidth: 'calc(100vw - 2.5rem)'
    });

    ['cv-update-btn', 'cv-dismiss-btn'].forEach(id => {
      Object.assign(banner.querySelector('#' + id).style, {
        background: 'rgba(255,255,255,.2)', border: 'none',
        color: '#fff', padding: '.4rem .85rem',
        borderRadius: '.4rem', cursor: 'pointer',
        fontSize: '.85rem', fontWeight: '600'
      });
    });

    document.body.appendChild(banner);

    banner.querySelector('#cv-update-btn').onclick = () =>
      newWorker.postMessage({ type: 'SKIP_WAITING' });

    banner.querySelector('#cv-dismiss-btn').onclick = () =>
      banner.remove();
  }


  /* ═══════════════════════════════════════════════════════════════════════
     4. INSTALL BADGE (Add to Home Screen)
  ═══════════════════════════════════════════════════════════════════════ */
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBadge();
  });

  function showInstallBadge() {
    if (document.getElementById('cv-install-badge')) return;

    const badge = document.createElement('button');
    badge.id = 'cv-install-badge';
    badge.textContent = '⬇ Install App';
    badge.title = 'Install CodeVent Digital as an app';

    Object.assign(badge.style, {
      position: 'fixed', bottom: '1.25rem', right: '1.25rem',
      background: '#00e5a0', color: '#0d0f1a',
      border: 'none', padding: '.65rem 1.2rem',
      borderRadius: '99px', fontWeight: '700',
      fontSize: '.85rem', fontFamily: 'system-ui,sans-serif',
      cursor: 'pointer', boxShadow: '0 4px 18px rgba(0,229,160,.35)',
      zIndex: '9998', transition: 'opacity .2s'
    });

    badge.onmouseenter = () => badge.style.opacity = '.85';
    badge.onmouseleave = () => badge.style.opacity = '1';

    badge.onclick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') badge.remove();
      deferredPrompt = null;
    };

    document.body.appendChild(badge);
  }

  window.addEventListener('appinstalled', () => {
    const b = document.getElementById('cv-install-badge');
    if (b) b.remove();
    deferredPrompt = null;
  });

})();
