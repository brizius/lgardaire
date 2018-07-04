const applicationServerPublicKey = 'BEKaSr_henOAd_PE47UIHt8Fh-stjFaWTsli1tFNtktA2WjODut1PgvriylcMAczH4d_3JP34PCSspZPAX2WR_w';
const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function loadServiceWorkers() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log("Service Worker and Push Manager available");
        navigator.serviceWorker.register('/sw.js', {scope: '/'})
            .then(function (registration) {
                console.log('Service Worker Registered');
                swRegistration = registration;
                initializeUI();
            });
        navigator.serviceWorker.ready.then(function (registration) {
            console.log('Service Worker Ready');
        });

        // navigator.serviceWorker.register('/push_notification.js', {scope: '/'})
        //     .then(function (registrationPush) {
        //         console.log('Push notification Service Worker Registered');
        //         swRegistration = registrationPush;
        //         initializeUI();
        //     });
        // navigator.serviceWorker.ready.then(function (registrationPush) {
        //     console.log('Push notification Service Worker Ready');
        // });
    } else {
        console.warn('Push messaging is not supported');
    }
}

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function updateBtn() {
    if (Notification.permission === 'denied') {
        pushButton.textContent = 'Push Messaging Blocked';
        pushButton.disabled = true;
        updateSubscriptionOnServer(null);
        return;
    }
    if (isSubscribed) {
        pushButton.textContent = 'Disable Push Messaging';
    } else {
        pushButton.textContent = 'Enable Push Messaging';
    }
    pushButton.disabled = false;
}

function initializeUI() {
    pushButton.addEventListener('click', function() {
        pushButton.disabled = true;
        if (isSubscribed) {
            // TODO: Unsubscribe user
        } else {
            subscribeUser();
        }
    });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            isSubscribed = !(subscription === null);
            if (isSubscribed) {
                console.log('User IS subscribed.');
            } else {
                console.log('User is NOT subscribed.');
            }
            updateBtn();
        });
}

function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server
    if (subscription) {
        console.log(JSON.stringify(subscription))
    } else {
        console.log("Not subscribed")
    }
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        .then(function(subscription) {
            console.log('User is subscribed.');
            updateSubscriptionOnServer(subscription);
            isSubscribed = true;
            updateBtn();
        })
        .catch(function(err) {
            console.log('Failed to subscribe the user: ', err);
            updateBtn();
        });
}