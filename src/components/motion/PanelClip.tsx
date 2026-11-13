"use client";

import { useRef } from "react";
import { sheetPath, sheetShape } from "@/components/motion/clip";
import { gsap, useGSAP } from "@/lib/gsap";

// how far the edge arches at most: the corners sit this much lower than the middle
const ARCH = (width: number) => Math.min(150, width * 0.1);

/**
 * Light sections are sheets of paper lying on the dark page, and they rise
 * over it with a curved top edge: the middle leading and the corners trailing,
 * flattening as it settles into the sheet's rounded corners (no widening box).
 * On the way out the bottom edge curves the same way. Drop inside a <section>.
 */
export function PanelClip() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const section = marker.current?.closest("section");
    if (!section) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 1 = fully arched, 0 = flat
      const state = { enter: 1, leave: 0 };
      let radius = sheetShape(section).r;
      const paint = () => {
        const w = section.offsetWidth;
        const h = section.offsetHeight;
        const top = state.enter * ARCH(w);
        const bottom = state.leave * ARCH(w);
        if (top < 0.5 && bottom < 0.5) {
          // settled: the sheet's own rounded corners (border-radius) take over
          section.style.clipPath = "";
          return;
        }
        section.style.clipPath = `path("${sheetPath(w, h, top, bottom, radius)}")`;
      };
      const refresh = () => {
        radius = sheetShape(section).r;
        paint();
      };
      paint();
      gsap.to(state, {
        enter: 0,
        ease: "power2.out",
        onUpdate: paint,
        scrollTrigger: { trigger: section, start: "top bottom", end: "top 30%", scrub: 0.4, onRefresh: refresh },
      });
      gsap.to(state, {
        leave: 1,
        ease: "power2.in",
        onUpdate: paint,
        scrollTrigger: { trigger: section, start: "bottom 70%", end: "bottom top", scrub: 0.4 },
      });
      return () => {
        section.style.clipPath = "";
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
