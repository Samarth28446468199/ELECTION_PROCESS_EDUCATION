// ══════════════════════════════════════════════════════════════════
// VoteIndia Service Worker — Offline & Caching (Efficiency)
// Strategy: Cache-first for assets, Network-first for HTML
// ══════════════════════════════════════════════════════════════════

const CACHE_NAME = 'voteindia-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/india.css',
  '/features.css',
  '/a11y.css',
  '/mobile.css',
  '/app.js',
  '/features.js',
  '/firebase.js',
  '/gemini.js',
  '/tests.js',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap',
];

// Install — cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch — Cache-first for assets, Network-first for navigation
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and external API calls
  if (request.method !== 'GET') return;
  if (url.hostname.includes('generativelanguage.googleapis.com')) return;
  if (url.hostname.includes('firestore.googleapis.com')) return;

  // Navigation: Network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Assets: Cache-first
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (!res || res.status !== 200 || res.type === 'opaque') return res;
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        });
      })
  );
});
