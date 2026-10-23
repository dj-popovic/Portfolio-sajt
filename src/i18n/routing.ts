import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "sr", "ru", "de"],
  defaultLocale: "en",
  // English lives at "/", the others at /sr, /ru, /de
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
