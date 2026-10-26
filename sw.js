/* Service worker : le carnet fonctionne sans réseau après la première ouverture. */
var CACHE = 'fi26-1-mvp3nw5f';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('fi26-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // météo et liens externes : réseau direct
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('index.html').then(function (hit) {
      var net = fetch(req).then(function (r) { if (r.ok) caches.open(CACHE).then(function (c) { c.put('index.html', r.clone()); }); return r; }).catch(function () { return hit; });
      return hit || net;
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (r) { if (r.ok) { var cl = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, cl); }); } return r; }).catch(function () { return hit; });
    return hit || net;
  }));
});
