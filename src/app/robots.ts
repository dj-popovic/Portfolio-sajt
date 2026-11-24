import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// everything may be crawled; the API isn't a page. (Vercel marks preview deployments noindex itself)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
