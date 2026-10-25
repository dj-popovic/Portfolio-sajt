"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

type ScrollTarget = string | HTMLElement | number;

type ScrollOptions = { offset?: number; immediate?: boolean; duration?: number; onComplete?: () => void };

type ScrollApi = {
  /** smooth-scroll to a selector, element or y position */
  scrollTo: (target: ScrollTarget, opts?: ScrollOptions) => void;
  /** freeze page scrolling (menus, the demo window); calls nest */
  lock: () => void;
  unlock: () => void;
};

function nativeScrollTo(target: ScrollTarget, opts?: ScrollOptions) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  const y =
    typeof el === "number" ? el : el ? el.getBoundingClientRect().top + window.scrollY + (opts?.offset ?? 0) : 0;
  window.scrollTo({ top: y, behavior: opts?.immediate || prefersReducedMotion() ? "auto" : "smooth" });
  opts?.onComplete?.();
}

// keys that scroll the page, held while something is open over it
const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);
// an overlay's own scroll area (marked data-lenis-prevent) keeps scrolling
const inScrollArea = (t: EventTarget | null) => t instanceof Element && t.closest("[data-lenis-prevent]") !== null;

/**
 * Holds the page still without hiding its scrollbar: hiding it (overflow:
 * hidden) widens the page and everything behind the overlay jumps sideways.
 * Lenis holds wheel and touch while stopped; this covers the keys, and wheel
 * and touch too when Lenis is off (reduced motion).
 */
function holdScroll() {
  const hold = (e: Event) => {
    if (e.cancelable && !inScrollArea(e.target)) e.preventDefault();
  };
  const holdKeys = (e: KeyboardEvent) => {
    if (!SCROLL_KEYS.has(e.key) || inScrollArea(e.target)) return;
    const t = e.target instanceof Element ? e.target : null;
    // fields keep their keys, and Space still presses buttons and links
    if (t?.closest("input, textarea, select, [contenteditable]")) return;
    if (e.key === " " && t?.closest("button, a, [role='button']")) return;
    e.preventDefault();
  };
  window.addEventListener("wheel", hold, { passive: false });
  window.addEventListener("touchmove", hold, { passive: false });
  window.addEventListener("keydown", holdKeys);
  return () => {
    window.removeEventListener("wheel", hold);
    window.removeEventListener("touchmove", hold);
    window.removeEventListener("keydown", holdKeys);
  };
}

const ScrollContext = createContext<ScrollApi | null>(null);

export function useScroll() {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error("useScroll must be used inside <SmoothScroll>");
  return ctx;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const locks = useRef(0);
  const release = useRef<() => void>(() => {});

  const api = useMemo<ScrollApi>(
    () => ({
      scrollTo: (target, opts) => {
        const lenis = lenisRef.current;
        if (!lenis) return nativeScrollTo(target, opts);
        lenis.scrollTo(target, {
          offset: opts?.offset ?? 0,
          immediate: opts?.immediate,
          duration: opts?.duration ?? 1.3,
          onComplete: opts?.onComplete,
        });
      },
      lock: () => {
        if (locks.current++ === 0) release.current = holdScroll();
        lenisRef.current?.stop();
      },
      unlock: () => {
        locks.current = Math.max(0, locks.current - 1);
        if (locks.current) return;
        release.current();
        release.current = () => {};
        lenisRef.current?.start();
      },
    }),
    [],
  );

  useEffect(() => {
    // in-page anchors glide instead of jumping (native smooth scroll when Lenis is off)
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      api.scrollTo(target);
      history.replaceState(null, "", id);
    };
    document.addEventListener("click", onClick);

    let teardown = () => {};
    if (!prefersReducedMotion()) {
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      teardown = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenisRef.current = null;
      };
    }

    // fonts change layout: re-measure every trigger once they're in
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      document.removeEventListener("click", onClick);
      teardown();
    };
  }, [api]);

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
