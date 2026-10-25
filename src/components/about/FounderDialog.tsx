"use client";

import { useTranslations } from "next-intl";
import { animate, stagger } from "motion/react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, type CSSProperties, type RefObject } from "react";
import { createPortal, flushSync } from "react-dom";
import { IconSphere } from "@/components/about/IconSphere";
import { useScroll } from "@/components/motion/SmoothScroll";
import { ArrowUpRight, CloseIcon, MailIcon, SparkIcon } from "@/components/ui/icons";
import type { Founder } from "@/lib/founders";
import { prefersReducedMotion } from "@/lib/gsap";
import { overlay } from "@/lib/overlay";
import { TECH } from "@/lib/tech-icons";

const OPEN = [0.32, 0.72, 0, 1] as const; // drawer-like: quick start, long settle
const OUT = [0.23, 1, 0.32, 1] as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Box = { t: number; r: number; b: number; l: number; rad: number };
type Tilt = { deg: number; x: number; y: number };
const boxOf = (el: Element, rad: number): Box => {
  const r = el.getBoundingClientRect();
  return { t: r.top, r: window.innerWidth - r.right, b: window.innerHeight - r.bottom, l: r.left, rad };
};
/**
 * The card as it rests: its own rectangle (not the bounding box of the tilted
 * card) around its centre, and the tilt, which its wrapper carries.
 */
const cardOf = (el: HTMLElement): { box: Box; tilt: Tilt } => {
  const r = el.getBoundingClientRect();
  const x = (r.left + r.right) / 2;
  const y = (r.top + r.bottom) / 2;
  const w = (el.offsetWidth || r.width) / 2;
  const h = (el.offsetHeight || r.height) / 2;
  const m = new DOMMatrixReadOnly(getComputedStyle(el.parentElement ?? el).transform);
  return {
    box: { t: y - h, r: window.innerWidth - x - w, b: window.innerHeight - y - h, l: x - w, rad: 26 },
    tilt: { deg: (Math.atan2(m.b, m.a) * 180) / Math.PI, x, y },
  };
};

/**
 * A founder card, opened. A full-screen layer whose clip grows from the
 * card's rectangle to the sheet (no scaling, so nothing stretches), turning
 * upright from the card's tilt, then the content comes in. Closing runs it
 * back into the card. Modal: focus stays inside, Esc or a click outside
 * closes, the page doesn't scroll behind it.
 */
