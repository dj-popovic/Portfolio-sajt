import { useTranslations } from "next-intl";
import { PanelClip } from "@/components/motion/PanelClip";
import { WorkGallery } from "@/components/work/WorkGallery";
import { richLight } from "@/lib/rich";

export function Work() {
  const t = useTranslations("work");

  return (
    <section className="work" id="work" data-screen-label="Work">
      <PanelClip />
      <div className="work-glow" aria-hidden />
      <div className="work-inner">
        <div className="sec-head">
          <div className="lead">
            <h2 className="sec-title" data-reveal="title">
              {t.rich("title", richLight)}
            </h2>
          </div>
          <p className="note" data-reveal="fade" data-reveal-delay="0.15">
            <span className="hover-only">{t.rich("note", richLight)}</span>
            <span className="touch-only">{t.rich("noteTouch", richLight)}</span>
          </p>
        </div>

        <WorkGallery />

        <div className="sec-foot" data-reveal="fade">
          <span className="ln" aria-hidden />
          <p>{t.rich("foot", richLight)}</p>
          <span className="ln" aria-hidden />
        </div>
      </div>
    </section>
  );
}
