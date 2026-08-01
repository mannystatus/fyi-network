// Mirrors hackthedeal.com's sw.js — one small Web Push handler, shared by
// every brand's subscription (see components/GameDaySoftPrompt.tsx and
// lib/pushClient.ts). The push payload itself carries whatever's brand-
// specific (title, body, icon, click-through url) — see
// backend/app/send_game_alerts.py's _send_to_brand_subscribers.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }

  const title = data.title || "Game update";
  const options = {
    body: data.body || "",
    icon: data.icon,
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(clients.openWindow(url));
});
