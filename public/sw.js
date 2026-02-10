const CACHE_NAME = 'achrilik-v1';
const STATIC_CACHE = 'achrilik-static-v1';
const DYNAMIC_CACHE = 'achrilik-dynamic-v1';
const IMAGE_CACHE = 'achrilik-images-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/favicon.ico',
    '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );

    self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => {
                        return name !== STATIC_CACHE &&
                            name !== DYNAMIC_CACHE &&
                            name !== IMAGE_CACHE;
                    })
                    .map((name) => caches.delete(name))
            );
        })
    );

    return self.clients.claim(); // Take control immediately
});

// Fetch event - network-first strategy with fallbacks
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip Chrome extensions and non-HTTP(S) requests
    if (!url.protocol.startsWith('http')) return;

    // API requests - Network First (with cache fallback)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache successful responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(request).then((cached) => {
                        return cached || new Response(
                            JSON.stringify({ error: 'Offline - cached data unavailable' }),
                            { headers: { 'Content-Type': 'application/json' } }
                        );
                    });
                })
        );
        return;
    }

    // Images - Cache First (with network fallback)
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request).then((cached) => {
                return cached || fetch(request).then((response) => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(IMAGE_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Pages - Network First (with offline fallback)
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful page loads
                if (response.ok && (request.mode === 'navigate' || url.pathname === '/')) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Try cache, then offline page
                return caches.match(request).then((cached) => {
                    return cached || caches.match('/offline.html');
                });
            })
    );
});

// Background sync (future: for orders, cart sync)
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-cart') {
        event.waitUntil(
            // Sync cart to server when online
            syncCart()
        );
    }
});

async function syncCart() {
    // Implementation for syncing localStorage cart to server
    console.log('[Service Worker] Syncing cart...');
    // This would read from IndexedDB and POST to /api/cart
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};
    const title = data.title || 'Achrilik';
    const options = {
        body: data.body || 'Nouvelle notification',
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        tag: data.tag || 'default',
        data: data.url || '/',
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data || '/')
    );
});
