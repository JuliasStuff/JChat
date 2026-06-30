// firebase-messaging-sw.js
// Handles background push notifications for JChat.
// SW build tag: 2026-06-30-v2 (bump this string to force the browser to re-install the SW)

try {
  importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

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
} catch (err) {
  // Surface the real error to the page console so we can diagnose.
  console.error("[jchat-sw] init failed:", err);
  throw err;
}

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

