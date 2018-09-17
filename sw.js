const cacheName = `my_first_pwa`;
self.addEventListener('install', e => {
    // const timeStamp = Date.now();
    e.waitUntil(
        caches.open(cacheName)
            .then(function(cache) {
                return fetch('files-to-cache.json').then(function(response) {
                    return response.json();
                }).then(function(files) {
                    console.log('[Install] Adding files from JSON file: ', files);
                    return cache.addAll(files);
                });
            })
            .then(function() {
                console.log(
                    '[Install] All required resources have been cached',
                    'The Service Worker was successfully installed'
                );
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(cacheName)
            .then(cache => cache.match(event.request, {ignoreSearch: true}))
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('push', event => {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Icelandair';
    const options = {
        body: `${event.data.text()}`,
        icon: 'images/icelandair_400x400.jpg',
        badge: 'images/icelandair_400x400.jpg',
        image: 'images/instagram-grid.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();
});