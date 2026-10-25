"use client";

import { splitTitle } from "@/components/motion/splitTitle";
import { gsap, useGSAP } from "@/lib/gsap";

/** First-load choreography: nav, headline words, subline, buttons, scroll cue, the orb's hint. */
export function HeroIntro() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let split: ReturnType<typeof splitTitle> | null = null;
      let cancelled = false;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      const play = () => {
        if (cancelled) return;
        const title = document.querySelector<HTMLElement>('[data-hero="title"]');
        if (title) {
          split = splitTitle(title);
          gsap.set(title, { opacity: 1 });
          tl.from(
            split.words,
            {
              opacity: 0,
              yPercent: 30,
              filter: "blur(8px)",
              duration: 1,
              stagger: 0.06,
              onComplete: () => split?.revert(),
            },
            0.25,
          );
        }
        tl.fromTo('[data-hero="nav"]', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
          .fromTo('[data-hero="sub"]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.7)
          .fromTo(
            '[data-hero="actions"] > *',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, clearProps: "transform" },
            0.85,
          )
          .fromTo('[data-hero="actions"]', { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.85)
          .fromTo('[data-hero="cue"]', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.3)
          .fromTo('[data-hero="hint"]', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.8 }, 1.7);
      };

      if (document.fonts?.status === "loaded") play();
      else document.fonts?.ready.then(play);

      return () => {
        cancelled = true;
        tl.kill();
        split?.revert();
      };
    });
    return () => mm.revert();
  });

  return null;
}
