import { useTranslations } from "next-intl";
import { FooterEmbers } from "@/components/canvas/FooterEmbers";
import { BackToTop, CopyrightYear, StudioStatus } from "@/components/layout/FooterLive";
import { PLACEHOLDER } from "@/lib/placeholders";

const STUDIO_LINKS = ["about", "services", "work", "process"] as const;

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");

  return (
    <footer className="footer" id="footer" data-screen-label="Footer">
      <div className="footer-glow" aria-hidden />
      <FooterEmbers className="footer-embers" />

      <div className="footer-inner">
        <div className="f-top">
          <div className="f-cta">
            <span className="lbl">
              <span className="ember-dot ember-dot-soft" aria-hidden />
              {t("label")}
            </span>
            {/* TODO(name): real address once the studio name/domain exist */}
            <a className="f-email block" data-reveal="title" href={`mailto:hello@${PLACEHOLDER.studio}.com`}>
              hello@<span className="ph">{PLACEHOLDER.studio}</span>.com
            </a>
          </div>
          <div className="f-nav" data-reveal="fade" data-reveal-delay="0.2">
            <div className="f-col">
              <h4>{t("studio")}</h4>
              <ul>
                {STUDIO_LINKS.map((id) => (
                  <li key={id}>
                    <a href={`#${id}`}>{tn(id)}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="f-col">
              <h4>{t("elsewhere")}</h4>
              <ul>
                {/* TODO(links): real profile URLs */}
                <li>
                  <a href="#">{t("social.instagram")}</a>
                </li>
                <li>
                  <a href="#">{t("social.dribbble")}</a>
                </li>
                <li>
                  <a href="#">{t("social.linkedin")}</a>
                </li>
                <li>
                  <a href="#">{t("journal")}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="f-atmosphere" aria-hidden />

        <div className="f-base">
          <StudioStatus />
          <span className="f-meta">
            <span className="logo-mark" aria-hidden>
              ★
            </span>
            <span>{t.rich("meta", { year: () => <CopyrightYear /> })}</span>
          </span>
          <div className="f-social">
            <a href="#" aria-label={t("social.instagram")}>
              IG
            </a>
            <a href="#" aria-label={t("social.x")}>
              X
            </a>
            <a href="#" aria-label={t("social.linkedin")}>
              in
            </a>
            <BackToTop label={t("top")} />
          </div>
        </div>
      </div>
    </footer>
  );
}
