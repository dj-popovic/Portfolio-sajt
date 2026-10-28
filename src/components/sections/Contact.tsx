import { useTranslations } from "next-intl";
import { ContactParticles } from "@/components/canvas/ContactParticles";
import { BriefCard } from "@/components/contact/BriefCard";
import { ContactChat } from "@/components/contact/ContactChat";
import { richDark } from "@/lib/rich";

export function Contact() {
  const t = useTranslations("contact");

  return (
    <section className="contact" id="contact" data-screen-label="Contact">
      <ContactParticles className="contact-particles" />
      <div className="contact-glow" aria-hidden />

      <div className="contact-inner">
        <div className="contact-grid" data-reveal-group data-reveal-stagger="0">
          <div className="presence">
            <h2 data-reveal="title">{t.rich("title", richDark)}</h2>
            <p className="lede" data-reveal="fade" data-reveal-delay="0.15">
              {t("lede")}
            </p>
            {/* the brief fills in beside the conversation */}
            <div className="brief-slot" data-reveal="fade" data-reveal-delay="0.25">
              <BriefCard />
            </div>
          </div>

          <div className="convo-stage">
            {/* warm light behind the glass, for it to bend */}
            <div className="convo-lights" aria-hidden>
              <span className="a" />
              <span className="b" />
            </div>
            <ContactChat />
          </div>
        </div>
      </div>
    </section>
  );
}
