"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

type ScrollTarget = string | HTMLElement | number;

type ScrollOptions = {
  offset?: number;
  immediate?: boolean;
  duration?: number;
  /** move the page even while it's held (the demo window lining up the card it closes into) */
  force?: boolean;
  onComplete?: () => void;
};

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

// once per page load: a later mount (switching language) starts where the router puts it
let landed = false;

/**
 * Where this page load should land: back where a reload (or a full back or
 * forward) left off, else the #section the address names. Null: leave it be.
 */
function landing(key: string): number | HTMLElement | null {
  if (landed) return null;
  landed = true;
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav?.type === "reload" || nav?.type === "back_forward") {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(key);
    } catch {}
    if (saved !== null) return Number(saved) || null;
  }
  return location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
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
  const pending = useRef<{ target: ScrollTarget; opts?: ScrollOptions } | null>(null);

  const api = useMemo<ScrollApi>(() => {
    const go = (target: ScrollTarget, opts?: ScrollOptions) => {
      const lenis = lenisRef.current;
      if (!lenis) return nativeScrollTo(target, opts);
      // Lenis can miss a scroll the browser made by itself (one that lands just after its own)
      // and would measure the trip from a stale place: line it up with the page first
      if (!lenis.isScrolling && Math.abs(lenis.animatedScroll - lenis.actualScroll) > 1)
        lenis.scrollTo(lenis.actualScroll, { immediate: true, force: true });
      lenis.scrollTo(target, {
        offset: opts?.offset ?? 0,
        immediate: opts?.immediate,
        duration: opts?.duration ?? 1.3,
        force: opts?.force,
        onComplete: opts?.onComplete,
      });
    };
    return {
      scrollTo: (target, opts) => {
        // a stopped Lenis ignores scrollTo (say, a link in the menu while the menu
        // holds the page): it runs as soon as the page is let go, unless forced
        if (locks.current > 0 && lenisRef.current && !opts?.force) {
          pending.current = { target, opts };
          return;
        }
        go(target, opts);
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
        const next = pending.current;
        pending.current = null;
        if (next) go(next.target, next.opts);
      },
    };
  }, []);

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

    // a load lands where it should. Left to the browser, a reload goes back to its old
    // place before the pinned sections have made their room, so it lands somewhere
    // earlier: we keep the place ourselves (the head script turns the browser's off) and
    // go there once the page is measured, unless the visitor has started scrolling
    ScrollTrigger.clearScrollMemory("manual");
    const key = `scroll:${location.pathname}`;
    const save = () => {
      try {
        sessionStorage.setItem(key, String(Math.round(window.scrollY)));
      } catch {}
    };
    window.addEventListener("pagehide", save);
    const target = landing(key);
    let moved = false;
    const move = () => (moved = true);
    if (target !== null) {
      window.addEventListener("wheel", move, { once: true, passive: true });
      window.addEventListener("touchstart", move, { once: true, passive: true });
      window.addEventListener("keydown", move, { once: true });
      const loaded =
        document.readyState === "complete"
          ? Promise.resolve()
          : new Promise((done) => window.addEventListener("load", done, { once: true }));
      Promise.all([loaded, document.fonts?.ready]).then(() => {
        if (moved) return;
        moved = true;
        ScrollTrigger.refresh();
        api.scrollTo(target, { immediate: true, force: true });
      });
    }

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("pagehide", save);
      window.removeEventListener("wheel", move);
      window.removeEventListener("touchstart", move);
      window.removeEventListener("keydown", move);
      moved = true;
      teardown();
    };
  }, [api]);

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
