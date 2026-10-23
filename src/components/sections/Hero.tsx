import { useTranslations } from "next-intl";
import { Nebula2D } from "@/components/canvas/Nebula2D";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PlayIcon } from "@/components/ui/icons";
import { richDark } from "@/lib/rich";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="hero" id="top" data-screen-label="Hero">
      <Nebula2D className="hero-canvas" />
      <div className="hero-scrim" aria-hidden />
      <div className="hero-vignette" aria-hidden />

      <div className="hero-inner">
        <div className="hero-content">
          <Eyebrow a={t("eyebrowA")} b={t("eyebrowB")} />
          <h1 className="hero-title">{t.rich("title", richDark)}</h1>
          <p className="hero-sub">{t("sub")}</p>
          <div className="hero-actions">
            <a href="#contact" className="btn-primary btn-ember">
              {t("primary")}
            </a>
            <a href="#work" className="btn-ghost">
              <span className="play" aria-hidden>
                <PlayIcon />
              </span>
              {t("secondary")}
            </a>
          </div>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden>
        <span>{t("scroll")}</span>
        <span className="line" />
      </div>
    </section>
  );
}
