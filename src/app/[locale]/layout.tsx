import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { routing } from "@/i18n/routing";
import { STUDIO } from "@/lib/brand";
import { fontVariables } from "@/lib/fonts";
import { PALETTE } from "@/lib/palette";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const OG_LOCALE = { en: "en_US", sr: "sr_RS", ru: "ru_RU", de: "de_DE" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const locale = await rootLocale();
  return {
    title: t("title"),
    description: t("description"),
    applicationName: STUDIO,
    appleWebApp: { title: STUDIO },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: STUDIO,
      type: "website",
      locale: OG_LOCALE[locale as keyof typeof OG_LOCALE] ?? OG_LOCALE.en,
    },
    alternates: {
      languages: {
        en: "/",
        sr: "/sr",
        ru: "/ru",
        de: "/de",
        "x-default": "/",
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: PALETTE.bg,
  colorScheme: "dark",
};

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* hide reveal targets until the motion layer takes over; show everything if it never does.
            A reload's old place is kept by SmoothScroll, once the pins have made their room */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');try{history.scrollRestoration='manual'}catch(e){}setTimeout(function(){var d=document.documentElement;if(!d.classList.contains('motion-ready'))d.classList.add('motion-failed')},4000);",
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