export function FounderDialog({
  founder,
  origin,
  onFolding,
  onClosed,
}: {
  founder: Founder;
  origin: RefObject<HTMLElement | null>;
  /** the sheet is back on the card: show the card again, under it */
  onFolding: () => void;
  onClosed: () => void;
}) {
  const t = useTranslations("about");
  const layer = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const scroll = useScroll();
  const closing = useRef(false);
  const cardEl = useRef<HTMLElement | null>(null);
  const from = useRef<Box>({ t: 0, r: 0, b: 0, l: 0, rad: 26 });
  const to = useRef<Box>({ t: 0, r: 0, b: 0, l: 0, rad: 28 });
  const tilt = useRef<Tilt>({ deg: 0, x: 0, y: 0 });

  const role = t(`people.${founder.id}.role`);
  const does = t.raw(`people.${founder.id}.does`) as string[];

  const paint = useCallback((p: number) => {
    const el = layer.current;
    if (!el) return;
    const a = from.current;
    const b = to.current;
    el.style.clipPath = `inset(${lerp(a.t, b.t, p).toFixed(1)}px ${lerp(a.r, b.r, p).toFixed(1)}px ${lerp(a.b, b.b, p).toFixed(1)}px ${lerp(a.l, b.l, p).toFixed(1)}px round ${lerp(a.rad, b.rad, p).toFixed(1)}px)`;
    // turned about the card's centre, so the clip leaves (and lands) at the card's own angle
    const turn = tilt.current.deg * (1 - p);
    el.style.transformOrigin = `${tilt.current.x.toFixed(1)}px ${tilt.current.y.toFixed(1)}px`;
    el.style.transform = Math.abs(turn) > 0.01 ? `rotate(${turn.toFixed(2)}deg)` : "";
  }, []);

  // before the first paint: clip to the card, hide the content, then grow
  useLayoutEffect(() => {
    const el = layer.current;
    const box = sheet.current;
    const card = origin.current;
    if (!el || !box || !card) return;
    cardEl.current = card;
    overlay.push();
    scroll.lock();
    const items = el.querySelectorAll<HTMLElement>("[data-fd]");
    const tiles = el.querySelectorAll<HTMLElement>("[data-fd-tile]");
    to.current = boxOf(box, window.innerWidth < 760 ? 22 : 28);

    if (prefersReducedMotion()) {
      paint(1);
      el.classList.add("is-settled");
      animate(el, { opacity: [0, 1] }, { duration: 0.18 });
      animate(scrim.current!, { opacity: [0, 1] }, { duration: 0.18 });
    } else {
      ({ box: from.current, tilt: tilt.current } = cardOf(card));
      paint(0);
      items.forEach((n) => (n.style.opacity = "0"));
      tiles.forEach((n) => (n.style.opacity = "0"));
      animate(scrim.current!, { opacity: [0, 1] }, { duration: 0.35, ease: OUT });
      // the sheet's edge line only once it has landed (mid-flight it cut across the shape)
      animate(0, 1, { duration: 0.62, ease: OPEN, onUpdate: paint }).then(() => {
        if (!closing.current) el.classList.add("is-settled");
      });
      animate(
        items,
        { opacity: [0, 1], y: [14, 0] },
        { duration: 0.42, ease: OUT, delay: stagger(0.05, { startDelay: 0.24 }) },
      );
      animate(
        tiles,
        { opacity: [0, 1], scale: [0.9, 1] },
        { duration: 0.32, ease: OUT, delay: stagger(0.022, { startDelay: 0.42 }) },
      );
    }
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      overlay.pop();
      scroll.unlock();
    };
  }, [origin, paint, scroll]);

  const close = useCallback(() => {
    const el = layer.current;
    const card = cardEl.current;
    if (closing.current || !el) return;
    closing.current = true;
    el.classList.remove("is-settled");
    if (prefersReducedMotion() || !card) {
      onFolding();
      animate(scrim.current!, { opacity: 0 }, { duration: 0.15 });
      animate(el, { opacity: 0 }, { duration: 0.15 }).then(onClosed);
      return;
    }
    ({ box: from.current, tilt: tilt.current } = cardOf(card));
    // the content (sphere included) goes first, the empty sheet folds back onto
    // the card, the card is put back under it, then the sheet dissolves (one
    // after the other, so the two never thin out together)
    animate(el.querySelectorAll("[data-fd], [data-fd-tile]"), { opacity: 0 }, { duration: 0.12 });
    animate(scrim.current!, { opacity: 0 }, { duration: 0.32, delay: 0.06 });
    animate(1, 0, { duration: 0.38, ease: OUT, delay: 0.04, onUpdate: paint }).then(() => {
      flushSync(onFolding);
      animate(el, { opacity: 0 }, { duration: 0.14 }).then(onClosed);
    });
  }, [onClosed, onFolding, paint]);

  // keys: Esc closes, Tab stays inside; a resize re-fits the sheet
  useEffect(() => {
    const el = layer.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const focusable = el.querySelectorAll<HTMLElement>("a[href], button");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (!sheet.current || closing.current) return;
      to.current = boxOf(sheet.current, window.innerWidth < 760 ? 22 : 28);
      paint(1);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [close, paint]);

  return createPortal(
    <div className="fdialog-root">
      <div ref={scrim} className="fdialog-scrim" onClick={close} aria-hidden />
      <div ref={layer} className="fdialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div ref={sheet} className="fdialog-sheet">
          <button
            ref={closeBtn}
            type="button"
            className="fdialog-close glass"
            aria-label={t("card.close")}
            onClick={close}
            data-fd
          >
            <CloseIcon />
          </button>

          <div className="fdialog-scroll" data-lenis-prevent>
            <div className="fdialog-grid">
              <div className="fdialog-id">
                <div className="fdialog-sphere-wrap" data-fd>
                  <IconSphere stack={founder.stack} className="fdialog-sphere" inOverlay />
                </div>
                <h2 id={titleId} className="fdialog-name" data-fd>
                  {founder.name}
                </h2>
                <p className="fdialog-role" data-fd>
                  {role}
                </p>
                <div className="fdialog-contact" data-fd>
                  <h3>{t("card.contact")}</h3>
                  <a className="fd-link" href={`mailto:${founder.email}`}>
                    <MailIcon />
                    <span>{founder.email}</span>
                  </a>
                  <div className="fd-socials">
                    {founder.links.map((l) => (
                      <a
                        key={l.label}
                        className="fd-link"
                        href={l.href}
                        {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        <span>{l.label}</span>
                        <ArrowUpRight />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="fdialog-info">
                <section data-fd>
                  <h3>{t("card.who")}</h3>
                  <p>{t(`people.${founder.id}.bio`)}</p>
                </section>
                <section data-fd>
                  <h3>{t("card.does")}</h3>
                  <ul className="fd-does">
                    {does.map((d) => (
                      <li key={d}>
                        <SparkIcon size={15} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </section>
                <section data-fd>
                  <h3>{t("card.stack")}</h3>
                  <ul className="fd-stack">
                    {founder.stack.map((id) => (
                      <li key={id} data-fd-tile style={{ "--brand": TECH[id].color } as CSSProperties}>
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d={TECH[id].path} />
                        </svg>
                        <span>{TECH[id].label}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
