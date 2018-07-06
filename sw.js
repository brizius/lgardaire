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

    const title = 'My first PWA';
    const options = {
        body: `${event.data.text()}`,
        icon: 'images/Amadeus_icon144.png',
        badge: 'images/Amadeus_icon144.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();
});