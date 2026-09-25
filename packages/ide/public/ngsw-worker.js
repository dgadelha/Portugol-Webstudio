/*
 * Substitui o service worker da versão Angular do IDE (`ngsw-worker.js`). Quem ainda o tem
 * registrado recebe este arquivo na próxima checagem: ele apaga os caches antigos e se
 * desregistra, e a página passa a usar o service worker novo (`sw.js`).
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(keys.filter(key => key.startsWith("ngsw:")).map(key => caches.delete(key)));
      await self.registration.unregister();

      const clients = await self.clients.matchAll({ type: "window" });

      for (const client of clients) {
        client.navigate(client.url);
      }
    })(),
  );
});
