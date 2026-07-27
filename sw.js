// Service Worker - PWA
const CACHE_NAME = 'cari-keluarga-v4';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(
            names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    // Network-first for JS, HTML, API calls
    if (url.pathname.endsWith('.js') || url.pathname.endsWith('.html') || url.pathname === '/' ||
        url.hostname === 'yfwikwedzqdicpjyqfhv.supabase.co' ||
        url.hostname.includes('firebaseio.com') ||
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com')) {
        event.respondWith(
            fetch(event.request).then((fetchResponse) => {
                if (fetchResponse.status === 200) {
                    const clone = fetchResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return fetchResponse;
            }).catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for static assets (CSS, images, fonts)
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                if (fetchResponse.status === 200) {
                    const clone = fetchResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return fetchResponse;
            });
        }).catch(() => caches.match('/'))
    );
});
