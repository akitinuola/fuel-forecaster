// sw.js
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('your-app-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/index.css',
                '/index.js',
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
