/**
 * CodeVent Digital — pwa-register.js  (v3 · corrected)
 *
 * Add ONE line before </body> on every HTML page:
 *   <script src="pwa-register.js"></script>
 *
 * Your pages already have the <head> PWA meta tags and manifest link,
 * so this file ONLY handles:
 *   1. Service Worker registration (registers sw.js — matches your index.html)
 *   2. Auto-update banner when a new SW version is detected
 *   3. "Install App" badge (beforeinstallprompt / Add to Home Screen)
 *
 * NO duplicate <head> injection — your existing head tags are respected.
 */

(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  /* ── Resolve SW path relative to the page's own origin/scope ───────── */
  const SW_PATH = new URL('sw.js', document.baseURI).href;
  const SW_SCOPE = new URL('./', document.baseURI).href;

  /* ── 1. Register Service Worker ─────────────────────────────────────── */
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(SW_PATH, { scope: SW_SCOPE });

      /* Detect new SW installing */
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(newWorker);
          }
        });
      });

      /* When new SW takes control, reload once to serve fresh content */
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) { refreshing = true; window.location.reload(); }
      });

      /* Periodic update check every 60 s while tab is open */
      setInterval(() => reg.update(), 60_000);

    } catch (err) {
      console.warn('[PWA] SW registration failed:', err);
    }
  });

  /* ── 2. Update Banner ────────────────────────────────────────────────── */
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
      zIndex: '99999', whiteSpace: 'nowrap',
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
    banner.querySelector('#cv-update-btn').onclick = () => newWorker.postMessage({ type: 'SKIP_WAITING' });
    banner.querySelector('#cv-dismiss-btn').onclick = () => banner.remove();
  }

  /* ── 3. Install Badge (Add to Home Screen) ───────────────────────────── */
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
      zIndex: '99998', transition: 'opacity .2s'
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
