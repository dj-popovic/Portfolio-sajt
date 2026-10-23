"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

type ScrollTarget = string | HTMLElement | number;

type ScrollApi = {
  /** smooth-scroll to a selector, element or y position */
  scrollTo: (target: ScrollTarget, opts?: { offset?: number; immediate?: boolean }) => void;
  /** freeze page scrolling (menus, the demo window); calls nest */
  lock: () => void;
  unlock: () => void;
};

function nativeScrollTo(target: ScrollTarget, opts?: { offset?: number; immediate?: boolean }) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  const y =
    typeof el === "number" ? el : el ? el.getBoundingClientRect().top + window.scrollY + (opts?.offset ?? 0) : 0;
  window.scrollTo({ top: y, behavior: opts?.immediate || prefersReducedMotion() ? "auto" : "smooth" });
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

  const api = useMemo<ScrollApi>(
    () => ({
      scrollTo: (target, opts) => {
        const lenis = lenisRef.current;
        if (!lenis) return nativeScrollTo(target, opts);
        lenis.scrollTo(target, { offset: opts?.offset ?? 0, immediate: opts?.immediate, duration: 1.3 });
      },
      lock: () => {
        locks.current++;
        lenisRef.current?.stop();
        document.documentElement.style.overflow = "hidden";
      },
      unlock: () => {
        locks.current = Math.max(0, locks.current - 1);
        if (locks.current) return;
        lenisRef.current?.start();
        document.documentElement.style.overflow = "";
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
