"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// how far the edge arches at most: the corners sit this much lower than the middle
const ARCH = (width: number) => Math.min(150, width * 0.1);

/**
 * Light sections rise over the dark page like a sheet of paper with a
 * curved top edge: full width from the start, the middle leading and the
 * corners trailing, flattening as it settles (no widening box). On the way
 * out the bottom edge curves the same way. Drop inside a <section>.
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
      const paint = () => {
        const w = section.offsetWidth;
        const h = section.offsetHeight;
        const top = state.enter * ARCH(w);
        const bottom = state.leave * ARCH(w);
        if (top < 0.5 && bottom < 0.5) {
          section.style.clipPath = "";
          return;
        }
        // a quadratic edge whose control point mirrors the corners: the middle stays on the edge
        section.style.clipPath = `path("M0 ${top.toFixed(1)}Q${w / 2} ${(-top).toFixed(1)} ${w} ${top.toFixed(1)}L${w} ${(h - bottom).toFixed(1)}Q${w / 2} ${(h + bottom).toFixed(1)} 0 ${(h - bottom).toFixed(1)}Z")`;
      };
      paint();
      gsap.to(state, {
        enter: 0,
        ease: "power2.out",
        onUpdate: paint,
        scrollTrigger: { trigger: section, start: "top bottom", end: "top 30%", scrub: 0.4, onRefresh: paint },
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
