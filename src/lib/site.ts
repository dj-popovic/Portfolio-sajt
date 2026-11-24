import { routing, type Locale } from "@/i18n/routing";

/**
 * The site's public address, for search engines and share cards (metadataBase, the sitemap,
 * robots.txt, structured data). NEXT_PUBLIC_SITE_URL wins when it is set; on Vercel it is
 * otherwise the project's production domain (its own domain once one is added there, picked up
 * by the next build); locally, the dev server. No trailing slash.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

/** A language's page: English at "/", the others at /sr, /ru, /de. */
export const pathOf = (locale: Locale) => (locale === routing.defaultLocale ? "/" : `/${locale}`);
