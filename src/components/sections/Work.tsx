import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { WorkGallery } from "@/components/work/WorkGallery";
import { richLight } from "@/lib/rich";

export function Work() {
  const t = useTranslations("work");

  return (
    <section className="work" id="work" data-screen-label="Work">
      <div className="work-glow" aria-hidden />
      <div className="work-inner">
        <div className="sec-head">
          <div className="lead">
            <Eyebrow a={t("eyebrowA")} b={t("eyebrowB")} tone="light" />
            <h2 className="sec-title">{t.rich("title", richLight)}</h2>
          </div>
          <p className="note">
            <span className="hover-only">{t.rich("note", richLight)}</span>
            <span className="touch-only">{t.rich("noteTouch", richLight)}</span>
          </p>
        </div>

        <WorkGallery />

        <div className="sec-foot">
          <span className="ln" aria-hidden />
          <p>{t.rich("foot", richLight)}</p>
          <span className="ln" aria-hidden />
        </div>
      </div>
    </section>
  );
}
