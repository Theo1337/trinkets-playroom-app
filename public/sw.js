// Version: 3.0.0
self.addEventListener("push", (event) => {
  const data = event.data.json();
  const title = data.title || "Cafofo Estelar";
  const options = {
    body: data.body || "Nova notificação!",
    icon: "/icon-192x192.png",
    badge: "/favicon-96x96.png",
    data: data.url || "/",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data;
  event.waitUntil(clients.openWindow(url));
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.endsWith("/manifest.json")) {
    event.respondWith(fetch(event.request));
  }
});
