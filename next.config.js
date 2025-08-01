const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable in dev
  runtimeCaching: [
    {
      // ✅ Exclude API POST routes from being cached
      urlPattern: /^\/api\/.*$/i,
      handler: "NetworkOnly",
      method: "POST",
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 4, maxAgeSeconds: 31536000 },
      },
    },
    {
      urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "jsdelivr",
        expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
      },
    },
    {
      urlPattern: /^\/$/i, // Cache root page
      handler: "NetworkFirst",
      options: {
        cacheName: "start-url",
        expiration: { maxEntries: 1, maxAgeSeconds: 86400 },
      },
    },
    {
      urlPattern: /^.*$/i, // Cache all other files
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "general-cache",
        expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
      },
    },
  ],
});

module.exports = withPWA({
  // add other Next.js config here if needed
});
