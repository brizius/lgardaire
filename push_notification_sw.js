
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