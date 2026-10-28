"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ComponentProps, type MouseEvent, type ReactNode } from "react";
import { useBrief } from "@/components/brief/BriefProvider";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";
import { ADDONS, FINDER, FINDER_STEPS, fitFor, type FinderAnswers, type PackageKey } from "@/lib/brief";
import { cn } from "@/lib/cn";
import { flyDots, flyTicket, pointIn, ticketSlot } from "@/lib/flight";
import { tiltLeave, tiltMove } from "@/lib/tilt";

const EASE = [0.25, 1, 0.5, 1] as const;
// an add-on's dots reach the package buttons in FLIGHT seconds, one button FAN after another
const FLIGHT = 0.6;
const FAN = 0.08;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** An add-on's dots fan out from where it was picked to every package button. */
function flyToPackages(from: Element) {
  const start = pointIn(from);
  document.querySelectorAll<HTMLElement>(".pkg-btn").forEach((btn, i) => {
    const spot = () => (btn.isConnected ? pointIn(btn.querySelector(".pkg-more") ?? btn) : null);
    void flyDots(start, spot, { delay: FAN * i, duration: FLIGHT });
  });
}

// tickets on their way down to Contact (two quick picks can overlap)
let tickets = 0;

/** The grid of packages: knows which one the finder points to, so the light behind the glass can follow. */
export function FitGrid(props: ComponentProps<"div">) {
  const { fit } = useBrief();
  return <div {...props} data-fit={fit ?? undefined} />;
}

// Package card shell: the server renders its content, this adds the pointer tilt and marks the fit.
export function PackageCard({ pkg, className, ...props }: ComponentProps<"article"> & { pkg: PackageKey }) {
  const { fit } = useBrief();
  return (
    <article
      {...props}
      className={cn(className, fit === pkg && "is-fit")}
      onPointerMove={(e) => tiltMove(e, 3)}
      onPointerLeave={tiltLeave}
    />
  );
}

