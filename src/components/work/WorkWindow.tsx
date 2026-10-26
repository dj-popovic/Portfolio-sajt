"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { useScroll } from "@/components/motion/SmoothScroll";
import { CloseIcon } from "@/components/ui/icons";
import { CONCEPT, DEMO_KEYS, type DemoKey } from "@/components/work/concepts";
import { ConceptMark } from "@/components/work/marks";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { overlay } from "@/lib/overlay";

function Loading() {
  return (
    <div className="ww-loading" aria-hidden>
      <span />
    </div>
  );
}

// each demo is its own little site, loaded only when its window opens
const DEMOS: Record<DemoKey, ComponentType> = {
  coffee: dynamic(() => import("./demos/coffee/CoffeeDemo"), { ssr: false, loading: Loading }),
  fintech: dynamic(() => import("./demos/fintech/FintechDemo"), { ssr: false, loading: Loading }),
  wellness: dynamic(() => import("./demos/wellness/WellnessDemo"), { ssr: false, loading: Loading }),
  food: dynamic(() => import("./demos/food/FoodDemo"), { ssr: false, loading: Loading }),
};

type Inset = { top: number; right: number; bottom: number; left: number; r: number };

type WorkWindowProps = {
  demo: DemoKey;
  /** the card it opened from */
  origin: HTMLElement;
  /** a concept's card, to close back into */
  cardOf: (key: DemoKey) => HTMLElement | null;
  onSwitch: (key: DemoKey) => void;
  onClose: () => void;
};

/**
 * The opened concept: grows out of its card's preview, dims the page and
 * closes back into the card of whichever concept is showing. The bar says
 * whose site it is and switches between the four without closing. Modal:
 * focus stays inside, Esc closes, the page holds still behind it.
 */
