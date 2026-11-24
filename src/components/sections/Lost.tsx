import { createTranslator } from "next-intl";
import { Logo } from "@/components/brand/Logo";
import { LostOrb } from "@/components/sections/LostOrb";
import { routing, type Locale } from "@/i18n/routing";
import { richHero } from "@/lib/rich";
import de from "../../../messages/de.json";
import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";
import sr from "../../../messages/sr.json";

export const LOST_MESSAGES = { en, sr, ru, de } as const;
const homeOf = (locale: Locale) => (locale === routing.defaultLocale ? "/" : `/${locale}`);

/**
 * The 404 (app/global-not-found.tsx): the hero's layout with its orb, the wordmark's pill
 * and the way back. It is one static page for every address that isn't the site, so it
 * carries all four languages and shows the one the address starts with (`html[data-lost]`,
 * set before the first paint; English without script). Plain links: the one-page site is
 * built around a full load (its pins measure themselves, a #section lands once they have).
 */
export function Lost() {
  return (
    <div className="hero lost">
      <div className="hero-aura" aria-hidden />
      <LostOrb />
      <div className="hero-scrim" aria-hidden />
      <div className="hero-floor" aria-hidden />
      <div className="hero-vignette" aria-hidden />

      {routing.locales.map((locale) => {
        const messages = LOST_MESSAGES[locale];
        const t = createTranslator({ locale, messages, namespace: "notFound" });
        const home = homeOf(locale);
        return (
          <div key={locale} className="lost-lang" data-l={locale} lang={locale}>
            <header className="site-nav lost-nav">
              <a href={home} className="nav-logo glass" aria-label={messages.common.logoAria}>
                <Logo interactive optical />
              </a>
            </header>

            <main className="hero-inner">
              <div className="hero-content">
                <p className="lost-code glass">
                  <span className="dot" aria-hidden />
                  {t("label")}
                </p>
                <h1 className="hero-title">{t.rich("title", richHero)}</h1>
                <p className="hero-sub">{t("sub")}</p>
                <div className="hero-actions">
                  <a href={home} className="btn-primary btn-lime">
                    {t("home")}
                  </a>
                  <a href={`${home}#work`} className="btn-ghost">
                    {t("work")}
                  </a>
                </div>
              </div>
            </main>
          </div>
        );
      })}
    </div>
  );
}
