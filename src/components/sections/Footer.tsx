import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/Logo";
import { FooterHorizon } from "@/components/layout/FooterHorizon";
import { BackToTop, CopyEmail, CopyrightYear, StudioStatus } from "@/components/layout/FooterLive";
import { InstagramIcon, LinkedInIcon, XIcon } from "@/components/ui/icons";
import { PLACEHOLDER } from "@/lib/placeholders";

const STUDIO_LINKS = ["about", "services", "work", "process"] as const;

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  // TODO(domain): the real address once the domain is registered
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
                  <a href="#">{t("social.github")}</a>
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
            <span>
              {t.rich("meta", {
                year: () => <CopyrightYear />,
                // in the line of text: one colour, a word's height, on the baseline
                logo: () => <Logo variant="mono" size="0.8em" />,
              })}
            </span>
          </span>
          <div className="f-social">
            <a className="glass" href="#" aria-label={t("social.instagram")}>
              <InstagramIcon />
            </a>
            <a className="glass" href="#" aria-label={t("social.x")}>
              <XIcon />
            </a>
            <a className="glass" href="#" aria-label={t("social.linkedin")}>
              <LinkedInIcon />
            </a>
            <BackToTop label={t("top")} />
          </div>
        </div>
      </div>
    </footer>
  );
}
