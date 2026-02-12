// Version: 3.1.1770909864736
const CACHE_NAME = 'riaya-v1-killer';

// Install event - cache essential resources
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event - claim clients and clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

// Fetch event - Network first with fallback
self.addEventListener('fetch', (event) => {
    // Skip for non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip for Supabase API calls - always network
    if (event.request.url.includes('supabase')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Try cache if network fails
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Return offline page for HTML requests
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return new Response('Offline - please connect to internet to update app.', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    }
                    return new Response('Network error', { status: 503 });
                });
            })
    );
});
