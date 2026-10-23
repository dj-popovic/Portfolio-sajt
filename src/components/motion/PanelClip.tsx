"use client";

import { useRef } from "react";
import { setInset } from "@/components/motion/clip";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Light sections behave like panels laid over the dark page: they open from
 * rounded, inset corners as they arrive and fold back as they leave
 * (a lighter cousin of the About signature move). Drop inside a <section>.
 */
export function PanelClip() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const section = marker.current?.closest("section");
    if (!section) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // closedness: 1 = inset with rounded corners, 0 = edge to edge
      const state = { enter: 1, leave: 0 };
      const paint = () => {
        const c = Math.max(state.enter, state.leave);
        setInset(section, 0, c * 5, c * 48, "%");
      };
      paint();
      gsap.to(state, {
        enter: 0,
        ease: "none",
        onUpdate: paint,
        scrollTrigger: { trigger: section, start: "top bottom", end: "top 25%", scrub: 0.4 },
      });
      gsap.to(state, {
        leave: 1,
        ease: "none",
        onUpdate: paint,
        scrollTrigger: { trigger: section, start: "bottom 75%", end: "bottom top", scrub: 0.4 },
      });
      return () => {
        section.style.clipPath = "";
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
