// Good Soil Harvest — Service Worker
// Handles push notifications and offline fallback.

const CACHE_NAME = "gsh-v1";
const OFFLINE_URL = "/offline";

// Cache essential assets on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([OFFLINE_URL, "/icon-192x192.png", "/icon-512x512.png"])
    )
  );
  self.skipWaiting();
});

// Clean up old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Network-first strategy with offline fallback for navigations
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(OFFLINE_URL).then((cached) => cached || new Response("Offline", { status: 503 }))
    )
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [100, 50, 100],
    tag: data.tag || "gsh-notification",
    renotify: true,
    data: {
      url: data.url || "/dashboard",
    },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Open the app when notification is clicked
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Focus an existing window if possible (exact hostname match)
        for (const client of clients) {
          try {
            const hostname = new URL(client.url).hostname;
            if ((hostname === "www.goodsoilharvest.com" || hostname === "goodsoilharvest.com") && "focus" in client) {
              client.navigate(url);
              return client.focus();
            }
          } catch { /* invalid URL — skip */ }
        }
        return self.clients.openWindow(url);
      })
  );
});
