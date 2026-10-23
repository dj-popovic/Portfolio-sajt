import { useTranslations } from "next-intl";
import { ADDONS, PACKAGES } from "@/lib/brief";
import { AddonChips, PackageButton } from "@/components/sections/FitInteractive";
import { PanelClip } from "@/components/motion/PanelClip";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { richLight } from "@/lib/rich";

export function Fit() {
  const t = useTranslations("fit");
  const addonLabels = Object.fromEntries(ADDONS.map((k) => [k, t(`addons.items.${k}`)])) as Record<
    (typeof ADDONS)[number],
    string
  >;

  return (
    <section className="fit" id="fit" data-screen-label="Find your fit">
      <PanelClip />
      <div className="fit-amb" aria-hidden />
      <div className="fit-inner">
        <div className="fit-head">
          <Eyebrow a={t("eyebrowA")} b={t("eyebrowB")} tone="light" />
          <h2 className="fit-title" data-reveal="title">
            {t.rich("title", richLight)}
          </h2>
          <p className="fit-sub" data-reveal="fade" data-reveal-delay="0.25">
            {t("sub")}
          </p>
        </div>

        <div className="fit-grid" data-reveal-group data-reveal-stagger="0.12">
          {PACKAGES.map((key) => {
            const featured = key === "pro";
            const includes = t.raw(`packages.${key}.includes`) as string[];
            return (
              <article
                key={key}
                className={cn("pkg", featured && "featured")}
                data-card
                data-reveal-item
                data-ignite={featured || undefined}
              >
                <div className="pkg-kicker">
                  <h3 className="pkg-name">{t(`packages.${key}.name`)}</h3>
                  {featured ? (
                    <span className="pkg-badge">
                      <span className="spark" aria-hidden />
                      {t("popular")}
                    </span>
                  ) : null}
                </div>
                <p className="pkg-tag">{t(`packages.${key}.tag`)}</p>

                {/* "Let's talk" for now; a "From €X" line drops into .price-hint later */}
                <div className="pkg-price">
                  <span className="price-note">{t("investment")}</span>
                  <span className="price-val">{t("price")}</span>
                  <span className="price-hint">{t(`packages.${key}.hint`)}</span>
                </div>

                {featured ? <p className="pkg-incl-lead">{t.rich("plus", richLight)}</p> : null}
                <ul className="pkg-incl">
                  {includes.map((item) => (
                    <li key={item}>
                      <span className="ck" aria-hidden>
                        <CheckIcon />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <PackageButton pkg={key}>{t(`packages.${key}.cta`)}</PackageButton>
              </article>
            );
          })}
        </div>

        <div className="fit-addons" data-reveal="fade">
          <span className="addons-lead">
            <span className="plus" aria-hidden>
              +
            </span>
            {t("addons.lead")}
          </span>
          <AddonChips labels={addonLabels} />
        </div>
      </div>
    </section>
  );
}
