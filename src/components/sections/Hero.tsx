import { useTranslations } from "next-intl";
import { HeroIntro } from "@/components/sections/HeroIntro";
import { HeroFallbackNebula } from "@/components/three/NebulaLayer";
import { PlayIcon } from "@/components/ui/icons";
import { richHero } from "@/lib/rich";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="hero" id="top" data-screen-label="Hero">
      {/* the 3D nebula is a fixed layer behind the page; this is its warm aura + fallbacks */}
      <div className="hero-aura" aria-hidden />
      <HeroFallbackNebula />
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

      <div className="scroll-cue" aria-hidden data-hero="cue">
        <span>{t("scroll")}</span>
        <span className="line" />
      </div>

      <HeroIntro />
    </section>
  );
}
