const CACHE_NAME = 'odanwan-v95';
const ASSETS = [
    'index.html',
    'style.css?v=95',
    'app.js?v=95',
    'manifest.json',
    'icon.png',
    'icon_splash.png'
];

// Install Event - cache core files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(ASSETS);
            })
    );
});

// Activate Event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - network first, fallback to cache
self.addEventListener('fetch', event => {
    // Only handle local/same-origin HTTP/HTTPS requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone response to put in cache
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // If network fails, serve from cache
                return caches.match(event.request);
            })
    );
});

// Listen for SKIP_WAITING signal from clients
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
