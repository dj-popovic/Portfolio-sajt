import { useTranslations } from "next-intl";
import { HeroIntro } from "@/components/sections/HeroIntro";
import { OrbControls } from "@/components/sections/OrbControls";
import { HeroOrbFallback } from "@/components/three/OrbLayer";
import { PlayIcon } from "@/components/ui/icons";
import { richHero } from "@/lib/rich";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="hero" id="top" data-screen-label="Hero">
      {/* the orb is a fixed layer behind the page; this is its warm aura, fallbacks and controls */}
      <div className="hero-aura" aria-hidden />
      <HeroOrbFallback />
      <div className="hero-scrim" aria-hidden />
      <div className="hero-floor" aria-hidden />
      <div className="hero-vignette" aria-hidden />

      <div className="hero-inner">
        <div className="hero-content">
          <h1 className="hero-title" data-hero="title">
            {t.rich("title", richHero)}
          </h1>
          <p className="hero-sub" data-hero="sub">
            {t("sub")}
          </p>
          <div className="hero-actions" data-hero="actions">
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

      {/* after the buttons in the tab order; it still sits under the text (z-index) */}
      <OrbControls />

      <div className="scroll-cue" aria-hidden data-hero="cue">
        <span>{t("scroll")}</span>
        <span className="line" />
      </div>

      <HeroIntro />
    </section>
  );
}
