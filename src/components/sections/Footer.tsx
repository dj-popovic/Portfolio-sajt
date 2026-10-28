import { useTranslations } from "next-intl";
import { FooterHorizon } from "@/components/layout/FooterHorizon";
import { BackToTop, CopyEmail, CopyrightYear, StudioStatus } from "@/components/layout/FooterLive";
import { PLACEHOLDER } from "@/lib/placeholders";

const STUDIO_LINKS = ["about", "services", "work", "process"] as const;

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  // TODO(name): real address once the studio name/domain exist
  const email = `hello@${PLACEHOLDER.studio}.com`;

  return (
    <footer className="footer" id="footer" data-screen-label="Footer">
      <div className="footer-glow" aria-hidden />
      <FooterHorizon className="footer-horizon" />

      <div className="footer-inner">
        <div className="f-top">
          <div className="f-cta" data-reveal="title">
            <a className="f-email" href={`mailto:${email}`}>
              hello@<span className="ph">{PLACEHOLDER.studio}</span>.com
            </a>
            <CopyEmail email={email} />
          </div>
          <div className="f-nav" data-reveal="fade" data-reveal-delay="0.15">
            <div className="f-col">
              <h3>{t("studio")}</h3>
              <ul>
                {STUDIO_LINKS.map((id) => (
                  <li key={id}>
                    <a href={`#${id}`}>{tn(id)}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="f-col">
              <h3>{t("elsewhere")}</h3>
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

        {/* room for the horizon's crown to rise into */}
        <div className="f-atmosphere" aria-hidden />

        <div className="f-base">
          <StudioStatus />
          <span className="f-meta glass">
            <span className="logo-mark" aria-hidden>
              ★
            </span>
            <span>{t.rich("meta", { year: () => <CopyrightYear /> })}</span>
          </span>
          <div className="f-social">
            <a className="glass" href="#" aria-label={t("social.instagram")}>
              IG
            </a>
            <a className="glass" href="#" aria-label={t("social.x")}>
              X
            </a>
            <a className="glass" href="#" aria-label={t("social.linkedin")}>
              in
            </a>
            <BackToTop label={t("top")} />
          </div>
        </div>
      </div>
    </footer>
  );
}
