
const C = 'english-v4';
const F = [
  './',
  'index.html',
  'app.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png'
];
 
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(C).then(cache => cache.addAll(F))
  );
  self.skipWaiting();
});
 
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== C)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});
 
self.addEventListener('fetch', e => {
  // Pages : toujours essayer d'avoir la dernière version de CETTE page
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(C).then(cache => cache.put(e.request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(e.request).then(r => r || caches.match('index.html'))
        )
    );
    return;
  }
 
  // Pour les autres fichiers : cache puis réseau
  e.respondWith(
    caches.match(e.request).then(response =>
      response || fetch(e.request)
    )
  );
});
 
