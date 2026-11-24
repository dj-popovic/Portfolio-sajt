import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { pathOf, SITE_URL } from "@/lib/site";

// the one page, once per language, each naming the others (hreflang)
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}${pathOf(l)}`]));
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}${pathOf(locale)}`,
    alternates: { languages },
  }));
}
