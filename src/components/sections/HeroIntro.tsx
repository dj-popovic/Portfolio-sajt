"use client";

import { splitTitle } from "@/components/motion/splitTitle";
import { gsap, useGSAP } from "@/lib/gsap";

/** First-load choreography: nav, headline words, subline, buttons, scroll cue. */
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
          gsap.set(title, { autoAlpha: 1 });
          tl.from(
            split.words,
            {
              autoAlpha: 0,
              yPercent: 40,
              filter: "blur(14px)",
              duration: 1.2,
              stagger: 0.07,
              onComplete: () => split?.revert(),
            },
            0.25,
          );
        }
        tl.fromTo('[data-hero="nav"]', { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.1)
          .fromTo('[data-hero="sub"]', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.85)
          .fromTo(
            '[data-hero="actions"] > *',
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, clearProps: "transform" },
            1.0,
          )
          .fromTo('[data-hero="actions"]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 1.0)
          .fromTo('[data-hero="cue"]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 1.6);
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
