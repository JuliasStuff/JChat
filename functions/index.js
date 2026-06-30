// JChat Cloud Function — sends push notifications when a new message is posted.
//
// DEPLOY STEPS:
//   1. Install Firebase CLI:  npm install -g firebase-tools
//   2. Log in:                firebase login
//   3. Set project:           firebase use YOUR_PROJECT_ID
//   4. Install deps:          cd functions && npm install
//   5. Update APP_URL below with your GitHub Pages URL
//   6. Deploy:                firebase deploy --only functions

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp }     = require("firebase-admin/app");
const { getFirestore }      = require("firebase-admin/firestore");
const { getMessaging }      = require("firebase-admin/messaging");

initializeApp();

const db  = getFirestore();
const fcm = getMessaging();

// Replace with your GitHub Pages URL
const APP_URL = "https://juliasstuff.github.io/JChat/";

exports.notifyOnMessage = onDocumentCreated("messages/{msgId}", async event => {
  const msg = event.data?.data();
  if (!msg?.text || !msg?.author) {
    console.log("Skipping: missing text or author");
    return;
  }

  const tokensSnap = await db.collection("tokens").get();
  const allDocs    = tokensSnap.docs;
  const targets    = allDocs.filter(d => d.data().deviceId !== msg.authorId);
  const tokens     = targets.map(d => d.data().token).filter(Boolean);

  console.log(`Message from ${msg.author} (${msg.authorId}): ${allDocs.length} total tokens, ${tokens.length} recipients`);

  if (tokens.length === 0) {
    console.log("No recipient tokens — nothing to send");
    return;
  }

  const body = msg.text.length > 120
    ? msg.text.slice(0, 120) + "…"
    : msg.text;

  const response = await fcm.sendEachForMulticast({
    tokens,
    notification: {
      title: msg.author,
      body
    },
    webpush: {
      notification: {
        icon:     APP_URL + "icon-192.png",
        tag:      "jchat-message",
        renotify: true
      },
      fcmOptions: {
        link: APP_URL
      }
    }
  });

  console.log(`FCM result: ${response.successCount} success, ${response.failureCount} failure`);
  response.responses.forEach((r, i) => {
    if (!r.success) {
      console.warn(`  token[${i}] failed: ${r.error?.code} — ${r.error?.message}`);
    }
  });

  // Remove stale tokens so they don't pile up
  const staleIds = [];
  response.responses.forEach((resp, i) => {
    if (!resp.success) {
      const code = resp.error?.code;
      if (
        code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token"
      ) {
        staleIds.push(targets[i].id);
      }
    }
  });

  if (staleIds.length > 0) {
    await Promise.all(
      staleIds.map(id => db.collection("tokens").doc(id).delete())
    );
  }
});
