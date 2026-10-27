import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { ProcessJourney } from "@/components/process/ProcessJourney";
import { richDark } from "@/lib/rich";

const STEPS = ["discover", "design", "build", "launch"] as const;

// an odometer wheel: once round, then on to the step's digit (index 10 + n, see .jy-wheel)
const WHEEL = Array.from({ length: 10 }, (_, i) => i);

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
          <p className="process-sub" data-reveal="fade" data-reveal-delay="0.15">
            {t("sub")}
          </p>
        </div>

        <ProcessJourney>
          <ol className="jy-steps">
            {STEPS.map((key, i) => {
              const n = i + 1;
              const phase = t(`steps.${key}.phase`);
              return (
                <li className="jy-step" key={key} style={{ "--n": n } as CSSProperties}>
                  <span className="jy-node" aria-hidden>
                    <i />
                  </span>
                  <button type="button" className="jy-phase" data-step={i} aria-label={t("goTo", { n, phase })}>
                    {phase}
                  </button>
                  <div className="jy-pane">
                    <span className="jy-num" aria-hidden>
                      <span>0</span>
                      <span className="jy-digit">
                        <span className="jy-wheel">
                          {[...WHEEL, ...WHEEL.slice(0, n + 1)].map((d, k) => (
                            <span key={k}>{d}</span>
                          ))}
                        </span>
                      </span>
                    </span>
                    <h3>{t(`steps.${key}.title`)}</h3>
                    <p className="jy-body">{t(`steps.${key}.body`)}</p>
                    <p className="jy-deliver">
                      <span className="jy-arrow" aria-hidden>
                        →
                      </span>
                      <span>{t.rich(`steps.${key}.deliver`, richDark)}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </ProcessJourney>
      </div>
    </section>
  );
}
