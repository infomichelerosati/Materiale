const CACHE_NAME = 'gest-mat-cache-v5';

// Elenco completo delle risorse da mettere in cache per il funzionamento offline.
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './sw.js',
    './icon-192x192.png',
    './icon-512x512.png',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.1/dist/browser-image-compression.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
    'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://unpkg.com/lucide@latest'
];

// Evento 'install': si attiva quando il Service Worker viene installato.
// Mette in cache tutte le risorse fondamentali dell'app.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aperta e risorse in fase di caching.');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento 'activate': si attiva quando il Service Worker viene attivato.
// Pulisce le vecchie versioni della cache per liberare spazio.
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Eliminazione vecchia cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Evento 'fetch': intercetta tutte le richieste di rete effettuate dalla PWA.
// Restituisce la risorsa dalla cache se presente, altrimenti la richiede dalla rete.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se la risorsa è trovata in cache, la restituisce.
                if (response) {
                    return response;
                }
                
                // Altrimenti, effettua la richiesta di rete.
                return fetch(event.request).then(
                    (networkResponse) => {
                        // Se la richiesta va a buon fine, clona la risposta.
                        // Una risposta può essere letta una sola volta, quindi serve una copia per la cache.
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    }
                );
            })
    );
});

