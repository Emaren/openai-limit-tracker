self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open("v1").then((cache) => {
        return cache.addAll([
          "/",
          "/index.html",
          "/src/main.jsx",
          "/src/App.jsx",
          "/src/assets/index.css",
          "/pwa-192x192.png",
          "/pwa-512x512.png"
        ]);
      })
    );
  });
  
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  