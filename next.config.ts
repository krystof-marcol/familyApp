import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin();

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: false,
    skipWaiting: true,
    clientsClaim: true,
    importScripts: ["/custom-sw.js"],
    runtimeCaching: [
      {
        urlPattern: /.*\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-data-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24,
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-cache",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-image-assets",
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  // ... your other config
};

export default withPWA(withNextIntl(nextConfig));
