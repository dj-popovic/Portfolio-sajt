import type { Metadata, Viewport } from "next";
import { Lost } from "@/components/sections/Lost";
import { routing } from "@/i18n/routing";
import { STUDIO } from "@/lib/brand";
import { fontVariables } from "@/lib/fonts";
import { PALETTE } from "@/lib/palette";
import "./globals.css";

// Every address that isn't the site (/whatever, /sr/whatever, /file.txt) gets this one static
// page with a 404: the root layout is the [locale] segment, so there is no layout a localized
// not-found could share, and a catch-all page that calls notFound() can't be prerendered with
// Cache Components on (it shipped an empty error shell, drawn only once script ran).

// the tab says the same in every language: the page is one static file, and a title changed
// by script is set back once the page is up
export const metadata: Metadata = {
  title: `404 · ${STUDIO}`,
  robots: { index: false },
};

export const viewport: Viewport = {
  themeColor: PALETTE.bg,
  colorScheme: "dark",
};

// before the first paint: the language the address starts with (Lost shows its copy)
const others = JSON.stringify(routing.locales.filter((l) => l !== routing.defaultLocale));
const PICK = `(function(){var d=document.documentElement,l=location.pathname.split("/")[1];if(${others}.indexOf(l)<0)return;d.lang=l;d.setAttribute("data-lost",l)})()`;

export default function GlobalNotFound() {
  return (
    <html lang={routing.defaultLocale} data-lost={routing.defaultLocale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PICK }} />
      </head>
      <body>
        <Lost />
      </body>
    </html>
  );
}
