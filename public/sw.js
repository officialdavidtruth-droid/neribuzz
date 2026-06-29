/* NeriBuzz Service Worker v2 */
const CACHE = "neribuzz-v2";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return; // always network for API

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

/* Push notification received */
self.addEventListener("push", e => {
  if (!e.data) return;
  let payload = { title: "NeriBuzz", body: "New stories available", url: "/" };
  try { payload = { ...payload, ...e.data.json() }; } catch {}

  e.waitUntil(
    self.registration.showNotification(payload.title, {
      body:    payload.body,
      icon:    "/icon-192.png",
      badge:   "/icon-192.png",
      tag:     payload.category || "news",
      data:    { url: payload.url },
      vibrate: [200, 100, 200],
      requireInteraction: false,
    })
  );
});

/* Notification clicked — open / focus the article */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const target = e.notification.data?.url || "/";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(wins => {
      const w = wins.find(w => w.url.includes(self.location.origin));
      if (w) { w.focus(); w.navigate(target); return; }
      clients.openWindow(target);
    })
  );
});
