"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useBrief } from "@/components/brief/BriefProvider";
import { burstDots } from "@/components/canvas/ContactParticles";
import { useScroll } from "@/components/motion/SmoothScroll";
import { CloseIcon } from "@/components/ui/icons";
import { CONTACT_STEPS, type ContactStep } from "@/lib/contact";
import { horizon } from "@/lib/horizon";
import { PLACEHOLDER } from "@/lib/placeholders";

const EASE = [0.25, 1, 0.5, 1] as const;
// an answer's dots take this long to fly in from the conversation (ContactChat)
export const INK_DELAY = 0.5;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compact = () => window.matchMedia("(max-width: 920px)").matches;
const noop = () => () => {};

// a row's value inks in once its answer has landed (the first paint shows it as it is);
// an empty row is a dotted line
function Ink({ value, children }: { value: string; children?: ReactNode }) {
  const delay = typeof window === "undefined" || reduced() || compact() ? 0 : INK_DELAY;
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {value ? (
        <motion.span
          key={value}
          className="brief-val"
          initial={{ opacity: 0, filter: "blur(6px)", y: 4 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0, transition: { delay, duration: 0.45, ease: EASE } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          {children ?? value}
        </motion.span>
      ) : (
        <motion.span key="blank" className="brief-blank" aria-hidden exit={{ opacity: 0 }} />
      )}
    </AnimatePresence>
  );
}

// the stub's code: a strip of the orb's dots that lights up as the brief fills in
function DotCode({ seed, filled }: { seed: string; filled: number }) {
  const cells = useMemo(() => {
    let h = 2166136261;
    for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    const out: number[] = [];
    for (let i = 0; i < 3 * 26; i++) {
      h = Math.imul(h ^ (i + 1), 2246822519) >>> 0;
      out.push((h % 1000) / 1000);
    }
    return out;
  }, [seed]);
  return (
    <span className="brief-code" aria-hidden>
      {cells.map((v, i) => (
        <i key={i} data-on={v < 0.18 + filled * 0.12 || undefined} data-hot={v < 0.06 + filled * 0.03 || undefined} />
      ))}
    </span>
  );
}

const ROWS: Array<{ step: ContactStep | "start"; label: string }> = [
  { step: "name", label: "brief.from" },
  { step: "project", label: "brief.project" },
  { step: "timeline", label: "brief.when" },
  { step: "start", label: "attached" },
  { step: "email", label: "brief.reply" },
];

/**
 * The brief beside the conversation, a ticket of the house glass: each answer inks into
 * its row as it lands, a package picked in Find your fit docks in its own row (its ticket
 * flies down to it). Sent, it's stamped and its stub tears off into the dots behind.
 */
export function BriefCard() {
  const t = useTranslations("contact");
  const tf = useTranslations("fit");
  const locale = useLocale();
  const scroll = useScroll();
  const { answers, pkg, addons, status, sent, arriving, choosePackage, removeAddon } = useBrief();
  const card = useRef<HTMLDivElement>(null);
  const stub = useRef<HTMLDivElement>(null);
  // how far this send has got: 1 stamped, 2 the stub is off (for the send it belongs to)
  const [phase, setPhase] = useState({ run: 0, step: 0 });
  const live = status === "done" && phase.run === sent;
  const sealed = live && phase.step >= 1;
  const torn = live && phase.step >= 2;
  // today, in the visitor's own calendar (none on the server)
  const date = useSyncExternalStore(
    noop,
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(Date.now()),
    () => "",
  );

  // sent: bring the card into view if it's off screen (phones), stamp it, tear the stub off
  useEffect(() => {
    if (status !== "done") return;
    horizon.welcome = true;
    const el = card.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const away = r.top < 60 || r.bottom > window.innerHeight - 20;
    if (away) scroll.scrollTo(el, { offset: -Math.max(80, (window.innerHeight - r.height) / 2) });
    const wait = away ? 900 : 250;
    const timers = [
      window.setTimeout(() => setPhase({ run: sent, step: 1 }), wait),
      window.setTimeout(() => {
        if (stub.current && !reduced()) burstDots(stub.current.getBoundingClientRect());
        setPhase({ run: sent, step: 2 });
      }, wait + 650),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [status, sent, scroll]);

  const filled = CONTACT_STEPS.filter((s) => answers[s]).length + (pkg ? 1 : 0);

  return (
    <div ref={card} className="brief-ticket">
      <article className="brief" aria-label={t("brief.title")} data-sealed={sealed || undefined}>
        <header className="brief-head">
          <span className="brief-kicker">{t("brief.title")}</span>
          <span className="brief-date">{date}</span>
        </header>
        <p className="brief-hint">{t("brief.hint")}</p>

        <dl className="brief-rows">
          {ROWS.map(({ step, label }) => (
            <div
              key={step}
              className="brief-row"
              data-brief-row={step}
              data-dock={step === "start" ? "start" : undefined}
            >
              <dt>{t(label)}</dt>
              <dd>
                {step === "start" ? (
                  <span className="brief-start" data-arriving={arriving || undefined}>
                    {pkg ? (
                      <span className="brief-chip is-pkg">
                        {tf(`packages.${pkg}.name`)}
                        {status === "editing" ? (
                          <button
                            type="button"
                            onClick={() => choosePackage(null)}
                            aria-label={`${t("removeAttachment")}: ${tf(`packages.${pkg}.name`)}`}
                          >
                            <CloseIcon size={10} />
                          </button>
                        ) : null}
                      </span>
                    ) : status === "editing" ? (
                      <a className="brief-pick" href="#fit">
                        {t("brief.pick")}
                      </a>
                    ) : addons.length ? null : (
                      <span className="brief-blank" aria-hidden />
                    )}
                    {addons.map((a) => (
                      <span key={a} className="brief-chip">
                        + {tf(`addons.items.${a}`)}
                        {status === "editing" ? (
                          <button
                            type="button"
                            onClick={() => removeAddon(a)}
                            aria-label={`${t("removeAttachment")}: ${tf(`addons.items.${a}`)}`}
                          >
                            <CloseIcon size={10} />
                          </button>
                        ) : null}
                      </span>
                    ))}
                  </span>
                ) : (
                  <Ink value={answers[step]} />
                )}
              </dd>
            </div>
          ))}
        </dl>

        <span className="brief-stamp" aria-hidden={!sealed}>
          {t("brief.stamp")}
        </span>
      </article>
      {/* the stub, past the perforation: it tears off into the dots when the brief is sent */}
      <div ref={stub} className="brief-stub" data-torn={torn || undefined}>
        <DotCode seed={date || "brief"} filled={filled} />
        <span className="brief-for">
          {t("brief.for", { nameOne: PLACEHOLDER.nameOne, nameTwo: PLACEHOLDER.nameTwo })}
        </span>
      </div>
    </div>
  );
}
