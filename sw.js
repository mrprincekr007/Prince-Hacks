// Prince Hacks Store - v5 SPEED (shell + image cache alag)
const C = "phs-v70", IM = "phs-img-v1", MAXIMG = 80;
const A = ["./", "./index.html", "./css/style.css", "./js/store.js", "./js/firebase-config.js", "./manifest.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(A)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== IM).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
function isImg(u) { return /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(u); }
async function trimCache() { try { const c = await caches.open(IM); const ks = await c.keys(); if (ks.length > MAXIMG) await Promise.all(ks.slice(0, ks.length - MAXIMG).map(k => c.delete(k))); } catch (e) {} }
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || !e.request.url.startsWith("http")) return;
  const u = e.request.url;
  if (e.request.destination === "image" || isImg(u)) {
    // photos: cache-first (page turant, photo cache/net se)
    e.respondWith(caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(r => { if (r.ok) { const x = r.clone(); caches.open(IM).then(c => { c.put(e.request, x); trimCache(); }); } return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  // shell/api: network-first, offline me cache
  e.respondWith(fetch(e.request).then(r => { const x = r.clone(); caches.open(C).then(c => c.put(e.request, x)); return r; }).catch(() => caches.match(e.request)));
});
