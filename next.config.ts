import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { routing } from "./src/i18n/routing";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // one branded 404 for every address that isn't the site (app/global-not-found.tsx)
  experimental: {
    globalNotFound: true,
  },
  // the browser's own protections, on every response. Framing is refused (no one can lay the
  // site under a click-jacking page), file types aren't guessed, other sites get only the
  // origin as a referrer, a page that opens this one can't reach into it (popups this site
  // opens, a sign-in window, still can), and the features
  // the site never asks for stay off (the clipboard isn't listed: Copy email uses it).
  // HSTS is Vercel's (it sends it on every HTTPS domain); a full Content-Security-Policy is
  // docs/BACKEND.md's, as it has to list whatever the backend adds
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [],
      // a single segment that isn't a language and isn't a file (/notes.txt, /index.html, /api)
      // never meets the proxy (its matcher skips those) and reaches the [locale] route, whose
      // layout calls notFound(): that gave Next's plain 404. These run after the files and
      // pages have been checked, so the icons, the manifest and public/ are served first
      afterFiles: [
        {
          source: `/:segment((?!(?:${routing.locales.join("|")})$)[^/]+)`,
          destination: "/_not-found",
        },
      ],
      fallback: [],
    };
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
