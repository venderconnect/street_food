/* global importScripts, firebase */
// Using compat for simplicity in a plain service worker file.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Replace with real values from Firebase console:
firebase.initializeApp({
  apiKey: 'REPLACE',
  authDomain: 'REPLACE',
  projectId: 'REPLACE',
  messagingSenderId: 'REPLACE',
  appId: 'REPLACE',
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification?.title || 'Update', {
    body: payload.notification?.body || '',
    icon: '/icon.png'
  });
});
