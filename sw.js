// ═══ SIMUREP — © 2026 AnthoninP — Tous droits réservés. Reproduction, copie, extraction ou réutilisation
// interdites sans autorisation écrite de l'auteur (contact@simurep.fr). Ce fichier fait partie d'une œuvre protégée. ═══
// Service worker du châssis public — SIMUREP (paliers 900, 1300, N4 et EPR)
// Stratégie : réseau d'abord (version toujours fraîche), cache en secours (mode avion).
var CACHE = 'rep1300-client-202609292107';

// Ressources locales nécessaires à l'installation et à l'identité sur iPhone.
var PWA_ASSETS = [
  './manifest.webmanifest',
  './assets/identite/logo-simurep.png',
  './assets/identite/icon-32.png',
  './assets/identite/icon-180.png',
  './assets/identite/icon-192.png',
  './assets/identite/icon-512.png'
];
var BASE = new URL('./', self.location.href);
// Complété depuis la liste fermée du paquet lors du déploiement.
var SDC_ASSETS = ["./index.html","./france.html","./client.html","./n4/index.html","./n4/n4.css","./n4/instruments-n4.js","./n4/n4-synoptiques.js","./n4/n4-commandes.js","./n4/n4.js","./n4/preferences-n4.js","./n4/adaptateur-n4.js","./n4/essai-n4.js","./n4/transport-prive.js","./epr/index.html","./epr/n4.css","./epr/instruments-n4.js","./epr/n4-synoptiques.js","./epr/n4-commandes.js","./epr/n4.js","./epr/preferences-n4.js","./epr/adaptateur-n4.js","./epr/essai-n4.js","./epr/transport-prive.js","./epr/epr-synoptiques.js","./epr/epr.js","./epr/epr.css"]; // SDC_PUBLIC_ASSETS
// Cache.addAll refuse les doublons : comparer les URL résolues, pas les écritures relatives.
var INSTALL_ASSETS = Array.from(new Set(['./', './index.html'].concat(PWA_ASSETS, SDC_ASSETS).map(function (path) { return new URL(path, BASE).href; })));
var STATIC_PATHS = PWA_ASSETS.concat(SDC_ASSETS).map(function (path) { return new URL(path, BASE).pathname; });

function cacheable(request, response) {
  if (!response || !response.ok || response.status === 206) return false;
  var control = response.headers.get('Cache-Control') || '';
  if (/\bno-store\b/i.test(control)) return false;
  // Une réponse JSON à une navigation ne doit pas devenir une page hors ligne.
  return request.mode !== 'navigate' || /\btext\/html\b/i.test(response.headers.get('Content-Type') || '');
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(INSTALL_ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE && k.indexOf('rep1300-') === 0; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var request = e.request, url;
  if (request.method !== 'GET' || request.cache === 'no-store') return;
  try { url = new URL(request.url); } catch (_e) { return; }
  if (url.origin !== self.location.origin) return;
  // Même en développement où le moteur peut partager l'origine, les API et
  // les requêtes de session restent au réseau. Aucun secours HTML pour elles.
  if (/(^|\/)(api|state|grid|cmd|parc)(\/|$)/.test(url.pathname) ||
      request.headers.has('Authorization') || request.headers.has('X-Sid')) return;
  if (request.mode !== 'navigate' && STATIC_PATHS.indexOf(url.pathname) === -1) return;

  e.respondWith(
    fetch(request).then(function (response) {
      if (!cacheable(request, response)) return response;
      var copy = response.clone();
      // Attendre l'écriture prolonge la vie du worker ; un cache plein ou
      // indisponible ne doit jamais transformer une réponse réseau en échec.
      return caches.open(CACHE).then(function (c) { return c.put(request, copy); })
        .catch(function () {}).then(function () { return response; });
    }).catch(function () {
      return caches.open(CACHE).then(function (c) {
        return c.match(request).then(function (saved) {
          if (cacheable(request, saved)) return saved;
          if (request.mode !== 'navigate') return Response.error();
          return c.match('./index.html').then(function (page) {
            return cacheable(request, page) ? page : Response.error();
          });
        });
      }).catch(function () { return Response.error(); });
    })
  );
});
