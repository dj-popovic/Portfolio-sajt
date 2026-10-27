import { useTranslations } from "next-intl";
import { ContactParticles } from "@/components/canvas/ContactParticles";
import { ConvoFlow } from "@/components/contact/ConvoFlow";
import { PLACEHOLDER } from "@/lib/placeholders";
import { richDark } from "@/lib/rich";

// no photos here (the owners' call): each founder is a lens of glass with their craft in it
const PenGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
    <path d="M12 3.5 18.5 13 12 20.5 5.5 13 12 3.5Z" strokeLinejoin="round" />
    <path d="M12 3.5v8.2" />
    <circle cx="12" cy="13.2" r="1.6" />
  </svg>
);
const CodeGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
    <path d="m8.5 7.5-4.5 4.5 4.5 4.5M15.5 7.5l4.5 4.5-4.5 4.5" strokeLinejoin="round" />
    <path d="m13.4 5.5-2.8 13" />
  </svg>
);

export function Contact() {
  const t = useTranslations("contact");
  const ta = useTranslations("about.people");

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

            <div className="founders glass" data-reveal="fade" data-reveal-delay="0.25">
              <div className="founder-avatars">
                <span className="founder-avatar" role="img" aria-label={`${PLACEHOLDER.nameOne}, ${ta("one.role")}`}>
                  <PenGlyph />
                </span>
                <span className="founder-avatar" role="img" aria-label={`${PLACEHOLDER.nameTwo}, ${ta("two.role")}`}>
                  <CodeGlyph />
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
          </div>

          <div className="convo-stage">
            {/* warm light behind the glass form, for it to bend */}
            <div className="convo-lights" aria-hidden>
              <span className="a" />
              <span className="b" />
            </div>
            <ConvoFlow />
          </div>
        </div>
      </div>
    </section>
  );
}
