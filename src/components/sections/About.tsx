import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ImageIcon } from "@/components/ui/icons";
import { PLACEHOLDER } from "@/lib/placeholders";
import { richLight } from "@/lib/rich";

export function About() {
  const t = useTranslations("about");

  return (
    <section className="about" id="about" data-screen-label="About">
      <div className="about-glow" aria-hidden />
      <div className="about-wrap">
        <figure className="photo photo-left">
          {/* TODO(photos): founder portrait 1 — see docs/OPEN-ITEMS.md */}
          <div className="photo-slot" role="img" aria-label={t("photo1")}>
            <ImageIcon />
            <span>{t("photo1")}</span>
          </div>
          <figcaption>
            <span className="nm">{PLACEHOLDER.nameOne}</span>
            <span className="rl">{t.rich("role1", richLight)}</span>
          </figcaption>
        </figure>

        <div className="about-center">
          <Eyebrow a={t("eyebrow")} tone="light" />
          <h2>{t.rich("title", richLight)}</h2>
          <p>{t("body")}</p>
          <div className="about-divider" aria-hidden />
          <div className="about-stats">
            <div className="stat">
              <div className="n">2</div>
              <div className="l">{t("stats.founders")}</div>
            </div>
            <div className="stat">
              <div className="n">4</div>
              <div className="l">{t("stats.disciplines")}</div>
            </div>
            <div className="stat">
              <div className="n">1</div>
              <div className="l">{t("stats.team")}</div>
            </div>
          </div>
        </div>

        <figure className="photo photo-right">
          {/* TODO(photos): founder portrait 2 — see docs/OPEN-ITEMS.md */}
          <div className="photo-slot" role="img" aria-label={t("photo2")}>
            <ImageIcon />
            <span>{t("photo2")}</span>
          </div>
          <figcaption>
            <span className="nm">{PLACEHOLDER.nameTwo}</span>
            <span className="rl">{t.rich("role2", richLight)}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
