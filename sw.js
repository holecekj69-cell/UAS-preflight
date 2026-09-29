/* Průvodce UAS – offline cache. Při každé změně aplikace zvyš VERZE. */
const VERZE = "pruvodce-uas-v4";
const SOUBORY = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png",
  "./icon-maskable-512.png", "./apple-touch-icon.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERZE).then(c => c.addAll(SOUBORY)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== VERZE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
/* Síť první (vždy aktuální verze), bez signálu z cache */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(r => {
      const kopie = r.clone();
      caches.open(VERZE).then(c => c.put(e.request, kopie));
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true})
      .then(r => r || caches.match("./index.html")))
  );
});
