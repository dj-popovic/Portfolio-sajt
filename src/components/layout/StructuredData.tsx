import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { STUDIO } from "@/lib/brand";
import { pathOf, SITE_URL } from "@/lib/site";

/**
 * What the page is, for search engines (schema.org JSON-LD): the studio, its two founders and
 * its city, and the site in this language. Only what's settled: no email or social links
 * while those are placeholders (docs/OPEN-ITEMS.md).
 */
export function StructuredData() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const studio = `${SITE_URL}/#studio`;
  const person = (who: "one" | "two") => ({
    "@type": "Person",
    name: t(`about.people.${who}.name`),
    jobTitle: t(`about.people.${who}.role`),
  });
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": studio,
        name: STUDIO,
        url: SITE_URL,
        logo: `${SITE_URL}/brand/icon-512.png`,
        description: t("meta.description"),
        address: { "@type": "PostalAddress", addressLocality: t("meta.city"), addressCountry: "RS" },
        founder: [person("one"), person("two")],
        knowsLanguage: routing.locales,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}${pathOf(locale)}`,
        name: STUDIO,
        inLanguage: locale,
        publisher: { "@id": studio },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // < is escaped, so nothing in the copy can close the script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
