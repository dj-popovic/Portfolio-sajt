import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale: override }) => {
  // The locale comes from the [locale] root segment, so pages stay static.
  const candidate = override ?? (await rootLocale());
  const locale = hasLocale(routing.locales, candidate)
    ? candidate
    : routing.defaultLocale;

  return {
    locale,
    timeZone: "Europe/Belgrade",
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
