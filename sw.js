const cacheName = `my_first_pwa`;
self.addEventListener('install', e => {
    const timeStamp = Date.now();
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll([
                "./",
                `./index.html`,
                "./images/Amadeus_Logo.png",
                "./images/Amadeus_icon144.png",
                "./images/Amadeus_icon192.png"
            ])
                .then(() => self.skipWaiting());
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

    const title = 'Push from My first PWA';
    const options = {
        body: 'Push notification test',
        icon: 'images/Amadeus_icon144.png',
        badge: 'images/Amadeus_icon144.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();
    // event.waitUntil(
    //     clients.openWindow('https://developers.google.com/web/')
    // );
});