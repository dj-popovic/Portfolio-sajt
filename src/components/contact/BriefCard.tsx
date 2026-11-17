"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useBrief } from "@/components/brief/BriefProvider";
import { burstDots } from "@/components/canvas/ContactParticles";
import { BriefOrb } from "@/components/contact/BriefOrb";
import { useScroll } from "@/components/motion/SmoothScroll";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { CONTACT_STEPS, type ContactStep } from "@/lib/contact";
import { horizon } from "@/lib/horizon";
import { pointerLight } from "@/lib/tilt";

const EASE = [0.25, 1, 0.5, 1] as const;
// an answer's dots take this long to fly in from the conversation (ContactChat)
export const INK_DELAY = 0.5;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compact = () => window.matchMedia("(max-width: 920px)").matches;
const noop = () => () => {};

// a row's value inks in once its answer has landed (the first paint shows it as it is)
function Ink({ value }: { value: string }) {
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
          {value}
        </motion.span>
      ) : null}
    </AnimatePresence>
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
 * The brief beside the conversation, on a pane of the house glass. Its orb is the hero's
 * again, small: a loose cloud of dots that takes shape as the answers come (BriefOrb).
 * Each answer lights its row's node and inks in as its dots land; a package picked in Find
 * your fit docks in its own row. Sent, the orb is whole, ripples and bursts into the dots
 * behind, and the pane says so.
 */
export function BriefCard() {
  const t = useTranslations("contact");
  const tf = useTranslations("fit");
  const locale = useLocale();
  const scroll = useScroll();
  const { answers, pkg, addons, status, sent, choosePackage, removeAddon, arriving } = useBrief();
  const card = useRef<HTMLElement>(null);
  // the send this card has answered (stamped once it's in view)
  const [sealedRun, setSealedRun] = useState(0);
  const sealed = status === "done" && sealedRun === sent;
  // today, in the visitor's own calendar (none on the server)
  const date = useSyncExternalStore(
    noop,
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(Date.now()),
    () => "",
  );

  const answered = CONTACT_STEPS.filter((s) => answers[s]).length;
  // the orb ripples as an answer lands (after its dots' flight) and when the brief is sent
  const [pulse, setPulse] = useState(0);
  const seen = useRef(answered);
  useEffect(() => {
    const more = answered > seen.current;
    seen.current = answered;
    if (!more) return;
    const id = window.setTimeout(() => setPulse((p) => p + 1), reduced() || compact() ? 0 : INK_DELAY * 1000);
    return () => window.clearTimeout(id);
  }, [answered]);

  // sent: bring the card into view if it's off screen (phones), then seal it
  useEffect(() => {
    if (status !== "done") return;
    horizon.welcome = true;
    const el = card.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const away = r.top < 60 || r.bottom > window.innerHeight - 20;
    if (away) scroll.scrollTo(el, { offset: -Math.max(80, (window.innerHeight - r.height) / 2) });
    const id = window.setTimeout(
      () => {
        setSealedRun(sent);
        setPulse((p) => p + 1);
        const orb = el.querySelector(".brief-orb");
        if (orb && !reduced()) burstDots(orb.getBoundingClientRect(), 120);
      },
      away ? 900 : 250,
    );
    return () => window.clearTimeout(id);
  }, [status, sent, scroll]);

  return (
    <article
      ref={card}
      className="brief"
      aria-label={t("brief.title")}
      data-sent={sealed || undefined}
      onPointerMove={pointerLight}
    >
      <header className="brief-head">
        <div className="brief-titles">
          <span className="brief-kicker">{t("brief.title")}</span>
          <span className="brief-hint">{sealed ? t("brief.sentHint") : t("brief.hint")}</span>
        </div>
        <BriefOrb className="brief-orb" fill={answered / CONTACT_STEPS.length} pulse={pulse} />
      </header>

      <dl className="brief-rows">
        {ROWS.map(({ step, label }) => {
          const on = step === "start" ? Boolean(pkg || addons.length) : Boolean(answers[step]);
          return (
            <div
              key={step}
              className="brief-row"
              data-brief-row={step}
              data-on={on || undefined}
              data-dock={step === "start" ? "start" : undefined}
            >
              <dt>
                <i className="brief-node" aria-hidden />
                {t(label)}
              </dt>
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
                      <span className="brief-none">{t("brief.none")}</span>
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
          );
        })}
      </dl>

      <footer className="brief-foot">
        <span className="brief-for">{t("brief.for")}</span>
        <AnimatePresence mode="popLayout" initial={false}>
          {sealed ? (
            <motion.span
              key="sent"
              className="brief-sent"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
            >
              <CheckIcon size={12} />
              {t("brief.sent")}
            </motion.span>
          ) : (
            <motion.span key="date" className="brief-date" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
              {date}
            </motion.span>
          )}
        </AnimatePresence>
      </footer>
    </article>
  );
}
