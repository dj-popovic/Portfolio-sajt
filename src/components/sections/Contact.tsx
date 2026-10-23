import { useTranslations } from "next-intl";
import { ContactParticles } from "@/components/canvas/ContactParticles";
import { ConvoFlow } from "@/components/contact/ConvoFlow";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PLACEHOLDER } from "@/lib/placeholders";
import { richDark } from "@/lib/rich";

export function Contact() {
  const t = useTranslations("contact");

  return (
    <section className="contact" id="contact" data-screen-label="Contact">
      <ContactParticles className="contact-particles" />
      <div className="contact-glow" aria-hidden />

      <div className="contact-inner">
        <div className="contact-grid">
          <aside className="presence">
            <Eyebrow a={t("eyebrowA")} b={t("eyebrowB")} />
            <h2>{t.rich("title", richDark)}</h2>
            <p className="lede">{t("lede")}</p>

            <div className="founders">
              <div className="founder-avatars">
                {/* TODO(photos): founder avatars — see docs/OPEN-ITEMS.md */}
                <span className="founder-avatar" role="img" aria-label={t("avatar1")}>
                  {t("avatar1")}
                </span>
                <span className="founder-avatar" role="img" aria-label={t("avatar2")}>
                  {t("avatar2")}
                </span>
              </div>
              <div className="said">
                <span className="ln">{t.rich("founders", richDark)}</span>
                <span className="meta">
                  <span className="pulse-dot" aria-hidden />
                  {t("foundersMeta", { nameOne: PLACEHOLDER.nameOne, nameTwo: PLACEHOLDER.nameTwo })}
                </span>
              </div>
            </div>
          </aside>

          <ConvoFlow />
        </div>
      </div>
    </section>
  );
}
