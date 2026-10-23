"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

// The rail fills with an ember glow as the "read line" (52% of the viewport)
// travels down it; each step lights up once its node passes that line.
const READ_LINE = "52%";

export function ProcessTimeline({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const rail = el.querySelector<HTMLElement>(".tl-rail");
      const fill = el.querySelector<HTMLElement>(".tl-fill");
      if (!rail || !fill) return;

      gsap.fromTo(
        fill,
        { height: 0 },
        {
          height: () => rail.offsetHeight,
          ease: "none",
          scrollTrigger: {
            trigger: rail,
            start: `top ${READ_LINE}`,
            end: `bottom ${READ_LINE}`,
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        },
      );

      el.querySelectorAll<HTMLElement>(".tl-step").forEach((step) => {
        const node = step.querySelector(".tl-node");
        ScrollTrigger.create({
          trigger: node ?? step,
          start: `center ${READ_LINE}`,
          onEnter: () => step.classList.add("active"),
          onLeaveBack: () => step.classList.remove("active"),
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="timeline">
      <div className="tl-rail" aria-hidden>
        <div className="tl-fill" />
      </div>
      {children}
    </div>
  );
}
