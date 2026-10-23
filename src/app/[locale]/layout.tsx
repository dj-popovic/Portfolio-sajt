import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("title"),
    description: t("description"),
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
  themeColor: "#0e0b0a",
  colorScheme: "dark",
};

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* hide reveal targets until the motion layer takes over; show everything if it never does */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');setTimeout(function(){var d=document.documentElement;if(!d.classList.contains('motion-ready'))d.classList.add('motion-failed')},4000);",
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
