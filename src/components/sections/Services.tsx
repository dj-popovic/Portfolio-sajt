import { useTranslations } from "next-intl";
import type { ComponentType } from "react";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { BrowserIcon, PhoneIcon, SparkIcon, TrendIcon } from "@/components/ui/icons";
import { richDark } from "@/lib/rich";

const ITEMS: Array<{ key: "branding" | "websites" | "apps" | "marketing"; Icon: ComponentType }> = [
  { key: "branding", Icon: SparkIcon },
  { key: "websites", Icon: BrowserIcon },
  { key: "apps", Icon: PhoneIcon },
  { key: "marketing", Icon: TrendIcon },
];

export function Services() {
  const t = useTranslations("services");

  return (
    <section className="services" id="services" data-screen-label="What we offer">
      <div className="services-glow" aria-hidden />
      <div className="services-inner">
        <div className="sec-head">
          <div className="lead">
            <h2 className="sec-title" data-reveal="title">
              {t.rich("title", richDark)}
            </h2>
          </div>
          <p className="note" data-reveal="fade" data-reveal-delay="0.3">
            {t("note")}
          </p>
        </div>

        <div className="svc-grid" data-reveal-group>
          {ITEMS.map(({ key, Icon }, i) => (
            <ServiceCard
              key={key}
              num={String(i + 1).padStart(2, "0")}
              title={t(`items.${key}.title`)}
              desc={t(`items.${key}.desc`)}
              tags={t.raw(`items.${key}.tags`) as string[]}
              icon={<Icon />}
            />
          ))}
        </div>

        <div className="sec-foot" data-reveal="fade">
          <span className="ln" aria-hidden />
          <p>{t.rich("foot", richDark)}</p>
          <span className="ln" aria-hidden />
        </div>
      </div>
    </section>
  );
}
