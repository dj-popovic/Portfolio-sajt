import { useTranslations } from "next-intl";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { richDark } from "@/lib/rich";

const STEPS = ["discover", "design", "build", "launch"] as const;

export function Process() {
  const t = useTranslations("process");

  return (
    <section className="process" id="process" data-screen-label="Process">
      <div className="process-glow" aria-hidden />
      <div className="process-inner">
        <div className="process-head">
          <h2 className="sec-title" data-reveal="title">
            {t.rich("title", richDark)}
          </h2>
          <p className="process-sub" data-reveal="fade" data-reveal-delay="0.25">
            {t("sub")}
          </p>
        </div>

        <ProcessTimeline>
          <ol className="tl-steps">
            {STEPS.map((key, i) => (
              <li className="tl-step" key={key}>
                <span className="tl-node" aria-hidden />
                <div className="tl-meta">
                  <span className="tl-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="tl-phase">{t(`steps.${key}.phase`)}</span>
                </div>
                <h3>{t(`steps.${key}.title`)}</h3>
                <p>{t(`steps.${key}.body`)}</p>
                <span className="tl-deliver">
                  <span className="ar" aria-hidden>
                    →
                  </span>
                  <span>{t.rich(`steps.${key}.deliver`, richDark)}</span>
                </span>
              </li>
            ))}
          </ol>
        </ProcessTimeline>
      </div>
    </section>
  );
}