/** "Your fit" on the package the finder points to; otherwise Pro keeps "Most popular". */
export function FitBadge({ pkg, popular, label }: { pkg: PackageKey; popular?: string; label: string }) {
  const { fit } = useBrief();
  const mine = fit === pkg;
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {mine || popular ? (
        <motion.span
          key={mine ? "fit" : "popular"}
          className={cn("pkg-badge", mine && "is-fit")}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.45 }}
        >
          <span className="spark" aria-hidden />
          {mine ? label : popular}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

const roll = {
  enter: { y: "100%", opacity: 0 },
  center: (delay: number) => ({ y: 0, opacity: 1, transition: { delay, duration: 0.3, ease: EASE } }),
  exit: (delay: number) => ({ y: "-100%", opacity: 0, transition: { delay, duration: 0.3, ease: EASE } }),
};

// "+2" on a package button: the add-ons picked below come along. A new one rolls in as its dots land.
function MoreCount({ n, index }: { n: number; index: number }) {
  // the count it last showed: a rise waits for the dots (state from the last render)
  const [prev, setPrev] = useState(n);
  const [delay, setDelay] = useState(0);
  if (n !== prev) {
    setPrev(n);
    setDelay(n > prev && !reduced() ? FLIGHT + FAN * index : 0);
  }
  return (
    <AnimatePresence initial={false}>
      {n ? (
        <motion.span
          key="more"
          className="pkg-more"
          aria-hidden
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.45, duration: 0.4, delay } }}
          exit={{ opacity: 0, scale: 0.4 }}
        >
          +
          <span className="pkg-more-n">
            <AnimatePresence mode="popLayout" initial={false} custom={delay}>
              <motion.span key={n} custom={delay} variants={roll} initial="enter" animate="center" exit="exit">
                {n}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

// Package button: remembers the choice, the anchor scrolls to Contact, and a ticket of the
// pick (with its add-ons) rides down with the page and lands in the brief there.
export function PackageButton({
  pkg,
  name,
  index,
  children,
}: {
  pkg: PackageKey;
  name: string;
  index: number;
  children: ReactNode;
}) {
  const { choosePackage, addons, setArriving } = useBrief();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    choosePackage(pkg);
    if (reduced()) return;
    tickets += 1;
    setArriving(true);
    void flyTicket(e.currentTarget, { name, more: addons.length ? `+${addons.length}` : null }, ticketSlot).then(() => {
      tickets -= 1;
      if (!tickets) setArriving(false);
    });
  };
  return (
    <a className="pkg-btn" href="#contact" onClick={onClick} data-package={pkg}>
      {children}
      <MoreCount n={addons.length} index={index} />
    </a>
  );
}

export function AddonChips({ labels }: { labels: Record<(typeof ADDONS)[number], string> }) {
  const { addons, toggleAddon } = useBrief();
  return (
    <div className="addon-chips">
      {ADDONS.map((key) => {
        const on = addons.includes(key);
        return (
          <button
            key={key}
            type="button"
            className="chip"
            aria-pressed={on}
            onClick={(e) => {
              toggleAddon(key);
              if (!on) flyToPackages(e.currentTarget);
            }}
            data-addon={key}
          >
            <span className="ico" aria-hidden>
              <PlusIcon className="x-add" />
              <CheckIcon className="x-on" size={11} />
            </span>
            {labels[key]}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Find your fit in three taps: what it is, how much motion, whether there's a brand yet.
 * Each tap moves the fit (the beam and the warm light behind the glass slide to that
 * package); "not yet" brings Branding & logo along, its dots flying to the buttons.
 */
export function FitFinder() {
  const t = useTranslations("fit");
  const { addons, fit, setFit, setAddon } = useBrief();
  const [answers, setAnswers] = useState<FinderAnswers>({});
  const [step, setStep] = useState(0);
  const [added, setAdded] = useState(false); // Branding & logo came with the finder (starting over takes it away)
  const root = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const key = FINDER_STEPS[step];
  const finished = step >= FINDER_STEPS.length;

  // a keyboard user keeps their place: the next question's first option, then the result
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    root.current?.querySelector<HTMLElement>(".finder-opt, .finder-result")?.focus({ preventScroll: true });
  }, [step]);

  function answer(value: string, el: HTMLElement) {
    if (finished) return;
    const next = { ...answers, [key]: value } as FinderAnswers;
    setAnswers(next);
    setFit(fitFor(next));
    if (key === "brand") {
      if (value === "no" && !addons.includes("branding")) {
        setAddon("branding", true);
        setAdded(true);
        flyToPackages(el);
      } else if (value === "yes" && added) {
        setAddon("branding", false);
        setAdded(false);
      }
    }
    moveFocus.current = root.current?.contains(document.activeElement) ?? false;
    setStep((s) => s + 1);
  }

  function again() {
    setAnswers({});
    setFit(null);
    if (added) setAddon("branding", false);
    setAdded(false);
    moveFocus.current = true;
    setStep(0);
  }

  return (
    <div className="fit-finder" ref={root} data-reveal="fade" data-reveal-delay="0.25">
      <p className="finder-lead" id="finder-lead">
        <span className="finder-spark" aria-hidden />
        {t("finder.lead")}
      </p>
      <div className="finder-bar" role="group" aria-labelledby="finder-lead" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {!finished ? (
            <motion.div
              key={key}
              className="finder-step"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14, transition: { duration: 0.14, ease: EASE } }}
              transition={{ duration: 0.26, ease: EASE }}
            >
              <span className="finder-n">
                {t.rich("finder.step", {
                  current: String(step + 1).padStart(2, "0"),
                  total: String(FINDER_STEPS.length).padStart(2, "0"),
                  b: (c) => <b>{c}</b>,
                })}
              </span>
              <span className="finder-q" id="finder-q">
                {t(`finder.${key}.q`)}
              </span>
              <span className="finder-opts" role="group" aria-labelledby="finder-q">
                {FINDER[key].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="finder-opt"
                    onClick={(e) => answer(value, e.currentTarget)}
                  >
                    {t(`finder.${key}.${value}`)}
                  </button>
                ))}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              className="finder-result"
              tabIndex={-1}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14, transition: { duration: 0.14, ease: EASE } }}
              transition={{ duration: 0.26, ease: EASE }}
            >
              <span className="finder-spark" aria-hidden />
              <span className="finder-says">
                {t.rich("finder.result", { name: t(`packages.${fit}.name`), b: (c) => <b>{c}</b> })}
              </span>
              {added ? <span className="finder-plus">+ {t("addons.items.branding")}</span> : null}
              <button type="button" className="finder-again" onClick={again}>
                {t("finder.again")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
