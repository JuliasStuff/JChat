// firebase-messaging-sw.js
// Handles background push notifications for JChat.
//
// SETUP: Replace the PASTE_ values below with the same Firebase config
// values you put in index.html.

importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "AIzaSyCb5Se60vt7DAw167Zw2K7I4tfCthKaAuw",
  authDomain:        "jchat-9b112.firebaseapp.com",
  projectId:         "jchat-9b112",
  storageBucket:     "jchat-9b112.firebasestorage.app",
  messagingSenderId: "455369385950",
  appId:             "1:455369385950:web:c451f0c411dcf16fb31f4f"
});

const messaging = firebase.messaging();

// Show notification when app is in the background or closed
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || "JChat";
  const body  = payload.notification?.body  || "";
  self.registration.showNotification(title, {
    body,
    icon:     "./icon-192.png",
    badge:    "./icon-192.png",
    tag:      "jchat-message",
    renotify: true
  });
});

// Open or focus the app when user taps the notification
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if ("focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow("./");
      })
  );
});
