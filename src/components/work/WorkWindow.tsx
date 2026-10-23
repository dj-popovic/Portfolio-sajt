"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { useScroll } from "@/components/motion/SmoothScroll";
import { CloseIcon } from "@/components/ui/icons";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { overlay } from "@/lib/overlay";
import type { DemoKey } from "@/components/work/WorkGallery";

function Loading() {
  return (
    <div className="ww-loading" aria-hidden>
      <span />
    </div>
  );
}

// each demo is its own little site — loaded only when its window opens
const DEMOS: Record<DemoKey, ComponentType> = {
  coffee: dynamic(() => import("./demos/coffee/CoffeeDemo"), { ssr: false, loading: Loading }),
  fintech: dynamic(() => import("./demos/fintech/FintechDemo"), { ssr: false, loading: Loading }),
  wellness: dynamic(() => import("./demos/wellness/WellnessDemo"), { ssr: false, loading: Loading }),
  food: dynamic(() => import("./demos/food/FoodDemo"), { ssr: false, loading: Loading }),
};

type WorkWindowProps = {
  demo: DemoKey;
  kind: "web" | "app";
  origin: HTMLElement;
  onClose: () => void;
};

/** The opened concept: grows out of its card, dims the page, closes back into it. */
export function WorkWindow({ demo, kind, origin, onClose }: WorkWindowProps) {
  const t = useTranslations("work");
  const scroll = useScroll();
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const covering = useRef(false);
  const [hintGone, setHintGone] = useState(false);
  const Demo = DEMOS[demo];

  // inset (relative to the frame) that matches the card's preview area
  const originInset = () => {
    const f = frame.current?.getBoundingClientRect();
    const m = (origin.querySelector(".media") ?? origin).getBoundingClientRect();
    if (!f) return { top: 0, right: 0, bottom: 0, left: 0 };
    return {
      top: Math.max(0, m.top - f.top),
      right: Math.max(0, f.right - m.right),
      bottom: Math.max(0, f.bottom - m.bottom),
      left: Math.max(0, m.left - f.left),
    };
  };

  const paintClip = (el: HTMLElement, v: { top: number; right: number; bottom: number; left: number; r: number }) => {
    el.style.clipPath = `inset(${v.top}px ${v.right}px ${v.bottom}px ${v.left}px round ${v.r}px)`;
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
    const to = originInset();
    const state = { top: 0, right: 0, bottom: 0, left: 0, r: 22 };
    gsap.to(f.querySelector(".ww-content"), { autoAlpha: 0, duration: 0.15 });
    gsap.to(scrim.current, { autoAlpha: 0, duration: 0.35, ease: "power2.inOut" });
    gsap.to(state, {
      ...to,
      r: 14,
      duration: 0.4,
      ease: "power3.inOut",
      onUpdate: () => paintClip(f, state),
      onComplete: onClose,
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
      const from = originInset();
      const state = { ...from, r: 14 };
      paintClip(f, state);
      gsap.fromTo(scrim.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
      gsap.fromTo(f.querySelector(".ww-content"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, delay: 0.2 });
      gsap.to(state, {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        r: 22,
        duration: 0.55,
        ease: "expo.out",
        onUpdate: () => paintClip(f, state),
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
      previous?.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per mount
  }, []);

  const name = t(`items.${demo}.name`);

  return createPortal(
    <div className="work-window" ref={root}>
      <div className="ww-scrim" ref={scrim} onClick={close} aria-hidden />
      <div className="ww-frame" ref={frame} role="dialog" aria-modal="true" aria-label={name}>
        <div className="ww-bar">
          <span className="logo-mark" aria-hidden>
            ★
          </span>
          <span className="ww-titles">
            <span className="ww-kicker">{kind === "web" ? t("kindWeb") : t("kindApp")}</span>
            <span className="ww-name">{name}</span>
          </span>
          <span className="ww-demo">
            <span className="dot" aria-hidden />
            <span className="lbl">{t("window.badge")}</span>
          </span>
          <button ref={closeBtn} className="ww-close" type="button" onClick={close} aria-label={t("window.close")}>
            <CloseIcon />
          </button>
        </div>
        <article
          className="ww-body ww-content"
          data-lenis-prevent
          onScroll={(e) => {
            if (!hintGone && e.currentTarget.scrollTop > 40) setHintGone(true);
          }}
        >
          <Demo />
        </article>
        <div className={`ww-hint ${hintGone ? "is-gone" : ""}`} aria-hidden>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          {t("window.hint")}
        </div>
      </div>
    </div>,
    document.body,
  );
}
