importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);

workbox.routing.registerRoute(
    () => true,
    new workbox.strategies.CacheFirst({ cacheName: 'large-type-pwa-assets' })
);