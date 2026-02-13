import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import {
    NetworkFirst,
    StaleWhileRevalidate,
    CacheFirst,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

// Disable dev logs in production
self.__WB_DISABLE_DEV_LOGS = true;

// Take control immediately (skip waiting)
self.skipWaiting();
clientsClaim();

// Clean up old caches from previous versions
cleanupOutdatedCaches();

// Precache static assets from workbox manifest
precacheAndRoute(self.__WB_MANIFEST || []);

// ============================================
// RUNTIME CACHING STRATEGIES
// ============================================

// 1. HTML Pages - Network First (always try to get fresh content)
registerRoute(
    ({ request }) => request.mode === "navigate",
    new NetworkFirst({
        cacheName: "pages-cache",
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
            }),
        ],
    }),
);

// 2. CSS & JS - Stale While Revalidate (serve cached, update in background)
registerRoute(
    ({ request }) =>
        request.destination === "style" || request.destination === "script",
    new StaleWhileRevalidate({
        cacheName: "static-resources",
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            }),
        ],
    }),
);

// 3. Images - Cache First (images rarely change)
registerRoute(
    ({ request }) => request.destination === "image",
    new CacheFirst({
        cacheName: "images-cache",
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
        ],
    }),
);

// 4. Fonts - Cache First (fonts never change)
registerRoute(
    ({ request }) => request.destination === "font",
    new CacheFirst({
        cacheName: "fonts-cache",
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            }),
        ],
    }),
);

// 5. API Calls - Network First with fallback
registerRoute(
    ({ url }) =>
        url.pathname.startsWith("/api/") || url.pathname.endsWith(".json"),
    new NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
            }),
        ],
    }),
);

// 6. Manifest - Cache First (manifest rarely changes)
registerRoute(
    ({ url }) => url.pathname === "/manifest.json",
    new NetworkFirst({
        cacheName: "dynamic-manifest",
        networkTimeoutSeconds: 5,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 10,
                maxAgeSeconds: 5 * 60, // cache 1 min
            }),
        ],
    }),
);

// ============================================
// OFFLINE FALLBACK
// ============================================

// Offline fallback for navigation requests
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request).catch(() => {
                return (
                    caches.match("/offline.html") || caches.match("/404.html")
                );
            }),
        );
    }

    if (event.request.destination === "document") {
        event.respondWith(
            fetch(event.request, { cache: "no-cache" }).catch(() =>
                caches.match(event.request),
            ),
        );
    }
});

self.addEventListener("push", (event) => {
    const data = event.data.json();
    event.waitUntil(showNotification(data));
});

async function showNotification({ title, options }) {
    await self.registration.showNotification(title, options);
    if (navigator.setAppBadge && options?.data?.badge) {
        await navigator.setAppBadge(options.data.badge);
    }
}

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url = new URL(event.notification.data.path, self.location.origin)
        .href;
    event.waitUntil(openURL(url));
});

async function openURL(url) {
    const clients = await self.clients.matchAll({ type: "window" });
    const focused = clients.find((client) => client.focused);

    if (focused) {
        await focused.navigate(url);
    } else {
        await self.clients.openWindow(url);
    }
}
