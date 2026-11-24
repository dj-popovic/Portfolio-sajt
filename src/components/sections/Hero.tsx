import { useTranslations } from "next-intl";
import { OrbControls } from "@/components/sections/OrbControls";
import { HeroOrbFallback } from "@/components/three/OrbLayer";
import { richHero } from "@/lib/rich";
import { splitWords } from "@/lib/words";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="hero" id="top" data-screen-label="Hero">
      {/* the orb is a fixed layer behind the page; this is its blue aura, fallbacks and controls */}
      <div className="hero-aura" aria-hidden />
      <HeroOrbFallback />
      <div className="hero-scrim" aria-hidden />
      <div className="hero-floor" aria-hidden />
      <div className="hero-vignette" aria-hidden />

      <div className="hero-inner">
        <div className="hero-content">
          {/* its words come in one after another (motion.css, the hero's entrance): split here,
              read as one line (the label; the split words are hidden from screen readers) */}
          <h1
            className="hero-title"
            data-hero="title"
            aria-label={t.markup("title", { glow: (c) => c, b: (c) => c, br: () => " " }).replace(/\s+/g, " ")}
          >
            <span aria-hidden>{splitWords(t.rich("title", richHero))}</span>
          </h1>
          <p className="hero-sub" data-hero="sub">
            {t("sub")}
          </p>
          <div className="hero-actions" data-hero="actions">
            <a href="#contact" className="btn-primary btn-lime">
              {t("primary")}
            </a>
            <a href="#work" className="btn-ghost">
              {t("secondary")}
            </a>
          </div>
        </div>
      </div>

      {/* after the buttons in the tab order; it still sits under the text (z-index) */}
      <OrbControls />
    </section>
  );
}
