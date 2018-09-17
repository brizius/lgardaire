const applicationServerPublicKey = 'BA4dnjHS4S9a-diuEBx4bO6qIW1gbJUNN7ysJyPJhRXgdulBcEz-aPrcvJzE6FJ_e5qY5IT3_ZoZKAKaFeBCq2g';
const pushButton = document.querySelector('.js-push-btn');
const subscriptionJson = document.querySelector('.js-subscription-json');
const subscriptionDetails = document.querySelector('.js-subscription-details');
const debugDetails = document.querySelector('.debug-details');
const debugText = document.querySelector('.debug-text');

const buttonUpdateSW = document.querySelector('#updateSW');
const divUpdate = document.querySelector('#footer');

let isSubscribed = false;
let swRegistration = null;

function initializeNotificationSystem() {
    window.addEventListener("offline", function () {
        displayNotification('You are now offline', "grey");
    });
    window.addEventListener("online", function (e) {
        var notification = document.getElementById('offlineNotification');
        notification.hidden = true;
        divUpdate.hidden = false;
    });
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', function (event) {
            console.log(
                '[Controllerchange] A "controllerchange" event has happened ' +
                'within navigator.serviceWorker: ', event
            );
            navigator.serviceWorker.controller.addEventListener('statechange',
                function () {
                    console.log('[Controllerchange][Statechange] ' +
                        'A "statechange" has occured: ', this.state
                    );
                    if (this.state === 'activated') {
                        displayNotification('You can now go offline ! Files are cached', "forestgreen");
                    }
                }
            );
        });
    }
}

function loadServiceWorkers() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log("Service Worker and Push Manager available");
        navigator.serviceWorker.register('sw.js')
            .then(function (registration) {
                buttonUpdateSW.onclick = function () {
                    registration.update();
                    divUpdate.hidden = true;
                };
                swRegistration = registration;
                initializeUI();
                console.log('Service Worker Registered');
            });
        navigator.serviceWorker.ready.then(function (registration) {
            console.log('Service Worker Ready');
        });
    } else {
        console.warn('Push messaging is not supported');
    }
}

function displayNotification(message, color) {
    var notification = document.getElementById('offlineNotification');
    notification.textContent = message;
    notification.style.backgroundColor = color;
    notification.hidden = false;
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


    if(!window.Notification){
        displayDebugMessage('Notifications not supported');
        return;
    }else{
        if (Notification.permission === 'denied') {
            displayDebugMessage('Notifications permission denied');
            pushButton.disabled = true;
            updateSubscriptionOnServer(null);
            return;
        }
        if (isSubscribed) {
            pushButton.textContent = 'Disable Push Messaging';
        } else {
            pushButton.textContent = 'Enable Push Messaging';
            debugText.style.display = "block";
        }
        clearDebugMessage();
    }
    pushButton.disabled = false;
}

function initializeUI() {
    pushButton.addEventListener('click', function () {
        pushButton.disabled = true;
        if (isSubscribed) {
            unsubscribeUser();
        } else {
            subscribeUser();
        }
    });
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            isSubscribed = !(subscription === null);
            if (isSubscribed) {
                console.log('User is subscribed ');
            } else {
                console.log('User is NOT subscribed.');
            }
            updateSubscriptionOnServer(subscription);
            updateBtn();
        });
}

function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server
    if (subscription) {
        subscriptionJson.textContent = JSON.stringify(subscription);
        subscriptionDetails.style.display = "block";
    } else {
        subscriptionDetails.style.display = "none";
    }
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        .then(function (subscription) {
            console.log('User is subscribed.');
            updateSubscriptionOnServer(subscription);
            isSubscribed = true;
            updateBtn();
        })
        .catch(function (err) {
            console.log('Failed to subscribe the user: ', err);
            updateBtn();
        });
}

function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            if (subscription) {
                return subscription.unsubscribe();
            }
        })
        .catch(function (error) {
            console.log('Error unsubscribing', error);
        })
        .then(function () {
            updateSubscriptionOnServer(null);

            console.log('User is unsubscribed.');
            isSubscribed = false;

            updateBtn();
        });
}

function displayDebugMessage(message){
    debugText.text(message);
    debugText.style.display = "block";
}

function clearDebugMessage(){
    debugText.text('');
    debugText.style.display = "none";
}