export function WorkWindow({ demo, origin, cardOf, onSwitch, onClose }: WorkWindowProps) {
  const t = useTranslations("work");
  const scroll = useScroll();
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const covering = useRef(false);
  const [shown, setShown] = useState<DemoKey>(demo);
  // which concept is showing, for the cleanup that runs after the last render
  const shownRef = useRef<DemoKey>(demo);
  const [hintGone, setHintGone] = useState(false);
  const Demo = DEMOS[shown];
  const brand = CONCEPT[shown].brand;
  const what = t(`items.${shown}.what`);

  // the inset (in the frame) that matches a card's preview
  const insetOf = (card: HTMLElement): Inset => {
    const f = frame.current?.getBoundingClientRect();
    const m = (card.querySelector(".cc-media") ?? card).getBoundingClientRect();
    if (!f) return { top: 0, right: 0, bottom: 0, left: 0, r: 18 };
    return {
      top: Math.max(0, m.top - f.top),
      right: Math.max(0, f.right - m.right),
      bottom: Math.max(0, f.bottom - m.bottom),
      left: Math.max(0, m.left - f.left),
      r: 18,
    };
  };
  const paint = (el: HTMLElement, v: Inset) => {
    el.style.clipPath = `inset(${v.top.toFixed(1)}px ${v.right.toFixed(1)}px ${v.bottom.toFixed(1)}px ${v.left.toFixed(1)}px round ${v.r.toFixed(1)}px)`;
  };
  const onScreen = (card: HTMLElement | null) => {
    const r = card?.querySelector(".cc-media")?.getBoundingClientRect();
    if (!r) return false;
    const seen = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
    return seen > r.height * 0.6;
  };

  // the page behind is fully dimmed: let its renderers rest while we're open
  const uncover = () => {
    if (!covering.current) return;
    covering.current = false;
    overlay.pop();
  };

  function close() {
    if (closing.current) return;
    closing.current = true;
    uncover();
    const f = frame.current;
    if (!f || prefersReducedMotion()) return onClose();
    const content = f.querySelectorAll(".ww-bar > *, .ww-content");
    gsap.to(content, { opacity: 0, duration: 0.14 });
    gsap.to(scrim.current, { opacity: 0, duration: 0.4, ease: "power2.inOut" });
    const card = cardOf(shown);
    if (card && onScreen(card)) {
      // back into the card of the concept that's showing
      const state = { top: 0, right: 0, bottom: 0, left: 0, r: 24 };
      gsap.to(state, {
        ...insetOf(card),
        duration: 0.5,
        ease: "power3.inOut",
        onUpdate: () => paint(f, state),
        onComplete: onClose,
      });
    } else {
      gsap.to(f, { opacity: 0, scale: 0.96, duration: 0.32, ease: "power2.in", onComplete: onClose });
    }
  }

  // another concept, in place: the content dips out, the next one rises in
  function go(key: DemoKey) {
    if (key === shown || closing.current) return;
    const content = body.current;
    const swap = () => {
      shownRef.current = key;
      setShown(key);
      setHintGone(false);
      onSwitch(key);
      content?.scrollTo({ top: 0 });
    };
    if (!content || prefersReducedMotion()) return swap();
    gsap.to(content, {
      opacity: 0,
      y: -10,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => {
        swap();
        gsap.fromTo(
          content,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", delay: 0.05 },
        );
      },
    });
  }

  useEffect(() => {
    const f = frame.current;
    if (!f) return;
    scroll.lock();
    covering.current = true;
    overlay.push();
    const previous = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus({ preventScroll: true });

    if (!prefersReducedMotion()) {
      const state = insetOf(origin);
      paint(f, state);
      gsap.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" });
      gsap.fromTo(
        f.querySelectorAll(".ww-bar > *"),
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.05, delay: 0.25 },
      );
      gsap.fromTo(f.querySelector(".ww-content"), { opacity: 0 }, { opacity: 1, duration: 0.35, delay: 0.22 });
      gsap.to(state, {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        r: 24,
        duration: 0.7,
        ease: "expo.out",
        onUpdate: () => paint(f, state),
        onComplete: () => {
          f.style.clipPath = "";
        },
      });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
      if (e.key !== "Tab" || !root.current) return;
      const items = root.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      uncover();
      scroll.unlock();
      // back to the card of the concept that was showing (it may not be the one it opened from)
      const card = shownRef.current === demo ? previous : cardOf(shownRef.current);
      (card ?? previous)?.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per mount
  }, []);

  return createPortal(
    <div className="work-window" ref={root}>
      <div className="ww-scrim" ref={scrim} onClick={close} aria-hidden />
      <div
        className="ww-frame"
        ref={frame}
        role="dialog"
        aria-modal="true"
        aria-label={`${brand}, ${what}`}
        style={{ background: CONCEPT[shown].bg }}
      >
        <div className="ww-bar">
          <div className="ww-id">
            <ConceptMark kind={shown} size={30} />
            <span className="ww-titles">
              <span className="ww-brand">{brand}</span>
              <span className="ww-what">{what}</span>
            </span>
          </div>
          <div className="ww-switch" role="group" aria-label={t("window.switch")}>
            {DEMO_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={key === shown}
                aria-label={`${CONCEPT[key].brand}, ${t(`items.${key}.what`)}`}
                onClick={() => go(key)}
              >
                {key === shown ? (
                  <motion.span
                    layoutId="ww-switch"
                    className="ww-switch-pill"
                    transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
                  />
                ) : null}
                <ConceptMark kind={key} size={22} />
              </button>
            ))}
          </div>
          <button ref={closeBtn} className="ww-close" type="button" onClick={close} aria-label={t("window.close")}>
            <span className="ww-esc" aria-hidden>
              Esc
            </span>
            <CloseIcon size={16} />
          </button>
        </div>
        <article
          ref={body}
          className="ww-body ww-content"
          data-lenis-prevent
          onScroll={(e) => {
            if (!hintGone && e.currentTarget.scrollTop > 40) setHintGone(true);
          }}
        >
          <Demo key={shown} />
        </article>
        <div className={`ww-hint ${hintGone ? "is-gone" : ""}`} aria-hidden>
          <svg width="14" height="18" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="1" y="1" width="12" height="18" rx="6" />
            <path className="ww-wheel" d="M7 5v3" strokeLinecap="round" />
          </svg>
          {t("window.hint")}
        </div>
      </div>
    </div>,
    document.body,
  );
}
