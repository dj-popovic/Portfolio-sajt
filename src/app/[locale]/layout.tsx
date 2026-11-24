import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { routing } from "@/i18n/routing";
import { STUDIO } from "@/lib/brand";
import { fontVariables, inter, unbounded } from "@/lib/fonts";
import { PALETTE } from "@/lib/palette";
import { pathOf, SITE_URL } from "@/lib/site";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const OG_LOCALE = { en: "en_US", sr: "sr_RS", ru: "ru_RU", de: "de_DE" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const locale = await rootLocale();
  const lang = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  // the share card for this language, made from the hero by scripts/og/build.mjs; addresses
  // are completed with the site's own (lib/site.ts: the production domain on Vercel)
  const image = { url: `/og/${lang}.jpg`, width: 1200, height: 630, alt: t("imageAlt") };
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    applicationName: STUDIO,
    appleWebApp: { title: STUDIO },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: STUDIO,
      type: "website",
      locale: OG_LOCALE[lang],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [image],
    },
    alternates: {
      canonical: pathOf(lang),
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, pathOf(l)])),
        "x-default": pathOf(routing.defaultLocale),
      },
    },
  };
}

// Before anything paints. Reveal targets hide until the motion layer takes over, and show if
// it never does (motion-failed). The hero's entrance is CSS (motion.css) and starts once its
// two faces are in for its own words, or after a second regardless (.hero-go): it no longer
// waits for the scripts, which on a slow phone kept the headline hidden for seconds. Only
// those faces and those letters (Cyrillic and Serbian's č ć đ are files of their own): all of
// the page's fonts include the concept previews' further down, a long wait on a slow line.
// A reload's old place is kept by SmoothScroll, once the pins have made their room
const json = (value: string) => JSON.stringify(value).replace(/</g, "\\u003c");
const headScript = (words: string) =>
  `(function(){var d=document.documentElement;d.classList.add("js");try{history.scrollRestoration="manual"}catch(e){}
setTimeout(function(){if(!d.classList.contains("motion-ready"))d.classList.add("motion-failed")},4000);
var on=0,go=function(){if(!on){on=1;d.classList.add("hero-go")}};setTimeout(go,1000);
requestAnimationFrame(function(){var f=document.fonts,w=${json(words)};if(!f||!f.load)return go();
Promise.all([f.load("700 1em "+${json(unbounded.style.fontFamily)},w),f.load("1em "+${json(inter.style.fontFamily)},w)]).then(go,go)})})()`;

export const viewport: Viewport = {
  themeColor: PALETTE.bg,
  colorScheme: "dark",
};

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations("hero");
  const heroWords = `${t.markup("title", { glow: (c) => c, b: (c) => c, br: () => " " })} ${t("sub")}`;

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript(heroWords) }} />
      </head>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
