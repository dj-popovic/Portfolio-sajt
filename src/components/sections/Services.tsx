import { useTranslations } from "next-intl";
import type { ComponentType } from "react";
import { ServiceCard } from "@/components/sections/ServiceCard";
import type { ServiceKey } from "@/components/services/ServiceGlyph";
import { ServicesDeck } from "@/components/services/ServicesDeck";
import { BrowserIcon, PhoneIcon, SparkIcon, TrendIcon } from "@/components/ui/icons";
import { richDark } from "@/lib/rich";

const ITEMS: Array<{ key: ServiceKey; Icon: ComponentType }> = [
  { key: "branding", Icon: SparkIcon },
  { key: "websites", Icon: BrowserIcon },
  { key: "apps", Icon: PhoneIcon },
  { key: "marketing", Icon: TrendIcon },
];

export function Services() {
  const t = useTranslations("services");
  const nav = useTranslations("nav");

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
          <p className="note" data-reveal="fade" data-reveal-delay="0.15">
            {t("note")}
          </p>
        </div>

        <ServicesDeck
          label={nav("services")}
          names={ITEMS.map(({ key }) => t(`items.${key}.title`))}
          foot={
            <div className="sec-foot">
              <span className="ln" aria-hidden />
              <p>{t.rich("foot", richDark)}</p>
              <span className="ln" aria-hidden />
            </div>
          }
        >
          {ITEMS.map(({ key, Icon }, i) => (
            <ServiceCard
              key={key}
              kind={key}
              index={i}
              num={String(i + 1).padStart(2, "0")}
              title={t(`items.${key}.title`)}
              desc={t(`items.${key}.desc`)}
              tags={t.raw(`items.${key}.tags`) as string[]}
              icon={<Icon />}
            />
          ))}
        </ServicesDeck>
      </div>
    </section>
  );
}
